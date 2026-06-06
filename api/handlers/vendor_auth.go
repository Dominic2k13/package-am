package handlers

import (
	"context"
	"net/http"

	"github.com/dominic2k13/package-am-api/db"
	"github.com/dominic2k13/package-am-api/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type VendorSignupRequest struct {
	// Owner / account details
	OwnerName string `json:"ownerName" binding:"required,min=2"`
	Email     string `json:"email"     binding:"required,email"`
	Password  string `json:"password"  binding:"required,min=6"`
	Phone     string `json:"phone"     binding:"required"`
	// Business details
	BusinessName string   `json:"businessName" binding:"required"`
	Tagline      string   `json:"tagline"`
	Description  string   `json:"description"  binding:"required"`
	Address      string   `json:"address"      binding:"required"`
	City         string   `json:"city"         binding:"required"`
	State        string   `json:"state"        binding:"required"`
	Categories   []string `json:"categories"   binding:"required,min=1"`
	Emoji        string   `json:"emoji"`
}

// VendorSignup — POST /api/v1/auth/vendor/signup
// Creates a user (role=vendor) + a vendor record (status=pending).
// The vendor must be approved by an admin before they can log in to the dashboard.
func VendorSignup(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req VendorSignupRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Email uniqueness check
		var exists bool
		_ = db.Pool.QueryRow(context.Background(),
			`SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`, req.Email,
		).Scan(&exists)
		if exists {
			c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
			return
		}

		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}

		emoji := req.Emoji
		if emoji == "" {
			emoji = "🍽️"
		}

		tx, err := db.Pool.Begin(context.Background())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
			return
		}
		defer tx.Rollback(context.Background())

		// Create user with vendor role
		userID := uuid.NewString()
		var user models.User
		err = tx.QueryRow(context.Background(),
			`INSERT INTO users (id, name, email, password_hash, cashback_balance, role)
			 VALUES ($1, $2, $3, $4, 0, 'vendor')
			 RETURNING id, name, email, cashback_balance, role, created_at`,
			userID, req.OwnerName, req.Email, string(hash),
		).Scan(&user.ID, &user.Name, &user.Email, &user.CashbackBalance, &user.Role, &user.CreatedAt)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}

		// Create vendor record (status = pending, awaiting admin approval)
		var vendorID int
		err = tx.QueryRow(context.Background(),
			`INSERT INTO vendors
			   (owner_user_id, name, emoji, tagline, description, address, city, state,
			    categories, phone, status, delivery_time, min_order)
			 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending','30–60 min',2000)
			 RETURNING id`,
			userID, req.BusinessName, emoji, req.Tagline, req.Description,
			req.Address, req.City, req.State, req.Categories, req.Phone,
		).Scan(&vendorID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create vendor record"})
			return
		}

		if err := tx.Commit(context.Background()); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit"})
			return
		}

		user.VendorID = &vendorID

		c.JSON(http.StatusCreated, gin.H{
			"message":  "Application submitted! We'll review and get back to you within 24 hours.",
			"vendorId": vendorID,
			"user":     user,
		})
	}
}
