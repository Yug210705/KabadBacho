import React, { useState, useEffect } from 'react';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Bell,
  Save,
  Camera,
  Eye,
  EyeOff,
  CheckCircle,
  LogOut,
  HelpCircle,
  Settings
} from 'lucide-react';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const KabadBechoSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    alternatePhone: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    pickupReminders: true,
    promotionalEmails: false,
    weeklyReport: true
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      if (user.email === 'demo@example.com') {
        setProfileData({
          name: 'Rajesh Kumar',
          email: 'rajesh.kumar@example.com',
          phone: '9876543210',
          address: '123 Green Street, Eco City',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          alternatePhone: '9876543211'
        });
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfileData(prev => ({
            ...prev,
            ...data,
            name: data.name || data.displayName || prev.name || '',
            email: data.email || user.email || prev.email || ''
          }));
        } else {
          // Initialize with Auth data if Firestore doc doesn't exist
          setProfileData(prev => ({
            ...prev,
            name: user.displayName || '',
            email: user.email || ''
          }));
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleNotificationToggle = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user || user.email === 'demo@example.com') {
       setSaveSuccess(true);
       setTimeout(() => setSaveSuccess(false), 3000);
       return;
    }

    setIsUpdating(true);
    try {
      await setDoc(doc(db, 'users', user.uid), profileData, { merge: true });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const quickTabs = [
    { id: 'profile', label: 'Profile', icon: <User size={20} /> },
    { id: 'security', label: 'Security', icon: <Lock size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-[#E8F5E9] to-white">
      {/* Header */}
      <section className="relative py-12 bg-linear-to-br from-[#66BB6A] to-[#4CAF50] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm">
              <Settings size={32} />
            </div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-2">Settings</h1>
              <p className="text-xl text-green-50">Manage your account preferences</p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Message */}
      {saveSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-slideIn">
          <div className="bg-white rounded-xl shadow-2xl p-4 flex items-center space-x-3 border-l-4 border-[#66BB6A]">
            <CheckCircle className="text-[#66BB6A]" size={24} />
            <span className="text-gray-700 font-semibold">Settings saved successfully!</span>
          </div>
        </div>
      )}
      {/* Quick cards UI */}
      <div className="max-w-7xl mx-auto px-6 mt-10 grid md:grid-cols-3 gap-6">
        {quickTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`p-6 rounded-2xl text-left border transition shadow-sm hover:shadow-lg ${
              activeTab === t.id
                ? "bg-linear-to-r from-[#66BB6A] to-[#4CAF50] text-white"
                : "bg-white"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">{t.icon}
              <h3 className="font-bold text-lg">{t.label}</h3>
            </div>
            <p className="text-sm opacity-80">
              {t.id === "profile" && "Update your personal details"}
              {t.id === "security" && "Manage your password & security"}
              {t.id === "notifications" && "Control your alerts & reminders"}
            </p>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            

            {/* Content Area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                {/* Profile Settings */}
                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-bold text-[#5D4037] mb-2">Profile Information</h2>
                      <p className="text-gray-600">Update your personal details and contact information</p>
                    </div>

                    {/* Profile Picture */}
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <div className="w-24 h-24 bg-linear-to-br from-[#66BB6A] to-[#4CAF50] rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                          {profileData.name?.[0] || profileData.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-white border-2 border-[#66BB6A] rounded-full flex items-center justify-center hover:bg-[#E8F5E9] transition-colors duration-300 shadow-md">
                          <Camera size={16} className="text-[#66BB6A]" />
                        </button>
                      </div>
                      <div>
                        <h3 className="font-bold text-[#5D4037] text-lg">{profileData.name}</h3>
                        <p className="text-gray-600 text-sm">{profileData.email}</p>
                        <button className="text-[#66BB6A] text-sm font-semibold hover:text-[#4CAF50] mt-1">
                          Change Profile Picture
                        </button>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-[#5D4037] mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="text-gray-400" size={20} />
                          </div>
                          <input
                            type="text"
                            name="name"
                            value={profileData.name}
                            onChange={handleProfileChange}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66BB6A] transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#5D4037] mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="text-gray-400" size={20} />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66BB6A] transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#5D4037] mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className="text-gray-400" size={20} />
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleProfileChange}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66BB6A] transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#5D4037] mb-2">
                          Alternate Phone
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Phone className="text-gray-400" size={20} />
                          </div>
                          <input
                            type="tel"
                            name="alternatePhone"
                            value={profileData.alternatePhone}
                            onChange={handleProfileChange}
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66BB6A] transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-[#5D4037] mb-2">
                          Address
                        </label>
                        <div className="relative">
                          <div className="absolute top-3 left-0 pl-4 pointer-events-none">
                            <MapPin className="text-gray-400" size={20} />
                          </div>
                          <textarea
                            name="address"
                            value={profileData.address}
                            onChange={handleProfileChange}
                            rows="2"
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66BB6A] transition-all duration-300 resize-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#5D4037] mb-2">City</label>
                        <input
                          type="text"
                          name="city"
                          value={profileData.city}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66BB6A] transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#5D4037] mb-2">State</label>
                        <input
                          type="text"
                          name="state"
                          value={profileData.state}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66BB6A] transition-all duration-300"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#5D4037] mb-2">Pincode</label>
                        <input
                          type="text"
                          name="pincode"
                          value={profileData.pincode}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66BB6A] transition-all duration-300"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSave}
                      className="w-full py-4 bg-linear-to-r from-[#66BB6A] to-[#4CAF50] text-white font-bold text-lg rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                    >
                      <Save size={22} />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-bold text-[#5D4037] mb-2">Security Settings</h2>
                      <p className="text-gray-600">Manage your password and account security</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-[#5D4037] mb-2">Current Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="text-gray-400" size={20} />
                          </div>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66BB6A] transition-all duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#66BB6A]"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#5D4037] mb-2">New Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="text-gray-400" size={20} />
                          </div>
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66BB6A] transition-all duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#66BB6A]"
                          >
                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-[#5D4037] mb-2">Confirm New Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="text-gray-400" size={20} />
                          </div>
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#66BB6A] transition-all duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#66BB6A]"
                          >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#E8F5E9] p-6 rounded-xl border-l-4 border-[#66BB6A]">
                      <h3 className="font-bold text-[#5D4037] mb-2">Password Requirements</h3>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="text-[#66BB6A]" size={16} />
                          <span>At least 8 characters long</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="text-[#66BB6A]" size={16} />
                          <span>Contains uppercase and lowercase letters</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="text-[#66BB6A]" size={16} />
                          <span>Contains at least one number</span>
                        </li>
                      </ul>
                    </div>

                    <button
                      onClick={handleSave}
                      className="w-full py-4 bg-linear-to-r from-[#66BB6A] to-[#4CAF50] text-white font-bold text-lg rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                    >
                      <Save size={22} />
                      <span>Update Password</span>
                    </button>

                    <div className="pt-8 border-t">
                      <h3 className="text-xl font-bold text-[#5D4037] mb-4">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between p-6 bg-linear-to-r from-[#E8F5E9] to-white rounded-xl border border-gray-100">
                        <div>
                          <h4 className="font-semibold text-[#5D4037] mb-1">Enable 2FA</h4>
                          <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <button className="px-6 py-2 bg-linear-to-r from-[#66BB6A] to-[#4CAF50] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300">
                          Enable
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-3xl font-bold text-[#5D4037] mb-2">Notification Preferences</h2>
                      <p className="text-gray-600">Choose how you want to receive updates</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                        { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive SMS alerts for pickups' },
                        { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser and mobile push notifications' },
                        { key: 'pickupReminders', label: 'Pickup Reminders', desc: 'Get reminded before scheduled pickup' },
                        { key: 'promotionalEmails', label: 'Promotional Emails', desc: 'Receive offers and promotional content' },
                        { key: 'weeklyReport', label: 'Weekly Report', desc: 'Get weekly summary of your activities' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-6 bg-linear-to-r from-white to-[#E8F5E9] rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300">
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#5D4037] mb-1">{item.label}</h4>
                            <p className="text-sm text-gray-600">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => handleNotificationToggle(item.key)}
                            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
                              notifications[item.key] ? 'bg-linear-to-r from-[#66BB6A] to-[#4CAF50]' : 'bg-gray-300'
                            }`}
                          >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                              notifications[item.key] ? 'translate-x-8' : 'translate-x-1'
                            }`}></div>
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleSave}
                      className="w-full py-4 bg-linear-to-r from-[#66BB6A] to-[#4CAF50] text-white font-bold text-lg rounded-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                    >
                      <Save size={22} />
                      <span>Save Preferences</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-blob {
          animation: blob 7s ease-in-out infinite;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default KabadBechoSettings;