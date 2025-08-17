// src/components/LoginModal.tsx
import React from 'react';
import Login from './Login';

const LoginModal: React.FC<{ onClose: () => void; onLoginSuccess: () => void }> = ({ onClose, onLoginSuccess }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="relative w-full max-w-md mx-auto">
        <button
          className="absolute top-0 right-2 text-gray-700 text-3xl font-bold z-10"
          onClick={onClose}
        >
          ×
        </button>
        <Login onSuccess={() => {
          onLoginSuccess();
          onClose();
        }} />
      </div>
    </div>
  );
};

export default LoginModal;
