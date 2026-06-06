package handlers

import (
	"context"
	"net/http"

	"github.com/dominic2k13/package-am-api/db"
	"github.com/dominic2k13/package-am-api/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	deliveryFee      = 1500  // flat ₦1500 delivery fee
	cashbackRatePct  = 5     // 5% cashback (will be configurable later)
)

// PlaceOrder — POST /api/v1/orders  (protected)
func PlaceOrder() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")

		var req models.PlaceOrderRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Calculate totals
		subtotal := 0
		for _, item := range req.Items {
			subtotal += item.Price * item.Quantity
		}
		total := subtotal + deliveryFee
		cashbackEarned := (total * cashbackRatePct) / 100

		orderID := uuid.NewString()

		// Begin transaction
		tx, err := db.Pool.Begin(context.Background())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
			return
		}
		defer tx.Rollback(context.Background())

		// Insert order
		var order models.Order
		err = tx.QueryRow(context.Background(),
			`INSERT INTO orders
			   (id, user_id, status, order_for, recipient_name, recipient_phone,
			    recipient_state, recipient_address, subtotal, delivery_fee, total, cashback_earned)
			 VALUES ($1,$2,'pending',$3,$4,$5,$6,$7,$8,$9,$10,$11)
			 RETURNING id, user_id, status, order_for, recipient_name, recipient_phone,
			           recipient_state, recipient_address, subtotal, delivery_fee, total,
			           cashback_earned, placed_at`,
			orderID, userID, req.OrderFor, req.RecipientName, req.RecipientPhone,
			req.RecipientState, req.RecipientAddress,
			subtotal, deliveryFee, total, cashbackEarned,
		).Scan(
			&order.ID, &order.UserID, &order.Status, &order.OrderFor,
			&order.RecipientName, &order.RecipientPhone, &order.RecipientState,
			&order.RecipientAddress, &order.Subtotal, &order.DeliveryFee,
			&order.Total, &order.CashbackEarned, &order.PlacedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
			return
		}

		// Insert order items
		order.Items = []models.OrderItem{}
		for _, ci := range req.Items {
			var oi models.OrderItem
			err = tx.QueryRow(context.Background(),
				`INSERT INTO order_items (order_id, menu_item_id, name, price, quantity, image)
				 VALUES ($1,$2,$3,$4,$5,$6)
				 RETURNING id, order_id, menu_item_id, name, price, quantity, image`,
				orderID, ci.MenuItemID, ci.Name, ci.Price, ci.Quantity, ci.Image,
			).Scan(&oi.ID, &oi.OrderID, &oi.MenuItemID, &oi.Name, &oi.Price, &oi.Quantity, &oi.Image)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save order item"})
				return
			}
			order.Items = append(order.Items, oi)
		}

		// Credit cashback to user
		_, err = tx.Exec(context.Background(),
			`UPDATE users SET cashback_balance = cashback_balance + $1 WHERE id = $2`,
			cashbackEarned, userID,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to credit cashback"})
			return
		}

		// Log cashback transaction
		_, err = tx.Exec(context.Background(),
			`INSERT INTO cashback_transactions (id, user_id, amount, type, description, order_id)
			 VALUES ($1, $2, $3, 'earned', $4, $5)`,
			uuid.NewString(), userID, cashbackEarned,
			"Cashback from order #"+orderID[:8],
			orderID,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to log cashback"})
			return
		}

		if err := tx.Commit(context.Background()); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit order"})
			return
		}

		c.JSON(http.StatusCreated, order)
	}
}

// ListOrders — GET /api/v1/orders  (protected)
func ListOrders() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")

		rows, err := db.Pool.Query(context.Background(),
			`SELECT o.id, o.user_id, o.status, o.order_for, o.recipient_name, o.recipient_phone,
			        o.recipient_state, o.recipient_address, o.subtotal, o.delivery_fee, o.total,
			        o.cashback_earned, o.placed_at
			 FROM orders o
			 WHERE o.user_id = $1
			 ORDER BY o.placed_at DESC`, userID,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
			return
		}
		defer rows.Close()

		orders := []models.Order{}
		for rows.Next() {
			var o models.Order
			if err := rows.Scan(
				&o.ID, &o.UserID, &o.Status, &o.OrderFor,
				&o.RecipientName, &o.RecipientPhone, &o.RecipientState,
				&o.RecipientAddress, &o.Subtotal, &o.DeliveryFee,
				&o.Total, &o.CashbackEarned, &o.PlacedAt,
			); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan order"})
				return
			}
			o.Items = []models.OrderItem{}
			orders = append(orders, o)
		}

		// Fetch items for all orders in one query
		if len(orders) > 0 {
			orderIDs := make([]string, len(orders))
			orderMap := map[string]*models.Order{}
			for i := range orders {
				orderIDs[i] = orders[i].ID
				orderMap[orders[i].ID] = &orders[i]
			}

			itemRows, err := db.Pool.Query(context.Background(),
				`SELECT id, order_id, menu_item_id, name, price, quantity, image
				 FROM order_items WHERE order_id = ANY($1)`, orderIDs,
			)
			if err == nil {
				defer itemRows.Close()
				for itemRows.Next() {
					var oi models.OrderItem
					if err := itemRows.Scan(&oi.ID, &oi.OrderID, &oi.MenuItemID, &oi.Name, &oi.Price, &oi.Quantity, &oi.Image); err == nil {
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

// GetOrder — GET /api/v1/orders/:id  (protected)
func GetOrder() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")
		orderID := c.Param("id")

		var o models.Order
		err := db.Pool.QueryRow(context.Background(),
			`SELECT id, user_id, status, order_for, recipient_name, recipient_phone,
			        recipient_state, recipient_address, subtotal, delivery_fee, total,
			        cashback_earned, placed_at
			 FROM orders WHERE id = $1 AND user_id = $2`, orderID, userID,
		).Scan(
			&o.ID, &o.UserID, &o.Status, &o.OrderFor,
			&o.RecipientName, &o.RecipientPhone, &o.RecipientState,
			&o.RecipientAddress, &o.Subtotal, &o.DeliveryFee,
			&o.Total, &o.CashbackEarned, &o.PlacedAt,
		)
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
			return
		}

		// Fetch items
		itemRows, err := db.Pool.Query(context.Background(),
			`SELECT id, order_id, menu_item_id, name, price, quantity, image
			 FROM order_items WHERE order_id = $1`, orderID,
		)
		o.Items = []models.OrderItem{}
		if err == nil {
			defer itemRows.Close()
			for itemRows.Next() {
				var oi models.OrderItem
				if err := itemRows.Scan(&oi.ID, &oi.OrderID, &oi.MenuItemID, &oi.Name, &oi.Price, &oi.Quantity, &oi.Image); err == nil {
					o.Items = append(o.Items, oi)
				}
			}
		}

		c.JSON(http.StatusOK, o)
	}
}
