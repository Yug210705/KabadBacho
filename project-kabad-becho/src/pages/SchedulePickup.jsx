import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Truck, Calendar, Package, CheckCircle, ArrowLeft, Upload } from 'lucide-react';
import Footer from '../components/Footer.jsx';

const SchedulePickup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const serviceNameParam = searchParams.get('serviceName');

  // Also check location.state for backward compatibility or if passed that way
  const preSelectedService = serviceNameParam || location.state?.serviceName;

  const [scrapType, setScrapType] = useState('Metal Scrap');

  useEffect(() => {
    if (preSelectedService) {
      setScrapType(preSelectedService);
    }
  }, [preSelectedService]);


  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative pt-8 pb-16 overflow-hidden bg-linear-to-br from-[#F1F8E9] via-white to-[#E8F5E9]">

        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#66BB6A]/10 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-[#81C784]/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-[#66BB6A]/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          {/* Back Button */}
          <div className="absolute left-4 top-0 sm:left-8">
            {/* Positioning back button absolutely to not interfere with centering or adjusting flow */}
            <button
              onClick={() => navigate('/dashboard/UserService')}
              className="text-[#5D4037] hover:text-[#66BB6A] transition-colors group mt-4 inline-flex items-center"
            >
              <ArrowLeft size={36} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Use spacer to clear absolute button if needed, but centering should be fine. 
              Actually BookPickup doesn't have a back button in Hero. 
              SchedulePickup has one. I will keep it but maybe position it better or just keep flow.
              Let's stick to the structure but change classes.
          */}

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-gray-100 animate-fadeIn mx-auto">
            <Truck className="text-[#66BB6A]" size={18} />
            <span className="text-sm font-semibold text-[#5D4037]">DOORSTEP COLLECTION</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#5D4037] tracking-tight animate-fadeIn animation-delay-200">
            Book Your <span className="text-[#66BB6A]">Scrap Pickup</span>
            <br />
            <span className="text-[#66BB6A]">Shaan Se, Aaram Se</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed animate-fadeIn animation-delay-400">
            Fast, reliable, and eco-friendly doorstep scrap collection service.
            Get the best prices with instant payment.
          </p>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-2xl border-2 border-gray-200">
            <h2 className="text-3xl md:text-4xl font-bold text-[#5D4037] mb-8 text-center">
              Fill in Your Details
            </h2>

            <form className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-[#5D4037] font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-[#66BB6A] focus:outline-none transition-all"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[#5D4037] font-semibold mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-[#66BB6A] focus:outline-none transition-all"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-[#5D4037] font-semibold mb-2">Pickup Address</label>
                <textarea
                  rows="3"
                  placeholder="Enter complete address with landmarks"
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-[#66BB6A] focus:outline-none transition-all resize-none"
                ></textarea>
              </div>

              {/* Date & Time */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[#5D4037] font-semibold mb-2">Pickup Date</label>
                  <input
                    type="date"
                    className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-[#66BB6A] focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[#5D4037] font-semibold mb-2">Preferred Time</label>
                  <select className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-[#66BB6A] focus:outline-none transition-all">
                    <option>Morning (9 AM - 12 PM)</option>
                    <option>Afternoon (12 PM - 3 PM)</option>
                    <option>Evening (3 PM - 6 PM)</option>
                  </select>
                </div>
              </div>

              {/* Scrap Type */}
              <div>
                <label className="block text-[#5D4037] font-semibold mb-2">Scrap Type</label>
                {preSelectedService ? (
                  <input
                    type="text"
                    value={scrapType}
                    readOnly
                    className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed focus:outline-none"
                  />
                ) : (
                  <select
                    value={scrapType}
                    onChange={(e) => setScrapType(e.target.value)}
                    className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-[#66BB6A] focus:outline-none transition-all"
                  >
                    <option>Metal Scrap</option>
                    <option>Plastic Scrap</option>
                    <option>E-Waste</option>
                    <option>Paper Scrap</option>
                    <option>Glass Scrap</option>
                    <option>Mixed Scrap</option>
                  </select>
                )}
              </div>

              {/* Estimated Weight - Optional */}
              <div>
                <label className="block text-[#5D4037] font-semibold mb-2">Estimated Weight (kg) <span className="text-gray-400 font-normal text-sm">(Optional)</span></label>
                <input
                  type="number"
                  placeholder="Approximate weight in kg"
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-[#66BB6A] focus:outline-none transition-all"
                />
              </div>

              {/* Upload Photo - Optional */}
              <div>
                <label className="block text-[#5D4037] font-semibold mb-2">Upload Photo <span className="text-gray-400 font-normal text-sm">(Optional)</span></label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-[#F1F8E9] transition-all p-8 flex flex-col items-center justify-center cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <Upload size={24} className="text-[#66BB6A]" />
                  </div>
                  <p className="font-semibold text-[#5D4037] text-sm">Click to upload photo</p>
                  <p className="text-xs text-gray-400 mt-1">Max 5MB (JPG, PNG)</p>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-[#5D4037] font-semibold mb-2">Additional Notes (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="Any special instructions or requirements"
                  className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-[#66BB6A] focus:outline-none transition-all resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-5 bg-[#66BB6A] text-white font-bold text-xl rounded-xl hover:bg-[#4CAF50] transition-all duration-300 shadow-xl flex items-center justify-center space-x-3 mt-8"
              >
                <Truck size={24} />
                <span>Confirm Pickup</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      

      {/* Footer */}
      <Footer />

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 10px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default SchedulePickup;
