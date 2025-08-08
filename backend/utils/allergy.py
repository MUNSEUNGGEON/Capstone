# 알레르기 관련 동의어 및 필터링 기능을 제공하는 모듈
# 사용자의 알레르기 정보를 기반으로 상품 및 레시피에서 알레르기 성분을 제외하는 SQL 조건을 생성
allergy_synonyms = {
    # 각 알레르기 이름별로 포함될 수 있는 다양한 동의어/관련어 리스트
    "난류": ["난류", "계란", "달걀", "유정란", "특란", "초란", "계란흰자", "계란노른자", "계란말이", "스크램블에그", "오믈렛"],
    "소고기": ["소고기", "쇠고기", "치마살", "우육", "불고기", "갈비", "육포", "사골", "소스지", "소스지육수", "한우"],
    "돼지고기": ["돼지고기", "삼겹", "삼겹살", "목살", "앞다리", "돈육", "제육", "돈가스", "햄", "베이컨", "순대", "소세지", "바베큐", "폭립",],
    "닭고기": ["닭고기", "닭가슴살", "닭다리", "치킨", "백숙", "삼계탕", "닭죽", "닭볶음탕", "닭육수"],
    "새우": ["새우", "대하", "초밥새우", "새우튀김", "칵테일새우", "깐쇼새우", "건새우"],
    "게": ["꽃게", "게살", "게장", "간장게장", "양념게장", "킹크랩", "대게", "꽃게탕"],
    "오징어": ["오징어", "마른오징어", "오징어채", "오징어무침", "오징어볶음", "오삼불고기"],
    "고등어": ["고등어", "고등어조림", "고등어구이", "고등어회"],
    "조개류": ["조개", "바지락", "모시조개", "백합", "홍합", "재첩", "가리비", "조개탕", "전복", "관자", "다슬기", "우렁", "성게", "소라", "꼬막", "굴", "골뱅이", "골벵이", "멍게"],
    "우유": ["우유", "치즈", "버터", "연유", "생크림", "요거트", "유제품", "두유", "아이스크림", "아구르트", "야쿠르트", "초코바"],
    "땅콩": ["땅콩", "피넛", "피넛버터", "땅콩버터", "견과류"],
    "호두": ["호두", "호두과자", "견과류"],
    "잣": ["잣", "견과류"],
    "대두": ["대두", "콩", "된장", "간장", "두부", "콩기름", "두유"],
    "복숭아": ["복숭아", "황도", "백도", "통조림복숭아"],
    "토마토": ["토마토", "방울토마토", "토마토소스", "케찹"],
    "밀": ["밀가루", "빵", "면", "국수", "파스타", "케이크", "쿠키", "도넛", "밀또띠아", "스파게티", "수제비"],
    "메밀": ["메밀", "메밀국수", "냉면", "막국수"],
    "아황산류": ["아황산", "이산화황", "보존료", "SO2", "아황산나트륨"]
}

# 알레르기 ID → 이름 매핑
allergy_id_name_map = {
    1: "난류", 2: "소고기", 3: "돼지고기", 4: "닭고기", 5: "새우", 6: "게",
    7: "오징어", 8: "고등어", 9: "조개류", 10: "우유", 11: "땅콩", 12: "호두",
    13: "잣", 14: "대두", 15: "복숭아", 16: "토마토", 17: "밀", 18: "메밀", 19: "아황산류"
}

def generate_product_allergy_filter_sql(user_allergy_ids, table_alias='p'):
    """
    상품 테이블(products)에서 알레르기 성분이 포함된 상품을 제외하는 SQL WHERE 조건을 생성합니다.
    - user_allergy_ids: 사용자의 알레르기 ID 리스트
    - table_alias: SQL에서 사용할 테이블 별칭(기본값 'p')
    """
    filter_conditions = []
    for allerg_id in user_allergy_ids:
        allerg_name = allergy_id_name_map.get(allerg_id)  # 알레르기 ID로 이름 찾기
        if not allerg_name:
            continue
        synonyms = allergy_synonyms.get(allerg_name, [allerg_name])  # 동의어 리스트
        for word in synonyms:
            word_lower = word.lower()
            # 상품명과 상세정보에 해당 알레르기 성분이 포함되어 있지 않은 조건
            condition = (
                f"(LOWER({table_alias}.food_products) NOT LIKE '%{word_lower}%' "
                f"AND LOWER({table_alias}.details_info) NOT LIKE '%{word_lower}%')"
            )
            filter_conditions.append(condition)
    # 모든 조건을 AND로 연결
    return " AND ".join(filter_conditions)

def generate_recipe_allergy_filter_sql(user_allergy_ids, table_alias='r'):
    """
    레시피 테이블(food)에서 알레르기 성분이 포함된 레시피를 제외하는 SQL WHERE 조건을 생성합니다.
    - user_allergy_ids: 사용자의 알레르기 ID 리스트
    - table_alias: SQL에서 사용할 테이블 별칭(기본값 'r')
    """
    filter_conditions = []
    for allerg_id in user_allergy_ids:
        allerg_name = allergy_id_name_map.get(allerg_id)  # 알레르기 ID로 이름 찾기
        if not allerg_name:
            continue
        synonyms = allergy_synonyms.get(allerg_name, [allerg_name])  # 동의어 리스트
        for word in synonyms:
            word_lower = word.lower()
            # 레시피명과 재료에 해당 알레르기 성분이 포함되어 있지 않은 조건
            condition = (
                f"(LOWER({table_alias}.Food_name) NOT LIKE '%{word_lower}%' "
                f"AND LOWER({table_alias}.Food_materials) NOT LIKE '%{word_lower}%')"
            )
            filter_conditions.append(condition)
    # 모든 조건을 AND로 연결
    return " AND ".join(filter_conditions)