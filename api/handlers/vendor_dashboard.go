package handlers

import (
	"context"
	"net/http"
	"strconv"

	"github.com/dominic2k13/package-am-api/db"
	"github.com/dominic2k13/package-am-api/models"
	"github.com/gin-gonic/gin"
)

// resolveVendorID returns the vendor id for the authenticated vendor user.
func resolveVendorID(c *gin.Context) (int, bool) {
	userID := c.GetString("userID")
	var vendorID int
	err := db.Pool.QueryRow(context.Background(),
		`SELECT id FROM vendors WHERE owner_user_id = $1 AND status = 'approved'`, userID,
	).Scan(&vendorID)
	if err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "Vendor account not found or not yet approved"})
		return 0, false
	}
	return vendorID, true
}

// ── Stats ─────────────────────────────────────────────────────

type VendorStats struct {
	TodayRevenue   int `json:"todayRevenue"`
	TodayOrders    int `json:"todayOrders"`
	PendingOrders  int `json:"pendingOrders"`
	TotalMenuItems int `json:"totalMenuItems"`
	TotalOrders    int `json:"totalOrders"`
	TotalRevenue   int `json:"totalRevenue"`
}

// GetVendorStats — GET /api/v1/vendor/stats
func GetVendorStats() gin.HandlerFunc {
	return func(c *gin.Context) {
		vendorID, ok := resolveVendorID(c)
		if !ok {
			return
		}

		var stats VendorStats
		db.Pool.QueryRow(context.Background(),
			`SELECT
			   COALESCE(SUM(CASE WHEN DATE(o.placed_at) = CURRENT_DATE THEN oi.price * oi.quantity END), 0),
			   COUNT(DISTINCT CASE WHEN DATE(o.placed_at) = CURRENT_DATE THEN o.id END),
			   COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN o.id END),
			   COALESCE(SUM(oi.price * oi.quantity), 0),
			   COUNT(DISTINCT o.id)
			 FROM order_items oi
			 JOIN orders o ON o.id = oi.order_id
			 WHERE oi.vendor_id = $1`, vendorID,
		).Scan(
			&stats.TodayRevenue, &stats.TodayOrders, &stats.PendingOrders,
			&stats.TotalRevenue, &stats.TotalOrders,
		)

		db.Pool.QueryRow(context.Background(),
			`SELECT COUNT(*) FROM menu_items WHERE vendor_id = $1`, vendorID,
		).Scan(&stats.TotalMenuItems)

		c.JSON(http.StatusOK, stats)
	}
}

// ── Orders ────────────────────────────────────────────────────

// GetVendorOrders — GET /api/v1/vendor/orders?status=pending
func GetVendorOrders() gin.HandlerFunc {
	return func(c *gin.Context) {
		vendorID, ok := resolveVendorID(c)
		if !ok {
			return
		}

		query := `SELECT DISTINCT o.id, o.user_id, o.status, o.order_for,
		                 o.recipient_name, o.recipient_phone, o.recipient_state,
		                 o.recipient_address, o.subtotal, o.delivery_fee, o.total,
		                 o.cashback_earned, o.placed_at
		          FROM orders o
		          JOIN order_items oi ON oi.order_id = o.id
		          WHERE oi.vendor_id = $1`
		args := []any{vendorID}

		if status := c.Query("status"); status != "" {
			query += " AND o.status = $2"
			args = append(args, status)
		}
		query += " ORDER BY o.placed_at DESC"

		rows, err := db.Pool.Query(context.Background(), query, args...)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
			return
		}
		defer rows.Close()

		orders := []models.Order{}
		orderMap := map[string]*models.Order{}
		for rows.Next() {
			var o models.Order
			o.Items = []models.OrderItem{}
			if err := rows.Scan(&o.ID, &o.UserID, &o.Status, &o.OrderFor,
				&o.RecipientName, &o.RecipientPhone, &o.RecipientState,
				&o.RecipientAddress, &o.Subtotal, &o.DeliveryFee, &o.Total,
				&o.CashbackEarned, &o.PlacedAt); err == nil {
				orders = append(orders, o)
				orderMap[o.ID] = &orders[len(orders)-1]
			}
		}

		// Fetch order items for this vendor only
		if len(orders) > 0 {
			orderIDs := make([]string, len(orders))
			for i, o := range orders {
				orderIDs[i] = o.ID
			}
			itemRows, err := db.Pool.Query(context.Background(),
				`SELECT id, order_id, menu_item_id, name, price, quantity, image
				 FROM order_items WHERE order_id = ANY($1) AND vendor_id = $2`,
				orderIDs, vendorID,
			)
			if err == nil {
				defer itemRows.Close()
				for itemRows.Next() {
					var oi models.OrderItem
					if err := itemRows.Scan(&oi.ID, &oi.OrderID, &oi.MenuItemID,
						&oi.Name, &oi.Price, &oi.Quantity, &oi.Image); err == nil {
						if o, ok := orderMap[oi.OrderID]; ok {
							o.Items = append(o.Items, oi)
						}
					}
				}
			}
		}

		c.JSON(http.StatusOK, orders)
	}
}

type UpdateStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=pending preparing ready delivered cancelled"`
}

