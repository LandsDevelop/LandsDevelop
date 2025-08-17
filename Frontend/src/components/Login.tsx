// src/components/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight, User, Mail, Check } from 'lucide-react';

interface LoginProps {
  onSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'phone' | 'otp' | 'details'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const sendOTP = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('https://landsdevelop.onrender.com/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');

      setOtpSent(true);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter valid 6-digit OTP');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('https://landsdevelop.onrender.com/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid OTP');

      // Check if user exists
      if (data.userExists) {
        // Existing user - direct login
        localStorage.setItem('token', data.token);
        localStorage.setItem('phone', phone);
        localStorage.setItem('name', data.user.firstName + ' ' + data.user.lastName);
        if (data.user.email) localStorage.setItem('email', data.user.email);

        // Redirect logic
        if (localStorage.getItem('redirectToPost')) {
          localStorage.removeItem('redirectToPost');
          navigate('/post-property');
        } else {
          navigate('/');
        }
        onSuccess();
      } else {
        // New user - collect details
        setStep('details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const completeSignup = async () => {
    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('https://landsdevelop.onrender.com/api/complete-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone, 
          firstName: firstName.trim(), 
          lastName: lastName.trim(), 
          email: email.trim() || null 
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to complete signup');

      // Store user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('phone', phone);
      localStorage.setItem('name', firstName + ' ' + lastName);
      if (email) localStorage.setItem('email', email);

      // Redirect logic
      if (localStorage.getItem('redirectToPost')) {
        localStorage.removeItem('redirectToPost');
        navigate('/post-property');
      } else {
        navigate('/');
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 10 digits
    return digits.slice(0, 10);
  };

  return (
    <div className="w-full bg-white p-8 rounded-xl shadow-lg space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          {step === 'phone' && 'Welcome'}
          {step === 'otp' && 'Verify OTP'}
          {step === 'details' && 'Complete Profile'}
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          {step === 'phone' && 'Enter your phone number to continue'}
          {step === 'otp' && `OTP sent to +91 ${phone}`}
          {step === 'details' && 'Tell us a bit about yourself'}
        </p>
      </div>

      {/* Phone Number Step */}
      {step === 'phone' && (
        <div className="space-y-4">
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
            <div className="flex">
              <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-600 text-sm rounded-l-lg">
                +91
              </span>
              <input
                type="tel"
                placeholder="Phone Number"
                className="pl-3 w-full py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                value={phone}
                onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                maxLength={10}
              />
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            onClick={sendOTP}
            disabled={loading || phone.length !== 10}
            className="bg-teal-600 text-white w-full py-3 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </div>
      )}

      {/* OTP Verification Step */}
      {step === 'otp' && (
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              className="w-full py-3 px-4 border border-gray-300 rounded-lg text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            onClick={verifyOTP}
            disabled={loading || otp.length !== 6}
            className="bg-teal-600 text-white w-full py-3 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button
            onClick={() => {
              setStep('phone');
              setOtp('');
              setError(null);
            }}
            className="text-teal-600 w-full py-2 text-sm hover:underline"
          >
            Change Phone Number
          </button>
        </div>
      )}

      {/* User Details Step */}
      {step === 'details' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="First Name *"
                className="pl-10 w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Last Name"
                className="pl-10 w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="email"
              placeholder="Email (Optional)"
              className="pl-10 w-full py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            onClick={completeSignup}
            disabled={loading || !firstName.trim()}
            className="bg-teal-600 text-white w-full py-3 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Creating Account...' : 'Complete Signup'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;