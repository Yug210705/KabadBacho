import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, Loader2, Info, Chrome, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

const DEMO_CREDENTIALS = {
  email: 'demo@example.com',
  password: 'password123'
};

const ROLE_LABELS = {
  user: 'Customer',
  kabadi: 'Partner (Pickup Person)',
  admin: 'Admin'
};

// InputField moved outside the component to prevent re-renders losing focus
const InputField = ({ icon: Icon, type, placeholder, label, value, onChange, error, isPassword, showPass, togglePass }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon size={18} className="text-[#66BB6A]" />
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-[#66BB6A] focus:border-[#66BB6A] text-sm transition-colors ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
        placeholder={placeholder}
      />
      {isPassword && (
        <button type="button" onClick={togglePass} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#66BB6A]">
          {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

/**
 * ROLE EXCLUSIVITY CHECK
 * AuthModal is only used for 'user' role login.
 * Checks if the given email is already registered under a different role (admin/kabadi).
 */
const checkRoleExclusivity = async (userEmail) => {
  if (!db || !userEmail) return null;
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', userEmail));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      for (const docSnap of snapshot.docs) {
        const existingRole = (docSnap.data().role || 'user').toLowerCase();
        if (existingRole !== 'user') {
          return existingRole; // Conflict — email is registered as admin or kabadi
        }
      }
    }
    return null; // No conflict
  } catch (err) {
    console.error('Role exclusivity check failed:', err);
    return null;
  }
};

const AuthModal = ({ isOpen, onClose, redirectPath }) => {
  const [view, setView] = useState('login'); // 'login', 'signup', 'forgot'
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [signupData, setSignupData] = useState({ name: '', email: '', phone: '', address: '', password: '' });
  const [resetSent, setResetSent] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!email || !password) {
      setErrors({ general: 'Email and password are required' });
      return;
    }

    setIsLoading(true);
    try {
      // ─── ROLE EXCLUSIVITY CHECK ───
      const conflictingRole = await checkRoleExclusivity(email);
      if (conflictingRole) {
        const conflictLabel = ROLE_LABELS[conflictingRole] || conflictingRole;
        setErrors({
          general: `⚠️ This email is already registered as "${conflictLabel}". You cannot sign in as a Customer with the same email. Please use a different email or login from the correct portal.`
        });
        setIsLoading(false);
        return;
      }

      let userCredential;
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

      // Sync user data to Firestore
      await syncUser(userCredential.user);
      onClose();
      navigate(redirectPath || '/dashboard');
    } catch (error) {
      console.error(error);
      if (auth.currentUser) {
        try { await auth.signOut(); } catch (_) {}
      }
      setErrors({ general: error.message || 'Invalid login. Please check your credentials.' });
    } finally {
      setIsLoading(false);
    }
  };

  const syncUser = async (user, additionalData = {}) => {
    if (!db) return;
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || signupData.name || 'User',
        phone: signupData.phone || '',
        address: signupData.address || '',
        role: 'user', // always user from this modal
        createdAt: serverTimestamp(),
        ...additionalData
      });
    } else {
      // Existing user — enforce role match
      const existingRole = (snap.data().role || 'user').toLowerCase();
      if (existingRole !== 'user') {
        await auth.signOut();
        throw new Error(
          `This account is registered as "${ROLE_LABELS[existingRole] || existingRole}". ` +
          `You cannot access the Customer portal. Please use a different email.`
        );
      }
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!signupData.email || !signupData.password) {
      setErrors({ general: 'Email and password are required' });
      return;
    }

    setIsLoading(true);
    try {
      // ─── ROLE EXCLUSIVITY CHECK ───
      const conflictingRole = await checkRoleExclusivity(signupData.email);
      if (conflictingRole) {
        const conflictLabel = ROLE_LABELS[conflictingRole] || conflictingRole;
        setErrors({
          general: `⚠️ This email is already registered as "${conflictLabel}". You cannot create a Customer account with the same email.`
        });
        setIsLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, signupData.email, signupData.password);
      await syncUser(userCredential.user);
      onClose();
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      if (auth.currentUser) {
        try { await auth.signOut(); } catch (_) {}
      }
      setErrors({ general: error.message.replace('Firebase:', '') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // ─── ROLE EXCLUSIVITY CHECK ───
      const conflictingRole = await checkRoleExclusivity(result.user.email);
      if (conflictingRole) {
        await auth.signOut();
        const conflictLabel = ROLE_LABELS[conflictingRole] || conflictingRole;
        setErrors({
          general: `⚠️ This Google account is already registered as "${conflictLabel}". You cannot sign in as a Customer with the same email.`
        });
        setIsLoading(false);
        return;
      }
      
      await syncUser(result.user);
      onClose();
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      if (auth.currentUser) {
        try { await auth.signOut(); } catch (_) {}
      }
      setErrors({ general: 'Google sign-in failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) { setErrors({ general: 'Email is required' }); return; }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (error) {
      setErrors({ general: error.message });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all animate-fade-in-up">

        {/* Header Gradient */}
        <div className="bg-linear-to-br from-[#2E7D32] to-[#66BB6A] p-6 text-center text-white relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
          <h2 className="text-2xl font-bold mb-1">
            {view === 'login' && 'Welcome Back'}
            {view === 'signup' && 'Create Account'}
            {view === 'forgot' && 'Reset Password'}
          </h2>
          <p className="text-white/90 text-sm">
            {view === 'login' && 'Please login to continue'}
            {view === 'signup' && 'Join the green revolution'}
            {view === 'forgot' && 'We\'ll help you reset it'}
          </p>
        </div>

        {/* Form Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

          {/* Role Exclusivity Warning */}
          <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-700 font-medium flex items-start gap-2">
            <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
            <span>Each email can only be registered under <strong>one role</strong>. If your email is already used as Admin or Partner, you cannot use it here.</span>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-semibold animate-shake">
              {errors.general}
            </div>
          )}

          {view === 'login' && (
            <>
              <form onSubmit={handleLogin}>
                <InputField
                  icon={Mail}
                  type="email"
                  label="Email Address"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />
                <InputField
                  icon={Lock}
                  type={showPassword ? "text" : "password"}
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  isPassword
                  showPass={showPassword}
                  togglePass={() => setShowPassword(!showPassword)}
                />

                <div className="flex justify-end mb-6">
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-xs font-semibold text-[#66BB6A] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#66BB6A] hover:bg-[#43A047] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-green-200 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
                </button>
              </form>

              {/* Google Login Button */}
              <div className="mt-4">
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                  <div className="relative flex justify-center text-xs text-gray-400 font-semibold uppercase bg-white px-2">Or</div>
                </div>
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-3 border-2 border-gray-100 hover:border-[#66BB6A] hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Chrome size={20} className="text-[#4285F4]" />
                  <span>Continue with Google</span>
                </button>

                {/* Subtle Demo Credentials */}
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => { setEmail(DEMO_CREDENTIALS.email); setPassword(DEMO_CREDENTIALS.password); }}
                    className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition underline decoration-gray-300 underline-offset-4"
                  >
                    Use Demo Account
                  </button>
                </div>
              </div>
            </>
          )}

          {view === 'signup' && (
            <form onSubmit={handleSignUp}>
              <InputField icon={User} type="text" label="Full Name" placeholder="John Doe" value={signupData.name} onChange={(e) => setSignupData({...signupData, name: e.target.value})} />
              <InputField icon={Mail} type="email" label="Email Address" placeholder="john@example.com" value={signupData.email} onChange={(e) => setSignupData({...signupData, email: e.target.value})} />
              <InputField icon={Phone} type="tel" label="Phone Number" placeholder="+91 0000000000" value={signupData.phone} onChange={(e) => setSignupData({...signupData, phone: e.target.value})} />
              <InputField icon={MapPin} type="text" label="Address" placeholder="Your City, Area" value={signupData.address} onChange={(e) => setSignupData({...signupData, address: e.target.value})} />
              <InputField icon={Lock} type="password" label="Password" placeholder="••••••••" value={signupData.password} onChange={(e) => setSignupData({...signupData, password: e.target.value})} />

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#66BB6A] hover:bg-[#43A047] text-white font-bold rounded-xl transition-all shadow-lg mt-4 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
              </button>
              
              <button
                  onClick={handleGoogleLogin}
                  type="button"
                  disabled={isLoading}
                  className="w-full mt-4 py-3 border-2 border-gray-100 hover:border-[#66BB6A] hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Chrome size={20} className="text-[#4285F4]" />
                  <span>Sign up with Google</span>
                </button>

              {/* Subtle Demo Credentials for Demo View */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setView('login');
                    setEmail(DEMO_CREDENTIALS.email);
                    setPassword(DEMO_CREDENTIALS.password);
                  }}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition underline decoration-gray-300 underline-offset-4"
                >
                  Use Demo Account
                </button>
              </div>
            </form>
          )}

          {view === 'forgot' && (
            <form onSubmit={handleResetPassword}>
              <InputField icon={Mail} type="email" label="Email Address" placeholder="registered-email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              {resetSent && <p className="text-xs text-green-600 font-bold mb-4">Reset link sent! Please check your inbox.</p>}
              <button 
                type="submit"
                disabled={isLoading || resetSent}
                className="w-full py-3 bg-[#66BB6A] hover:bg-[#43A047] text-white font-bold rounded-xl transition-all shadow-lg mt-4 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
              </button>
            </form>
          )}

          {/* Footer Navigation */}
          <div className="text-center text-sm text-gray-500 mt-6 pt-4 border-t border-gray-100">
            {view === 'login' ? (
              <p>Don't have an account? <button onClick={() => setView('signup')} className="text-[#66BB6A] font-bold hover:underline">Sign Up</button></p>
            ) : (
              <p>Already have an account? <button onClick={() => setView('login')} className="text-[#66BB6A] font-bold hover:underline">Login</button></p>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AuthModal;
