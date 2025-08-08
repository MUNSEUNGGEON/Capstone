import { API_BASE_URL } from './apiConfig'

export const orderService = {
  create: async (order, token) => {
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(order),
    })
    if (!res.ok) throw new Error('주문 생성 실패')
    return res.json()
  },
  list: async (token) => {
    const res = await fetch(`${API_BASE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('주문 목록 조회 실패')
    return res.json()
  },
  detail: async (orderId, token) => {
    const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('주문 상세 조회 실패')
    return res.json()
  },
}


