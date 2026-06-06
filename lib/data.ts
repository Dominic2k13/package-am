import type { FoodItem, MenuItem, Order, Transaction } from '@/types'

export const CATEGORIES = [
  { id: 'all',      label: 'All',      emoji: '🍽️' },
  { id: 'nigerian', label: 'Nigerian', emoji: '🇳🇬' },
  { id: 'pizza',    label: 'Pizza',    emoji: '🍕' },
  { id: 'shawarma', label: 'Shawarma', emoji: '🌯' },
  { id: 'fast-food',label: 'Fast Food',emoji: '🍔' },
  { id: 'rice',     label: 'Rice',     emoji: '🍚' },
  { id: 'drinks',   label: 'Drinks',   emoji: '🥤' },
  { id: 'soups',    label: 'Soups',    emoji: '🍲' },
  { id: 'snacks',   label: 'Snacks',   emoji: '🍟' },
]

// ── General / platform items ───────────────────────────────────
export const FOOD_ITEMS: FoodItem[] = [

  // ── General platform items (no specific vendor) ──────────────
  { id: 1,  name: 'Jollof Rice & Chicken',  category: 'nigerian',  price: 2500,  rating: 4.8, time: '20–30 min', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=500&q=80', badge: '🔥 Bestseller',  cashback: 125 },
  { id: 2,  name: 'Suya Platter',           category: 'nigerian',  price: 3000,  rating: 4.9, time: '25–35 min', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80', badge: '⭐ Top Rated',   cashback: 150 },
  { id: 3,  name: 'Peppered Egusi Soup',    category: 'soups',     price: 2200,  rating: 4.7, time: '30–40 min', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=500&q=80', badge: '🇳🇬 Local Fav', cashback: 110 },
  { id: 4,  name: 'Beef Burger & Fries',    category: 'fast-food', price: 3500,  rating: 4.6, time: '15–25 min', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80', badge: '🔥 Hot Deal',    cashback: 175 },
  { id: 5,  name: 'Margherita Pizza',       category: 'pizza',     price: 4500,  rating: 4.7, time: '25–35 min', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80', badge: '💛 Fan Fav',     cashback: 225 },
  { id: 6,  name: 'Fried Rice & Plantain',  category: 'rice',      price: 2000,  rating: 4.5, time: '20–30 min', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80',                          cashback: 100 },
  { id: 7,  name: 'Chapman Cocktail',       category: 'drinks',    price:  900,  rating: 4.4, time: '5–10 min',  image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=80', badge: '🥤 Refreshing',  cashback:  45 },
  { id: 8,  name: 'Puff Puff',              category: 'snacks',    price:  800,  rating: 4.6, time: '10–15 min', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80', badge: '🆕 New',          cashback:  40 },
  { id: 9,  name: 'Banga Soup & Starch',    category: 'soups',     price: 2800,  rating: 4.8, time: '30–45 min', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=500&q=80', badge: '⭐ Top Rated',  cashback: 140 },
  { id: 10, name: 'Pepperoni Pizza',        category: 'pizza',     price: 5000,  rating: 4.9, time: '25–35 min', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80', badge: '🔥 Bestseller', cashback: 250 },
  { id: 11, name: 'Shawarma Wrap',          category: 'shawarma',  price: 2200,  rating: 4.7, time: '15–20 min', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80',                          cashback: 110 },
  { id: 12, name: 'Fresh Zobo Drink',       category: 'drinks',    price:  700,  rating: 4.5, time: '5–10 min',  image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=80', badge: '🥤 Refreshing',  cashback:  35 },

  // ── Gineer Tasty Grills (vendorId: 1) ── Enugu ───────────────
  // Pizza
  { id: 13, vendorId: 1, name: 'Gineer Special Mix Pizza (Medium)',      category: 'pizza',     price: 14000, rating: 5.0, time: '30–40 min', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&q=80', badge: '⭐ All Protein',  cashback: 700  },
  { id: 14, vendorId: 1, name: 'Beef Pizza (Medium)',                     category: 'pizza',     price: 12000, rating: 4.8, time: '30–40 min', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&q=80', badge: '🔥 Bestseller',  cashback: 600  },
  { id: 15, vendorId: 1, name: 'Chicken Pizza (Medium)',                  category: 'pizza',     price: 10000, rating: 4.7, time: '30–40 min', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',                          cashback: 500  },
  { id: 16, vendorId: 1, name: 'Chicken & Beef Mix Pizza (Medium)',       category: 'pizza',     price: 13000, rating: 4.8, time: '30–40 min', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80', badge: '💛 Fan Fav',     cashback: 650  },
  { id: 17, vendorId: 1, name: 'Turkey Pizza (Medium)',                   category: 'pizza',     price: 13000, rating: 4.7, time: '30–40 min', image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&q=80',                          cashback: 650  },
  { id: 18, vendorId: 1, name: 'Suya Mix Pizza (Large)',                  category: 'pizza',     price: 16000, rating: 4.9, time: '30–40 min', image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&q=80', badge: '🔥 Spicy Hit',   cashback: 800  },

  // Shawarma
  { id: 19, vendorId: 1, name: 'Chicken Shawarma (King Size)',            category: 'shawarma',  price: 5000,  rating: 4.8, time: '15–25 min', image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80', badge: '🔥 Bestseller',  cashback: 250  },
  { id: 20, vendorId: 1, name: 'Turkey Shawarma (King Size)',             category: 'shawarma',  price: 7000,  rating: 4.9, time: '15–25 min', image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&q=80', badge: '⭐ Top Rated',   cashback: 350  },
  { id: 21, vendorId: 1, name: 'Mixed Shawarma — Chicken & Beef (King)',  category: 'shawarma',  price: 6000,  rating: 4.7, time: '15–25 min', image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&q=80',                          cashback: 300  },
  { id: 22, vendorId: 1, name: 'Suya Mix Shawarma (King Size)',           category: 'shawarma',  price: 7000,  rating: 4.8, time: '15–25 min', image: 'https://images.unsplash.com/photo-1551615593-ef5fe247e8f7?w=500&q=80', badge: '🔥 Spicy',       cashback: 350  },
  { id: 23, vendorId: 1, name: 'Gineer Zero Veggies Shawarma',            category: 'shawarma',  price: 8000,  rating: 4.9, time: '15–25 min', image: 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=500&q=80', badge: '🆕 Special',     cashback: 400  },
  { id: 24, vendorId: 1, name: 'Gineer All Combo Shawarma',               category: 'shawarma',  price: 12000, rating: 5.0, time: '20–30 min', image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500&q=80', badge: '👑 Ultimate',    cashback: 600  },

  // Burgers & Fast food
  { id: 25, vendorId: 1, name: 'Beef Burger (Single Patty)',              category: 'fast-food', price: 4500,  rating: 4.6, time: '20–30 min', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80',                          cashback: 225  },
  { id: 26, vendorId: 1, name: 'Chicken Burger',                          category: 'fast-food', price: 7000,  rating: 4.7, time: '20–30 min', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&q=80', badge: '💛 Fan Fav',     cashback: 350  },
  { id: 27, vendorId: 1, name: 'Burger Combo (Burger, Sausage & Chips)',  category: 'fast-food', price: 10000, rating: 4.8, time: '25–35 min', image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=500&q=80', badge: '🔥 Best Value',  cashback: 500  },
  { id: 28, vendorId: 1, name: 'Loaded Fries',                            category: 'snacks',    price: 7000,  rating: 4.7, time: '15–20 min', image: 'https://images.unsplash.com/photo-1630431341973-02e1b662ec35?w=500&q=80',                          cashback: 350  },

  // Drinks & Desserts
  { id: 29, vendorId: 1, name: 'Vanilla Milkshake',                       category: 'drinks',    price: 4000,  rating: 4.6, time: '10–15 min', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&q=80',                          cashback: 200  },
  { id: 30, vendorId: 1, name: 'Mixed Oreo Milkshake',                    category: 'drinks',    price: 5000,  rating: 4.8, time: '10–15 min', image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=500&q=80', badge: '⭐ Top Pick',    cashback: 250  },
  { id: 31, vendorId: 1, name: 'Fruit Parfait (12oz)',                    category: 'snacks',    price: 5000,  rating: 4.8, time: '10–15 min', image: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=500&q=80', badge: '🆕 New',         cashback: 250  },
  { id: 32, vendorId: 1, name: 'Zobo Drink (50cl)',                       category: 'drinks',    price: 1000,  rating: 4.5, time: '5–10 min',  image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500&q=80', badge: '🥤 Refreshing',  cashback:  50  },
]

export const VENDOR_MENU: MenuItem[] = [
  { id: 1, name: 'Jollof Rice & Chicken', category: 'Nigerian', price: 2500, prepTime: '20–30 min', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=300&q=80', available: true,  ordersToday: 24 },
  { id: 2, name: 'Suya Platter',          category: 'Nigerian', price: 3000, prepTime: '25–35 min', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&q=80', available: true,  ordersToday: 18 },
  { id: 3, name: 'Egusi Soup',            category: 'Soups',    price: 2200, prepTime: '30–40 min', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=300&q=80', available: false, ordersToday: 11 },
  { id: 4, name: 'Fried Rice & Plantain', category: 'Rice',     price: 2000, prepTime: '20–30 min', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&q=80', available: true,  ordersToday: 16 },
  { id: 5, name: 'Puff Puff',             category: 'Snacks',   price:  800, prepTime: '10–15 min', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&q=80', available: true,  ordersToday: 30 },
  { id: 6, name: 'Banga Soup',            category: 'Soups',    price: 2800, prepTime: '30–45 min', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=300&q=80', available: true,  ordersToday:  9 },
]

export const VENDOR_ORDERS: Order[] = [
  { id: '#PA-001', customer: 'Amaka Obi',    avatar: 'AO', items: ['Jollof Rice & Chicken', 'Zobo Drink'],  total: 3200, status: 'pending',   time: '5 mins ago',  address: '12 Allen Ave, Ikeja',       cashbackEarned: 160 },
  { id: '#PA-002', customer: 'Chidi Eze',    avatar: 'CE', items: ['Suya Platter', 'Puff Puff'],            total: 3800, status: 'preparing', time: '12 mins ago', address: '7 Broad St, Lagos Island',  cashbackEarned: 190 },
  { id: '#PA-003', customer: 'Ngozi Bello',  avatar: 'NB', items: ['Egusi Soup', 'Fried Rice'],             total: 4200, status: 'ready',     time: '20 mins ago', address: '3 Marina Rd, VI',           cashbackEarned: 210 },
  { id: '#PA-004', customer: 'Tunde Fashola',avatar: 'TF', items: ['Banga Soup', 'Chapman'],                total: 3700, status: 'delivered', time: '35 mins ago', address: '15 Opebi Link, Ikeja',      cashbackEarned: 185 },
  { id: '#PA-005', customer: 'Ifeoma Nwosu', avatar: 'IN', items: ['Pepperoni Pizza', 'Zobo'],              total: 5700, status: 'pending',   time: '8 mins ago',  address: '22 Bode Thomas, Surulere',  cashbackEarned: 285 },
  { id: '#PA-006', customer: 'Emeka Okafor', avatar: 'EO', items: ['Jollof Rice & Chicken'],                total: 2500, status: 'preparing', time: '18 mins ago', address: '9 Awolowo Rd, Ikoyi',       cashbackEarned: 125 },
]

export const VENDOR_TRANSACTIONS: Transaction[] = [
  { id: 't1', customer: 'Amaka Obi',    avatar: 'AO', orderId: '#PA-001', amount: 3200, cashback: 160, time: '5 mins ago'  },
  { id: 't2', customer: 'Chidi Eze',    avatar: 'CE', orderId: '#PA-002', amount: 3800, cashback: 190, time: '12 mins ago' },
  { id: 't3', customer: 'Ngozi Bello',  avatar: 'NB', orderId: '#PA-003', amount: 4200, cashback: 210, time: '20 mins ago' },
  { id: 't4', customer: 'Tunde Fashola',avatar: 'TF', orderId: '#PA-004', amount: 3700, cashback: 185, time: '35 mins ago' },
  { id: 't5', customer: 'Ifeoma Nwosu', avatar: 'IN', orderId: '#PA-005', amount: 5700, cashback: 285, time: '8 mins ago'  },
]

export const WEEKLY_REVENUE = [
  { day: 'Mon', amount: 42000 },
  { day: 'Tue', amount: 58000 },
  { day: 'Wed', amount: 35000 },
  { day: 'Thu', amount: 72000 },
  { day: 'Fri', amount: 91000 },
  { day: 'Sat', amount: 84500 },
  { day: 'Sun', amount: 67000 },
]
