import React from 'react';
import type { Category } from '../types';

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

export default OptionSelector;
