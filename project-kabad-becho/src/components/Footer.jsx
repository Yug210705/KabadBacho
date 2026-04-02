import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Clock,
  Send,
  Recycle,
  ChevronRight,
  Heart
} from 'lucide-react';

const KabadBechoFooter = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
  { name: 'About Us', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Contact Us', href: '/contact' }
];

const services = [
  { name: 'Metal Scrap',  },
  { name: 'Paper Scrap', },
  { name: 'E-Waste Scrap',  },
  { name: 'Plastic Scrap' },
  { name: 'Glass Scrap' }
];

 

  const socialLinks = [
    { icon: <Facebook size={20} />, name: 'Facebook', color: 'hover:bg-blue-600' },
    { icon: <Twitter size={20} />, name: 'Twitter', color: 'hover:bg-sky-500' },
    { icon: <Instagram size={20} />, name: 'Instagram', color: 'hover:bg-pink-600' },
    { icon: <Linkedin size={20} />, name: 'LinkedIn', color: 'hover:bg-blue-700' },
    { icon: <Youtube size={20} />, name: 'YouTube', color: 'hover:bg-red-600' }
  ];

  return (
    <footer className="bg-linear-to-br from-[#5D4037] via-[#4E342E] to-[#3E2723] text-white">
      {/* Newsletter Section */}
      

      {/* Main Footer Content */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="space-y-6">
              <div>
                <img 
                  src="KabadBecho2.jpg" 
                  alt="Kabad Becho" 
                  className="h-20 mb-4 "
                />
                <p className="text-amber-100 leading-relaxed">
                  Making recycling easy and rewarding. Join us in creating a cleaner, greener India.
                </p>
              </div>
              
              {/* Social Media */}
              <div>
                <h4 className="font-bold text-lg mb-4 text-[#66BB6A]">Follow Us</h4>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((social, idx) => (
                    <button
                      key={idx}
                      className={`w-10 h-10 bg-white/10 rounded-full flex items-center justify-center ${social.color} transition-all duration-300 transform hover:scale-110 hover:shadow-lg`}
                      aria-label={social.name}
                    >
                      {social.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
      <h4 className="font-bold text-lg mb-6 text-[#66BB6A] flex items-center">
        <Recycle size={20} className="mr-2" />
        Quick Links
      </h4>
      <ul className="space-y-3">
        {quickLinks.map((link, idx) => (
          <li key={idx}>
            <Link 
              to={link.href} 
              className="group flex items-center text-amber-100 hover:text-[#66BB6A] transition-colors duration-300 cursor-pointer"
            >
              <ChevronRight 
                size={16} 
                className="mr-2 group-hover:translate-x-1 transition-transform duration-300" 
              />
              {/* Use link.name here to display the text */}
              <span>{link.name}</span>
            </Link>
          </li>
          ))}
        </ul>
      </div>

            {/* Services */}
            <div>
    <h4 className="font-bold text-lg mb-6 text-[#66BB6A] flex items-center">
      <Send size={20} className="mr-2" />
      Our Services
    </h4>
    <ul className="space-y-3">
      {services.map((service, idx) => (
        <li key={idx}>
          <Link to={service.href} className="group flex items-center text-amber-100 hover:text-[#66BB6A] transition-all duration-300">
            <ChevronRight size={16} className="mr-2 group-hover:translate-x-1 transition-transform" />
            <span>{service.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-[#66BB6A]">Contact Us</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 group">
                  <div className="shrink-0 w-10 h-10 bg-[#66BB6A]/20 rounded-full flex items-center justify-center group-hover:bg-[#66BB6A] transition-colors duration-300">
                    <Phone size={18} className="text-[#66BB6A] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Call Us</p>
                    <a href="tel:+919876543210" className="text-amber-100 hover:text-[#66BB6A] transition-colors">
                      +91 98765 43210
                    </a>
                    <br />
                    <a href="tel:+919876543211" className="text-amber-100 hover:text-[#66BB6A] transition-colors">
                      +91 98765 43211
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3 group">
                  <div className="shrink-0 w-10 h-10 bg-[#66BB6A]/20 rounded-full flex items-center justify-center group-hover:bg-[#66BB6A] transition-colors duration-300">
                    <Mail size={18} className="text-[#66BB6A] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Email</p>
                    <a href="mailto:info@kabadbecho.com" className="text-amber-100 hover:text-[#66BB6A] transition-colors break-all">
                      info@kabadbecho.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3 group">
                  <div className="shrink-0 w-10 h-10 bg-[#66BB6A]/20 rounded-full flex items-center justify-center group-hover:bg-[#66BB6A] transition-colors duration-300">
                    <MapPin size={18} className="text-[#66BB6A] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Address</p>
                    <p className="text-amber-100 leading-relaxed">
                      123 Green Street, Eco City<br />
                      Mumbai, Maharashtra 400001
                    </p>
                  </div>
                </div>

                <br/>
              </div>
            </div>
          </div>

          

          {/* Trust Badges */}
          

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/10">
            <div className="text-center md:text-left">
              <p className="text-amber-100 text-sm">
                © {currentYear} <span className="font-semibold text-[#66BB6A]">Kabad Becho</span>. All rights reserved.
              </p>
              <p className="text-amber-200 text-xs mt-1 italic">Shaan Se, Aaram Se</p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <button className="text-amber-100 hover:text-[#66BB6A] transition-colors duration-300">
                Privacy Policy
              </button>
              <span className="text-amber-100/30">|</span>
              <button className="text-amber-100 hover:text-[#66BB6A] transition-colors duration-300">
                Terms & Conditions
              </button>
              <span className="text-amber-100/30">|</span>
              <button className="text-amber-100 hover:text-[#66BB6A] transition-colors duration-300">
                Refund Policy
              </button>
              <span className="text-amber-100/30">|</span>
              <button className="text-amber-100 hover:text-[#66BB6A] transition-colors duration-300">
                Sitemap
              </button>
            </div>
          </div>

          {/* Made with Love */}
          <div className="mt-6 text-center">
            <p className="text-amber-100/60 text-sm flex items-center justify-center gap-2">
              Made with <Heart size={14} className="text-red-400 animate-pulse" /> for a greener India
            </p>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-linear-to-br from-[#66BB6A] to-[#4CAF50] text-white rounded-full shadow-2xl hover:shadow-[#66BB6A]/50 transition-all duration-300 flex items-center justify-center z-50 hover:scale-110 group"
        aria-label="Scroll to top"
      >
        <ChevronRight size={24} className="transform -rotate-90 group-hover:-translate-y-1 transition-transform duration-300" />
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </footer>
  );
};

export default KabadBechoFooter;