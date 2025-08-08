import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MenuBar from '../common/MenuBar'
import { orderService } from '../../services/orderService'

const OrdersPage = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token
    orderService
      .list(token)
      .then((res) => setOrders(res.orders || []))
      .catch(() => setError('주문 내역을 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <MenuBar />
      <div className="cart-container">
        <h1 className="cart-title">주문 내역</h1>
        {loading ? (
          <div>불러오는 중...</div>
        ) : error ? (
          <div>{error}</div>
        ) : orders.length === 0 ? (
          <div className="cart-empty">
            <p>주문 내역이 없습니다.</p>
            <Link to="/products" className="cart-link">상품 보러가기</Link>
          </div>
        ) : (
          <div className="cart-items">
            {orders.map((o) => (
              <Link to={`/orders/${o.Order_id}`} key={o.Order_id} className="cart-item" style={{display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', textDecoration:'none', color:'inherit'}}>
                <div>
                  <div className="cart-item-name">주문번호 #{o.Order_id}</div>
                  <div className="cart-item-price">{new Date(o.created_at).toLocaleString()} · {o.status}</div>
                </div>
                <div style={{fontWeight:700}}>{(o.total || 0).toLocaleString()}원</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default OrdersPage


