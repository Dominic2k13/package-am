package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/dominic2k13/package-am-api/config"
	"github.com/dominic2k13/package-am-api/db"
	"github.com/dominic2k13/package-am-api/handlers"
	"github.com/dominic2k13/package-am-api/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	cfg := config.Load()
	db.Connect(cfg.DatabaseURL)
	ensureAdmin(cfg)

	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{cfg.FrontendURL},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": "package-am-api"})
	})

	v1 := r.Group("/api/v1")
	auth := middleware.RequireAuth(cfg.JWTSecret)

	// ── Public auth ──────────────────────────────────────────────
	v1.POST("/auth/signup",              handlers.Signup(cfg.JWTSecret))
	v1.POST("/auth/login",               handlers.Login(cfg.JWTSecret))
	v1.GET("/auth/me",         auth,     handlers.Me())
	v1.POST("/auth/vendor/signup",       handlers.VendorSignup(cfg.JWTSecret))

	// ── Public: vendors & menu ───────────────────────────────────
	v1.GET("/vendors",                   handlers.ListVendors())
	v1.GET("/vendors/:id",               handlers.GetVendor())
	v1.GET("/menu",                      handlers.ListMenuItems())
	v1.GET("/menu/:id",                  handlers.GetMenuItem())

	// ── Customer: orders & cashback ──────────────────────────────
	orders := v1.Group("/orders", auth, middleware.RequireRole("customer", "admin"))
	orders.POST("",    handlers.PlaceOrder())
	orders.GET("",     handlers.ListOrders())
	orders.GET("/:id", handlers.GetOrder())

	cb := v1.Group("/cashback", auth, middleware.RequireRole("customer", "admin"))
	cb.GET("",              handlers.GetCashback())
	cb.POST("/redeem",      handlers.RedeemCashback())

	// ── Vendor dashboard ─────────────────────────────────────────
	vendor := v1.Group("/vendor", auth, middleware.RequireRole("vendor", "admin"))
	vendor.GET("/stats",               handlers.GetVendorStats())
	vendor.GET("/orders",              handlers.GetVendorOrders())
	vendor.PATCH("/orders/:id/status", handlers.UpdateOrderStatus())
	vendor.GET("/menu",                handlers.GetVendorMenu())
	vendor.POST("/menu",               handlers.CreateMenuItem())
	vendor.PATCH("/menu/:id",          handlers.UpdateMenuItem())
	vendor.PATCH("/menu/:id/toggle",   handlers.ToggleAvailability())
	vendor.DELETE("/menu/:id",         handlers.DeleteMenuItem())

	// ── Admin panel ──────────────────────────────────────────────
	admin := v1.Group("/admin", auth, middleware.RequireRole("admin"))
	admin.GET("/stats",               handlers.GetAdminStats())
	admin.GET("/vendors",             handlers.ListAdminVendors())
	admin.PATCH("/vendors/:id/review",handlers.ReviewVendor())
	admin.GET("/users",               handlers.ListAllUsers())
	admin.GET("/orders",              handlers.ListAllOrders())

	log.Printf("🚀 Package-Am API on :%s (%s)", cfg.Port, cfg.Env)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

// ensureAdmin creates the admin user on first boot if ADMIN_PASSWORD is set.
func ensureAdmin(cfg *config.Config) {
	if cfg.AdminPassword == "" {
		log.Println("ℹ️  ADMIN_PASSWORD not set — skipping admin seed")
		return
	}

	var exists bool
	db.Pool.QueryRow(context.Background(),
		`SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`, cfg.AdminEmail,
	).Scan(&exists)
	if exists {
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(cfg.AdminPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("⚠️  Failed to hash admin password: %v", err)
		return
	}

	_, err = db.Pool.Exec(context.Background(),
		`INSERT INTO users (id, name, email, password_hash, cashback_balance, role)
		 VALUES ($1, 'Admin', $2, $3, 0, 'admin')`,
		uuid.NewString(), cfg.AdminEmail, string(hash),
	)
	if err != nil {
		log.Printf("⚠️  Failed to seed admin: %v", err)
		return
	}
	log.Printf("✅ Admin account created: %s", cfg.AdminEmail)
}
