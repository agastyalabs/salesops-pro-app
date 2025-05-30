import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard, Users, Briefcase, UserRound, ListChecks } from "lucide-react";

const navLinks = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", path: "/leads", icon: Users },
  { label: "Deals", path: "/deals", icon: Briefcase },
  { label: "Contacts", path: "/contacts", icon: UserRound },
  { label: "Activities", path: "/activities", icon: ListChecks }
];

const SidebarLayout = ({ user, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    // Insert real signOut logic as needed!
    navigate("/login");
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className={`transition-all duration-200 bg-white dark:bg-gray-800 shadow-lg flex flex-col ${sidebarOpen ? 'w-56' : 'w-16'} min-h-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700">
          <span className="font-bold text-xl tracking-tight text-blue-700">S</span>
          <button
            onClick={() => setSidebarOpen((open) => !open)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            title={sidebarOpen ? "Collapse" : "Expand"}
          >
            {sidebarOpen ? "<" : ">"}
          </button>
        </div>
        <nav className="flex-1 px-2 py-6 space-y-2">
          {navLinks.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center rounded-lg px-3 py-2 text-md font-medium transition ${
                location.pathname.startsWith(path)
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-white"
                  : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Icon className="mr-2" size={20} />
              {sidebarOpen && label}
            </Link>
          ))}
        </nav>
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 flex items-center px-6 bg-white dark:bg-gray-800 shadow-sm justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold">Welcome, {user.email.split("@")[0]}</span>
            {user.role === "admin" && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-orange-200 text-orange-800 rounded">Admin</span>
            )}
          </div>
          <button
            className="flex items-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white px-3 py-2 rounded font-semibold hover:bg-red-500 hover:text-white transition"
            onClick={handleLogout}
          >
            <LogOut className="mr-2" size={18} /> Logout
          </button>
        </header>
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default SidebarLayout;
