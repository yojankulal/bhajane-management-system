import React, { useState } from 'react';
import { LogIn, LogOut, User, ShieldAlert, Loader2 } from 'lucide-react';
import { loginWithGoogle, logoutUser } from '../firebase';
import { User as FirebaseUser } from 'firebase/auth';

interface LoginProps {
  onUserUpdate: (user: FirebaseUser | null) => void;
  currentUser: FirebaseUser | null;
  authError?: string | null;
  authChecking?: boolean;
}

export default function LoginPage({ onUserUpdate, currentUser, authError, authChecking }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      onUserUpdate(null);
    } catch (err: any) {
      console.error('Logout error', err);
    } finally {
      setLoading(false);
    }
  };

  const displayError = authError || error;
  const isPending = loading || authChecking;

  if (currentUser) {
    return (
      <div id="logged-in-badge" className="flex items-center gap-3 bg-white dark:bg-zinc-800 p-2 px-3 rounded-full shadow-sm border border-zinc-100 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          {currentUser.photoURL ? (
            <img 
              referrerPolicy="no-referrer"
              src={currentUser.photoURL} 
              alt={currentUser.displayName || 'User'} 
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-600 flex items-center justify-center">
              <User className="w-4 h-4 text-zinc-500" />
            </div>
          )}
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              {currentUser.displayName || 'Admin'}
            </p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Authorized Admin</p>
          </div>
        </div>
        <button
          id="btn-logout"
          onClick={handleLogout}
          disabled={isPending}
          className="p-1.5 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 rounded-full text-zinc-500 dark:text-zinc-400 transition"
          title="Sign Out"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin text-zinc-400" /> : <LogOut className="w-4 h-4" />}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 relative">
      <div className="hidden lg:flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-2.5 py-1 rounded-full border border-amber-200/50 dark:border-amber-900/30">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>Read-Only Viewer Mode (Login to Edit)</span>
      </div>
      <button
        id="btn-login-header"
        onClick={handleLogin}
        disabled={isPending}
        className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-zinc-950 px-4 py-2 rounded-full text-sm font-semibold shadow-sm transition disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LogIn className="w-4 h-4" />
        )}
        <span>{isPending ? 'Verifying...' : 'Sign In'}</span>
      </button>
      {displayError && (
        <span className="text-xs text-red-500 font-medium absolute top-12 right-0 bg-white dark:bg-zinc-900 p-2.5 px-4 rounded-xl shadow-lg border border-red-200 dark:border-red-900/40 z-50 whitespace-nowrap">
          {displayError}
        </span>
      )}
    </div>
  );
}
