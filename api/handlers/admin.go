package handlers

import (
	"context"
	"net/http"

	"github.com/dominic2k13/package-am-api/db"
	"github.com/gin-gonic/gin"
)

// ── Platform stats ────────────────────────────────────────────

type PlatformStats struct {
	TotalUsers        int `json:"totalUsers"`
	TotalVendors      int `json:"totalVendors"`
	PendingVendors    int `json:"pendingVendors"`
	TotalOrders       int `json:"totalOrders"`
	TodayOrders       int `json:"todayOrders"`
	TotalRevenue      int `json:"totalRevenue"`
	TodayRevenue      int `json:"todayRevenue"`
	TotalCashbackPaid int `json:"totalCashbackPaid"`
}

// GetAdminStats — GET /api/v1/admin/stats
func GetAdminStats() gin.HandlerFunc {
	return func(c *gin.Context) {
		var stats PlatformStats

		db.Pool.QueryRow(context.Background(),
			`SELECT COUNT(*) FROM users WHERE role = 'customer'`,
		).Scan(&stats.TotalUsers)

		db.Pool.QueryRow(context.Background(),
			`SELECT COUNT(*) FROM vendors WHERE status = 'approved'`,
		).Scan(&stats.TotalVendors)

		db.Pool.QueryRow(context.Background(),
			`SELECT COUNT(*) FROM vendors WHERE status = 'pending'`,
		).Scan(&stats.PendingVendors)

		db.Pool.QueryRow(context.Background(),
			`SELECT COUNT(*), COUNT(CASE WHEN DATE(placed_at) = CURRENT_DATE THEN 1 END),
			        COALESCE(SUM(total),0), COALESCE(SUM(CASE WHEN DATE(placed_at) = CURRENT_DATE THEN total END),0),
			        COALESCE(SUM(cashback_earned),0)
			 FROM orders`,
		).Scan(&stats.TotalOrders, &stats.TodayOrders, &stats.TotalRevenue, &stats.TodayRevenue, &stats.TotalCashbackPaid)

		c.JSON(http.StatusOK, stats)
	}
}

// ── Vendor management ─────────────────────────────────────────

type VendorRow struct {
	ID              int     `json:"id"`
	Name            string  `json:"name"`
	Emoji           string  `json:"emoji"`
	OwnerName       string  `json:"ownerName"`
	OwnerEmail      string  `json:"ownerEmail"`
	Phone           string  `json:"phone"`
	Address         string  `json:"address"`
	City            string  `json:"city"`
	State           string  `json:"state"`
	Description     string  `json:"description"`
	Categories      []string `json:"categories"`
	Status          string  `json:"status"`
	RejectionReason *string `json:"rejectionReason,omitempty"`
	AppliedAt       string  `json:"appliedAt"`
	TotalOrders     int     `json:"totalOrders"`
	TotalRevenue    int     `json:"totalRevenue"`
}

// ListAdminVendors — GET /api/v1/admin/vendors?status=pending
func ListAdminVendors() gin.HandlerFunc {
	return func(c *gin.Context) {
		query := `SELECT v.id, v.name, v.emoji,
		                 COALESCE(u.name,''), COALESCE(u.email,''),
		                 COALESCE(v.phone,''), COALESCE(v.address,''), COALESCE(v.city,''), COALESCE(v.state,''),
		                 COALESCE(v.description,''), v.categories, v.status,
		                 v.rejection_reason, v.applied_at::text,
		                 COALESCE((SELECT SUM(oi.price*oi.quantity) FROM order_items oi WHERE oi.vendor_id=v.id),0),
		                 COALESCE((SELECT COUNT(DISTINCT oi.order_id) FROM order_items oi WHERE oi.vendor_id=v.id),0)
		          FROM vendors v
		          LEFT JOIN users u ON u.id = v.owner_user_id`
		args := []any{}
		if status := c.Query("status"); status != "" {
			query += " WHERE v.status = $1"
			args = append(args, status)
		}
		query += " ORDER BY v.applied_at DESC"

		rows, err := db.Pool.Query(context.Background(), query, args...)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch vendors"})
			return
		}
		defer rows.Close()

		vendors := []VendorRow{}
		for rows.Next() {
			var v VendorRow
			var totalRev, totalOrd int
			if err := rows.Scan(
				&v.ID, &v.Name, &v.Emoji, &v.OwnerName, &v.OwnerEmail,
				&v.Phone, &v.Address, &v.City, &v.State, &v.Description,
				&v.Categories, &v.Status, &v.RejectionReason, &v.AppliedAt,
				&totalRev, &totalOrd,
			); err == nil {
				v.TotalRevenue = totalRev
				v.TotalOrders = totalOrd
				vendors = append(vendors, v)
			}
		}
		c.JSON(http.StatusOK, vendors)
	}
}

