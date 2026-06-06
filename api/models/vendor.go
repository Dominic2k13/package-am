package models

import "time"

type Vendor struct {
	ID           int      `json:"id"`
	Name         string   `json:"name"`
	Emoji        string   `json:"emoji"`
	Tagline      string   `json:"tagline"`
	Description  string   `json:"description"`
	Address      string   `json:"address"`
	City         string   `json:"city"`
	State        string   `json:"state"`
	Rating       float64  `json:"rating"`
	ReviewCount  int      `json:"reviewCount"`
	DeliveryTime string   `json:"deliveryTime"`
	MinOrder     int      `json:"minOrder"`
	Categories   []string `json:"categories"`
	IsOpen       bool     `json:"isOpen"`
	Badge        *string  `json:"badge,omitempty"`
	Phone        string   `json:"phone"`
	Instagram    *string  `json:"instagram,omitempty"`
	TikTok       *string  `json:"tiktok,omitempty"`
	CreatedAt    time.Time `json:"-"`
}
