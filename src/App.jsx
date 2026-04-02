import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Services from "./pages/Services.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import BookPickup from "./pages/BookPickup.jsx";
import SchedulePickup from "./pages/SchedulePickup.jsx";
import Login from "./components/Login.jsx";
import UserLayout from "./components/User/UserLayout.jsx";
import Dashboard from "./components/User/Dashboard.jsx";
import Pickup from "./components/User/pickup.jsx";
import Setting from "./components/User/Setting.jsx";
import UserService from "./components/User/UserService.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Contact from "./pages/Contact.jsx";

// Admin
import AdminLayout from "./components/admin/AdminLayout.jsx";
import AnalyticsReports from "./components/admin/AnalyticsReports.jsx";
import UserRequests from "./components/admin/UserRequests.jsx";
import UserManagement from "./components/admin/UserManagement.jsx";
import PaymentsPricing from "./components/admin/PaymentsPricing.jsx";
import ComplaintsSupport from "./components/admin/ComplaintsSupport.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Kabadi from "./components/Kabadi.jsx";

const App = () => {
  return (
    <Router>
      <ScrollToTop/>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/services" element={<><Navbar /><Services /></>} />
        <Route path="/about" element={<><Navbar /><AboutUs /></>} />
        <Route path="/contact" element={<><Navbar /><Contact /></>} />
        <Route path="/login" element={<><Navbar /><Login /></>} />
        <Route path="/admin/login" element={<><Navbar /><Login defaultRole="admin" /></>} />
        <Route path="/kabadi/login" element={<><Navbar /><Login defaultRole="kabadi" /></>} />
        <Route path="/Kabadi" element={<ProtectedRoute requiredRole="kabadi"><Kabadi/></ProtectedRoute>}></Route>
        <Route path="/book-pickup" element={<><BookPickup /></>} />
        <Route path="/schedule-pickup" element={<><SchedulePickup /></>} />

        {/* USER DASHBOARD (nested) */}
        <Route path="/dashboard" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="pickup" element={<Pickup />} />
          <Route path="UserService" element={<UserService/>} />
          <Route path="setting" element={<Setting />} />
          <Route path="book-pickup" element={<BookPickup/>} />
        </Route>


        {/* ADMIN routes */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/admin/analytics" replace />} />
          <Route path="analytics" element={<AnalyticsReports />} />
          <Route path="requests" element={<UserRequests />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="payments" element={<PaymentsPricing />} />
          <Route path="complaints" element={<ComplaintsSupport />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
