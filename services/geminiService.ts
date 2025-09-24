
import { GoogleGenAI, Modality } from "@google/genai";
import type { AspectRatio } from "../types";

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

export const generateImage = async ({ apiKey, prompt, negativePrompt, aspectRatio, image, numberOfImages }: GenerateImageParams): Promise<string[]> => {
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
