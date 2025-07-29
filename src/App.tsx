import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { Login } from './components/auth/Login';
import { SignUp } from './components/auth/SignUp';
import { Dashboard } from './components/Dashboard';

function App() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-white">PortfolioHub</h2>
          <p className="text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {authMode === 'login' ? (
          <Login onToggleMode={() => setAuthMode('signup')} />
        ) : (
          <SignUp onToggleMode={() => setAuthMode('login')} />
        )}
      </>
    );
  }

  return <Dashboard />;
}

export default App;
