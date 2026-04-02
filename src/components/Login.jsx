import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Recycle, Leaf, Info, Loader2, Chrome, Phone, Shield, Truck, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, db } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

const DEMO_CREDENTIALS = {
  email: 'demo@example.com',
  password: 'password123'
};

const KabadBechoLogin = ({ defaultRole = 'user' }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState(defaultRole); // 'user', 'kabadi', 'admin'
  const [view, setView] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedInput, setFocusedInput] = useState(null);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!email || !password) {
      setErrors({ general: 'Email and password are required' });
      return;
    }

    setIsLoading(true);
    try {
      let userCredential;
      if (view === 'signup') {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        try {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
          // If it's the demo account and it doesn't exist, auto-create it
          if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password && 
             (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential')) {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
          } else {
            throw error;
          }
        }
      }
      await syncUser(userCredential.user);
      
      // Navigate to correct dashboard based on role
      localStorage.setItem('token', await userCredential.user.getIdToken()); // Ensure token is set for Navbar
      if (role === 'admin') navigate('/admin');
      else if (role === 'kabadi') navigate('/Kabadi');
      else navigate('/dashboard');
    } catch (error) {
      setErrors({ general: error.message || 'Authentication failed. Please try again.' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncUser = async (user) => {
    if (!db) return;
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'User',
      lastLogin: serverTimestamp()
    };

    if (!snap.exists()) {
      // New user registration
      await setDoc(userRef, {
        ...userData,
        role: role || 'user',
        isAdmin: role === 'admin',
        isPartner: role === 'kabadi',
        createdAt: serverTimestamp()
      });
    } else {
       // Existing user - update role if they are logging into a specific higher-privilege portal
       const existingRole = snap.data().role;
       if (role === 'admin' && existingRole !== 'admin') {
          await updateDoc(userRef, { role: 'admin', isAdmin: true });
       } else if (role === 'kabadi' && existingRole !== 'kabadi' && existingRole !== 'admin') {
          await updateDoc(userRef, { role: 'kabadi', isPartner: true });
       } else {
          await updateDoc(userRef, { lastLogin: serverTimestamp() });
       }
    }
    // Small buffer to ensure Firestore propagation before navigation
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const getRoleConfig = () => {
    switch (role) {
      case 'admin':
        return {
          title: 'Admin Portal',
          subtitle: 'Management & Analytics Control',
          primary: '#5D4037',
          secondary: '#795548',
          bg: 'from-[#5D4037] to-[#8D6E63]',
          icon: Shield
        };
      case 'kabadi':
        return {
          title: 'Partner Portal',
          subtitle: 'Driver & Logistics Access',
          primary: '#1976D2',
          secondary: '#2196F3',
          bg: 'from-[#1976D2] to-[#64B5F6]',
          icon: Truck
        };
      default:
        return {
          title: 'Welcome Back',
          subtitle: 'Log in to your Kabad Becho account',
          primary: '#2E7D32',
          secondary: '#66BB6A',
          bg: 'from-[#66BB6A] to-[#AED581]',
          icon: Recycle
        };
    }
  };

  const config = getRoleConfig();
  const RoleIcon = config.icon;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUser(result.user);
      
      // Navigate based on role
      if (role === 'admin') navigate('/admin');
      else if (role === 'kabadi') navigate('/Kabadi');
      else navigate('/dashboard');
    } catch (error) {
      setErrors({ general: error.message || 'Google sign-in failed. Please try again.' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#F1F8E9] flex items-center justify-center p-4 pt-28 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-[#AED581]/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] bg-[#81C784]/20 rounded-full blur-[100px] animate-pulse delay-700"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[40%] bg-[#4DB6AC]/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          {/* Role Switcher */}
          <div className="flex justify-center gap-2 mb-8 p-1.5 bg-gray-100 rounded-2xl w-full max-w-xs mx-auto">
            {[
              { id: 'user', label: 'Customer', icon: UserCircle },
              { id: 'kabadi', label: 'Partner', icon: Truck },
              { id: 'admin', label: 'Admin', icon: Shield }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  role === r.id 
                    ? 'bg-white text-[#2E7D32] shadow-sm scale-105' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <r.icon size={16} />
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 sm:p-10 relative overflow-hidden">

          {/* Top Decorative Line */}
          <div className={`absolute top-0 left-0 w-full h-2 transition-colors duration-500`} style={{ backgroundColor: config.primary }}></div>

          {/* Subtle Leaf Decoration */}
          <Leaf className="absolute -top-6 -right-6 text-[#E8F5E9] transform rotate-12" size={120} />

          {/* Header */}
          <div className="text-center mb-10 relative">
            <div 
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 shadow-lg transform rotate-3 hover:rotate-6 transition-all duration-500"
              style={{ background: `linear-gradient(135deg, ${config.primary}, ${config.secondary})`, boxShadow: `0 10px 20px -5px ${config.primary}40` }}
            >
              <RoleIcon className="text-white drop-shadow-md" size={40} />
            </div>
            <h2 className="text-3xl font-extrabold mb-2 tracking-tight transition-colors duration-500" style={{ color: config.primary }}>
              {view === 'login' ? config.title : `Join as ${role === 'user' ? 'Customer' : role === 'kabadi' ? 'Partner' : 'Admin'}`}
            </h2>
            <p className="text-gray-500 font-medium">
              {view === 'login' ? config.subtitle : 'Join the green revolution today'}
            </p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3 text-red-600 font-semibold text-sm animate-shake">
              {errors.general}
            </div>
          )}


          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#558B2F] ml-1">Email Address</label>
              <div className={`
                relative group transition-all duration-300 rounded-xl
                ${focusedInput === 'email' ? 'shadow-[0_0_0_4px_rgba(102,187,106,0.2)]' : ''}
              `}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`transition-colors duration-300 ${focusedInput === 'email' ? 'text-[#66BB6A]' : 'text-gray-400'}`} size={20} />
                </div>
                <input
                  type="email"
                  value={email}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  placeholder="name@example.com"
                  className={`
                    w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-xl outline-none transition-all duration-300 font-medium text-gray-700 placeholder-gray-400
                    ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-100 hover:border-gray-200'}
                    ${focusedInput === 'email' && !errors.email ? 'border-[#66BB6A] bg-white' : ''}
                  `}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 font-semibold ml-1 flex items-center animate-shake">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#558B2F] ml-1">Password</label>
              <div className={`
                relative group transition-all duration-300 rounded-xl
                ${focusedInput === 'password' ? 'shadow-[0_0_0_4px_rgba(102,187,106,0.2)]' : ''}
              `}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`transition-colors duration-300 ${focusedInput === 'password' ? 'text-[#66BB6A]' : 'text-gray-400'}`} size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  placeholder="Enter your password"
                  className={`
                    w-full pl-12 pr-12 py-4 bg-gray-50 border-2 rounded-xl outline-none transition-all duration-300 font-medium text-gray-700 placeholder-gray-400
                    ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-100 hover:border-gray-200'}
                    ${focusedInput === 'password' && !errors.password ? 'border-[#66BB6A] bg-white' : ''}
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#66BB6A] transition-colors duration-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 font-semibold ml-1 flex items-center animate-shake">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Options */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center cursor-pointer group select-none">
                <div className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200
                  ${rememberMe ? 'bg-[#66BB6A] border-[#66BB6A]' : 'border-gray-300 bg-white group-hover:border-[#66BB6A]'}
                `}>
                  {rememberMe && <ArrowRight size={12} className="text-white transform -rotate-45" />}
                </div>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="hidden"
                />
                <span className="ml-2 text-sm text-gray-600 font-medium group-hover:text-[#2E7D32] transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-[#66BB6A] hover:text-[#2E7D32] font-bold transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 relative overflow-hidden group"
              style={{ background: `linear-gradient(135deg, ${config.primary}, ${config.secondary})`, boxShadow: `0 10px 20px -5px ${config.primary}50` }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>{view === 'login' ? 'Logging In...' : 'Joining...'}</span>
                </>
              ) : (
                <>
                  <span className="relative z-10">{view === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform relative z-10" size={20} />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-xs font-semibold text-gray-400 uppercase tracking-widest">Or continue with</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 group"
            >
              <Chrome size={20} className="text-[#4285F4] group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-gray-600">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 group">
              <Phone size={20} className="text-[#66BB6A] group-hover:scale-110 transition-transform" />
              <span className="text-sm font-semibold text-gray-600">Phone</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center mt-8 text-gray-500 font-medium">
            {view === 'login' ? (
              <>
                Don't have an account?{' '}
                <button onClick={() => setView('signup')} className="text-[#66BB6A] hover:text-[#2E7D32] font-bold hover:underline transition-all cursor-pointer" style={{ color: config.primary }}>
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => setView('login')} className="text-[#66BB6A] hover:text-[#2E7D32] font-bold hover:underline transition-all cursor-pointer" style={{ color: config.primary }}>
                  Sign in
                </button>
              </>
            )}
          </p>

          {/* Demo Credentials Card */}
          <div className="mt-8 p-4 bg-linear-to-br from-gray-50 to-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg" style={{ backgroundColor: config.primary }}>
                  <Info size={16} className="text-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-800">Demo Account Available</h3>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-xs bg-white/50 p-2 rounded-lg border border-gray-100">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-mono font-bold text-gray-700">{DEMO_CREDENTIALS.email}</span>
                </div>
                <div className="flex justify-between items-center text-xs bg-white/50 p-2 rounded-lg border border-gray-100">
                  <span className="text-gray-500">Pass:</span>
                  <span className="font-mono font-bold text-gray-700">{DEMO_CREDENTIALS.password}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail(DEMO_CREDENTIALS.email);
                  setPassword(DEMO_CREDENTIALS.password);
                }}
                className="w-full py-2 text-xs font-bold transition-all border rounded-lg"
                style={{ color: config.primary, borderColor: config.primary + '30', backgroundColor: config.primary + '08' }}
              >
                Use Demo Credentials
              </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default KabadBechoLogin;