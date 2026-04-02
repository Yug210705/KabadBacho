import React, { useState, useEffect, useRef } from 'react';
import {
  Recycle,
  Users,
  TrendingUp,
  Award,
  Target,
  Heart,
  Leaf,
  ShieldCheck,
  Globe,
  Smartphone,
  Truck,
  Scale,
  IndianRupee,
} from 'lucide-react';

/* ===================== STAT CARD COMPONENT ===================== */
const StatCard = ({ stat }) => {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          let start = 0;
          const end = stat.number;
          const duration = 1500;
          const increment = end / (duration / 16);

          const counter = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(counter);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);

          setHasAnimated(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasAnimated, stat.number]);

  return (
    <div ref={ref} className="group relative h-full">
      {/* Glow */}
      <div
        className="absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-10 transition-all duration-500 rounded-2xl blur-xl"
        style={{ background: 'linear-gradient(to bottom right, #66BB6A, #4CAF50)' }}
      ></div>

      {/* Card */}
      <div className="relative bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 h-full flex flex-col">
        
        {/* Number */}
        <div
          className={`inline-flex px-4 py-2 rounded-xl bg-linear-to-br ${stat.color} text-white text-2xl font-bold mb-2 self-start`}
        >
          {count}{stat.suffix}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[#5D4037] mb-1">
          {stat.title}
        </h3>

        {/* Paragraph (NO TOP GAP) */}
        <p className="text-sm text-gray-600 leading-relaxed">
          {stat.desc}
        </p>

        {/* Bottom spacing */}
        <div className="mt-4"></div>
      </div>
    </div>
  );
};


