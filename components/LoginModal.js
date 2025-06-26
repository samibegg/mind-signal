// 10. components/LoginModal.js (NEW FILE)
'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { X } from 'lucide-react';

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  if (!isOpen) return null;

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (isSignUp) {
      // Sign-up logic
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        await signIn('credentials', { redirect: false, email, password });
        onClose();
      } else {
        const data = await res.json();
        setError(data.message || 'Sign-up failed.');
      }
    } else {
      // Sign-in logic
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      if (result.error) {
        setError('Invalid credentials. Please try again.');
      } else {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-dark-bg/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-dark-surface border border-dark-border rounded-lg p-8 w-full max-w-sm relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-dark-text-secondary hover:text-dark-text">
            <X size={20}/>
        </button>
        <h2 className="text-2xl font-bold text-center text-brand-purple mb-6">{isSignUp ? '[ CREATE ACCOUNT ]' : '[ SECURE LOGIN ]'}</h2>
        {error && <p className="bg-red-900/50 border border-red-500 text-red-300 text-center text-sm p-2 mb-4 rounded">{error}</p>}
        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <div>
            <label className="text-dark-text-secondary text-xs" htmlFor="email">{'>'} Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-dark-bg p-2 mt-1 border border-dark-border rounded focus:outline-none focus:ring-2 focus:ring-brand-purple text-brand-light-green" />
          </div>
          <div>
            <label className="text-dark-text-secondary text-xs" htmlFor="password">{'>'} Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-dark-bg p-2 mt-1 border border-dark-border rounded focus:outline-none focus:ring-2 focus:ring-brand-purple text-brand-light-green" />
          </div>
          <button type="submit" className="w-full py-2 bg-brand-purple text-dark-bg font-bold rounded hover:bg-opacity-80 transition-colors">
            {isSignUp ? '[ SIGN UP ]' : '[ SIGN IN ]'}
          </button>
        </form>
        <div className="flex items-center my-6">
            <div className="flex-grow border-t border-dark-border"></div>
            <span className="flex-shrink mx-4 text-dark-text-secondary text-xs">OR</span>
            <div className="flex-grow border-t border-dark-border"></div>
        </div>
        <button onClick={() => signIn('google')} className="w-full py-2 border border-dark-border bg-dark-bg text-dark-text font-bold rounded hover:bg-dark-border transition-colors">
            Sign in with Google
        </button>
        <p className="text-center mt-6 text-xs">
            <span className="text-dark-text-secondary">{isSignUp ? 'Already have an account? ' : "Don't have an account? "}</span>
            <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="text-brand-light-green hover:underline">
                {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
        </p>
      </div>
    </div>
  );
}

