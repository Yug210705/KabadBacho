import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Recycle, Leaf, Info, Loader2, Chrome, Phone, Shield, Truck, UserCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, db } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';

const DEMO_CREDENTIALS = {
  email: 'demo@example.com',
  password: 'password123'
};

const ROLE_LABELS = {
  user: 'Customer',
  kabadi: 'Partner',
  admin: 'Admin'
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

  const checkRoleExclusivity = async (userEmail, attemptedRole) => {
    if (!db || !userEmail) return null;
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', userEmail));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        for (const docSnap of snapshot.docs) {
          const existingRole = (docSnap.data().role || 'user').toLowerCase();
          const attempted = attemptedRole.toLowerCase();
          if (existingRole !== attempted) {
            return existingRole;
          }
        }
      }
      return null;
    } catch (err) {
      console.error('Role exclusivity check failed:', err);
      return null;
    }
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
      const conflictingRole = await checkRoleExclusivity(email, role);
      if (conflictingRole) {
        const conflictLabel = ROLE_LABELS[conflictingRole] || conflictingRole;
        const attemptedLabel = ROLE_LABELS[role] || role;
        setErrors({
          general: `This email is already registered as "${conflictLabel}". You cannot sign in as "${attemptedLabel}".`
        });
        setIsLoading(false);
        return;
      }

      let userCredential;
      if (view === 'signup') {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        try {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
          if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password && 
             (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential')) {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
          } else {
            throw error;
          }
        }
      }
      await syncUser(userCredential.user);
      
      localStorage.setItem('token', await userCredential.user.getIdToken());
      if (role === 'admin') navigate('/admin');
      else if (role === 'kabadi') navigate('/Kabadi');
      else navigate('/dashboard');
    } catch (error) {
      if (auth.currentUser) {
        try { await auth.signOut(); } catch (_) {}
      }
      setErrors({ general: error.message.replace('Firebase: ', '') || 'Authentication failed. Please try again.' });
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
      await setDoc(userRef, {
        ...userData,
        role: role || 'user',
        isAdmin: role === 'admin',
        isPartner: role === 'kabadi',
        approvalStatus: role === 'kabadi' ? 'pending' : 'approved',
        createdAt: serverTimestamp()
      });
      
      if (role === 'kabadi') {
        await auth.signOut();
        throw new Error("Registration successful! Your Partner account is pending Admin approval. Please try logging in later.");
      }
    } else {
      const dbData = snap.data();
      const existingRole = (dbData.role || 'user').toLowerCase();
      const attemptedRole = role.toLowerCase();
      
      if (existingRole !== attemptedRole) {
        await auth.signOut();
        throw new Error(
          `Account registered as "${ROLE_LABELS[existingRole] || existingRole}". ` +
          `You cannot access the ${ROLE_LABELS[attemptedRole] || attemptedRole} portal.`
        );
      }

      if (attemptedRole === 'kabadi') {
        if (dbData.approvalStatus === 'pending') {
          await auth.signOut();
          throw new Error("Your Partner account is still pending Admin approval. Please wait for authorization.");
        }
        if (dbData.approvalStatus === 'rejected') {
          await auth.signOut();
          throw new Error("Your Partner application has been rejected by the Admin.");
        }
      }

      await setDoc(userRef, { ...dbData, lastLogin: serverTimestamp() }, { merge: true });
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const getRoleConfig = () => {
    switch (role) {
      case 'admin':
        return {
          title: 'Admin Portal',
          subtitle: 'Command Center & Analytics',
          primary: '#4E342E',
          secondary: '#8D6E63',
          light: '#EFEBE9',
          icon: Shield,
          heroText: 'Manage the entire recycling ecosystem from one transparent unified dashboard.'
        };
      case 'kabadi':
        return {
          title: 'Partner Portal',
          subtitle: 'Driver & Logistics Access',
          primary: '#1565C0',
          secondary: '#64B5F6',
          light: '#E3F2FD',
          icon: Truck,
          heroText: 'Get AI-optimized routes and connect with customers easily on the go.'
        };
      default:
        return {
          title: 'Customer Portal',
          subtitle: 'Sell Scrap, Save Planet',
          primary: '#2E7D32',
          secondary: '#81C784',
          light: '#E8F5E9',
          icon: UserCircle,
          heroText: 'Turn your everyday waste into wealth. Book a pickup and let us handle the rest.'
        };
    }
  };

  const config = getRoleConfig();
  const RoleIcon = config.icon;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const conflictingRole = await checkRoleExclusivity(result.user.email, role);
      if (conflictingRole) {
        await auth.signOut();
        const conflictLabel = ROLE_LABELS[conflictingRole] || conflictingRole;
        setErrors({ general: `Google account registered as "${conflictLabel}". Access denied.` });
        setIsLoading(false);
        return;
      }
      await syncUser(result.user);
      if (role === 'admin') navigate('/admin');
      else if (role === 'kabadi') navigate('/Kabadi');
      else navigate('/dashboard');
    } catch (error) {
      if (auth.currentUser) {
        try { await auth.signOut(); } catch (_) {}
      }
      setErrors({ general: 'Google sign-in failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#F8FAFC] pt-28 pb-12 px-4 relative overflow-hidden">
      {/* Dynamic Mesh Background Grid */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[120px] transition-all duration-1000 ease-in-out"
          style={{ backgroundColor: config.primary }}
        ></div>
        <div 
          className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full opacity-20 blur-[120px] transition-all duration-1000 ease-in-out"
          style={{ backgroundColor: config.secondary }}
        ></div>
        <div 
          className="absolute -bottom-[10%] left-[20%] w-[60%] h-[40%] rounded-full opacity-[0.15] blur-[120px] transition-all duration-1000 ease-in-out"
          style={{ backgroundColor: config.primary }}
        ></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1000px] my-auto bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] flex flex-col md:flex-row overflow-hidden min-h-[600px] border border-white/60 animate-fade-in-up">
        
        {/* LEFT COLUMN: BRANDING / INFO */}
        <div 
          className="md:w-5/12 p-10 flex flex-col justify-between relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${config.primary}, ${config.secondary})` }}
        >
          {/* Glass overlay patterns */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute top-10 -right-20 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex items-center gap-2 text-white/90 font-bold tracking-widest text-xs uppercase mb-12">
            <Recycle size={18} />
            <span>KabadBecho</span>
          </div>

          <div className="relative z-10 my-auto">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/30">
              <RoleIcon className="text-white" size={32} />
            </div>
            <h1 className="text-4xl text-white font-black tracking-tight leading-tight mb-4">
              {config.title}
            </h1>
            <p className="text-white/80 text-lg leading-relaxed font-medium max-w-sm">
              {config.heroText}
            </p>
          </div>

          <div className="relative z-10 mt-12 text-sm text-white/60 font-medium">
            &copy; {new Date().getFullYear()} KabadBecho Inc.
          </div>
        </div>

        {/* RIGHT COLUMN: FORM */}
        <div className="md:w-7/12 p-8 md:p-12 pb-10 flex flex-col bg-white">
          
          {/* Top segment: Role switcher */}
          <div className="flex justify-end mb-8">
            <div className="inline-flex bg-gray-100 p-1 rounded-xl">
              {[
                { id: 'user', label: 'User' },
                { id: 'kabadi', label: 'Partner' },
                { id: 'admin', label: 'Admin' }
              ].map(r => (
                <button
                  key={r.id}
                  onClick={() => { setRole(r.id); setErrors({}); }}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    role === r.id 
                      ? 'bg-white shadow-sm text-gray-800' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {view === 'login' ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                {view === 'login' ? 'Please enter your details to sign in.' : 'Enter your details to get started.'}
              </p>
            </div>

            {errors.general && (
              <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-sm font-semibold text-red-600 flex gap-2 animate-shake">
                <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                <p>{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all font-medium text-gray-800 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
                  {view === 'login' && (
                    <button type="button" className="text-xs font-bold text-gray-400 hover:text-gray-700 transition">Forgot?</button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all font-medium text-gray-800 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{ backgroundColor: config.primary }}
                className="w-full py-3.5 mt-2 text-white font-bold rounded-xl hover:opacity-90 transition-all flex justify-center items-center gap-2 active:scale-[0.98]"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : (view === 'login' ? 'Sign in' : 'Create Account')}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-8 relative flex items-center justify-center">
              <div className="border-t border-gray-200 w-full absolute"></div>
              <span className="bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-widest relative z-10">Or</span>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 bg-white border border-gray-200 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all text-sm text-gray-700 active:scale-[0.98]"
              >
                <Chrome size={18} className="text-[#4285F4]" />
                Continue with Google
              </button>
            </div>

            <div className="mt-auto pt-8 flex items-center justify-between text-sm">
              <p className="text-gray-500 font-medium">
                {view === 'login' ? "Don't have an account?" : "Already have an account?"}
              </p>
              <button 
                onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                className="font-bold hover:underline"
                style={{ color: config.primary }}
              >
                {view === 'login' ? 'Sign up for free' : 'Log in instead'}
              </button>
            </div>

            {/* Subtle Demo Login action - no longer a massive box! */}
            <div className="mt-4 text-center">
               <button 
                  onClick={() => { setEmail(DEMO_CREDENTIALS.email); setPassword(DEMO_CREDENTIALS.password); setView('login'); }}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition underline decoration-gray-300 underline-offset-4"
               >
                  Use Demo Account
               </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default KabadBechoLogin;