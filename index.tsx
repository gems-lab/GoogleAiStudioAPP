import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Modality } from "@google/genai";

// === FROM types.ts ===
interface Option {
  id: string;
  label: string;
  promptValue: string;
  gender?: 'male' | 'female' | 'unisex';
}

interface Category {
  id: string;
  label: string;
  options: Option[];
}

interface Selections {
  [key: string]: string; // category.id -> option.id
}

type AspectRatio = '9:16' | '16:9' | '1:1' | '21:9';


// === FROM constants.ts ===
const CATEGORIES: Category[] = [
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

const DEFAULT_SELECTIONS: Selections = CATEGORIES.reduce((acc, category) => {
    acc[category.id] = category.options[0].id;
    return acc;
}, {} as Selections);


// === FROM services/geminiService.ts ===
interface GenerateImageParams {
    apiKey: string;
    prompt: string;
    negativePrompt: string;
    aspectRatio: AspectRatio;
    numberOfImages: number;
    image?: {
        base64: string;
        mimeType: string;
    };
}

const generateImage = async ({ apiKey, prompt, negativePrompt, aspectRatio, image, numberOfImages }: GenerateImageParams): Promise<string[]> => {
    if (!apiKey) {
        throw new Error("Gemini API 키가 제공되지 않았습니다. 사이드바에서 키를 설정해주세요.");
    }
    const ai = new GoogleGenAI({ apiKey });

    try {
        if (image) {
            // Face reference generation
            const model = 'gemini-2.5-flash-image-preview';
            const moods = [
                'with a joyful atmosphere',
                'with a serene and peaceful atmosphere',
                'with a powerful and confident atmosphere',
                'with a mysterious and enigmatic atmosphere',
            ];

            const generationPromises = moods.slice(0, numberOfImages).map(async (mood) => {
                const enhancedPrompt = `Maintain the facial features and identity of the person in the provided image. Do not change the person's face. Place this person in a new scene. ${mood}. New description: ${prompt}. Avoid the following elements, concepts, and styles: ${negativePrompt}`;

                const imagePart = {
                    inlineData: {
                        data: image.base64,
                        mimeType: image.mimeType,
                    },
                };
                const textPart = { text: enhancedPrompt };
                
                try {
                    const response = await ai.models.generateContent({
                        model: model,
                        contents: { parts: [imagePart, textPart] },
                        config: {
                            responseModalities: [Modality.IMAGE, Modality.TEXT],
                        },
                    });
    
                    const imageResponsePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    
                    if (imageResponsePart?.inlineData) {
                        return imageResponsePart.inlineData.data;
                    }
                } catch (err) {
                    console.warn(`A generation for mood "${mood}" failed.`, err);
                }
                return null;
            });

            const results = await Promise.all(generationPromises);
            const successfulResults = results.filter((res): res is string => res !== null);

            if (successfulResults.length === 0) {
                 throw new Error("API가 이미지를 반환하지 않았습니다. 모든 생성이 차단되었을 수 있습니다.");
            }
            
            return successfulResults;

        } else {
            // Text-to-image generation
            const model = 'imagen-4.0-generate-001';
            const fullPrompt = `${prompt}. Do not include the following: ${negativePrompt}`;

            const response = await ai.models.generateImages({
                model,
                prompt: fullPrompt,
                config: {
                    numberOfImages: numberOfImages,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: aspectRatio,
                },
            });

            const generatedImages = response.generatedImages;
            if (generatedImages && generatedImages.length > 0) {
                 return generatedImages.map(img => img.image.imageBytes).filter((bytes): bytes is string => !!bytes);
            } else {
                 throw new Error("이미지 생성에 실패했거나 API 응답 형식이 예상과 다릅니다.");
            }
        }
    } catch (error) {
        console.error("Error generating image:", error);
        if (error instanceof Error) {
            if (error.message.includes('API key not valid')) {
                throw new Error("제공된 API 키가 유효하지 않습니다. 키를 확인하고 다시 시도해주세요.");
            }
            // Handle quota exceeded error
            if (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429')) {
                throw new Error("API 할당량을 초과했습니다. 잠시 후 다시 시도하거나 Google Cloud에서 요금제 및 결제 세부정보를 확인하세요.");
            }
        }
        const errorMessage = error instanceof Error ? error.message : "이미지 생성 중 알 수 없는 오류가 발생했습니다.";
        throw new Error(errorMessage);
    }
};


// === FROM components/IconComponents.tsx ===
const WandIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);
const DownloadIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);
const TrashIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);
const UploadIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);
const CloseIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const RefreshIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0121 12a9 9 0 01-4.5 7.5M20 20l-1.5-1.5A9 9 0 013 12a9 9 0 014.5-7.5" />
    </svg>
);
const EyeIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);
const EyeOffIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
);
const DownloadAllIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4m0 0h.01M3 12h.01M21 12h.01" />
    </svg>
);


