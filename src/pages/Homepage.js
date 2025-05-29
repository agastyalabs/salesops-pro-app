import React from 'react';
import { Briefcase, Moon, Sun, ArrowRight, Target, Zap, LineChart as LucideLineChart, UsersRound, ShieldCheck } from 'lucide-react';
import { TRIAL_DURATION_DAYS } from '../config'; // Import from config

const Homepage = ({
    navigateToView,
    theme,
    toggleTheme,
    isAuthenticated
}) => {
    const features = [
        { name: "Intelligent Lead Management", description: "Capture, track, score, and distribute leads efficiently to close more deals faster.", icon: Target, color: "text-blue-500" },
        { name: "Streamlined Deal Tracking", description: "Visualize your sales pipeline, manage stages, and forecast revenue with precision.", icon: Briefcase, color: "text-green-500" },
        { name: "Comprehensive Contact Hub", description: "Maintain a 360-degree view of your contacts, interactions, and history.", icon: UsersRound, color: "text-indigo-500" },
        { name: "Actionable Sales Analytics", description: "Gain deep insights into performance with customizable reports and dashboards.", icon: LucideLineChart, color: "text-purple-500" },
        { name: "Workflow Automation", description: "Automate repetitive sales tasks, follow-ups, and notifications to boost productivity.", icon: Zap, color: "text-yellow-500" },
        { name: "Customizable & Secure", description: "Tailor the platform to your needs with robust security and permission controls.", icon: ShieldCheck, color: "text-red-500" },
    ];

    return (
        <div className={`min-h-screen flex flex-col font-inter ${theme === 'dark' ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
            <header className="py-4 px-6 md:px-10 shadow-sm sticky top-0 z-40 bg-white dark:bg-gray-800/80 backdrop-blur-md">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center cursor-pointer" onClick={() => navigateToView('homepage')}>
                        <Briefcase size={28} className="text-blue-600 dark:text-blue-400" />
                        <h1 className="text-2xl font-bold ml-2.5 text-gray-800 dark:text-white">SalesOps Pro</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        {isAuthenticated ? (
                            <button 
                                onClick={() => navigateToView('dashboard')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                            >
                                Dashboard
                            </button>
                        ) : (
                            <>
                                <button 
                                    onClick={() => navigateToView('login')}
                                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                                >
                                    Login
                                </button>
                                <button 
                                    onClick={() => navigateToView('signup')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                                >
                                    Sign Up Free
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                <section className="py-20 md:py-32 text-center bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-700 dark:via-blue-600 dark:to-indigo-700 text-white">
                    <div className="container mx-auto px-6">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fadeInUp">
                            Elevate Your Sales Operations
                        </h2>
                        <p className="text-lg md:text-xl lg:text-2xl mb-10 max-w-3xl mx-auto opacity-90 animate-fadeInUp animation-delay-300">
                            SalesOps Pro provides the tools you need to streamline processes, boost productivity, and drive revenue growth. All in one powerful, intuitive platform.
                        </p>
                        <button 
                            onClick={() => navigateToView(isAuthenticated ? 'dashboard' : 'signup')}
                            className="bg-white hover:bg-gray-100 text-blue-600 dark:text-blue-500 dark:hover:bg-gray-200 font-bold py-3 px-8 rounded-lg shadow-xl hover:shadow-2xl text-lg transition-all duration-200 flex items-center justify-center mx-auto"
                        >
                            {isAuthenticated ? 'Go to Dashboard' : `Start Your ${TRIAL_DURATION_DAYS}-Day Free Trial`} <ArrowRight size={20} className="ml-2" />
                        </button>
                    </div>
                </section>

                <section className="py-16 md:py-24 bg-white dark:bg-gray-800">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12 md:mb-16">
                            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">Powerful Features, Seamless Experience</h3>
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                                Everything you need to supercharge your sales team and achieve your targets.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                            {features.map((feature, index) => (
                                <div key={feature.name} className="bg-gray-50 dark:bg-gray-850 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                                    <div className={`p-3 inline-block rounded-full bg-opacity-10 mb-4 ${feature.color.replace('text-', 'bg-')}`}>
                                        <feature.icon size={28} className={feature.color} />
                                    </div>
                                    <h4 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{feature.name}</h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-8 text-center bg-gray-100 dark:bg-gray-850 border-t dark:border-gray-700">
                <div className="container mx-auto px-6">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} SalesOps Pro. All rights reserved.
                    </p>
                </div>
            </footer>
            {/* Animation styles specific to this page or that were previously in App.js global style tag */}
            <style jsx global>{` 
                .animation-delay-300 { animation-delay: 0.3s; }
                .animation-delay-600 { animation-delay: 0.6s; }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeInUp { 
                    animation-name: fadeInUp;
                    animation-duration: 0.7s;
                    animation-fill-mode: both;
                }
                .dark .bg-gray-850 { background-color: #161d2a; }
            `}</style>
        </div>
    );
};

export default Homepage;
