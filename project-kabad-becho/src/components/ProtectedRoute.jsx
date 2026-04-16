import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const ProtectedRoute = ({ children, requiredRole = 'user' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        // Correctly redirect based on which portal we are protecting
        if (location.pathname.startsWith('/admin')) {
          navigate("/admin/login", { replace: true });
        } else if (location.pathname.startsWith('/Kabadi')) {
          navigate("/kabadi/login", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
        setLoading(false);
        return;
      }

      // If user is logged in, check their role in Firestore
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const userRole = (userData.role || 'user').toLowerCase();
          const targetRole = requiredRole.toLowerCase();

          // STRICT ROLE CHECK — no cross-role access allowed
          if (userRole !== targetRole) {
            console.warn("Unauthorized role:", userRole, "expected:", targetRole);
            // Sign them out to prevent stale sessions
            await auth.signOut();
            localStorage.removeItem('token');
            if (location.pathname.startsWith('/admin')) navigate("/admin/login", { replace: true });
            else if (location.pathname.startsWith('/Kabadi')) navigate("/kabadi/login", { replace: true });
            else navigate("/login", { replace: true });
            setLoading(false);
            return;
          }
        } else {
          // User doc doesn't exist — redirect to login
          await auth.signOut();
          localStorage.removeItem('token');
          navigate("/login", { replace: true });
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Auth check failed", err);
      }

      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, requiredRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F8E9]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#66BB6A]"></div>
      </div>
    );
  }

  return user ? children : null;
};

export default ProtectedRoute;