type ApproveRequest struct {
	Approved bool   `json:"approved"`
	Reason   string `json:"reason"` // rejection reason if approved=false
}

// ApproveVendor — PATCH /api/v1/admin/vendors/:id/review
func ReviewVendor() gin.HandlerFunc {
	return func(c *gin.Context) {
		vendorID := c.Param("id")
		var req ApproveRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		status := "approved"
		if !req.Approved {
			status = "rejected"
		}

		_, err := db.Pool.Exec(context.Background(),
			`UPDATE vendors SET status = $1, rejection_reason = $2 WHERE id = $3`,
			status, req.Reason, vendorID,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update vendor"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"status": status, "vendorId": vendorID})
	}
}

// ── Users ─────────────────────────────────────────────────────

type UserRow struct {
	ID              string `json:"id"`
	Name            string `json:"name"`
	Email           string `json:"email"`
	Role            string `json:"role"`
	CashbackBalance int    `json:"cashbackBalance"`
	TotalOrders     int    `json:"totalOrders"`
	TotalSpent      int    `json:"totalSpent"`
	CreatedAt       string `json:"createdAt"`
}

// ListAllUsers — GET /api/v1/admin/users
func ListAllUsers() gin.HandlerFunc {
	return func(c *gin.Context) {
		rows, err := db.Pool.Query(context.Background(),
			`SELECT u.id, u.name, u.email, u.role, u.cashback_balance, u.created_at::text,
			        COALESCE((SELECT COUNT(*) FROM orders WHERE user_id = u.id),0),
			        COALESCE((SELECT SUM(total) FROM orders WHERE user_id = u.id),0)
			 FROM users u
			 ORDER BY u.created_at DESC`,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
			return
		}
		defer rows.Close()

		users := []UserRow{}
		for rows.Next() {
			var u UserRow
			if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.CashbackBalance,
				&u.CreatedAt, &u.TotalOrders, &u.TotalSpent); err == nil {
				users = append(users, u)
			}
		}
		c.JSON(http.StatusOK, users)
	}
}

// ── All Orders ────────────────────────────────────────────────

// ListAllOrders — GET /api/v1/admin/orders?status=pending
func ListAllOrders() gin.HandlerFunc {
	return func(c *gin.Context) {
		query := `SELECT o.id, o.status, o.recipient_name, o.total, o.cashback_earned,
		                 o.placed_at::text, u.name, u.email
		          FROM orders o
		          JOIN users u ON u.id = o.user_id`
		args := []any{}
		if status := c.Query("status"); status != "" {
			query += " WHERE o.status = $1"
			args = append(args, status)
		}
		query += " ORDER BY o.placed_at DESC LIMIT 200"

		rows, err := db.Pool.Query(context.Background(), query, args...)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
			return
		}
		defer rows.Close()

		type OrderSummary struct {
			ID             string `json:"id"`
			Status         string `json:"status"`
			RecipientName  string `json:"recipientName"`
			Total          int    `json:"total"`
			CashbackEarned int    `json:"cashbackEarned"`
			PlacedAt       string `json:"placedAt"`
			CustomerName   string `json:"customerName"`
			CustomerEmail  string `json:"customerEmail"`
		}

		orders := []OrderSummary{}
		for rows.Next() {
			var o OrderSummary
			if err := rows.Scan(&o.ID, &o.Status, &o.RecipientName, &o.Total,
				&o.CashbackEarned, &o.PlacedAt, &o.CustomerName, &o.CustomerEmail); err == nil {
				orders = append(orders, o)
			}
		}
		c.JSON(http.StatusOK, orders)
	}
}
