import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon, TrashIcon } from './IconComponents';

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

export default ImageUploader;