// === FROM components/LoadingSpinner.tsx ===
const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-400"></div>
            <p className="text-gray-300">걸작을 생성하는 중...</p>
        </div>
    );
};


// === FROM components/OptionSelector.tsx ===
interface OptionSelectorProps {
    category: Category;
    selectedValue: string;
    onChange: (categoryId: string, optionId: string) => void;
}
const OptionSelector: React.FC<OptionSelectorProps> = ({ category, selectedValue, onChange }) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(category.id, event.target.value);
    };

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={category.id} className="text-sm font-medium text-gray-300">{category.label}</label>
            <select
                id={category.id}
                value={selectedValue}
                onChange={handleChange}
                className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            >
                {category.options.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};


// === FROM components/ImageUploader.tsx ===
interface ImageUploaderProps {
    onImageUpload: (file: File | null) => void;
}
const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                onImageUpload(file);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
            onImageUpload(null);
        }
    }, [onImageUpload]);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleFile(event.target.files?.[0] || null);
    };

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(false);
        handleFile(event.dataTransfer.files?.[0] || null);
    }, [handleFile]);

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragOver(false);
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        onImageUpload(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    
    const containerClasses = `relative flex flex-col items-center justify-center w-full h-48 p-4 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300 ${isDragOver ? 'border-indigo-400 bg-gray-700/50' : 'border-gray-600 hover:border-indigo-400 hover:bg-gray-700/30'}`;

    return (
        <div 
            className={containerClasses}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
            />
            {imagePreview ? (
                <>
                    <img src={imagePreview} alt="얼굴 참조 미리보기" className="object-contain h-full w-full rounded-md" />
                    <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveImage(); }}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-red-600/80 transition-colors"
                        aria-label="이미지 제거"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                    <UploadIcon className="w-10 h-10 mb-2" />
                    <p className="font-semibold">얼굴 이미지 업로드</p>
                    <p className="text-xs">드래그 앤 드롭 또는 클릭</p>
                </div>
            )}
        </div>
    );
};


// === FROM components/ApiKeyInput.tsx ===
interface ApiKeyInputProps {
    value: string;
    onSave: (key: string) => void;
}
const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ value, onSave }) => {
    const [currentKey, setCurrentKey] = useState(value);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    useEffect(() => {
        setCurrentKey(value);
    }, [value]);

    const handleSave = () => {
        onSave(currentKey);
    };

    return (
        <div className="pt-6 border-t border-gray-700">
            <h2 className="text-xl font-bold text-gray-100 mb-2">Gemini API 키</h2>
            <p className="text-sm text-gray-400 mb-4">
                이미지를 생성하려면 Gemini API 키가 필요합니다. 
                <a 
                    href="https://ai.google.dev/gemini-api/docs/api-key" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-indigo-400 hover:underline"
                >
                    Google AI Studio
                </a>
                에서 키를 발급받으세요.
            </p>
            <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                    <input
                        type={isPasswordVisible ? 'text' : 'password'}
                        value={currentKey}
                        onChange={(e) => setCurrentKey(e.target.value)}
                        placeholder="여기에 API 키를 붙여넣으세요"
                        className="w-full px-3 py-2 pr-10 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white"
                        aria-label={isPasswordVisible ? "API 키 숨기기" : "API 키 보기"}
                    >
                        {isPasswordVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                </div>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-500 transition-colors"
                    disabled={currentKey === value || !currentKey}
                >
                    저장
                </button>
            </div>
        </div>
    );
};


// === FROM App.tsx ===
type NotificationType = 'info' | 'warning' | 'error' | 'loading';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = (reader.result as string).split(',')[1];
            resolve(result);
        };
        reader.onerror = error => reject(error);
    });
};

