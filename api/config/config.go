package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port          string
	DatabaseURL   string
	JWTSecret     string
	Env           string
	FrontendURL   string
	AdminEmail    string
	AdminPassword string
}

func Load() *Config {
	// Load .env in development; skip silently in production (env vars already set)
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found — using environment variables")
	}

	cfg := &Config{
		Port:          getEnv("PORT", "8080"),
		DatabaseURL:   mustEnv("DATABASE_URL"),
		JWTSecret:     mustEnv("JWT_SECRET"),
		Env:           getEnv("ENV", "development"),
		FrontendURL:   getEnv("FRONTEND_URL", "http://localhost:3000"),
		AdminEmail:    getEnv("ADMIN_EMAIL", "admin@package-am.com"),
		AdminPassword: getEnv("ADMIN_PASSWORD", ""),
	}

	return cfg
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		log.Fatalf("Required environment variable %s is not set", key)
	}
	return v
}
