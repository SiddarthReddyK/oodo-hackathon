import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from './AuthModal';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen bg-[#f4f1ea] dark:bg-[#0f1715] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1e3a34] dark:bg-[#24453e] flex items-center justify-center animate-pulse text-white">
            <svg
              className="w-6 h-6 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <span className="text-xs font-semibold text-[#1c2a27] dark:text-[#cbd5d1] tracking-wider uppercase">
            Verifying Session...
          </span>
        </div>
      </div>
    );
  }

  // Not authenticated: always render login / register portal
  if (!isAuthenticated) {
    return <AuthModal />;
  }

  // Authenticated: render the protected application routes
  return <>{children}</>;
};
