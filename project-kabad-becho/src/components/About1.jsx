import React, { useState } from 'react';
import { 
  Recycle, 
  Target, 
  Users, 
  TrendingUp,
  Building2,
  Award,
  CheckCircle,
  MapPin,
  Calendar,
  Package,
  Leaf,
  Factory,
  RefreshCw,
  ArrowRight,
  Truck,
  Scale,
  Boxes,
  Zap,
  Shield,
  Globe
} from 'lucide-react';

const KabadBechoAboutUs = () => {
  const [activeProject, setActiveProject] = useState(0);

  const projects = [
    {
      title: 'Green Mumbai Initiative',
      location: 'Mumbai, Maharashtra',
      year: '2023',
      icon: <Building2 size={32} />,
      description: 'Large-scale recycling program covering 50+ residential societies',
      stats: { collected: '200 Tons', beneficiaries: '10,000+', trees: '5,000+' },
      gradient: 'from-[#66BB6A] to-[#4CAF50]'
    },
    {
      title: 'E-Waste Drive Delhi',
      location: 'Delhi NCR',
      year: '2023',
      icon: <Zap size={32} />,
      description: 'Successful e-waste collection campaign in schools and offices',
      stats: { collected: '50 Tons', beneficiaries: '5,000+', trees: '2,500+' },
      gradient: 'from-[#81C784] to-[#66BB6A]'
    },
    {
      title: 'Plastic-Free Bangalore',
      location: 'Bangalore, Karnataka',
      year: '2024',
      icon: <Recycle size={32} />,
      description: 'Community-driven plastic waste collection and recycling',
      stats: { collected: '150 Tons', beneficiaries: '8,000+', trees: '4,000+' },
      gradient: 'from-[#4CAF50] to-[#2E7D32]'
    },
    {
      title: 'Corporate Partnership Program',
      location: 'Pan India',
      year: '2024',
      icon: <Building2 size={32} />,
      description: 'Collaboration with 100+ companies for sustainable waste management',
      stats: { collected: '500 Tons', beneficiaries: '25,000+', trees: '12,000+' },
      gradient: 'from-[#66BB6A] to-[#81C784]'
    }
  ];

  const recyclingSteps = [
    {
      step: '01',
      title: 'Collection',
      icon: <Truck size={40} />,
      description: 'Our team picks up scrap from your doorstep with free collection service',
      details: ['Free doorstep pickup', 'Scheduled time slots', 'Professional handling', 'All materials accepted'],
      color: 'from-[#66BB6A] to-[#4CAF50]'
    },
    {
      step: '02',
      title: 'Segregation',
      icon: <Boxes size={40} />,
      description: 'Materials are carefully sorted by type and quality at our facility',
      details: ['Advanced sorting', 'Quality checking', 'Type classification', 'Contamination removal'],
      color: 'from-[#81C784] to-[#66BB6A]'
    },
    {
      step: '03',
      title: 'Processing',
      icon: <Factory size={40} />,
      description: 'Sorted materials undergo specialized processing and cleaning',
      details: ['Industrial cleaning', 'Size reduction', 'Quality enhancement', 'Safety protocols'],
      color: 'from-[#4CAF50] to-[#2E7D32]'
    },
    {
      step: '04',
      title: 'Recycling',
      icon: <RefreshCw size={40} />,
      description: 'Processed materials are converted into reusable raw materials',
      details: ['Eco-friendly methods', 'Energy efficient', 'Zero waste', 'Quality output'],
      color: 'from-[#2E7D32] to-[#4CAF50]'
    },
    {
      step: '05',
      title: 'Distribution',
      icon: <Globe size={40} />,
      description: 'Recycled materials are supplied to manufacturers for new products',
      details: ['Industry partnerships', 'Quality certified', 'Sustainable supply', 'Circular economy'],
      color: 'from-[#66BB6A] to-[#81C784]'
    }
  ];

  return (
    <div className="bg-white pt-24 lg:pt-32 scroll-smooth">
      {/* Hero Section */}
      <section className="relative py-20 bg-linear-to-br from-[#E8F5E9] to-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#66BB6A] rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#81C784] rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 animate-fadeIn">
            <div className="inline-flex items-center space-x-2 bg-white px-5 py-2 rounded-full shadow-md mb-6">
              <Users className="text-[#66BB6A]" size={20} />
              <span className="text-[#5D4037] font-semibold">About Us</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#5D4037] mb-6">
              Building a <span className="text-[#66BB6A]">Sustainable Future</span>
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            We are on a mission to revolutionize waste management across India by bridging 
            the gap between households and responsible recycling. Through innovative 
            technology and a dedicated network, we ensure your scrap is processed 
            ethically, reducing landfill waste and fostering a cleaner, greener 
            tomorrow for our communities.
          </p>
          </div>
        </div>
      </section>

     

      {/* Section 2: Projects Done */}
      <section className="py-20 bg-linear-to-b from-white to-[#E8F5E9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#5D4037] mb-4">
              Our <span className="text-[#66BB6A]">Projects</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Making a real impact across India through innovative recycling initiatives
            </p>
          </div>

          {/* Project Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {projects.map((project, idx) => (
              <button
                key={idx}
                onClick={() => setActiveProject(idx)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  activeProject === idx
                    ? `bg-linear-to-r ${project.gradient} text-white shadow-xl`
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                }`}
              >
                {project.title}
              </button>
            ))}
          </div>

          {/* Active Project Display */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className={`bg-linear-to-r ${projects[activeProject].gradient} p-8 sm:p-12 text-white`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    {projects[activeProject].icon}
                  </div>
                  <div>
                    <h3 className="text-3xl sm:text-4xl font-bold mb-2">
                      {projects[activeProject].title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-green-50">
                      <div className="flex items-center space-x-2">
                        <MapPin size={18} />
                        <span>{projects[activeProject].location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar size={18} />
                        <span>{projects[activeProject].year}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                  <Award className="text-white" size={24} />
                  <span className="font-bold text-lg">Featured Project</span>
                </div>
              </div>
            </div>

            <div className="p-8 sm:p-12">
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                {projects[activeProject].description}
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-linear-to-br from-[#E8F5E9] to-white p-6 rounded-xl border-l-4 border-[#66BB6A]">
                  <div className="flex items-center space-x-3 mb-2">
                    <Package className="text-[#66BB6A]" size={24} />
                    <span className="text-sm text-gray-600 font-medium">Total Collected</span>
                  </div>
                  <div className="text-3xl font-bold text-[#5D4037]">{projects[activeProject].stats.collected}</div>
                </div>
                <div className="bg-linear-to-br from-[#E8F5E9] to-white p-6 rounded-xl border-l-4 border-[#4CAF50]">
                  <div className="flex items-center space-x-3 mb-2">
                    <Users className="text-[#4CAF50]" size={24} />
                    <span className="text-sm text-gray-600 font-medium">Beneficiaries</span>
                  </div>
                  <div className="text-3xl font-bold text-[#5D4037]">{projects[activeProject].stats.beneficiaries}</div>
                </div>
                <div className="bg-linear-to-br from-[#E8F5E9] to-white p-6 rounded-xl border-l-4 border-[#2E7D32]">
                  <div className="flex items-center space-x-3 mb-2">
                    <Leaf className="text-[#2E7D32]" size={24} />
                    <span className="text-sm text-gray-600 font-medium">Trees Saved</span>
                  </div>
                  <div className="text-3xl font-bold text-[#5D4037]">{projects[activeProject].stats.trees}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                {['Eco-Friendly', 'Community Driven', 'Government Approved', 'Certified Process'].map((badge, idx) => (
                  <div key={idx} className="flex items-center space-x-2 bg-[#E8F5E9] px-4 py-2 rounded-full">
                    <CheckCircle className="text-[#66BB6A]" size={16} />
                    <span className="text-sm font-medium text-gray-700">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Impact Stats */}
          <div className="grid md:grid-cols-4 gap-6 mt-12">
            {[
              { value: '900+', label: 'Total Tons Recycled', icon: <TrendingUp size={24} /> },
              { value: '48,000+', label: 'People Reached', icon: <Users size={24} /> },
              { value: '23,500+', label: 'Trees Saved', icon: <Leaf size={24} /> },
              { value: '100+', label: 'Partner Organizations', icon: <Building2 size={24} /> }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                <div className="inline-flex p-3 bg-[#E8F5E9] rounded-xl text-[#66BB6A] mb-3">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-[#66BB6A] mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: How We Recycle */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#5D4037] mb-4">
              How We <span className="text-[#66BB6A]">Recycle</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Our end-to-end recycling process ensures maximum environmental impact
            </p>
          </div>

          <div className="space-y-8">
            {recyclingSteps.map((step, idx) => (
              <div key={idx} className="group">
                <div className={`bg-linear-to-r ${step.color} p-1 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500`}>
                  <div className="bg-white rounded-3xl p-8 sm:p-12">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                      {/* Left - Icon and Title */}
                      <div className={`${idx % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                        <div className="flex items-center space-x-6 mb-6">
                          <div className={`relative shrink-0 w-20 h-20 bg-linear-to-br ${step.color} rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                            {step.icon}
                            <div className="absolute -top-3 -right-3 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                              <span className="text-xl font-bold text-[#5D4037]">{step.step}</span>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold text-[#5D4037] mb-2">{step.title}</h3>
                            <p className="text-gray-600 text-lg">{step.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Right - Details */}
                      <div className={`${idx % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                        <div className="grid grid-cols-2 gap-4">
                          {step.details.map((detail, detailIdx) => (
                            <div key={detailIdx} className="flex items-center space-x-3 bg-linear-to-br from-[#E8F5E9] to-white p-4 rounded-xl hover:shadow-md transition-all duration-300">
                              <CheckCircle className="text-[#66BB6A] shrink-0" size={20} />
                              <span className="text-gray-700 font-medium text-sm">{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Connecting Arrow */}
                {idx < recyclingSteps.length - 1 && (
                  <div className="flex justify-center py-4">
                    <ArrowRight className="text-[#66BB6A] transform rotate-90" size={32} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Process Benefits */}
          <div className="mt-16 bg-linear-to-br from-[#66BB6A] to-[#4CAF50] rounded-3xl p-8 sm:p-12 text-white shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4">Why Our Process Matters</h3>
              <p className="text-xl text-green-50">
                Every step is designed to maximize recycling efficiency and minimize environmental impact
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: <Leaf size={28} />, title: 'Zero Waste', desc: 'Nothing goes to landfills' },
                { icon: <Shield size={28} />, title: 'Safe & Certified', desc: 'Government approved methods' },
                { icon: <RefreshCw size={28} />, title: 'Circular Economy', desc: 'Materials back in production' }
              ].map((benefit, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      {benefit.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{benefit.title}</h4>
                      <p className="text-green-50 text-sm">{benefit.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

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

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-fadeInLeft {
          animation: fadeInLeft 0.8s ease-out forwards;
        }

        .animate-fadeInRight {
          animation: fadeInRight 0.8s ease-out forwards;
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

export default KabadBechoAboutUs;