// UpdateOrderStatus — PATCH /api/v1/vendor/orders/:id/status
func UpdateOrderStatus() gin.HandlerFunc {
	return func(c *gin.Context) {
		vendorID, ok := resolveVendorID(c)
		if !ok {
			return
		}
		orderID := c.Param("id")

		// Verify the order belongs to this vendor
		var count int
		db.Pool.QueryRow(context.Background(),
			`SELECT COUNT(*) FROM order_items WHERE order_id = $1 AND vendor_id = $2`,
			orderID, vendorID,
		).Scan(&count)
		if count == 0 {
			c.JSON(http.StatusForbidden, gin.H{"error": "Order not found for this vendor"})
			return
		}

		var req UpdateStatusRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		_, err := db.Pool.Exec(context.Background(),
			`UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`,
			req.Status, orderID,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"status": req.Status})
	}
}

// ── Menu management ───────────────────────────────────────────

// GetVendorMenu — GET /api/v1/vendor/menu
func GetVendorMenu() gin.HandlerFunc {
	return func(c *gin.Context) {
		vendorID, ok := resolveVendorID(c)
		if !ok {
			return
		}

		rows, err := db.Pool.Query(context.Background(),
			`SELECT id, vendor_id, name, category, price, rating, prep_time, image, badge, is_available
			 FROM menu_items WHERE vendor_id = $1 ORDER BY category, name`, vendorID,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch menu"})
			return
		}
		defer rows.Close()

		items := []models.MenuItem{}
		for rows.Next() {
			var item models.MenuItem
			if err := rows.Scan(&item.ID, &item.VendorID, &item.Name, &item.Category,
				&item.Price, &item.Rating, &item.PrepTime, &item.Image, &item.Badge,
				&item.IsAvailable); err == nil {
				items = append(items, item)
			}
		}
		c.JSON(http.StatusOK, items)
	}
}

type MenuItemRequest struct {
	Name        string  `json:"name"     binding:"required"`
	Category    string  `json:"category" binding:"required"`
	Price       int     `json:"price"    binding:"required,min=1"`
	PrepTime    string  `json:"prepTime"`
	Image       string  `json:"image"`
	Badge       *string `json:"badge"`
	IsAvailable *bool   `json:"isAvailable"`
}

// CreateMenuItem — POST /api/v1/vendor/menu
func CreateMenuItem() gin.HandlerFunc {
	return func(c *gin.Context) {
		vendorID, ok := resolveVendorID(c)
		if !ok {
			return
		}
		var req MenuItemRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		available := true
		if req.IsAvailable != nil {
			available = *req.IsAvailable
		}

		var item models.MenuItem
		err := db.Pool.QueryRow(context.Background(),
			`INSERT INTO menu_items (vendor_id, name, category, price, prep_time, image, badge, is_available)
			 VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
			 RETURNING id, vendor_id, name, category, price, rating, prep_time, image, badge, is_available`,
			vendorID, req.Name, req.Category, req.Price, req.PrepTime, req.Image, req.Badge, available,
		).Scan(&item.ID, &item.VendorID, &item.Name, &item.Category, &item.Price,
			&item.Rating, &item.PrepTime, &item.Image, &item.Badge, &item.IsAvailable)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create item"})
			return
		}
		c.JSON(http.StatusCreated, item)
	}
}

// UpdateMenuItem — PATCH /api/v1/vendor/menu/:id
func UpdateMenuItem() gin.HandlerFunc {
	return func(c *gin.Context) {
		vendorID, ok := resolveVendorID(c)
		if !ok {
			return
		}
		itemID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item id"})
			return
		}
		var req MenuItemRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		available := true
		if req.IsAvailable != nil {
			available = *req.IsAvailable
		}

		var item models.MenuItem
		err = db.Pool.QueryRow(context.Background(),
			`UPDATE menu_items
			 SET name=$1, category=$2, price=$3, prep_time=$4, image=$5, badge=$6, is_available=$7
			 WHERE id=$8 AND vendor_id=$9
			 RETURNING id, vendor_id, name, category, price, rating, prep_time, image, badge, is_available`,
			req.Name, req.Category, req.Price, req.PrepTime, req.Image, req.Badge, available, itemID, vendorID,
		).Scan(&item.ID, &item.VendorID, &item.Name, &item.Category, &item.Price,
			&item.Rating, &item.PrepTime, &item.Image, &item.Badge, &item.IsAvailable)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
			return
		}
		c.JSON(http.StatusOK, item)
	}
}

// ToggleAvailability — PATCH /api/v1/vendor/menu/:id/toggle
func ToggleAvailability() gin.HandlerFunc {
	return func(c *gin.Context) {
		vendorID, ok := resolveVendorID(c)
		if !ok {
			return
		}
		itemID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item id"})
			return
		}

		var newAvailable bool
		err = db.Pool.QueryRow(context.Background(),
			`UPDATE menu_items SET is_available = NOT is_available
			 WHERE id = $1 AND vendor_id = $2
			 RETURNING is_available`,
			itemID, vendorID,
		).Scan(&newAvailable)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"isAvailable": newAvailable})
	}
}

// DeleteMenuItem — DELETE /api/v1/vendor/menu/:id
func DeleteMenuItem() gin.HandlerFunc {
	return func(c *gin.Context) {
		vendorID, ok := resolveVendorID(c)
		if !ok {
			return
		}
		itemID, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item id"})
			return
		}

		result, err := db.Pool.Exec(context.Background(),
			`DELETE FROM menu_items WHERE id = $1 AND vendor_id = $2`, itemID, vendorID,
		)
		if err != nil || result.RowsAffected() == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"deleted": itemID})
	}
}