/* ===================== MAIN COMPONENT ===================== */
const KabadBechoAbout = () => {
  return (
    <div className="bg-white">

      {/* ================= ABOUT INTRO ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* LEFT: Waste Image Grid */}
            <div className="grid grid-cols-2 gap-4">
              {['plastic.webp', 'ewas.jpeg', 'paper.jpeg', 'metal.jpeg'].map(
                (img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="Waste"
                    className="h-48 w-full object-cover rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300"
                  />
                )
              )}
            </div>

            {/* RIGHT: About Content */}
            <div className="space-y-10">
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold text-[#5D4037] mb-4">
                  About <span className="text-[#66BB6A]">Kabad Becho</span>
                </h1>
                <p className="text-lg text-gray-700 leading-relaxed">
                  <strong>Kabad Becho</strong> is transforming the way India handles
                  waste. We make scrap selling simple, transparent, and rewarding
                  by connecting households and businesses directly with verified
                  recyclers. Our goal is to reduce landfill waste while creating
                  economic value from everyday scrap.
                </p>
              </div>

              {/* STAT CARDS */}
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  {
                    number: 5000,
                    suffix: '+',
                    title: 'Happy Customers',
                    desc: 'Trusted by households and businesses across cities.',
                    color: 'from-[#66BB6A] to-[#4CAF50]',
                  },
                  {
                    number: 100,
                    suffix: '+',
                    title: 'Tons Recycled',
                    desc: 'Plastic, paper, metal, and e-waste recycled responsibly.',
                    color: 'from-[#81C784] to-[#66BB6A]',
                  },
                  {
                    number: 2500,
                    suffix: '+',
                    title: 'Trees Saved',
                    desc: 'Deforestation reduced through paper recycling.',
                    color: 'from-[#4CAF50] to-[#2E7D32]',
                  },
                ].map((stat, idx) => (
                  <StatCard key={idx} stat={stat} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>



      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image/Logo */}
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-[#66BB6A]/20 to-[#81C784]/20 rounded-3xl blur-2xl"></div>
              <div className="relative bg-linear-to-br from-[#E8F5E9] to-white p-8 rounded-3xl shadow-2xl">
                <img 
                  src="KabadBecho2.jpg" 
                  alt="Kabad Becho Mission" 
                  className="w-full max-w-md mx-auto "
                />
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#66BB6A]">
                    <div className="text-3xl font-bold text-[#66BB6A] mb-1">24/7</div>
                    <div className="text-sm text-gray-600 font-medium">Available</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#66BB6A]">
                    <div className="text-3xl font-bold text-[#66BB6A] mb-1">100%</div>
                    <div className="text-sm text-gray-600 font-medium">Eco-Friendly</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Content */}
            <div className="space-y-8">
              {/* Our Mission */}
              <div className="group">
                <div className="flex items-start space-x-4">
                  <div className="shrink-0 w-16 h-16 bg-linear-to-br from-[#66BB6A] to-[#4CAF50] rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Target size={32} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-[#5D4037] mb-4">Our Mission</h2>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      To revolutionize waste management in India by making recycling accessible, profitable, and effortless for every household and business. We're committed to creating a sustainable future where nothing goes to waste.
                    </p>
                  </div>
                </div>
              </div>

              {/* Our Vision */}
              <div className="group">
                <div className="flex items-start space-x-4">
                  <div className="shrink-0 w-16 h-16 bg-linear-to-br from-[#81C784] to-[#66BB6A] rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Heart size={32} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-[#5D4037] mb-4">Our Vision</h2>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      To become India's most trusted scrap collection platform, building a circular economy where every piece of waste is recognized as a valuable resource. Together, we're creating cleaner cities and greener tomorrow.
                    </p>
                  </div>
                </div>
              </div>

              {/* Values */}
              <div className="bg-linear-to-br from-[#E8F5E9] to-white p-6 rounded-2xl border-2 border-[#66BB6A]/20">
                <h3 className="text-xl font-bold text-[#5D4037] mb-4">Core Values</h3>
                <div className="grid grid-cols-2 gap-4">
                  {['Transparency', 'Sustainability', 'Reliability', 'Innovation'].map((value, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-[#66BB6A] rounded-full"></div>
                      <span className="text-gray-700 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-linear-to-b from-white to-[#E8F5E9]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-4xl sm:text-5xl font-bold text-[#5D4037] mb-4">
        How It <span className="text-[#66BB6A]">Works</span>
      </h2>
      <p className="text-xl text-gray-700 max-w-2xl mx-auto">
        Simple, transparent, and efficient process to sell your scrap
      </p>
    </div>

    <div className="grid md:grid-cols-4 gap-8">
      {[
        {
          step: '01',
          icon: <Smartphone size={48} className="text-[#66BB6A]" />,
          title: 'Book Online',
          desc: 'Schedule pickup via call, WhatsApp, or our app',
        },
        {
          step: '02',
          icon: <Truck size={48} className="text-[#66BB6A]" />,
          title: 'Free Pickup',
          desc: 'We collect from your doorstep at your convenience',
        },
        {
          step: '03',
          icon: <Scale size={48} className="text-[#66BB6A]" />,
          title: 'Fair Weighing',
          desc: 'Transparent weighing with digital scales',
        },
        {
          step: '04',
          icon: <IndianRupee size={48} className="text-[#66BB6A]" />,
          title: 'Instant Payment',
          desc: 'Get paid immediately via cash or online transfer',
        },
      ].map((item, idx) => (
        <div key={idx} className="relative group">
          {/* Connecting Line */}
          {idx < 3 && (
            <div className="hidden md:block absolute top-16 left-full w-full h-1 bg-linear-to-r from-[#66BB6A] to-[#81C784] -z-10"></div>
          )}

          <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-2 border-transparent hover:border-[#66BB6A] relative">
            {/* Step Number */}
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-linear-to-br from-[#66BB6A] to-[#4CAF50] rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              {item.step}
            </div>

            <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
              {item.icon}
            </div>

            <h3 className="text-xl font-bold text-[#5D4037] mb-3">
              {item.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {item.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#5D4037] mb-4">
              Why Choose <span className="text-[#66BB6A]">Us</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Experience the difference with India's most reliable scrap collection service
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
  {[
    { icon: <Award size={32} />, title: 'Best Rates', desc: 'Competitive pricing guaranteed with transparent rate cards', gradient: 'from-[#66BB6A] to-[#4CAF50]' },
    { icon: <ShieldCheck size={32} />, title: 'Verified Service', desc: 'Licensed and insured professionals you can trust', gradient: 'from-[#81C784] to-[#66BB6A]' },
    { icon: <Truck size={32} />, title: 'Free Pickup', desc: 'No hidden charges - completely free doorstep collection', gradient: 'from-[#4CAF50] to-[#2E7D32]' },
    { icon: <Globe size={32} />, title: 'Eco-Friendly', desc: 'Contributing to a cleaner, greener environment', gradient: 'from-[#66BB6A] to-[#81C784]' },
    { icon: <Users size={32} />, title: 'Expert Team', desc: 'Trained professionals with years of experience', gradient: 'from-[#2E7D32] to-[#4CAF50]' },
    { icon: <Recycle size={32} />, title: 'Wide Coverage', desc: 'Accepting all types of recyclable materials', gradient: 'from-[#81C784] to-[#4CAF50]' }
  ].map((feature, idx) => (
    <div key={idx} className="group relative h-full">
      <div className="absolute inset-0 bg-linear-to-br from-[#66BB6A]/5 to-transparent rounded-2xl transform scale-0 group-hover:scale-100 transition-transform duration-500"></div>

      <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl
                      transition-all duration-500 border border-gray-100 group-hover:border-[#66BB6A]
                      h-full">
        
        <div className={`inline-flex p-4 rounded-xl bg-linear-to-br ${feature.gradient} text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
          {feature.icon}
        </div>

        <h3 className="text-xl font-bold text-[#5D4037] mb-3">
          {feature.title}
        </h3>

        <p className="text-gray-600 leading-relaxed">
          {feature.desc}
        </p>
      </div>
    </div>
  ))}
</div>

        </div>
      </section>

      

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

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

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-blob {
          animation: blob 7s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default KabadBechoAbout;