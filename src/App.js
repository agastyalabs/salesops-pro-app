import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./utils/firebase";
import SidebarLayout from "./components/SidebarLayout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Contacts from "./pages/Contacts";
import Deals from "./pages/Deals";
import Activities from "./pages/Activities";
import LoginPage from "./pages/LoginPage";
// import SignupPage from "./pages/SignupPage"; // Uncomment if using signup

function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setCheckingAuth(false);
    });
    return () => unsub();
  }, []);

  if (checkingAuth) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        {/* <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/dashboard" />} /> */}
        <Route
          path="/*"
          element={
            user ? (
              <SidebarLayout user={user}>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard userProfile={user} />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/deals" element={<Deals />} />
                  <Route path="/activities" element={<Activities />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </SidebarLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
