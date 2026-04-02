import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Recycle, Box, Zap, FileText, Trees, ArrowRight, CheckCircle, Clock,
  DollarSign, Truck, Phone, Shield, TrendingUp, Award, Leaf, Globe,
  Scale, HelpCircle, ChevronDown, Monitor, Newspaper, HardHat, GlassWater, Layers
} from 'lucide-react';

const KabadBechoServices = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState(0);
  const [activeFaq, setActiveFaq] = useState(null);

 

  const services = [
    {
      id: 0,
      title: 'Metal Scrap',
      icon: <HardHat size={24} />,
      mainIcon: <Box size={40} />,
      gradient: 'from-[#66BB6A] to-[#4CAF50]',
      description: 'Industrial and domestic metal waste management with precision weighing and competitive market pricing.',
      subCategories: [
        { name: 'Heavy Iron', price: '₹38/kg' },
        { name: 'Copper Wire', price: '₹450/kg' },
        { name: 'Aluminum Sheets', price: '₹140/kg' },
        { name: 'Brass/Pital', price: '₹320/kg' }
      ],
      benefits: ['Instant Spot Cash', 'Digital Weighing', 'Industrial Pickups', 'Bulk Contract Options'],
      stats: { recycled: '1.2k Tons', saved: '45% Energy' }
    },
    {
      id: 1,
      title: 'Plastic Scrap',
      icon: <Recycle size={24} />,
      mainIcon: <Recycle size={40} />,
      gradient: 'from-[#81C784] to-[#66BB6A]',
      description: 'Sustainable plastic disposal for PET, HDPE, and PVC materials to prevent landfill pollution.',
      subCategories: [
        { name: 'PET Bottles', price: '₹15/kg' },
        { name: 'Hard Plastic', price: '₹12/kg' },
        { name: 'Polythene (Mix)', price: '₹8/kg' },
        { name: 'Plastic Jars', price: '₹10/kg' }
      ],
      benefits: ['Zero-Waste Policy', 'Eco-Certification', 'Segregation Support', 'Doorstep Service'],
      stats: { recycled: '800 Tons', saved: '12k Barrels Oil' }
    },
    {
      id: 2,
      title: 'E-Waste',
      icon: <Monitor size={24} />,
      mainIcon: <Zap size={40} />,
      gradient: 'from-[#4CAF50] to-[#2E7D32]',
      description: 'Certified destruction and recycling of electronic components ensuring data security and toxic waste safety.',
      subCategories: [
        { name: 'Laptops/PCs', price: '₹300/unit' },
        { name: 'Mobile Phones', price: '₹50/unit' },
        { name: 'Circuit Boards', price: '₹120/kg' },
        { name: 'Lead Batteries', price: '₹85/kg' }
      ],
      benefits: ['Data Destruction', 'Toxic Filter Tech', 'Green Certificate', 'Secure Logistics'],
      stats: { recycled: '450 Tons', saved: '98% Components' }
    },
    {
      id: 3,
      title: 'Paper Scrap',
      icon: <Newspaper size={24} />,
      mainIcon: <FileText size={40} />,
      gradient: 'from-[#66BB6A] to-[#81C784]',
      description: 'High-volume paper recycling solutions for offices, schools, and households.',
      subCategories: [
        { name: 'Newspaper', price: '₹18/kg' },
        { name: 'Office Records', price: '₹15/kg' },
        { name: 'Cardboard/Carton', price: '₹12/kg' },
        { name: 'Waste Books', price: '₹14/kg' }
      ],
      benefits: ['Tree-Save Credits', 'Confidential Shredding', 'Monthly Pickups', 'Free Sacks Provided'],
      stats: { recycled: '2.5k Tons', saved: '42k Trees' }
    },
    {
      id: 4,
      title: 'Glass Scrap',
      icon: <GlassWater size={24} />,
      mainIcon: <Layers size={40} />,
      gradient: 'from-[#A5D6A7] to-[#66BB6A]',
      description: 'Safe and eco-friendly recycling of clear, colored, and industrial glass to reduce landfill waste.',
      subCategories: [
        { name: 'Clear Glass Bottles', price: '₹6/kg' },
        { name: 'Colored Glass', price: '₹5/kg' },
        { name: 'Window Glass', price: '₹4/kg' },
        { name: 'Glass Jars', price: '₹5/kg' }
      ],
      benefits: [
        '100% Recyclable',
        'Safe Handling',
        'Bulk Collection',
        'Eco Disposal Certificate'
      ],
      stats: { recycled: '600 Tons', saved: '30% Raw Material' }
    }
  ];

  const currentService = services[selectedService];

  return (
    <div className="bg-white pt-24 lg:pt-32 scroll-smooth">
      {/* Hero Section */}
      <section className="relative py-24 bg-linear-to-br from-[#F1F8E9] to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <span className="inline-flex items-center px-4 py-1.5 mb-6 text-sm font-bold tracking-wider text-[#4CAF50] uppercase bg-[#E8F5E9] rounded-full">
              <Shield size={16} className="mr-2" /> Full Spectrum Recycling
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-[#5D4037] mb-8 tracking-tight">
              Recycling <span className="text-[#66BB6A]">Simplified</span>
            </h1>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
              Professional scrap collection services with high-precision digital weighing
              and real-time market-linked pricing.
            </p>
          </div>
        </div>
      </section>

      {/* Main Service Navigation - Removed sticky class */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center space-x-2 lg:space-x-8 py-8 overflow-x-auto no-scrollbar">
            {services.map((service, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedService(idx)}
                className={`flex items-center space-x-3 px-8 py-4 rounded-full transition-all duration-500 whitespace-nowrap ${selectedService === idx
                  ? `bg-linear-to-r ${service.gradient} text-white shadow-xl scale-110`
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#66BB6A]'
                  }`}
              >
                {service.icon}
                <span className="font-bold">{service.title}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Service Details Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-16">

            {/* Left Column */}
            <div className="lg:col-span-7 space-y-12">
              <div>
                <h2 className="text-4xl font-black text-[#5D4037] mb-6 flex items-center">
                  <span className="mr-4 p-3 bg-[#E8F5E9] rounded-2xl text-[#66BB6A]">
                    {currentService.mainIcon}
                  </span>
                  {currentService.title} Insights
                </h2>

                <p className="text-xl text-gray-600 leading-relaxed mb-10">
                  {currentService.description}
                </p>

                <h3 className="text-xl font-bold text-[#5D4037] mb-6 flex items-center">
                  <Scale className="mr-2 text-[#66BB6A]" size={20} />
                  Current Market Rates
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentService.subCategories.map((sub, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#66BB6A] transition-colors"
                    >
                      <span className="font-semibold text-gray-700">{sub.name}</span>
                      <span className="text-[#66BB6A] font-black">{sub.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Environmental Impact Card */}
              <div className="bg-[#5D4037] text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <h3 className="text-2xl font-bold mb-8 flex items-center">
                  <Globe className="mr-3 text-[#81C784]" />
                  Global Impact
                </h3>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-4xl font-black text-[#81C784] mb-2">
                      {currentService.stats.recycled}
                    </div>
                    <div className="text-gray-300 text-sm uppercase tracking-widest font-bold">
                      Processed Yearly
                    </div>
                  </div>

                  <div>
                    <div className="text-4xl font-black text-[#81C784] mb-2">
                      {currentService.stats.saved}
                    </div>
                    <div className="text-gray-300 text-sm uppercase tracking-widest font-bold">
                      Conservation Rate
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Benefits & Booking */}
            <div className="lg:col-span-5">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
                <h3 className="text-2xl font-bold text-[#5D4037] mb-8">
                  Service Privileges
                </h3>

                <ul className="space-y-5 mb-10">
                  {currentService.benefits.map((benefit, i) => (
                    <li
                      key={i}
                      className="flex items-center text-gray-700 font-medium bg-[#F1F8E9] p-4 rounded-xl"
                    >
                      <CheckCircle
                        className="text-[#66BB6A] mr-4 shrink-0"
                        size={24}
                      />
                      {benefit}
                    </li>
                  ))}
                </ul>

                
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* FAQ Section */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <HelpCircle className="mx-auto text-[#66BB6A] mb-4" size={48} />
            <h2 className="text-4xl font-black text-[#5D4037]">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "How do you weigh the scrap?", a: "We use ISO-certified digital scales which are calibrated weekly. You can witness the live weighing process on-site." },
              { q: "Is there a minimum pickup weight?", a: "For residential areas, we recommend a minimum of 20kg. For industrial e-waste or metal, we have no minimum limit." },
              { q: "When do I get paid?", a: "Payment is processed instantly via UPI, Bank Transfer, or Cash immediately after the weighing is completed." }
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-6 text-left flex justify-between items-center"
                >
                  <span className="font-bold text-[#5D4037]">{faq.q}</span>
                  <ChevronDown className={`transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === i && <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-50">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Section: Premium Re-styled CTA */}


      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default KabadBechoServices;