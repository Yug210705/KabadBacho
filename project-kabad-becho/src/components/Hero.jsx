import React from 'react';
import { Truck, Recycle, ShieldCheck, Clock, Phone } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-20 overflow-hidden">

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#66BB6A]/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-[#81C784]/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-[#66BB6A]/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8 text-center lg:text-left">

            <div className="inline-flex items-center space-x-2 bg-[#E8F5E9] px-4 py-2 rounded-full animate-fadeInUp">
              <div className="w-2 h-2 bg-[#66BB6A] rounded-full animate-pulse"></div>
              <span className="text-[#5D4037] font-semibold text-sm">
                India's Trusted Scrap Pickup Service
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight animate-fadeInUp animation-delay-200">
              <span className="text-[#66BB6A]">Kabad Becho</span><br />
              <span className="text-[#5D4037]">Shaan Se,</span><br />
              <span className="text-[#5D4037]">Aaram Se</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-fadeInUp animation-delay-400">
              Transform your waste into wealth! Sell your scrap materials at the
              <span className="font-semibold text-[#66BB6A]"> best prices </span>
              with hassle-free
              <span className="font-semibold text-[#66BB6A]"> doorstep pickup</span>.
            </p>

            {/* Feature Cards moved here */}
            <div className="grid grid-cols-2 gap-4 mt-8 animate-fadeInUp animation-delay-600">
              {[
                { icon: <Recycle />, title: 'Eco-Friendly', desc: 'Go Green' },
                { icon: <Truck />, title: 'Free Pickup', desc: 'Doorstep' },
                { icon: <ShieldCheck />, title: 'Best Rates', desc: 'Guaranteed' },
                { icon: <Clock />, title: 'Quick Service', desc: 'Same Day' }
              ].map((f, i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-[#E8F5E9] rounded-xl text-[#66BB6A]">
                      {React.cloneElement(f.icon, { size: 20 })}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#5D4037] text-sm sm:text-base">{f.title}</h3>
                      <p className="text-xs text-gray-600">{f.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>


          </div>

          {/* Right Content */}
          <div className="relative animate-fadeInRight">
            <img
              src="step3.svg"
              alt="Kabad Becho"
              className="w-full max-w-lg mx-auto drop-shadow-2xl"
            />


          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
