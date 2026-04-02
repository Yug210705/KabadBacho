import React from "react";
import Hero from "../components/Hero";
import About from "../components/About";
import Team from "../components/Team";
import Testimonials from "../components/Testimonials";
import Contact from "../components/Contact";
import Footer from "../components/Footer.jsx";
import Navbar from "../components/Navbar.jsx";

const Home = () => {
  return (
    <div>
      <Navbar/>
      <Hero />
      <About />
      <Team />
      <Testimonials />
      <Footer/>
    </div>
  );
};

export default Home;