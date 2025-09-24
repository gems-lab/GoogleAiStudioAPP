


import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { CATEGORIES, DEFAULT_SELECTIONS } from './constants';
import type { Selections, AspectRatio, Category } from './types';
import { generateImage } from './services/geminiService';
import OptionSelector from './components/OptionSelector';
import ImageUploader from './components/ImageUploader';
import LoadingSpinner from './components/LoadingSpinner';
import ApiKeyInput from './components/ApiKeyInput';
import { WandIcon, DownloadIcon, CloseIcon, RefreshIcon, DownloadAllIcon } from './components/IconComponents';

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

export default App;