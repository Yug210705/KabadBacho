import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Clock, Upload, Phone, CheckCircle, Sparkles, ArrowRight, Truck, X } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const BookPickup = ({ isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    weight: '',
    scrapType: [],
    date: '',
    time: '',
    notes: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (location.state && location.state.scrapType) {
      setFormData(prev => ({ 
        ...prev, 
        scrapType: Array.isArray(location.state.scrapType) 
          ? location.state.scrapType 
          : [location.state.scrapType] 
      }));
    }
  }, [location]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const scrapTypes = [
    { id: 'paper', label: 'Paper', icon: '📄', desc: 'Newspapers, Cardboard' },
    { id: 'plastic', label: 'Plastic', icon: '🥤', desc: 'Bottles, Containers' },
    { id: 'metal', label: 'Metal', icon: '🔩', desc: 'Iron, Copper, Aluminum' },
    { id: 'wood', label: 'Wood', icon: '🪵', desc: 'Furniture, Crates' },
    { id: 'E-Waste', label: 'E-Waste', icon: '💻', desc: 'Electronics, Gadgets' },
    { id: 'mixed', label: 'Mixed', icon: '🗃️', desc: 'Other / Combined' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleScrapType = (id) => {
    setFormData(prev => {
      const isSelected = prev.scrapType.includes(id);
      return {
        ...prev,
        scrapType: isSelected
          ? prev.scrapType.filter(item => item !== id)
          : [...prev.scrapType, id]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
       alert("Please log in to book a pickup!");
       return;
    }
    
    if (formData.scrapType.length === 0) {
      alert("Please select at least one scrap category.");
      return;
    }

    setIsSubmitting(true);
    try {
       await addDoc(collection(db, "orders"), {
          ...formData,
          userId: user.uid,
          userName: formData.name || user.displayName || 'Anonymous',
          status: 'pending',
          requestedAt: serverTimestamp(),
          scrapType: formData.scrapType.join(', ')
       });
       alert("Pickup scheduled successfully! You can track it in your dashboard.");
       onClose();
    } catch (err) {
       console.error("Booking failed:", err);
       alert("Failed to book pickup. Please try again later.");
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      
      {/* Background Blur Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md animate-fadeIn" 
        onClick={onClose} 
      />

      {/* Popup Container - Reduced max-w to 4xl to keep it elegant when full-width */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-[#F9FAFB] rounded-[2.5rem] shadow-2xl overflow-y-auto animate-zoomIn">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-lg hover:text-red-500 transition-colors z-50"
        >
          <X size={24} />
        </button>

        {/* Header Section */}
        <section className="pt-16 pb-8 bg-linear-to-b from-white to-[#E8F5E9]/50 text-center">
          <div className="max-w-3xl mx-auto px-4 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white shadow-sm border border-gray-100 mx-auto">
              <Truck className="text-[#66BB6A]" size={16} />
              <span className="text-xs font-semibold text-[#5D4037]">DOORSTEP COLLECTION</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-[#5D4037]">
              Schedule Your <span className="text-[#66BB6A]">Pickup</span>
            </h1>
          </div>
        </section>

        <div className="px-6 md:px-12 pb-16">
          {/* Changed grid layout to 1 column so form fills the space */}
          <div className="max-w-4xl mx-auto">
            
            <div className="bg-white rounded-3xl border border-gray-100 p-6 md:p-10 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-10">
                
                {/* Section 1: Contact Details */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#5D4037] flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#66BB6A] text-white flex items-center justify-center text-xs font-bold">1</span>
                    Contact Details
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {['name', 'phone', 'email', 'weight'].map((field) => (
                      <div key={field} className="space-y-1">
                        <input
                          type={field === 'email' ? 'email' : field === 'weight' ? 'number' : 'text'}
                          name={field}
                          value={formData[field]}
                          onChange={handleInputChange}
                          placeholder={field === 'weight' ? "Est. Weight (kg)" : `Your ${field}`}
                          className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[#66BB6A] transition-all font-medium text-sm"
                          required={field !== 'weight'}
                        />
                      </div>
                    ))}
                    <textarea name="address" placeholder="Full Address" onChange={handleInputChange} rows="2" className="md:col-span-2 w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-[#66BB6A] text-sm" required />
                  </div>
                </div>

                {/* Section 2: Categories */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#5D4037] flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#66BB6A] text-white flex items-center justify-center text-xs font-bold">2</span>
                    Select Categories
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {scrapTypes.map((type) => {
                      const isSelected = formData.scrapType.includes(type.id);
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => toggleScrapType(type.id)}
                          className={`relative p-5 rounded-xl border-2 transition-all flex flex-col items-center text-center ${isSelected ? 'border-[#66BB6A] bg-[#F1F8E9]' : 'border-gray-100 bg-gray-50 hover:bg-white'}`}
                        >
                          <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${isSelected ? 'bg-[#66BB6A]' : 'bg-gray-200'}`}>
                            {isSelected && <CheckCircle size={12} className="text-white" />}
                          </div>
                          <span className="text-4xl mb-2">{type.icon}</span>
                          <span className="text-sm font-bold text-[#5D4037]">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Schedule */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-[#5D4037] flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#66BB6A] text-white flex items-center justify-center text-xs font-bold">3</span>
                    Schedule Pickup
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input type="date" name="date" onChange={handleInputChange} className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none" required />
                    <select name="time" onChange={handleInputChange} className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 outline-none" required>
                      <option value="">Time Slot</option>
                      <option value="morning">Morning (9-12)</option>
                      <option value="afternoon">Afternoon (12-4)</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full py-4 bg-[#66BB6A] text-white rounded-xl font-bold text-lg hover:bg-[#4CAF50] transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200">
                  Confirm Booking <ArrowRight size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-zoomIn { animation: zoomIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default BookPickup;