// src/components/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Lock, User } from 'lucide-react';

interface LoginProps {
  onSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const url = isLogin
        ? 'http://localhost:5174/api/login'
        : 'http://localhost:5174/api/signup';
      const body = isLogin
        ? { email, password }
        : { email, password, name, mobile };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');

      // Safely handle login or signup
      if (data.token) localStorage.setItem('token', data.token);
      if (data.user?.email) localStorage.setItem('email', data.user.email);
      if (data.user?.name) localStorage.setItem('name', data.user.name);

      // Redirect logic
      if (localStorage.getItem('redirectToPost')) {
        localStorage.removeItem('redirectToPost');
        navigate('/post-property');
      } else {
        navigate('/');
      }

      onSuccess(); // ✅ Close modal
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white p-8 rounded-xl shadow-lg space-y-6">
      <h2 className="text-center text-3xl font-bold text-gray-900">
        {isLogin ? 'Sign In' : 'Sign Up'}
      </h2>
      <p className="text-center text-sm text-gray-600">
        {isLogin ? "Don't have an account?" : "Already have an account?"}
        <button
          className="text-teal-600 ml-1 font-semibold hover:underline"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </button>
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {!isLogin && (
          <>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Full Name"
                className="pl-10 w-full py-2 border rounded-lg"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <ArrowRight className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Mobile"
                className="pl-10 w-full py-2 border rounded-lg"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-400" />
          <input
            type="email"
            placeholder="Email"
            className="pl-10 w-full py-2 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" />
          <input
            type="password"
            placeholder="Password"
            className="pl-10 w-full py-2 border rounded-lg"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-teal-600 text-white w-full py-2 rounded-lg hover:bg-teal-700"
        >
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default Login;
