package models

import "time"

type User struct {
	ID              string    `json:"id"`
	Name            string    `json:"name"`
	Email           string    `json:"email"`
	PasswordHash    string    `json:"-"`
	CashbackBalance int       `json:"cashbackBalance"`
	Role            string    `json:"role"` // customer | vendor | admin
	VendorID        *int      `json:"vendorId,omitempty"`
	CreatedAt       time.Time `json:"createdAt"`
}

// SignupRequest is the payload for POST /auth/signup
type SignupRequest struct {
	Name     string `json:"name"     binding:"required,min=2"`
	Email    string `json:"email"    binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// LoginRequest is the payload for POST /auth/login
type LoginRequest struct {
	Email    string `json:"email"    binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// AuthResponse is returned after a successful signup or login
type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
