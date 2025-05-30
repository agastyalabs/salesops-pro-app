import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SidebarLayout from "./components/SidebarLayout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Contacts from "./pages/Contacts";
import Deals from "./pages/Deals";
import Activities from "./pages/Activities";
import LoginPage from "./pages/LoginPage";

// Replace with your real auth/user logic!
const fakeUser = { uid: "abc123", email: "demo@sales.com", role: "user" };

function App() {
  const user = fakeUser; // Replace with real auth state

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
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
