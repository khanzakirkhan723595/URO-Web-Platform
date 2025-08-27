// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart2, Users } from 'lucide-react'; // Icons for stats

// siteStats and statsLoading props will be passed from App.jsx
const Footer = ({ siteStats, statsLoading }) => {
  const currentYear = new Date().getFullYear();

  const StatItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center justify-center md:justify-start text-sm">
      <Icon size={18} className="mr-2 text-blue-300 flex-shrink-0" />
      <span>{label}: {statsLoading ? 'Loading...' : (value ?? 'N/A')}</span>
    </div>
  );

  return (
    <footer className="bg-slate-800 text-slate-300">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 items-start">
          
          {/* Column 1: Logo and Brand - Updated by user */}
          <div className="flex flex-col items-center md:items-start">
            <Link to="/" className="flex items-center mb-4 group">
              <img 
                src="/logo.png" // Ensure this path is correct in your public folder
                alt="URO Flood Lab Logo" 
                // User updated logo size to h-40 w-40
                className="h-40 w-40 rounded-full shadow-md mr-4 border-2 border-blue-500 group-hover:border-blue-400 transition-all flex-shrink-0"
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/160x160/3b82f6/ffffff?text=URO&font=inter"; }} // Updated placeholder size to match h-40 w-40 (160px)
              />
              {/* User commented out the brand text */}
              <div className="ml-1"> 
                <span className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors block">URO Flood Lab</span>
                <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Advancing Flood Science</p>
              </div> 
             
            </Link>
            {/* User commented out the paragraph */}
            <p className="text-slate-400 text-sm text-center md:text-left"> 
              Urban River Ocean Flood Dynamics Lab - Developing advanced models for flood prediction and management.
            </p> 
           
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 text-center md:text-left">Quick Links</h3>
            <ul className="space-y-2 text-center md:text-left">
              <li><Link to="/" className="hover:text-white hover:underline">Home</Link></li>
              <li><Link to="/about" className="hover:text-white hover:underline">About Us</Link></li>
              {/* Ensure this link is updated if you renamed the model page/path */}
              <li><Link to="/models/flood-model" className="hover:text-white hover:underline">Flood Model</Link></li> 
              <li><Link to="/contact" className="hover:text-white hover:underline">Contact</Link></li>
            </ul>
          </div>
          
          {/* Column 3: Site Stats & Social */}
          <div>
             <h3 className="text-lg font-semibold text-white mb-4 text-center md:text-left">Site Statistics</h3>
             <div className="space-y-3 text-center md:text-left">
                <StatItem icon={Users} label="Unique Visitors" value={siteStats?.uniqueVisitors} />
                <StatItem icon={BarChart2} label="Total Page Hits" value={siteStats?.totalVisits} />
             </div>
            <div className="mt-6 flex space-x-4 justify-center md:justify-start">
              <a href="#" aria-label="URO Flood Lab on Twitter" className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a href="#" aria-label="URO Flood Lab on GitHub" className="text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-10 pt-8 border-t border-slate-700 text-center">
          <p className="text-slate-400 text-sm">
            &copy; {currentYear} URO Flood Lab. All rights reserved.
            Powered by Advanced Simulation Technologies.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
