import type { Category, Selections } from './types';

export const CATEGORIES: Category[] = [
    // 1. Core Concept
    {
        id: 'age',
        label: '피사체 나이대 (Subject Age)',
        options: [
            { id: 'female_20s', label: '20대 여성', promptValue: 'a Korean woman in her 20s' },
            { id: 'female_30s', label: '30대 여성', promptValue: 'a Korean woman in her 30s' },
            { id: 'female_40s', label: '40대 여성', promptValue: 'a Korean woman in her 40s' },
            { id: 'female_50s', label: '50대 여성', promptValue: 'a Korean woman in her 50s' },
            { id: 'male_20s', label: '20대 남성', promptValue: 'a Korean man in his 20s' },
            { id: 'male_30s', label: '30대 남성', promptValue: 'a Korean man in his 30s' },
            { id: 'male_40s', label: '40대 남성', promptValue: 'a Korean man in his 40s' },
            { id: 'male_50s', label: '50대 남성', promptValue: 'a Korean man in his 50s' },
        ],
    },
    {
        id: 'style',
        label: '스타일 (Style)',
        options: [
            { id: 'realistic', label: '실사', promptValue: 'realistic photo' },
            { id: 'oil_painting', label: '유화', promptValue: 'oil painting' },
            { id: 'watercolor', label: '수채화', promptValue: 'watercolor painting' },
            { id: 'disney', label: '디즈니 스타일', promptValue: 'in the style of Disney animation' },
            { id: 'ghibli', label: '지브리 스타일', promptValue: 'in the style of Studio Ghibli' },
        ],
    },
    {
        id: 'quality',
        label: '화질 (Quality)',
        options: [
            { id: 'uhd', label: '초고화질', promptValue: 'ultra high definition, 8k' },
            { id: '4k', label: '4K', promptValue: '4k resolution' },
            { id: 'hd', label: '고화질', promptValue: 'high definition' },
        ],
    },
    {
        id: 'mode',
        label: '연출 모드 (Mode)',
        options: [
            { id: 'cinematic', label: '영화처럼', promptValue: 'cinematic still, film grain, dramatic lighting' },
            { id: 'portrait', label: '인물사진', promptValue: 'professional portrait photography, studio lighting, sharp focus' },
            { id: 'fashion', label: '패션화보', promptValue: 'fashion editorial, vogue style, high fashion' },
            { id: 'candid', label: '자연스럽게', promptValue: 'candid shot, natural pose, everyday moment' },
            { id: 'daily_snap', label: '일상 스냅', promptValue: 'candid daily life snapshot, natural lighting' },
            { id: 'travel_snap', label: '여행 스냅', promptValue: 'travel photography, scenic background' },
            { id: 'documentary', label: '다큐멘터리', promptValue: 'documentary photography style, photojournalism' },
            { id: 'cycling', label: '자전거 타기', promptValue: 'action shot of cycling' },
            { id: 'cooking', label: '요리하기', promptValue: 'cooking in a kitchen' },
            { id: 'reading', label: '독서하기', promptValue: 'reading a book' },
            { id: 'instrument', label: '악기 연주하기', promptValue: 'playing an instrument' },
            { id: 'walking', label: '산책하기', promptValue: 'walking' },
        ],
    },
    // 2. Composition & Framing
    {
        id: 'composition',
        label: '구도 (Composition)',
        options: [
            { id: 'medium', label: '미디엄샷', promptValue: 'medium shot' },
            { id: 'closeup', label: '클로즈업', promptValue: 'close-up shot' },
            { id: 'fullbody', label: '풀샷', promptValue: 'full body shot' },
            { id: 'cowboy', label: '카우보이샷', promptValue: 'cowboy shot, from mid-thighs up' },
            { id: 'bust', label: '바스트샷', promptValue: 'bust shot, from the chest up' },
            { id: 'low_angle', label: '로우앵글', promptValue: 'dramatic low-angle shot' },
            { id: 'high_angle', label: '하이앵글', promptValue: 'high-angle shot' },
            { id: 'eye_level', label: '아이레벨', promptValue: 'eye-level shot' },
            { id: 'first_person', label: '1인칭 시점', promptValue: 'first-person view, POV' },
            { id: 'aerial_view', label: '항공샷', promptValue: 'aerial view shot from above' },
            { id: 'action_shot', label: '액션샷 (패닝샷)', promptValue: 'dynamic action shot with motion blur, panning shot' },
            { id: 'rule_of_thirds', label: '삼분할', promptValue: 'composition using the rule of thirds' },
            { id: 'golden_ratio', label: '황금비율', promptValue: 'composition using the golden ratio' },
            { id: 'centered', label: '중앙 구도', promptValue: 'centered composition' },
            { id: 'symmetrical', label: '대칭 구도', promptValue: 'symmetrical composition' },
            { id: 'contrast', label: '대비', promptValue: 'composition with strong contrast' },
            { id: 'perspective', label: '원근법', promptValue: 'composition using perspective' },
        ],
    },
    {
        id: 'aspectRatio',
        label: '결과물 비율 (Aspect Ratio)',
        options: [
            { id: 'square_1_1', label: '정사각형 (1:1)', promptValue: '1:1' },
            { id: 'portrait_9_16', label: '세로 (9:16)', promptValue: '9:16' },
            { id: 'landscape_16_9', label: '가로 (16:9)', promptValue: '16:9' },
            { id: 'ultrawide_21_9', label: '초광각 (21:9)', promptValue: '21:9' },
        ],
    },
    // 3. Subject Details
    {
        id: 'expression',
        label: '표정 (Expression)',
        options: [
            { id: 'happy_smile', label: '행복한 미소', promptValue: 'with a happy smile' },
            { id: 'serious', label: '진지한 표정', promptValue: 'with a serious expression' },
            { id: 'playful', label: '장난스러운 표정', promptValue: 'with a playful expression' },
            { id: 'pensive', label: '사색에 잠긴 표정', promptValue: 'with a pensive expression' },
        ],
    },
    {
        id: 'skin',
        label: '피부톤 (Skin Tone)',
        options: [
            { id: 'fair', label: '밝은 톤', promptValue: 'fair skin with a healthy glow' },
            { id: 'natural', label: '자연스러운 톤', promptValue: 'natural beige skin tone' },
            { id: 'tanned', label: '약간 그을린 톤', promptValue: 'lightly tanned, sun-kissed skin' },
            { id: 'clear', label: '투명하고 깨끗한 피부', promptValue: 'clear and translucent skin' },
            { id: 'flawless', label: '잡티 없는 피부', promptValue: 'flawless skin' },
        ],
    },
    {
        id: 'face_shape',
        label: '얼굴형 (Face Shape)',
        options: [
            { id: 'oval', label: '계란형', promptValue: 'oval face shape' },
            { id: 'round', label: '둥근형', promptValue: 'round face shape' },
            { id: 'v-line', label: '브이라인', promptValue: 'V-line jaw, sharp chin' },
            { id: 'square', label: '각진형', promptValue: 'defined square jawline' },
        ],
    },
    {
        id: 'eyes',
        label: '눈매 (Eyes)',
        options: [
            { id: 'monolid', label: '무쌍', promptValue: 'monolid eyes' },
            { id: 'double_eyelid', label: '쌍커풀', promptValue: 'natural double eyelids' },
            { id: 'almond', label: '아몬드형', promptValue: 'almond-shaped eyes' },
            { id: 'cat_eye', label: '고양이 눈매', promptValue: 'seductive cat-eye makeup' },
            { id: 'large_clear', label: '크고 맑은 눈', promptValue: 'large, clear eyes' },
        ],
    },
    {
        id: 'hair',
        label: '헤어스타일 (Hairstyle)',
        options: [
            // Female
            { id: 'bob', label: '단발머리', promptValue: 'chic short bob hairstyle', gender: 'female' },
            { id: 'long_straight', label: '긴 생머리', promptValue: 'long, sleek straight hair', gender: 'female' },
            { id: 'long_wave', label: '긴 웨이브', promptValue: 'long, wavy hair', gender: 'female' },
            { id: 'ponytail', label: '포니테일', promptValue: 'ponytail hairstyle', gender: 'female' },
            { id: 'updo', label: '올림머리', promptValue: 'elegant updo', gender: 'female' },
             // Male
            { id: 'short_male', label: '짧은 남성 헤어', promptValue: 'short, stylish male haircut', gender: 'male' },
            { id: 'dandy_cut', label: '댄디컷', promptValue: 'neat dandy cut hairstyle', gender: 'male' },
            { id: 'slicked_back', label: '슬릭백', promptValue: 'slicked-back hair', gender: 'male' },
            { id: 'undercut', label: '언더컷', promptValue: 'modern undercut hairstyle', gender: 'male' },
            { id: 'parted_perm', label: '가르마 펌', promptValue: 'parted perm hairstyle', gender: 'male' },
        ],
    },
    {
        id: 'body_type',
        label: '신체 체형 (Body Type)',
        options: [
            { id: 'slim', label: '슬림', promptValue: 'slim body type' },
            { id: 'athletic', label: '탄탄한', promptValue: 'athletic and fit body type' },
            { id: 'average', label: '보통', promptValue: 'average body type' },
            { id: 'glamorous', label: '글래머', promptValue: 'curvy and glamorous body type' },
            { id: 'healthy', label: '건강한 체형', promptValue: 'healthy build' },
        ],
    },
    // 4. Outfit
    {
        id: 'outfit_style',
        label: '의상 스타일 (Outfit Style)',
        options: [
            { id: 'casual', label: '캐주얼', promptValue: 'a stylish casual outfit' },
            { id: 'office', label: '오피스룩', promptValue: 'a modern and chic office look' },
            { id: 'dress', label: '드레스', promptValue: 'an elegant dress' },
            { id: 'hanbok', label: '모던 한복', promptValue: 'a modern, reinterpreted Hanbok' },
            { id: 'bikini', label: '비키니', promptValue: 'a bikini' },
            { id: 'cycling_wear', label: '자전거 의류', promptValue: 'professional cycling wear' },
            { id: 'vintage', label: '빈티지 스타일', promptValue: 'a vintage style outfit' },
            { id: 'bohemian', label: '보헤미안 스타일', promptValue: 'a bohemian style outfit' },
            { id: 'punk', label: '펑크 스타일', promptValue: 'a punk style outfit' },
        ],
    },
    {
        id: 'outfit_material',
        label: '의상 재질 (Outfit Material)',
        options: [
            { id: 'denim', label: '데님', promptValue: 'made of denim' },
            { id: 'leather', label: '가죽', promptValue: 'made of leather' },
            { id: 'silk', label: '실크', promptValue: 'made of silk' },
            { id: 'wool', label: '울', promptValue: 'made of wool' },
        ],
    },
    {
        id: 'outfit_color',
        label: '의상 색상 (Outfit Color)',
        options: [
            { id: 'neutral', label: '뉴트럴 톤', promptValue: 'with neutral tones (beige, white, grey)' },
            { id: 'vivid', label: '비비드 컬러', promptValue: 'with vivid colors (red, blue, yellow)' },
            { id: 'pastel', label: '파스텔 톤', promptValue: 'with pastel tones (light pink, mint, sky blue)' },
            { id: 'monochrome', label: '모노크롬', promptValue: 'with monochrome tones (black and white)' },
            { id: 'black_coat', label: '검정색 코트', promptValue: 'wearing a black coat' },
        ],
    },
    // 5. Environment & Background
    {
        id: 'location',
        label: '장소 (Location)',
        options: [
            { id: 'seoul_cafe', label: '서울의 카페', promptValue: 'in a cozy, stylish cafe in Seoul' },
            { id: 'palace', label: '고궁', promptValue: 'at a traditional Korean palace, wearing modern attire' },
            { id: 'home', label: '집', promptValue: 'in a minimalist, modern apartment living room' },
            { id: 'vintage_bookstore', label: '빈티지 서점', promptValue: 'in a vintage bookstore filled with old books' },
            { id: 'art_museum', label: '미술관', promptValue: 'in a modern art museum' },
            { id: 'restaurant', label: '따뜻한 조명의 레스토랑', promptValue: 'in a restaurant with warm lighting' },
            { id: 'city_night', label: '도시의 밤', promptValue: 'on a neon-lit street in a bustling city at night' },
            { id: 'park', label: '공원', promptValue: 'in a serene park' },
            { id: 'pool', label: '수영장', promptValue: 'at a luxurious hotel swimming pool' },
            { id: 'beach', label: '바닷가', promptValue: 'on a beautiful sandy beach at sunset' },
            { id: 'riverside_bike', label: '강변 자전거길', promptValue: 'on a scenic riverside bicycle path' },
            { id: 'beach_bike', label: '해변 자전거길', promptValue: 'on a bicycle path along a beautiful beach' },
            { id: 'mountain_bike', label: '산악 자전거길', promptValue: 'on a mountain bike trail in a lush forest' },
            { id: 'nordic_forest', label: '북유럽 숲속', promptValue: 'in a Nordic forest with tall pine trees' },
            { id: 'desert', label: '사막', promptValue: 'in a vast desert with sand dunes' },
            { id: 'new_york', label: '뉴욕 거리', promptValue: 'on a busy street in New York City' },
        ],
    },
    {
        id: 'weather',
        label: '날씨 (Weather)',
        options: [
            { id: 'sunny', label: '맑음', promptValue: 'on a clear sunny day' },
            { id: 'cloudy', label: '구름 조금', promptValue: 'on a day with scattered clouds' },
            { id: 'overcast', label: '흐림', promptValue: 'on an overcast day' },
            { id: 'sunset', label: '노을', promptValue: 'during a beautiful sunset' },
            { id: 'rainy', label: '비 오는 날', promptValue: 'on a rainy day' },
            { id: 'snowy', label: '눈 오는 날', promptValue: 'on a snowy day' },
        ],
    },
    {
        id: 'lighting',
        label: '조명 (Lighting)',
        options: [
            { id: 'natural', label: '자연광', promptValue: 'soft natural light' },
            { id: 'backlight', label: '역광', promptValue: 'dramatic backlight' },
            { id: 'side_light', label: '사이드 라이트', promptValue: 'side lighting' },
            { id: 'soft_light', label: '부드러운 조명', promptValue: 'soft, diffused lighting' },
            { id: 'dramatic_shadows', label: '강렬한 그림자', promptValue: 'with dramatic shadows' },
            { id: 'candlelight', label: '촛불 조명', promptValue: 'lit by candlelight' },
            { id: 'neon', label: '네온사인', promptValue: 'illuminated by neon city lights' },
        ],
    },
    {
        id: 'atmosphere',
        label: '분위기 (Atmosphere)',
        options: [
            { id: 'warm_cozy', label: '따뜻하고 아늑한', promptValue: 'warm and cozy atmosphere' },
            { id: 'mysterious', label: '신비로운', promptValue: 'mysterious atmosphere' },
            { id: 'vibrant_dynamic', label: '활기차고 역동적인', promptValue: 'vibrant and dynamic atmosphere' },
        ],
    },
    // 6. Camera & Technical
    {
        id: 'camera_model',
        label: '카메라 모델 (Camera Model)',
        options: [
            { id: 'default', label: '기본', promptValue: '' },
            { id: 'canon_r5', label: 'Canon EOS R5', promptValue: 'shot on Canon EOS R5' },
            { id: 'sony_a7s3', label: 'Sony A7S III', promptValue: 'shot on Sony A7S III' },
            { id: 'hasselblad', label: 'Hasselblad', promptValue: 'shot on Hasselblad' },
        ],
    },
    {
        id: 'camera_lens',
        label: '카메라 렌즈 (Lens)',
        options: [
            { id: '50mm', label: '50mm (표준)', promptValue: 'shot with a 50mm lens, natural perspective' },
            { id: '85mm', label: '85mm (인물)', promptValue: 'shot with an 85mm portrait lens, beautiful bokeh' },
            { id: '24mm', label: '24mm (광각)', promptValue: 'shot with a 24mm wide-angle lens' },
            { id: 'telephoto', label: '70-200mm (망원)', promptValue: 'shot with a 70-200mm telephoto lens' },
            { id: 'macro', label: '매크로 렌즈', promptValue: 'shot with a macro lens for extreme close-up details' },
        ],
    },
    // 7. Output
    {
        id: 'numberOfImages',
        label: '출력 이미지 갯수',
        options: [
            { id: '1', label: '1개', promptValue: '1' },
            { id: '2', label: '2개', promptValue: '2' },
            { id: '3', label: '3개', promptValue: '3' },
            { id: '4', label: '4개', promptValue: '4' },
        ],
    },
];

export const DEFAULT_SELECTIONS: Selections = CATEGORIES.reduce((acc, category) => {
    acc[category.id] = category.options[0].id;
    return acc;
}, {} as Selections);