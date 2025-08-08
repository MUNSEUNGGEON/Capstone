from flask import Blueprint, request, jsonify
from utils.auth import token_required
from models.user import get_db_connection

orders_bp = Blueprint('orders', __name__)


def ensure_order_tables_exist():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS `orders` (
              `Order_id` INT AUTO_INCREMENT PRIMARY KEY,
              `User_id` INT NOT NULL,
              `recipient_name` VARCHAR(100) NOT NULL,
              `recipient_phone` VARCHAR(30) NOT NULL,
              `postal_code` VARCHAR(10),
              `address` VARCHAR(255) NOT NULL,
              `address_detail` VARCHAR(255),
              `request_text` VARCHAR(255),
              `payment_method` VARCHAR(20) NOT NULL,
              `subtotal` INT NOT NULL DEFAULT 0,
              `delivery_fee` INT NOT NULL DEFAULT 0,
              `total` INT NOT NULL DEFAULT 0,
              `status` VARCHAR(20) NOT NULL DEFAULT 'MOCK_PAID',
              `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
        )

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS `order_item` (
              `Order_item_id` INT AUTO_INCREMENT PRIMARY KEY,
              `Order_id` INT NOT NULL,
              `Product_id` INT,
              `product_name` VARCHAR(255) NOT NULL,
              `quantity` INT NOT NULL,
              `price` INT NOT NULL,
              `line_total` INT NOT NULL,
              INDEX(`Order_id`),
              CONSTRAINT `fk_order_item_order`
                FOREIGN KEY (`Order_id`) REFERENCES `orders`(`Order_id`)
                ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
        )

        conn.commit()
    finally:
        cursor.close()
        conn.close()


@orders_bp.route('/api/orders', methods=['POST'])
@token_required
def create_order(current_user):
    ensure_order_tables_exist()
    data = request.get_json() or {}

    required = ['recipientName', 'recipientPhone', 'address', 'paymentMethod', 'total', 'items']
    for key in required:
        if key not in data:
            return jsonify({'success': False, 'message': f'Missing field: {key}'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            INSERT INTO orders
            (User_id, recipient_name, recipient_phone, postal_code, address, address_detail,
             request_text, payment_method, subtotal, delivery_fee, total, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                current_user['User_id'],
                data.get('recipientName'),
                data.get('recipientPhone'),
                data.get('postalCode'),
                data.get('address'),
                data.get('addressDetail'),
                data.get('requestText'),
                data.get('paymentMethod'),
                data.get('subtotal', 0),
                data.get('deliveryFee', 0),
                data.get('total'),
                'MOCK_PAID',
            )
        )
        conn.commit()
        order_id = cursor.lastrowid

        items = data.get('items', [])
        for item in items:
            cursor.execute(
                """
                INSERT INTO order_item
                (Order_id, Product_id, product_name, quantity, price, line_total)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    order_id,
                    item.get('id'),
                    item.get('name'),
                    int(item.get('qty', 1)),
                    int(item.get('price', 0)),
                    int(item.get('price', 0)) * int(item.get('qty', 1)),
                )
            )
        conn.commit()

        return jsonify({'success': True, 'orderId': order_id}), 201
    except Exception as e:
        print('주문 생성 오류:', e)
        conn.rollback()
        return jsonify({'success': False, 'message': '주문 생성 실패'}), 500
    finally:
        cursor.close()
        conn.close()


@orders_bp.route('/api/orders', methods=['GET'])
@token_required
def list_orders(current_user):
    ensure_order_tables_exist()
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """
            SELECT Order_id, total, status, created_at, recipient_name
            FROM orders
            WHERE User_id = %s
            ORDER BY Order_id DESC
            """,
            (current_user['User_id'],)
        )
        rows = cursor.fetchall()
        return jsonify({'success': True, 'orders': rows}), 200
    except Exception as e:
        print('주문 목록 조회 오류:', e)
        return jsonify({'success': False, 'orders': []}), 500
    finally:
        cursor.close()
        conn.close()


@orders_bp.route('/api/orders/<int:order_id>', methods=['GET'])
@token_required
def get_order_detail(current_user, order_id):
    ensure_order_tables_exist()
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT * FROM orders WHERE Order_id = %s AND User_id = %s",
            (order_id, current_user['User_id'])
        )
        order = cursor.fetchone()
        if not order:
            return jsonify({'success': False, 'message': '주문을 찾을 수 없습니다.'}), 404

        cursor.execute(
            "SELECT * FROM order_item WHERE Order_id = %s",
            (order_id,)
        )
        items = cursor.fetchall()
        return jsonify({'success': True, 'order': order, 'items': items}), 200
    except Exception as e:
        print('주문 상세 조회 오류:', e)
        return jsonify({'success': False}), 500
    finally:
        cursor.close()
        conn.close()


