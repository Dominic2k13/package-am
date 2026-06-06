package models

type MenuItem struct {
	ID          int     `json:"id"`
	VendorID    *int    `json:"vendorId,omitempty"`
	Name        string  `json:"name"`
	Category    string  `json:"category"`
	Price       int     `json:"price"` // in Naira
	Rating      float64 `json:"rating"`
	PrepTime    string  `json:"time"`
	Image       string  `json:"image"`
	Badge       *string `json:"badge,omitempty"`
	IsAvailable bool    `json:"isAvailable"`
}
