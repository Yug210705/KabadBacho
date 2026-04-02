import React from "react";
import {
  Phone,
  Mail,
  MapPin,
  Send,
  Users
} from "lucide-react";
import KabadBechoFooter from "../components/Footer";

const KabadBechoContact = () => {
  return (
    <div className="bg-white pt-20">
      {/* Header */}
      <section className="py-20 bg-linear-to-b from-white to-[#E8F5E9]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white px-5 py-2 rounded-full shadow mb-6 animate-fadeIn">
            <Users className="text-[#66BB6A]" size={20} />
            <span className="font-semibold text-[#5D4037]">
              Get In Touch
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-[#5D4037] mb-4">
            Contact <span className="text-[#66BB6A]">Kabad Becho</span>
          </h2>

          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Have questions or want to schedule a scrap pickup?  
            We’d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#E8F5E9] rounded-xl text-[#66BB6A]">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#5D4037]">Phone</h4>
                    <p className="text-gray-600">+91 98765 43210</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#E8F5E9] rounded-xl text-[#66BB6A]">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#5D4037]">Email</h4>
                    <p className="text-gray-600">support@kabadbecho.com</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#E8F5E9] rounded-xl text-[#66BB6A]">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#5D4037]">Address</h4>
                    <p className="text-gray-600">
                      Bhopal, Madhya Pradesh, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-3xl shadow-xl">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#5D4037] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66BB6A]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#5D4037] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66BB6A]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#5D4037] mb-2">
                    Message
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Write your message..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#66BB6A]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-linear-to-r from-[#66BB6A] to-[#4CAF50] text-white font-bold rounded-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Send Message
                  <Send size={20} />
                </button>
              </form>
            </div>

          </div>
        </div>
      </section>
      {/*Footer */}
      <KabadBechoFooter/>
      {/* Animation */}
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

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
      
    </div>
    
  );
};

export default KabadBechoContact;
