import type { Vendor } from '@/types'

// ── Vendor registry ────────────────────────────────────────────
// Each vendor has a unique id that matches vendorId on their FoodItems.
// Add new vendors here — they automatically appear on the menu page.

export const VENDORS: Vendor[] = [
  {
    id:           1,
    name:         'Gineer Tasty Grills',
    emoji:        '🍕',
    tagline:      'Tickle Your Taste Bud',
    description:  "Enugu's home of authentic pizza, shawarma, burgers, grills and refreshing drinks. Every bite tells a story.",
    address:      'Amazon Extension, Rangers Avenue, Beside Ignition Lounge',
    city:         'Enugu',
    state:        'Enugu',
    rating:       4.9,
    reviewCount:  243,
    deliveryTime: '20–40 min',
    minOrder:     3000,
    categories:   ['Pizza', 'Shawarma', 'Burgers', 'Drinks', 'Desserts'],
    isOpen:       true,
    badge:        '🔥 Popular',
    phone:        '08064129532',
    instagram:    '@gineertasty',
    tiktok:       'gineer.tasty.grill',
  },
]

export function getVendorById(id: number): Vendor | undefined {
  return VENDORS.find(v => v.id === id)
}
