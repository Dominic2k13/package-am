package db

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Pool is the shared connection pool used across all handlers.
var Pool *pgxpool.Pool

// Connect initialises the pool and runs a ping to verify connectivity.
func Connect(databaseURL string) {
	cfg, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		log.Fatalf("db: failed to parse DATABASE_URL: %v", err)
	}

	pool, err := pgxpool.NewWithConfig(context.Background(), cfg)
	if err != nil {
		log.Fatalf("db: unable to create connection pool: %v", err)
	}

	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("db: cannot reach database: %v", err)
	}

	Pool = pool
	log.Println("db: connected to PostgreSQL ✓")
}
