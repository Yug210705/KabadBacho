import React from 'react';
import {
  Users,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Award,
  Heart,
  Target,
  Truck
} from 'lucide-react';

const KabadBechoTeam = () => {
  const teamMembers = [
    {
      name: 'Rajesh Kumar',
      role: 'Founder & CEO',
      image: 'man1.jpeg',
      bio: 'Visionary leader with 15+ years in waste management',
      email: 'rajesh@kabadbecho.com',
      phone: '+91 98765 43210',
      expertise: 'Business Strategy'
    },
    {
      name: 'Priya Sharma',
      role: 'Operations Head',
      image: 'person2.webp',
      bio: 'Expert in logistics and operational excellence',
      email: 'priya@kabadbecho.com',
      phone: '+91 98765 43211',
      expertise: 'Operations Management'
    },
    {
      name: 'Amit Patel',
      role: 'Logistics Manager',
      image: 'man1.jpeg',
      bio: 'Ensuring timely and efficient pickup services',
      email: 'amit@kabadbecho.com',
      phone: '+91 98765 43212',
      expertise: 'Supply Chain'
    },
    
  ];

  const achievements = [
    { icon: <Award size={24} />, title: 'Award Winning', value: '10+', desc: 'Industry Awards' },
    { icon: <Users size={24} />, title: 'Team Size', value: '50+', desc: 'Dedicated Members' },
    { icon: <Heart size={24} />, title: 'Customer Love', value: '98%', desc: 'Satisfaction Rate' },
    { icon: <Target size={24} />, title: 'Success Rate', value: '100%', desc: 'On-Time Delivery' }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#5D4037]">
              Our <span className="text-[#66BB6A]">Leadership Team</span>
            </h2>
            <p className="text-xl text-gray-700 mt-2">
              Experts driving innovation in waste management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="p-6 bg-white rounded-xl shadow-md"
              >
                <div className="flex justify-center mb-4">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-[#E8F5E9]"
                  />
                </div>

                <h3 className="text-xl font-semibold text-center text-[#5D4037]">
                  {member.name}
                </h3>
                <p className="text-sm text-center text-[#66BB6A] mb-2">
                  {member.role}
                </p>

                <div className="text-center mb-3">
                  <span className="px-3 py-1 text-xs bg-[#E8F5E9] rounded-full">
                    {member.expertise}
                  </span>
                </div>

                <p className="text-sm text-center text-gray-600 mb-4">
                  {member.bio}
                </p>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-center items-center gap-2">
                    <Mail size={14} className="text-[#66BB6A]" />
                    <span>{member.email}</span>
                  </div>
                  <div className="flex justify-center items-center gap-2">
                    <Phone size={14} className="text-[#66BB6A]" />
                    <span>{member.phone}</span>
                  </div>
                </div>

                <div className="flex justify-center gap-4 border-t pt-4">
                  <Linkedin size={18} className="text-[#66BB6A] cursor-pointer" />
                  <Twitter size={18} className="text-[#66BB6A] cursor-pointer" />
                  <Mail size={18} className="text-[#66BB6A] cursor-pointer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      
    </div>
  );
};

export default KabadBechoTeam;
