from config import get_db_connection

class Food:
    def __init__(self, Food_id=None, Food_name=None, Food_role=None, Food_classification=None, Food_img=None, Food_materials=None, Food_Embedding=None):
        self.Food_id = Food_id                    # Food_id
        self.Food_name = Food_name                # Food_name
        self.Food_role = Food_role                # Food_role
        self.Food_classification = Food_classification  # Food_classification
        self.Food_img = Food_img                  # Food_img
        self.Food_materials = Food_materials      # Food_materials
        self.Food_Embedding = Food_Embedding      # Food_Embedding

    @staticmethod
    def get_all():
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Food")
        foods = cursor.fetchall()
        cursor.close()
        conn.close()
        return foods
    
    @staticmethod
    def get_by_role(role):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Food WHERE Food_role = %s", (role,))
        foods = cursor.fetchall()
        cursor.close()
        conn.close()
        return foods
    
    @staticmethod
    def get_random_by_role(role, limit=1):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Food WHERE Food_role = %s ORDER BY RAND() LIMIT %s", (role, limit))
        foods = cursor.fetchall()
        cursor.close()
        conn.close()
        if limit == 1 and foods:
            return foods[0]
        return foods
        
    @staticmethod
    def get_by_id(food_id):
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Food WHERE Food_id = %s", (food_id,))
        food = cursor.fetchone()
        cursor.close()
        conn.close()
        return food 