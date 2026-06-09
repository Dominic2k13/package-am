package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/dominic2k13/package-am-api/db"
	"github.com/dominic2k13/package-am-api/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

const welcomeCashback = 500 // ₦500 welcome bonus for new users

// Signup — POST /api/v1/auth/signup
func Signup(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req models.SignupRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check email uniqueness
		var exists bool
		err := db.Pool.QueryRow(context.Background(),
			`SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`, req.Email,
		).Scan(&exists)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
		if exists {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
			return
		}

		// Hash password
		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}

		// Insert user
		id := uuid.NewString()
		var user models.User
		err = db.Pool.QueryRow(context.Background(),
			`INSERT INTO users (id, name, email, password_hash, cashback_balance)
			 VALUES ($1, $2, $3, $4, $5)
			 RETURNING id, name, email, cashback_balance, created_at`,
			id, req.Name, req.Email, string(hash), welcomeCashback,
		).Scan(&user.ID, &user.Name, &user.Email, &user.CashbackBalance, &user.CreatedAt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}

		token, err := generateToken(user.ID, jwtSecret)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		c.JSON(http.StatusCreated, models.AuthResponse{Token: token, User: user})
	}
}

// Login — POST /api/v1/auth/login
func Login(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req models.LoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		var user models.User
		err := db.Pool.QueryRow(context.Background(),
			`SELECT id, name, email, password_hash, cashback_balance, role, created_at
			 FROM users WHERE email = $1`, req.Email,
		).Scan(&user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.CashbackBalance, &user.Role, &user.CreatedAt)
		if err != nil {
			// Return same error for unknown email & wrong password (prevent enumeration)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
			return
		}

		token, err := generateToken(user.ID, jwtSecret)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		c.JSON(http.StatusOK, models.AuthResponse{Token: token, User: user})
	}
}

// Me — GET /api/v1/auth/me  (protected)
func Me() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")

		var user models.User
		err := db.Pool.QueryRow(context.Background(),
			`SELECT id, name, email, cashback_balance, created_at
			 FROM users WHERE id = $1`, userID,
		).Scan(&user.ID, &user.Name, &user.Email, &user.CashbackBalance, &user.CreatedAt)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		c.JSON(http.StatusOK, user)
	}
}

// generateToken creates a signed JWT valid for 30 days.
func generateToken(userID, secret string) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"iat": time.Now().Unix(),
		"exp": time.Now().Add(30 * 24 * time.Hour).Unix(),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
}
