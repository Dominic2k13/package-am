package handlers

import (
	"context"
	"net/http"
	"strconv"

	"github.com/dominic2k13/package-am-api/db"
	"github.com/dominic2k13/package-am-api/models"
	"github.com/gin-gonic/gin"
)

// ListVendors — GET /api/v1/vendors
func ListVendors() gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := db.Pool.Query(context.Background(),
			`SELECT id, name, emoji, tagline, description, address, city, state,
			        rating, review_count, delivery_time, min_order, categories,
			        is_open, badge, phone, instagram, tiktok
			 FROM vendors
			 ORDER BY id`,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch vendors"})
			return
		}
		defer rows.Close()

		vendors := []models.Vendor{}
		for rows.Next() {
			var v models.Vendor
			if err := rows.Scan(
				&v.ID, &v.Name, &v.Emoji, &v.Tagline, &v.Description,
				&v.Address, &v.City, &v.State, &v.Rating, &v.ReviewCount,
				&v.DeliveryTime, &v.MinOrder, &v.Categories,
				&v.IsOpen, &v.Badge, &v.Phone, &v.Instagram, &v.TikTok,
			); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan vendor"})
				return
			}
			vendors = append(vendors, v)
		}

		c.JSON(http.StatusOK, vendors)
	}
}

// GetVendor — GET /api/v1/vendors/:id
func GetVendor() gin.HandlerFunc {
	return func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid vendor id"})
			return
		}

		var v models.Vendor
		err = db.Pool.QueryRow(context.Background(),
			`SELECT id, name, emoji, tagline, description, address, city, state,
			        rating, review_count, delivery_time, min_order, categories,
			        is_open, badge, phone, instagram, tiktok
			 FROM vendors WHERE id = $1`, id,
		).Scan(
			&v.ID, &v.Name, &v.Emoji, &v.Tagline, &v.Description,
			&v.Address, &v.City, &v.State, &v.Rating, &v.ReviewCount,
			&v.DeliveryTime, &v.MinOrder, &v.Categories,
			&v.IsOpen, &v.Badge, &v.Phone, &v.Instagram, &v.TikTok,
		)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Vendor not found"})
			return
		}

		c.JSON(http.StatusOK, v)
	}
}
