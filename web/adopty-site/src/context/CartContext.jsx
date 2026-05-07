import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'adopty_cart'

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => loadFromStorage())

  // Persiste chaque changement dans localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems))
    } catch { /* silencieux */ }
  }, [cartItems])

  const addToCart = (produit) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === produit.id)
      if (existing) {
        // Ne pas dépasser le stock disponible
        const newQty = Math.min(existing.qty + 1, produit.stock ?? 99)
        return prev.map(item =>
          item.id === produit.id ? { ...item, qty: newQty } : item
        )
      }
      return [...prev, { ...produit, qty: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const updateQty = (id, qty) => {
    if (qty < 1) { removeFromCart(id); return }
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, qty } : item))
  }

  const clearCart = () => {
    setCartItems([])
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* silencieux */ }
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0)
  const totalPrice = cartItems.reduce((sum, item) => sum + item.prix * item.qty, 0)
  const isInCart = (id) => cartItems.some(item => item.id === String(id))

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      totalItems,
      totalPrice,
      isInCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
