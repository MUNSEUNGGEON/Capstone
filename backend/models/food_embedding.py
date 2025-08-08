import numpy as np
from typing import List, Dict
from config import get_db_connection


def get_embeddings(food_ids: List[int]) -> Dict[int, np.ndarray]:
    """Return a mapping of food_id to embedding vector for given IDs."""
    if not food_ids:
        return {}
    # Remove duplicates to reduce query size
    unique_ids = list(dict.fromkeys([fid for fid in food_ids if fid is not None]))
    if not unique_ids:
        return {}

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    format_strings = ','.join(['%s'] * len(unique_ids))
    cursor.execute(
        f"SELECT Food_id, Food_Embedding FROM Food WHERE Food_id IN ({format_strings})",
        tuple(unique_ids)
    )
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    embeddings: Dict[int, np.ndarray] = {}
    for row in rows:
        emb_str = row.get('Food_Embedding') or ''
        try:
            vec = np.fromstring(emb_str, sep=',')
            embeddings[row['Food_id']] = vec
        except Exception:
            continue
    return embeddings
