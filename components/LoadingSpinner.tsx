import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-400"></div>
            <p className="text-gray-300">걸작을 생성하는 중...</p>
        </div>
    );
};

export default LoadingSpinner;