const getAspectRatioFromSelection = (selectionId: string): AspectRatio => {
    if (selectionId.includes('9_16')) return '9:16';
    if (selectionId.includes('16_9')) return '16:9';
    if (selectionId.includes('21_9')) return '21:9';
    if (selectionId.includes('1_1')) return '1:1';
    return '1:1'; // Default
};

const getAspectRatioClassFromSelection = (selectionId: string): string => {
    if (selectionId.includes('9_16')) return 'aspect-[9/16]';
    if (selectionId.includes('16_9')) return 'aspect-video';
    if (selectionId.includes('21_9')) return 'aspect-[21/9]';
    if (selectionId.includes('1_1')) return 'aspect-square';
    return 'aspect-square'; // Default
};


const App: React.FC = () => {
    const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini-api-key') || '');
    const [selections, setSelections] = useState<Selections>(DEFAULT_SELECTIONS);
    const [referenceImage, setReferenceImage] = useState<{ file: File; base64: string; mimeType: string; } | null>(null);
    const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [notification, setNotification] = useState<{ type: NotificationType; message: string } | null>(null);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);

    useEffect(() => {
        if (apiKey) {
            localStorage.setItem('gemini-api-key', apiKey);
        } else {
            localStorage.removeItem('gemini-api-key');
        }
    }, [apiKey]);

    const handleSaveApiKey = useCallback((key: string) => {
        setApiKey(key);
        setNotification({ type: 'info', message: 'API 키가 성공적으로 저장되었습니다.' });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    const handleSelectionChange = useCallback((categoryId: string, optionId: string) => {
        setSelections(prev => ({ ...prev, [categoryId]: optionId }));
    }, []);

    useEffect(() => {
        const isBikini = selections.outfit_style === 'bikini';
        const isRiskyComposition = ['fullbody', 'low_angle'].includes(selections.composition);

        if (isBikini && isRiskyComposition) {
            setSelections(prev => ({ ...prev, composition: 'medium' }));
            setNotification({
                type: 'warning',
                message: '안전 필터: \'비키니\' 선택 시, 생성 성공률을 높이기 위해 구도를 "미디엄샷"으로 자동 변경했습니다.'
            });
            setTimeout(() => setNotification(null), 5000);
        } else if (notification?.type === 'warning' && (!isBikini || !isRiskyComposition)) {
             setNotification(null);
        }
    }, [selections.outfit_style, selections.composition, notification?.type]);


    const handleImageUpload = useCallback(async (file: File | null) => {
        if (file) {
            try {
                const base64 = await fileToBase64(file);
                setReferenceImage({
                    file: file,
                    base64: base64,
                    mimeType: file.type,
                });
                setNotification({type: 'info', message: '참조 이미지가 업로드되었습니다.'});
                setTimeout(() => setNotification(null), 3000);
            } catch (error) {
                console.error("Error converting file to base64:", error);
                setNotification({ type: 'error', message: '이미지를 처리하는 중 오류가 발생했습니다.' });
            }
        } else {
            setReferenceImage(null);
        }
    }, []);

    const selectedSubjectOption = useMemo(() => {
        const ageCategory = CATEGORIES.find(c => c.id === 'age');
        return ageCategory?.options.find(o => o.id === selections.age);
    }, [selections.age]);
    
    const subjectGender = useMemo(() => {
        return selectedSubjectOption?.id.includes('female') ? 'female' : 'male';
    }, [selectedSubjectOption]);

    const filteredCategories = useMemo(() => {
        return CATEGORIES.map(category => {
            if (category.id === 'hair') {
                const filteredOptions = category.options.filter(option => 
                    !option.gender || option.gender === subjectGender
                );
                return { ...category, options: filteredOptions };
            }
            return category;
        });
    }, [subjectGender]);

    useEffect(() => {
        const hairCategory = CATEGORIES.find(c => c.id === 'hair');
        const selectedHairOption = hairCategory?.options.find(o => o.id === selections.hair);
        
        if (selectedHairOption && selectedHairOption.gender && selectedHairOption.gender !== subjectGender) {
            const defaultHairOption = filteredCategories.find(c => c.id === 'hair')?.options[0];
            if (defaultHairOption) {
                setSelections(prev => ({ ...prev, hair: defaultHairOption.id }));
            }
        }
    }, [subjectGender, selections.hair, filteredCategories]);


    const buildPrompt = useCallback(() => {
        const promptParts: string[] = [];
        
        const orderedCategories = [
            'age', 'style', 'quality', 'mode', 'composition', 
            'expression', 'skin', 'face_shape', 'eyes', 'hair', 'body_type', 
            'outfit_style', 'outfit_material', 'outfit_color', 
            'location', 'weather', 'lighting', 'atmosphere', 
            'camera_model', 'camera_lens'
        ];

        orderedCategories.forEach(categoryId => {
            const category = CATEGORIES.find(c => c.id === categoryId);
            const optionId = selections[categoryId];
            if (category && optionId) {
                const option = category.options.find(o => o.id === optionId);
                if (option && option.promptValue) {
                    promptParts.push(option.promptValue);
                }
            }
        });

        return promptParts.filter(p => p).join(', ');
    }, [selections]);

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setGeneratedImages(null);
        setNotification({ type: 'loading', message: '이미지 생성을 시작합니다... 잠시만 기다려주세요.' });

        const prompt = buildPrompt();
        const negativePrompt = "text, watermark, blurry, low quality, jpeg artifacts, signature, ugly, disfigured, deformed, extra limbs, bad anatomy";
        
        try {
            const images = await generateImage({
                apiKey,
                prompt,
                negativePrompt,
                aspectRatio: getAspectRatioFromSelection(selections.aspectRatio),
                numberOfImages: parseInt(selections.numberOfImages, 10),
                image: referenceImage ? { base64: referenceImage.base64, mimeType: referenceImage.mimeType } : undefined
            });

            setGeneratedImages(images);
            setNotification({ type: 'info', message: '이미지 생성이 완료되었습니다!' });
            setTimeout(() => setNotification(null), 5000);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            setNotification({ type: 'error', message: `생성 실패: ${errorMessage}` });
        } finally {
            setIsLoading(false);
        }
    }, [apiKey, referenceImage, buildPrompt, selections]);
    
    const downloadImage = (base64Image: string, index: number) => {
        const link = document.createElement('a');
        link.href = `data:image/jpeg;base64,${base64Image}`;
        link.download = `generated-image-${Date.now()}-${index + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadAll = useCallback(() => {
        if (!generatedImages) return;
        generatedImages.forEach((img, index) => {
            downloadImage(img, index);
        });
        setNotification({ type: 'info', message: '모든 이미지를 다운로드합니다.' });
        setTimeout(() => setNotification(null), 3000);
    }, [generatedImages]);


    const handleReset = () => {
        setSelections(DEFAULT_SELECTIONS);
        setReferenceImage(null);
        setGeneratedImages(null);
        setNotification({ type: 'info', message: '모든 옵션이 초기화되었습니다.' });
        setTimeout(() => setNotification(null), 3000);
    };

    const getNotificationClasses = (type: NotificationType) => {
        switch (type) {
            case 'info': return 'bg-blue-500/80 backdrop-blur-sm border-blue-400';
            case 'warning': return 'bg-yellow-500/80 backdrop-blur-sm border-yellow-400';
            case 'error': return 'bg-red-500/80 backdrop-blur-sm border-red-400';
            case 'loading': return 'bg-gray-600/80 backdrop-blur-sm border-gray-500';
            default: return 'bg-gray-700/80 backdrop-blur-sm';
        }
    };
    
    if (!apiKey) {
        return (
            <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-gray-800 p-8 rounded-lg shadow-2xl animate-fade-in">
                    <h1 className="text-3xl font-bold text-indigo-400 mb-4">시작하기</h1>
                    <p className="text-gray-400 mb-6">계속하려면 Gemini API 키를 입력하세요. 키는 브라우저에만 저장됩니다.</p>
                    <ApiKeyInput value="" onSave={handleSaveApiKey} />
                    {notification && (
                        <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white text-sm border ${getNotificationClasses(notification.type)} animate-fade-in-up z-50`}>
                             <div className="flex items-center gap-3">
                                <span>{notification.message}</span>
                                {notification.type !== 'loading' && (
                                    <button onClick={() => setNotification(null)} className="p-1 -mr-2 rounded-full hover:bg-white/20">
                                        <CloseIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <div className="flex flex-col lg:flex-row">
                {/* Sidebar */}
                <aside className="w-full lg:w-[400px] bg-gray-800 p-6 space-y-6 overflow-y-auto h-screen lg:sticky top-0 shadow-lg">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-indigo-400">AI 프로필 생성기</h1>
                        <button onClick={handleReset} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors" title="옵션 초기화">
                            <RefreshIcon className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-700">
                        <h2 className="text-xl font-bold text-gray-100">이미지 설정</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        {filteredCategories.map(category => (
                            <OptionSelector
                                key={category.id}
                                category={category as Category}
                                selectedValue={selections[category.id]}
                                onChange={handleSelectionChange}
                            />
                        ))}
                    </div>

                    <div className="pt-6 border-t border-gray-700">
                        <h2 className="text-xl font-bold text-gray-100 mb-4">얼굴 참조 (선택 사항)</h2>
                        <p className="text-sm text-gray-400 mb-4">특정 인물의 얼굴을 유지하려면 이미지를 업로드하세요. 업로드하지 않으면 프롬프트에 따라 새로운 얼굴이 생성됩니다.</p>
                        <ImageUploader onImageUpload={handleImageUpload} />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 mt-6 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                    >
                        {isLoading ? '생성 중...' : <><WandIcon className="w-5 h-5" /> 이미지 생성</>}
                    </button>
                    
                    <div className="pt-6 border-t border-gray-700">
                         <ApiKeyInput value={apiKey} onSave={handleSaveApiKey} />
                         <button 
                             onClick={() => {
                                 if (window.confirm('API 키를 정말로 지우시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                                     setApiKey('');
                                 }
                             }}
                             className="w-full text-center text-sm text-gray-400 hover:text-red-500 mt-3 transition-colors underline"
                         >
                             API 키 지우기 및 재설정
                         </button>
                    </div>

                </aside>

                {/* Main content */}
                <main className="flex-1 p-8 md:p-12">
                    {/* Results */}
                    <div className="mt-8">
                        {!generatedImages && !isLoading && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-10 border-2 border-dashed border-gray-700 rounded-lg">
                                <WandIcon className="w-16 h-16 mb-4" />
                                <h2 className="text-2xl font-semibold text-gray-300">결과가 여기에 표시됩니다</h2>
                                <p className="mt-2 max-w-md">왼쪽 패널에서 옵션을 선택하고 "이미지 생성" 버튼을 클릭하여 마법을 시작하세요!</p>
                            </div>
                        )}
                        
                        {isLoading && <LoadingSpinner />}
                        
                        {generatedImages && (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-semibold text-gray-300">생성된 이미지</h2>
                                    <button
                                        onClick={handleDownloadAll}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-700 transition-colors"
                                    >
                                        <DownloadAllIcon className="w-5 h-5" />
                                        전체 다운로드
                                    </button>
                                </div>
                                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6`}>
                                    {generatedImages.map((img, index) => (
                                        <div key={index} className="relative group rounded-lg overflow-hidden shadow-xl cursor-pointer" onClick={() => setZoomedImage(img)}>
                                            <img 
                                                src={`data:image/jpeg;base64,${img}`} 
                                                alt={`Generated creation ${index + 1}`} 
                                                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${getAspectRatioClassFromSelection(selections.aspectRatio)}`}
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); downloadImage(img, index); }}
                                                    className="p-3 bg-white/20 text-white rounded-full hover:bg-white/40 transition-colors backdrop-blur-sm"
                                                    title="Download image"
                                                >
                                                    <DownloadIcon className="w-6 h-6" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </main>
            </div>

            {/* Notification */}
            {notification && (
                 <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white text-sm border ${getNotificationClasses(notification.type)} animate-fade-in-up z-50`}>
                    <div className="flex items-center gap-3">
                        <span>{notification.message}</span>
                        {notification.type !== 'loading' && (
                            <button onClick={() => setNotification(null)} className="p-1 -mr-2 rounded-full hover:bg-white/20">
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}
            
            {/* Zoomed image modal */}
            {zoomedImage && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={() => setZoomedImage(null)}>
                    <div className="relative max-w-4xl max-h-[90vh] p-4" onClick={e => e.stopPropagation()}>
                        <img 
                            src={`data:image/jpeg;base64,${zoomedImage}`} 
                            alt="Zoomed result" 
                            className="object-contain w-full h-full rounded-lg shadow-2xl"
                        />
                        <button 
                            onClick={() => setZoomedImage(null)}
                            className="absolute -top-4 -right-4 p-2 bg-white/20 text-white rounded-full hover:bg-white/40 transition-colors"
                            aria-label="Close zoomed image"
                        >
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


// === FROM original index.tsx (entry point) ===
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);