package models

import "time"

type OrderStatus string

const (
	StatusPending   OrderStatus = "pending"
	StatusPreparing OrderStatus = "preparing"
	StatusReady     OrderStatus = "ready"
	StatusDelivered OrderStatus = "delivered"
)

type OrderItem struct {
	ID         int    `json:"id"`
	OrderID    string `json:"orderId"`
	MenuItemID int    `json:"menuItemId"`
	Name       string `json:"name"`
	Price      int    `json:"price"`
	Quantity   int    `json:"quantity"`
	Image      string `json:"image"`
}

type Order struct {
	ID               string      `json:"id"`
	UserID           string      `json:"userId"`
	Status           OrderStatus `json:"status"`
	OrderFor         string      `json:"orderFor"`
	RecipientName    string      `json:"recipientName"`
	RecipientPhone   string      `json:"recipientPhone"`
	RecipientState   string      `json:"recipientState"`
	RecipientAddress string      `json:"recipientAddress"`
	Items            []OrderItem `json:"items"`
	Subtotal         int         `json:"subtotal"`
	DeliveryFee      int         `json:"deliveryFee"`
	Total            int         `json:"total"`
	CashbackEarned   int         `json:"cashbackEarned"`
	PlacedAt         time.Time   `json:"placedAt"`
}

// PlaceOrderRequest is the payload for POST /orders
type PlaceOrderRequest struct {
	OrderFor         string      `json:"orderFor"         binding:"required,oneof=myself friend"`
	RecipientName    string      `json:"recipientName"    binding:"required"`
	RecipientPhone   string      `json:"recipientPhone"   binding:"required"`
	RecipientState   string      `json:"recipientState"   binding:"required"`
	RecipientAddress string      `json:"recipientAddress" binding:"required"`
	Items            []CartItem  `json:"items"            binding:"required,min=1"`
}

type CartItem struct {
	MenuItemID int    `json:"menuItemId" binding:"required"`
	Name       string `json:"name"       binding:"required"`
	Price      int    `json:"price"      binding:"required"`
	Quantity   int    `json:"quantity"   binding:"required,min=1"`
	Image      string `json:"image"`
}
