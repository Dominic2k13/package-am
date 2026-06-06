package middleware

import (
	"context"
	"net/http"

	"github.com/dominic2k13/package-am-api/db"
	"github.com/gin-gonic/gin"
)

// RequireRole must come after RequireAuth (which sets UserIDKey).
// It fetches the user's role from the DB and aborts if not in allowedRoles.
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	allowed := make(map[string]bool, len(allowedRoles))
	for _, r := range allowedRoles {
		allowed[r] = true
	}

	return func(c *gin.Context) {
		userID := c.GetString(UserIDKey)
		if userID == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
			return
		}

		var role string
		err := db.Pool.QueryRow(context.Background(),
			`SELECT role FROM users WHERE id = $1`, userID,
		).Scan(&role)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			return
		}

		if !allowed[role] {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Insufficient permissions"})
			return
		}

		c.Set("role", role)
		c.Next()
	}
}
