import React, { useState } from "react";
import {
  Star,
  Quote,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const testimonials = [
  {
    name: "Rohit Mehta",
    role: "Home Owner, Delhi",
    message:
      "Kabad Becho made selling scrap extremely easy. The pickup was on time and payment was instant!",
    rating: 5,
  },
  {
    name: "Anjali Sharma",
    role: "Apartment Resident, Pune",
    message:
      "Very professional service. Transparent weighing and friendly staff. Highly recommended!",
    rating: 5,
  },
  {
    name: "Amit Verma",
    role: "Small Business Owner, Indore",
    message:
      "Best scrap pickup service I’ve used so far. Smooth process and great prices.",
    rating: 4,
  },
  {
    name: "Neha Kapoor",
    role: "Eco-conscious Customer, Bengaluru",
    message:
      "Loved the eco-friendly approach. It feels good to recycle with a trusted company.",
    rating: 5,
  },
  {
    name: "Suresh Patel",
    role: "Shop Owner, Ahmedabad",
    message:
      "Quick pickup and honest pricing. I regularly use Kabad Becho now.",
    rating: 4,
  },
  {
    name: "Priya Nair",
    role: "Resident, Kochi",
    message:
      "Customer support was excellent and the process was very smooth.",
    rating: 5,
  },
];

const ITEMS_PER_PAGE = 3;

const KabadBechoTestimonials = () => {
  const [page, setPage] = useState(0);
  const [animate, setAnimate] = useState(true);

  const totalPages = Math.ceil(testimonials.length / ITEMS_PER_PAGE);

  const next = () => {
    setAnimate(false);
    setTimeout(() => {
      setPage((prev) => (prev + 1) % totalPages);
      setAnimate(true);
    }, 150);
  };

  const prev = () => {
    setAnimate(false);
    setTimeout(() => {
      setPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
      setAnimate(true);
    }, 150);
  };

  const visibleTestimonials = testimonials.slice(
    page * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  return (
    <div className="bg-white">

      {/* ================= HEADER ================= */}
      <section className="py-20 bg-linear-to-b from-white to-[#E8F5E9]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white px-5 py-2 rounded-full shadow mb-6">
            <Users className="text-[#66BB6A]" size={20} />
            <span className="font-semibold text-[#5D4037]">
              What Our Customers Say
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-[#5D4037] mb-4">
            Trusted by <span className="text-[#66BB6A]">Thousands</span>
          </h2>

          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Real experiences from people who chose Kabad Becho for hassle-free
            scrap recycling
          </p>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">

          {/* Cards */}
          <div
            className={`grid md:grid-cols-3 gap-8 transition-all duration-500 ${
              animate ? "animate-cardsIn" : "opacity-0"
            }`}
          >
            {visibleTestimonials.map((item, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#66BB6A]"
              >
                <div className="p-6 relative h-full flex flex-col">

                  {/* Quote */}
                  <div className="absolute -top-4 left-6 bg-linear-to-br from-[#66BB6A] to-[#4CAF50] p-3 rounded-full shadow-lg">
                    <Quote size={18} className="text-white" />
                  </div>

                  {/* Message */}
                  <p className="text-gray-600 text-sm leading-relaxed mt-6 mb-6 grow">
                    “{item.message}”
                  </p>

                  {/* Rating */}
                  <div className="flex justify-center mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={
                          i < item.rating
                            ? "text-[#66BB6A] fill-[#66BB6A]"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>

                  {/* User */}
                  <div className="text-center border-t pt-4">
                    <h4 className="font-semibold text-[#5D4037]">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {item.role}
                    </p>
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-6 mt-10">
            <button
              onClick={prev}
              className="bg-white shadow-md p-3 rounded-full hover:bg-[#E8F5E9] transition-all"
            >
              <ChevronLeft className="text-[#5D4037]" />
            </button>

            <button
              onClick={next}
              className="bg-white shadow-md p-3 rounded-full hover:bg-[#E8F5E9] transition-all"
            >
              <ChevronRight className="text-[#5D4037]" />
            </button>
          </div>

        </div>
      </section>

      {/* ================= ANIMATIONS ================= */}
      <style>{`
        @keyframes cardsIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-cardsIn {
          animation: cardsIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default KabadBechoTestimonials;
