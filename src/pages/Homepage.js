import React, { useState } from "react";
import {
  ChevronRight,
  LogIn,
  Users,
  Briefcase,
  Zap,
  ShieldCheck,
  ArrowRight,
  Quote,
} from "lucide-react";

// Dummy logo URLs for "Trusted By"
const logos = [
  "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
  "https://upload.wikimedia.org/wikipedia/commons/4/44/Salesforce_logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
  "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/0/08/Google_Logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/2/2f/Logo_Telegram.svg",
];

// Dummy use case data
const useCases = [
  {
    title: "Sales Automation",
    description:
      "Automate lead capture, distribution, and follow-up to help your sales team close more deals, faster.",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Marketing Automation",
    description:
      "Nurture prospects with personalized campaigns and track engagement across multiple channels.",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Customer Support",
    description:
      "Manage tickets, automate responses, and deliver a seamless support experience to your customers.",
    image:
      "https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?auto=format&fit=crop&w=600&q=80",
  },
];

// Dummy testimonials
const testimonials = [
  {
    quote:
      "SalesOps Pro has transformed the way our team works. Automations have saved us countless hours!",
    name: "Alex Kim",
    title: "Director of Sales",
    company: "Acme Inc.",
    image:
      "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    quote:
      "Our lead conversion rates have increased by 30% since we switched to this platform. Highly recommended.",
    name: "Priya Sharma",
    title: "VP Marketing",
    company: "NextGen Solutions",
    image:
      "https://randomuser.me/api/portraits/women/65.jpg",
  },
];

// Smooth scroll for in-page navigation
const scrollToSection = (id) => {
  const section = document.getElementById(id);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
};

