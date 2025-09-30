import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Tools', path: '/tools' },
  ];

  return (
    <div className="bg-[#100f1f] p-4 font-sans">
      <header className="w-full max-w-5xl mx-auto bg-white rounded-full py-3 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center">
            {/* This class will now work correctly */}
            <div className="text-black font-semibold text-2xl tracking-normal font-orbitron leading-6">
              STORIQ
            </div>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-300 ${
                  location.pathname === link.path
                    ? 'bg-black text-white' 
                    : 'bg-transparent text-black hover:bg-gray-200'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center">
            <Link to="/signup" className="text-black text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-gray-200 transition-colors duration-300">
              SIGN UP
            </Link>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default Header;