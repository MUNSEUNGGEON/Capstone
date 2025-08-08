import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MenuBar from '../common/MenuBar'
import { orderService } from '../../services/orderService'
import './CheckoutPage.css'

const formatCurrency = (n) => (n || 0).toLocaleString() + '원'

const OrderDetailPage = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token
    orderService
      .detail(id, token)
      .then((res) => {
        setOrder(res.order)
        setItems(res.items || [])
      })
      .catch(() => setError('주문 상세를 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <>
      <MenuBar />
      <div className="checkout-container">
        <h1 className="checkout-title">주문 상세</h1>
        {loading ? (
          <div>불러오는 중...</div>
        ) : error ? (
          <div>{error}</div>
        ) : !order ? (
          <div>주문을 찾을 수 없습니다.</div>
        ) : (
          <div className="checkout-layout">
            <div className="checkout-left">
              <section className="panel">
                <div className="panel-header">
                  <h2>주문정보</h2>
                </div>
                <div className="address-view">
                  <div className="addr-line">주문번호 #{order.Order_id}</div>
                  <div className="addr-line">주문일시 {new Date(order.created_at).toLocaleString()}</div>
                  <div className="addr-line">상태 {order.status}</div>
                </div>
              </section>

              <section className="panel">
                <div className="panel-header">
                  <h2>배송지</h2>
                </div>
                <div className="address-view">
                  <div className="addr-name">{order.recipient_name}</div>
                  <div className="addr-line">{order.recipient_phone}</div>
                  <div className="addr-line">{order.postal_code ? `[${order.postal_code}] ` : ''}{order.address}</div>
                  {order.address_detail && <div className="addr-line">{order.address_detail}</div>}
                </div>
              </section>

              {order.request_text && (
                <section className="panel">
                  <div className="panel-header"><h2>배송 요청사항</h2></div>
                  <div className="address-view"><div className="addr-line">{order.request_text}</div></div>
                </section>
              )}

              <section className="panel">
                <div className="panel-header"><h2>주문 상품</h2></div>
                <div className="checkout-items">
                  {items.map((item) => (
                    <div key={item.Order_item_id} className="checkout-item" style={{gridTemplateColumns:'1fr auto'}}>
                      <div className="checkout-item-info">
                        <div className="checkout-item-name">{item.product_name}</div>
                        <div className="checkout-item-meta">수량 {item.quantity}개 · {formatCurrency(item.price)}</div>
                      </div>
                      <div className="checkout-item-line-price">{formatCurrency(item.line_total)}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <aside className="checkout-summary">
              <div className="summary-row"><span>상품금액</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className="summary-row"><span>배송비</span><span>{order.delivery_fee === 0 ? '무료' : formatCurrency(order.delivery_fee)}</span></div>
              <div className="summary-total"><span>결제금액</span><span>{formatCurrency(order.total)}</span></div>
              <Link to="/orders" className="back-to-cart">주문 목록으로</Link>
            </aside>
          </div>
        )}
      </div>
    </>
  )
}

export default OrderDetailPage