export default function Homepage({ navigateToView }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="font-sans bg-gray-50 text-gray-900 min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
          <button
            className="flex items-center space-x-2 cursor-pointer bg-transparent border-none outline-none"
            onClick={() => scrollToSection("hero")}
            aria-label="Go to homepage"
          >
            <Briefcase size={28} className="text-blue-600" />
            <span className="text-xl font-bold tracking-tight">SalesOps Pro</span>
          </button>
          <div className="hidden md:flex items-center space-x-6">
            <button
              className="hover:text-blue-600 transition-colors bg-transparent border-none outline-none"
              onClick={() => scrollToSection("features")}
            >
              Features
            </button>
            <button
              className="hover:text-blue-600 transition-colors bg-transparent border-none outline-none"
              onClick={() => scrollToSection("pricing")}
            >
              Pricing
            </button>
            <button
              className="hover:text-blue-600 transition-colors bg-transparent border-none outline-none"
              onClick={() => scrollToSection("about")}
            >
              About
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button
              className="flex items-center px-4 py-2 rounded text-blue-600 font-semibold hover:bg-blue-50 transition bg-transparent border-none outline-none"
              onClick={() => navigateToView?.("login")}
            >
              <LogIn size={18} className="mr-1" /> Login
            </button>
            <button
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition flex items-center"
              onClick={() => navigateToView?.("signup")}
            >
              Sign Up Free <ChevronRight size={18} className="ml-1" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="flex flex-col-reverse md:flex-row items-center justify-between max-w-7xl mx-auto px-4 sm:px-8 pt-16 md:pt-24 pb-12 md:pb-20">
        <div className="w-full md:w-1/2 space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
            Elevate Your <span className="text-blue-600">Sales Operations</span>
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            SalesOps Pro provides the tools you need to streamline processes, boost productivity, and drive revenue growth. All in one powerful, intuitive platform.
          </p>
          <div className="flex space-x-3">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow transition flex items-center"
              onClick={() => navigateToView?.("signup")}
            >
              Start Your 14-Day Free Trial <ArrowRight size={19} className="ml-2" />
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center mb-8 md:mb-0">
          <img
            src="https://www.leadsquared.com/wp-content/uploads/2023/10/leadsquared-sales-execution-platform.png"
            alt="CRM Dashboard Illustration"
            className="w-full max-w-md rounded-2xl shadow-xl"
          />
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-6 bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center">
          <div className="text-gray-600 text-sm mb-4">Trusted by leading companies</div>
          <div className="flex flex-wrap gap-6 justify-center items-center">
            {logos.map((logo, i) => (
              <img
                src={logo}
                alt={`Client ${i + 1}`}
                key={i}
                className="h-10 object-contain grayscale hover:grayscale-0 transition-all duration-200"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Everything You Need in One Platform</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Boost sales performance, automate repetitive tasks, and make smarter decisions.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 flex flex-col items-center text-center">
              <Users className="text-blue-600 mb-3" size={32} />
              <h3 className="font-semibold text-lg mb-2">Lead Management</h3>
              <p className="text-gray-500 text-sm">Capture, nurture, and convert leads efficiently with smart automations.</p>
            </div>
            <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 flex flex-col items-center text-center">
              <Briefcase className="text-green-600 mb-3" size={32} />
              <h3 className="font-semibold text-lg mb-2">Deal Tracking</h3>
              <p className="text-gray-500 text-sm">Visualize your pipeline and forecast revenue with powerful deal tracking tools.</p>
            </div>
            <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 flex flex-col items-center text-center">
              <Zap className="text-yellow-500 mb-3" size={32} />
              <h3 className="font-semibold text-lg mb-2">Workflow Automation</h3>
              <p className="text-gray-500 text-sm">Eliminate manual tasks and speed up your sales process with automation.</p>
            </div>
            <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 flex flex-col items-center text-center">
              <ShieldCheck className="text-purple-600 mb-3" size={32} />
              <h3 className="font-semibold text-lg mb-2">Secure & Scalable</h3>
              <p className="text-gray-500 text-sm">Enterprise-grade security and scalability for fast-growing teams.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Case Carousel or Tabs */}
      <section id="pricing" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Designed For Every Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how SalesOps Pro empowers your business across departments.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {useCases.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-2 rounded-full font-medium transition border ${
                  activeTab === idx
                    ? "bg-blue-600 text-white border-blue-600 shadow"
                    : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-50"
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center md:gap-12 gap-6 mt-6">
            <div className="md:w-1/2 w-full">
              <img
                src={useCases[activeTab].image}
                alt={useCases[activeTab].title}
                className="rounded-2xl shadow-lg mx-auto"
                loading="lazy"
              />
            </div>
            <div className="md:w-1/2 w-full text-center md:text-left">
              <h3 className="text-2xl font-bold mb-4">{useCases[activeTab].title}</h3>
              <p className="text-gray-600 text-lg">{useCases[activeTab].description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="about" className="py-16 bg-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow hover:shadow-lg transition p-8 flex flex-col items-center text-center"
              >
                <Quote className="text-blue-400 mb-2" size={32} />
                <p className="text-gray-700 text-lg mb-5 italic">"{t.quote}"</p>
                <div className="flex items-center space-x-3">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                  />
                  <div className="text-left">
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-gray-500">
                      {t.title}, {t.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-blue-600 py-12">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-0">
            Ready to drive more revenue and productivity?
          </h2>
          <button
            className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold shadow hover:bg-blue-50 transition flex items-center mt-2 md:mt-0"
            onClick={() => navigateToView?.("signup")}
          >
            Start your free trial <ArrowRight size={19} className="ml-2" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-100 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div>
            <div className="flex items-center mb-2">
              <Briefcase size={25} className="text-blue-500 mr-2" />
              <span className="font-bold text-lg">SalesOps Pro</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              The modern revenue platform for high-velocity teams.
            </p>
            <div className="flex space-x-3">
              <a href="https://twitter.com/" aria-label="Twitter" className="hover:text-blue-400 transition" target="_blank" rel="noopener noreferrer">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724 9.864 9.864 0 0 1-3.127 1.195A4.916 4.916 0 0 0 16.616 3c-2.737 0-4.958 2.22-4.958 4.958 0 .388.045.765.127 1.124C7.728 8.874 4.1 6.9 1.67 3.882a4.822 4.822 0 0 0-.666 2.492c0 1.721.876 3.234 2.213 4.122a4.904 4.904 0 0 1-2.244-.618v.062c0 2.404 1.71 4.411 3.977 4.867a4.897 4.897 0 0 1-2.239.085c.63 1.966 2.444 3.393 4.6 3.434A9.868 9.868 0 0 1 0 21.542a13.94 13.94 0 0 0 7.548 2.212c9.142 0 14.307-7.721 14.307-14.426 0-.22-.005-.438-.015-.654A10.243 10.243 0 0 0 24 4.557z"/></svg>
              </a>
              <a href="https://linkedin.com/" aria-label="LinkedIn" className="hover:text-blue-400 transition" target="_blank" rel="noopener noreferrer">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm14.5 11.268h-3v-5.604c0-1.337-.025-3.058-1.865-3.058-1.867 0-2.153 1.457-2.153 2.965v5.697h-3v-10h2.882v1.366h.041c.401-.76 1.381-1.561 2.842-1.561 3.041 0 3.602 2.002 3.602 4.604v5.591z"/></svg>
              </a>
              <a href="https://facebook.com/" aria-label="Facebook" className="hover:text-blue-400 transition" target="_blank" rel="noopener noreferrer">
                <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path d="M22.676 0h-21.352c-.732 0-1.324.594-1.324 1.326v21.348c0 .73.592 1.326 1.324 1.326h11.495v-9.284h-3.125v-3.622h3.125v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.461.098 2.797.142v3.24l-1.919.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12v9.284h6.116c.73 0 1.324-.596 1.324-1.326v-21.348c0-.732-.594-1.326-1.324-1.326z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-3">Products</div>
            <ul className="space-y-1 text-gray-400 text-sm">
              <li><span className="cursor-pointer hover:text-blue-300 transition" onClick={() => scrollToSection('features')}>Sales CRM</span></li>
              <li><span className="cursor-pointer hover:text-blue-300 transition" onClick={() => scrollToSection('features')}>Marketing Automation</span></li>
              <li><span className="cursor-pointer hover:text-blue-300 transition" onClick={() => scrollToSection('features')}>Lead Management</span></li>
              <li><span className="cursor-pointer hover:text-blue-300 transition" onClick={() => scrollToSection('features')}>Reporting</span></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">Solutions</div>
            <ul className="space-y-1 text-gray-400 text-sm">
              <li><span className="cursor-pointer hover:text-blue-300 transition" onClick={() => scrollToSection('features')}>Field Sales</span></li>
              <li><span className="cursor-pointer hover:text-blue-300 transition" onClick={() => scrollToSection('features')}>Inside Sales</span></li>
              <li><span className="cursor-pointer hover:text-blue-300 transition" onClick={() => scrollToSection('features')}>Support Automation</span></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">Company</div>
            <ul className="space-y-1 text-gray-400 text-sm">
              <li><span className="cursor-pointer hover:text-blue-300 transition" onClick={() => scrollToSection('about')}>About</span></li>
              <li><a href="https://yourcompany.com/careers" className="hover:text-blue-300 transition" target="_blank" rel="noopener noreferrer">Careers</a></li>
              <li><a href="https://yourcompany.com/press" className="hover:text-blue-300 transition" target="_blank" rel="noopener noreferrer">Press</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3">Contact</div>
            <ul className="space-y-1 text-gray-400 text-sm">
              <li><a href="mailto:support@yourcompany.com" className="hover:text-blue-300 transition">Help Center</a></li>
              <li><a href="mailto:support@yourcompany.com" className="hover:text-blue-300 transition">Support</a></li>
              <li><button className="hover:text-blue-300 transition bg-transparent border-none outline-none p-0" onClick={() => navigateToView?.("signup")}>Request a Demo</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 text-gray-400 text-xs text-center border-t border-gray-800 pt-6">
          © {new Date().getFullYear()} SalesOps Pro. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
