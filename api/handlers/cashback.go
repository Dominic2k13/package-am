package handlers

import (
	"context"
	"net/http"

	"github.com/dominic2k13/package-am-api/db"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CashbackBalance struct {
	Balance      int                  `json:"balance"`
	Transactions []CashbackTxResponse `json:"transactions"`
}

type CashbackTxResponse struct {
	ID          string `json:"id"`
	Amount      int    `json:"amount"`
	Type        string `json:"type"`
	Description string `json:"description"`
	CreatedAt   string `json:"createdAt"`
}

// GetCashback — GET /api/v1/cashback  (protected)
func GetCashback() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")

		var balance int
		err := db.Pool.QueryRow(context.Background(),
			`SELECT cashback_balance FROM users WHERE id = $1`, userID,
		).Scan(&balance)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cashback"})
			return
		}

		rows, err := db.Pool.Query(context.Background(),
			`SELECT id, amount, type, description, created_at
			 FROM cashback_transactions
			 WHERE user_id = $1
			 ORDER BY created_at DESC
			 LIMIT 50`, userID,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
			return
		}
		defer rows.Close()

		txs := []CashbackTxResponse{}
		for rows.Next() {
			var tx CashbackTxResponse
			var createdAt interface{}
			if err := rows.Scan(&tx.ID, &tx.Amount, &tx.Type, &tx.Description, &createdAt); err == nil {
				if t, ok := createdAt.(interface{ String() string }); ok {
					tx.CreatedAt = t.String()
				}
				txs = append(txs, tx)
			}
		}

		c.JSON(http.StatusOK, CashbackBalance{Balance: balance, Transactions: txs})
	}
}

type RedeemRequest struct {
	Amount int `json:"amount" binding:"required,min=500"`
}

// RedeemCashback — POST /api/v1/cashback/redeem  (protected)
func RedeemCashback() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetString("userID")

		var req RedeemRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check and deduct balance atomically
		result, err := db.Pool.Exec(context.Background(),
			`UPDATE users
			 SET cashback_balance = cashback_balance - $1
			 WHERE id = $2 AND cashback_balance >= $1`,
			req.Amount, userID,
		)
		if err != nil || result.RowsAffected() == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient cashback balance"})
			return
		}

		// Log redemption
		_, _ = db.Pool.Exec(context.Background(),
			`INSERT INTO cashback_transactions (id, user_id, amount, type, description)
			 VALUES ($1, $2, $3, 'redeemed', 'Cashback redeemed')`,
			uuid.NewString(), userID, req.Amount,
		)

		// Return updated balance
		var newBalance int
		_ = db.Pool.QueryRow(context.Background(),
			`SELECT cashback_balance FROM users WHERE id = $1`, userID,
		).Scan(&newBalance)

		c.JSON(http.StatusOK, gin.H{"balance": newBalance, "redeemed": req.Amount})
	}
}
