import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cartItems')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(items))
    } catch {}
  }, [items])

  const addItem = (product, quantity = 1) => {
    const safePrice = parseInt(product.price || 0)
    const normalized = {
      product_id: product.product_id ?? product.id ?? product.Product_id,
      food_products: product.food_products ?? product.name ?? product.Product_name,
      price: isNaN(safePrice) ? 0 : safePrice,
      img: product.img || product.image || '',
    }

    setItems((prev) => {
      const existingIndex = prev.findIndex((p) => p.product_id === normalized.product_id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        }
        return updated
      }
      return [...prev, { ...normalized, quantity }]
    })
  }

  const updateQuantity = (productId, quantity) => {
    setItems((prev) => prev.map((p) => (p.product_id === productId ? { ...p, quantity } : p)))
  }

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((p) => p.product_id !== productId))
  }

  const clear = () => setItems([])

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const deliveryFee = subtotal >= 40000 || subtotal === 0 ? 0 : 3000
    const total = subtotal + deliveryFee
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
    return { subtotal, deliveryFee, total, itemCount }
  }, [items])

  const value = useMemo(
    () => ({ items, addItem, updateQuantity, removeItem, clear, ...totals }),
    [items, totals]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}


