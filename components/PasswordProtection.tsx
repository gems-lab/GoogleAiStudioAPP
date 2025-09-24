
import React, { useState } from 'react';

interface PasswordProtectionProps {
  onSuccess: () => void;
}

// NOTE: For this simple implementation, the password is hardcoded.
// For a real-world application, this should be handled more securely.
const CORRECT_PASSWORD = 'gemini-2024';

const PasswordProtection: React.FC<PasswordProtectionProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setError(null);
      onSuccess();
    } else {
      setError('비밀번호가 올바르지 않습니다.');
      setPassword('');
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gray-800 p-8 rounded-lg shadow-2xl animate-fade-in">
        <h1 className="text-2xl font-bold text-indigo-400 mb-4 text-center">접근 인증</h1>
        <p className="text-gray-400 mb-6 text-center text-sm">
          이 앱에 접근하려면 비밀번호를 입력하세요.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password-input" className="sr-only">
              비밀번호
            </label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              autoFocus
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-500 transition-colors"
          >
            입장
          </button>
        </form>
         <p className="text-gray-500 mt-6 text-center text-xs">
            비밀번호 분실 시 관리자에게 문의하세요.
        </p>
      </div>
    </div>
  );
};

export default PasswordProtection;
