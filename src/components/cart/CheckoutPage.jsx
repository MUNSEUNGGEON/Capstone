import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import MenuBar from '../common/MenuBar'
import { useCart } from '../../contexts/CartContext'
import './CheckoutPage.css'
import { orderService } from '../../services/orderService'

const formatCurrency = (n) => n.toLocaleString() + '원'

const deliveryRequests = [
  '문 앞에 놓아주세요',
  '경비실에 맡겨주세요',
  '직접 수령하겠습니다',
  '벨 누르지 말아주세요',
  '직접 입력',
]

const CheckoutPage = ({ userInfo }) => {
  const { items, subtotal, deliveryFee, total, clear } = useCart()

  const defaultName = userInfo?.name || userInfo?.User_name || ''
  const defaultPhone = userInfo?.phone_number || userInfo?.User_phone || ''
  const defaultZip = userInfo?.postal_address || ''
  const defaultAddr = userInfo?.address || userInfo?.User_address || ''
  const defaultAddrDetail = ''

  const [recipientName, setRecipientName] = useState(defaultName)
  const [recipientPhone, setRecipientPhone] = useState(defaultPhone)
  const [postalCode, setPostalCode] = useState(defaultZip)
  const [address, setAddress] = useState(defaultAddr)
  const [addressDetail, setAddressDetail] = useState(defaultAddrDetail)
  const [isEditingAddress, setIsEditingAddress] = useState(false)

  const [requestType, setRequestType] = useState(deliveryRequests[0])
  const [customRequest, setCustomRequest] = useState('')
  const requestText = useMemo(
    () => (requestType === '직접 입력' ? customRequest : requestType),
    [requestType, customRequest]
  )

  const [paymentMethod, setPaymentMethod] = useState('card') // 'card' | 'naver' | 'kakao' | 'tosspay' | 'bank'
  const [agree, setAgree] = useState(false)

  // 외부 스크립트 로더 (다음 우편번호)
  useEffect(() => {
    const ensureScript = (id, src) => {
      if (document.getElementById(id)) return
      const s = document.createElement('script')
      s.id = id
      s.src = src
      s.async = true
      document.body.appendChild(s)
    }
    ensureScript('daum-postcode', '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js')
  }, [])

  const openPostcode = () => {
    if (!window.daum || !window.daum.Postcode) {
      alert('우편번호 스크립트를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        setPostalCode(data.zonecode)
        setAddress(data.address)
      },
    }).open()
  }

  const canPay = useMemo(() => {
    const required = recipientName && recipientPhone && address
    return items.length > 0 && required && paymentMethod && agree
  }, [items.length, recipientName, recipientPhone, address, paymentMethod, agree])

  const placeOrder = () => {
    if (!canPay) return
    // 실제 PG 사용 없이 모의 결제 처리
    const orderSummary = {
      recipientName,
      recipientPhone,
      postalCode,
      address,
      addressDetail,
      requestText,
      paymentMethod,
      total,
      items: items.map((i) => ({ id: i.product_id, name: i.food_products, qty: i.quantity })),
      createdAt: new Date().toISOString(),
    }
    console.log('모의 주문 생성:', orderSummary)
    // 백엔드에 주문 저장
    const token = JSON.parse(localStorage.getItem('userInfo') || '{}').token
    orderService
      .create(
        {
          recipientName,
          recipientPhone,
          postalCode,
          address,
          addressDetail,
          requestText,
          paymentMethod,
          subtotal,
          deliveryFee,
          total,
          items: items.map((i) => ({ id: i.product_id, name: i.food_products, qty: i.quantity, price: i.price })),
        },
        token
      )
      .then(() => {
        alert('주문이 완료되었습니다! (모의 결제)')
        clear()
      })
      .catch((e) => {
        console.error(e)
        alert('주문 저장에 실패했습니다. 다시 시도해 주세요.')
      })
  }

  return (
    <>
      <MenuBar />
      <div className="checkout-container">
        <h1 className="checkout-title">주문/결제</h1>
        {items.length === 0 ? (
          <div className="checkout-empty">
            <p>주문할 상품이 없습니다.</p>
            <Link to="/products" className="checkout-link">상품 보러가기</Link>
          </div>
        ) : (
          <div className="checkout-layout">
            <div className="checkout-left">
              {/* 배송지 */}
              <section className="panel">
                <div className="panel-header">
                  <h2>배송지</h2>
                  <button className="link-btn" onClick={() => setIsEditingAddress((v) => !v)}>
                    {isEditingAddress ? '완료' : '배송지 변경'}
                  </button>
                </div>
                {!isEditingAddress ? (
                  <div className="address-view">
                    <div className="addr-name">{recipientName || '이름 없음'}</div>
                    <div className="addr-line">{recipientPhone || '연락처 없음'}</div>
                    <div className="addr-line">{postalCode && `[${postalCode}]`} {address}</div>
                    {addressDetail && <div className="addr-line">{addressDetail}</div>}
                  </div>
                ) : (
                  <div className="address-form">
                    <div className="form-row">
                      <label>받는 분</label>
                      <input value={recipientName} onChange={(e)=>setRecipientName(e.target.value)} placeholder="이름" />
                    </div>
                    <div className="form-row">
                      <label>연락처</label>
                      <input value={recipientPhone} onChange={(e)=>setRecipientPhone(e.target.value)} placeholder="전화번호" />
                    </div>
                    <div className="form-row">
                      <label>우편번호</label>
                      <div style={{display:'flex', gap:8}}>
                        <input value={postalCode} onChange={(e)=>setPostalCode(e.target.value)} placeholder="우편번호" />
                        <button type="button" className="link-btn" onClick={openPostcode}>주소검색</button>
                      </div>
                    </div>
                    <div className="form-row">
                      <label>주소</label>
                      <input value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="기본 주소" />
                    </div>
                    <div className="form-row">
                      <label>상세 주소</label>
                      <input value={addressDetail} onChange={(e)=>setAddressDetail(e.target.value)} placeholder="상세 주소" />
                    </div>
                  </div>
                )}
              </section>

              {/* 배송 요청사항 */}
              <section className="panel">
                <div className="panel-header"><h2>배송 요청사항</h2></div>
                <div className="request-options">
                  {deliveryRequests.map((label) => (
                    <label key={label} className={`chip ${requestType === label ? 'active' : ''}`}>
                      <input type="radio" name="req" value={label} checked={requestType === label} onChange={() => setRequestType(label)} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                {requestType === '직접 입력' && (
                  <input className="request-input" value={customRequest} onChange={(e)=>setCustomRequest(e.target.value)} placeholder="요청사항을 입력하세요" />
                )}
              </section>

              {/* 결제수단 */}
              <section className="panel">
                <div className="panel-header"><h2>결제수단</h2></div>
                <div className="payment-grid">
                  <label className={`pay-chip ${paymentMethod === 'card' ? 'active' : ''}`}>
                    <input type="radio" name="pay" value="card" checked={paymentMethod === 'card'} onChange={()=>setPaymentMethod('card')} />
                    <span>신용/체크카드</span>
                  </label>
                  <label className={`pay-chip ${paymentMethod === 'bank' ? 'active' : ''}`}>
                    <input type="radio" name="pay" value="bank" checked={paymentMethod === 'bank'} onChange={()=>setPaymentMethod('bank')} />
                    <span>계좌이체</span>
                  </label>
                  <label className={`pay-chip ${paymentMethod === 'naver' ? 'active' : ''}`}>
                    <input type="radio" name="pay" value="naver" checked={paymentMethod === 'naver'} onChange={()=>setPaymentMethod('naver')} />
                    <span>네이버페이</span>
                  </label>
                  <label className={`pay-chip ${paymentMethod === 'kakao' ? 'active' : ''}`}>
                    <input type="radio" name="pay" value="kakao" checked={paymentMethod === 'kakao'} onChange={()=>setPaymentMethod('kakao')} />
                    <span>카카오페이</span>
                  </label>
                  <label className={`pay-chip ${paymentMethod === 'tosspay' ? 'active' : ''}`}>
                    <input type="radio" name="pay" value="tosspay" checked={paymentMethod === 'tosspay'} onChange={()=>setPaymentMethod('tosspay')} />
                    <span>토스페이</span>
                  </label>
                </div>
                <div className="agree-row">
                  <label>
                    <input type="checkbox" checked={agree} onChange={(e)=>setAgree(e.target.checked)} />
                    <span> 결제 진행 필수 동의 (개인정보 수집/제공 및 결제대행 동의)</span>
                  </label>
                </div>
              </section>

              {/* 주문 상품 */}
              <section className="panel">
                <div className="panel-header"><h2>주문 상품</h2></div>
                <div className="checkout-items">
                  {items.map((item) => (
                    <div key={item.product_id} className="checkout-item">
                      <img src={item.img || '/placeholder-image.jpg'} alt={item.food_products} className="checkout-item-image" onError={(e)=>{e.target.src='/placeholder-image.jpg'}} />
                      <div className="checkout-item-info">
                        <div className="checkout-item-name">{item.food_products}</div>
                        <div className="checkout-item-meta">수량 {item.quantity}개 · {formatCurrency(item.price)}</div>
                        <div className="checkout-item-line-price">{formatCurrency(item.price * item.quantity)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* 우측 결제 요약 */}
            <aside className="checkout-summary">
              <div className="summary-row"><span>상품금액</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="summary-row"><span>배송비</span><span>{deliveryFee === 0 ? '무료' : formatCurrency(deliveryFee)}</span></div>
              <div className="summary-total"><span>결제금액</span><span>{formatCurrency(total)}</span></div>

              <button className="pay-btn" onClick={placeOrder} disabled={!canPay}>
                {canPay ? '결제하기' : '정보 입력/동의 필요'}
              </button>
              <Link to="/cart" className="back-to-cart">장바구니로 돌아가기</Link>
            </aside>
          </div>
        )}
      </div>
    </>
  )
}

export default CheckoutPage


