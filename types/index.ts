export interface FoodItem {
  id: number
  name: string
  category: string
  price: number
  rating: number
  time: string
  image: string
  badge?: string
  cashback: number
}

export interface CartItem extends FoodItem {
  quantity: number
}

export interface Order {
  id: string
  customer: string
  avatar: string
  items: string[]
  total: number
  status: 'pending' | 'preparing' | 'ready' | 'delivered'
  time: string
  address: string
  cashbackEarned: number
}

export interface MenuItem {
  id: number
  name: string
  category: string
  price: number
  prepTime: string
  image: string
  available: boolean
  ordersToday: number
}

export interface Transaction {
  id: string
  customer: string
  avatar: string
  orderId: string
  amount: number
  cashback: number
  time: string
}
