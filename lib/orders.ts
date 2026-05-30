// ── Order history storage ───────────────────────────────────────
// Orders are stored in localStorage under pa_orders.
// If the user is logged in, orders are tagged with userEmail so
// the orders page can filter to only show theirs.

const ORDERS_KEY = 'pa_orders'

export interface StoredOrder {
  orderId:          string
  items:            Array<{ name: string; quantity: number; price: number; image: string }>
  subtotal:         number
  deliveryFee:      number
  total:            number
  cashbackEarned:   number
  orderFor:         'myself' | 'friend'
  recipientName:    string
  recipientPhone:   string
  recipientState:   string
  recipientAddress: string
  placedAt:         string  // ISO string
  userEmail?:       string  // set when user is logged in
}

export function saveOrder(order: StoredOrder): void {
  if (typeof window === 'undefined') return
  const all = loadAllOrders()
  all.unshift(order)
  localStorage.setItem(ORDERS_KEY, JSON.stringify(all.slice(0, 50)))
}

export function loadAllOrders(): StoredOrder[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(ORDERS_KEY)
    return raw ? (JSON.parse(raw) as StoredOrder[]) : []
  } catch {
    return []
  }
}

export function loadOrdersByEmail(email: string): StoredOrder[] {
  return loadAllOrders().filter(o => o.userEmail === email)
}
