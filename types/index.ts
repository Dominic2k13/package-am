export interface Vendor {
  id:           number
  name:         string
  emoji:        string       // used as avatar when no image available
  tagline:      string
  description:  string
  address:      string
  city:         string
  state:        string
  rating:       number
  reviewCount:  number
  deliveryTime: string
  minOrder:     number
  categories:   string[]
  isOpen:       boolean
  badge?:       string
  phone:        string
  instagram?:   string
  tiktok?:      string
}

export interface FoodItem {
  id:       number
  name:     string
  category: string
  vendorId?: number     // links item to a specific vendor
  price:    number
  rating:   number
  time:     string
  image:    string
  badge?:   string
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
