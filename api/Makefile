## Package-Am Go API — common tasks
.PHONY: dev build run migrate tidy

# Start with hot-reload (requires: go install github.com/air-verse/air@latest)
dev:
	air

# Build production binary
build:
	go build -o bin/api ./main.go

# Run compiled binary
run: build
	./bin/api

# Apply DB schema (requires psql and DATABASE_URL in env)
migrate:
	psql $$DATABASE_URL -f migrations/schema.sql

# Download / tidy dependencies
tidy:
	go mod tidy
