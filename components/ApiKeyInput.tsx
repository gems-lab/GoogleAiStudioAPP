
import React, { useState, useEffect } from 'react';
import { EyeIcon, EyeOffIcon } from './IconComponents';

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

export default ApiKeyInput;