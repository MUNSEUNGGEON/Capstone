import { Link, useNavigate } from 'react-router-dom'
import MenuBar from '../common/MenuBar'
import { useCart } from '../../contexts/CartContext'
import './CartPage.css'

const formatCurrency = (n) => n.toLocaleString() + '원'

const CartPage = () => {
  const navigate = useNavigate()
  const { items, updateQuantity, removeItem, subtotal, deliveryFee, total, itemCount } = useCart()

  const goCheckout = () => {
    if (itemCount === 0) return
    navigate('/checkout')
  }

  return (
    <>
      <MenuBar />
      <div className="cart-container">
        <h1 className="cart-title">장바구니</h1>

        {items.length === 0 ? (
          <div className="cart-empty">
            <p>장바구니가 비어있습니다.</p>
            <Link to="/products" className="cart-link">상품 보러가기</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.product_id} className="cart-item">
                  <img src={item.img || '/placeholder-image.jpg'} alt={item.food_products} className="cart-item-image" onError={(e)=>{e.target.src='/placeholder-image.jpg'}} />
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.food_products}</div>
                    <div className="cart-item-price">{formatCurrency(item.price)}</div>
                    <div className="cart-item-controls">
                      <button className="qty-btn" onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}>-</button>
                      <input className="qty-input" type="number" min={1} value={item.quantity} onChange={(e)=>updateQuantity(item.product_id, Math.max(1, parseInt(e.target.value)||1))} />
                      <button className="qty-btn" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
                      <button className="remove-btn" onClick={() => removeItem(item.product_id)}>삭제</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="cart-summary">
              <div className="summary-row"><span>상품금액</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="summary-row"><span>배송비</span><span>{deliveryFee === 0 ? '무료' : formatCurrency(deliveryFee)}</span></div>
              <div className="summary-total"><span>결제예정금액</span><span>{formatCurrency(total)}</span></div>

              <button className="checkout-btn" onClick={goCheckout}>주문하기</button>
              <Link to="/products" className="continue-link">계속 쇼핑하기</Link>
            </aside>
          </div>
        )}
      </div>
    </>
  )
}

export default CartPage


