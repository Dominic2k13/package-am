package handlers

import (
	"context"
	"net/http"
	"strconv"

	"github.com/dominic2k13/package-am-api/db"
	"github.com/dominic2k13/package-am-api/models"
	"github.com/gin-gonic/gin"
)

// ListMenuItems — GET /api/v1/menu?vendor_id=1&category=pizza
func ListMenuItems() gin.HandlerFunc {
	return func(c *gin.Context) {
		query := `SELECT id, vendor_id, name, category, price, rating, prep_time, image, badge, is_available
		          FROM menu_items WHERE is_available = true`
		args := []any{}
		argIdx := 1

		if v := c.Query("vendor_id"); v != "" {
			if _, err := strconv.Atoi(v); err == nil {
				query += " AND vendor_id = $" + strconv.Itoa(argIdx)
				args = append(args, v)
				argIdx++
			}
		}

		if cat := c.Query("category"); cat != "" && cat != "all" {
			query += " AND category = $" + strconv.Itoa(argIdx)
			args = append(args, cat)
			argIdx++
		}

		query += " ORDER BY id"

		rows, err := db.Pool.Query(context.Background(), query, args...)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch menu items"})
			return
		}
		defer rows.Close()

		items := []models.MenuItem{}
		for rows.Next() {
			var item models.MenuItem
			if err := rows.Scan(
				&item.ID, &item.VendorID, &item.Name, &item.Category,
				&item.Price, &item.Rating, &item.PrepTime, &item.Image,
				&item.Badge, &item.IsAvailable,
			); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan menu item"})
				return
			}
			items = append(items, item)
		}

		c.JSON(http.StatusOK, items)
	}
}

// GetMenuItem — GET /api/v1/menu/:id
func GetMenuItem() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item id"})
			return
		}

		var item models.MenuItem
		err = db.Pool.QueryRow(context.Background(),
			`SELECT id, vendor_id, name, category, price, rating, prep_time, image, badge, is_available
			 FROM menu_items WHERE id = $1`, id,
		).Scan(
			&item.ID, &item.VendorID, &item.Name, &item.Category,
			&item.Price, &item.Rating, &item.PrepTime, &item.Image,
			&item.Badge, &item.IsAvailable,
		)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Menu item not found"})
			return
		}

		c.JSON(http.StatusOK, item)
	}
}
