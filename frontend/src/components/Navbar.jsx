// src/components/Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { LogIn, UserPlus, LogOut, UserCircle, ShieldCheck } from 'lucide-react'; // Icons

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModelsDropdownOpen, setIsModelsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false); // For user menu
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loadingAuth } = useAuth(); // Get user and logout function

  const userDropdownRef = useRef(null);
  const modelsDropdownRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);


  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleModelsDropdown = () => setIsModelsDropdownOpen(!isModelsDropdownOpen);
  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);

  const closeDropdowns = () => {
    setIsModelsDropdownOpen(false);
    setIsUserDropdownOpen(false);
  };
  
  const handleLogout = async () => {
    await logout();
    closeDropdowns();
    setIsMenuOpen(false); // Close mobile menu on logout
    navigate('/'); // Redirect to home after logout
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
      }
      if (modelsDropdownRef.current && !modelsDropdownRef.current.contains(event.target) &&
          mobileMenuButtonRef.current && !mobileMenuButtonRef.current.contains(event.target)) {
        // Check if not clicking the mobile menu button for models dropdown
        const modelsButtonInDesktop = document.getElementById('desktop-models-button');
        if (modelsButtonInDesktop && !modelsButtonInDesktop.contains(event.target)) {
             setIsModelsDropdownOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const isActive = (path) => location.pathname === path ? 'text-blue-500 font-bold' : 'text-gray-700 hover:text-blue-600';
  const isModelPage = location.pathname.startsWith('/models/');
  const currentModelPath = isModelPage ? location.pathname : '';

  // Common link class for mobile menu
  const mobileLinkClass = (path) => 
    `block pl-3 pr-4 py-2 border-l-4 ${location.pathname === path ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'}`;
  
  const mobileModelLinkClass = (path) =>
    `block pl-3 pr-4 py-2 border-l-4 ${currentModelPath === path ? 'border-blue-300 text-blue-700 bg-blue-50' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'}`;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side: Logo and main navigation */}
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img src="/logo.png" alt="URO Flood Lab Logo" className="h-10 w-10 mr-2" 
                   onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/40x40/3b82f6/ffffff?text=L&font=inter"; }}/>
              <span className="text-xl font-bold text-blue-800">URO Flood Lab</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link to="/" className={`inline-flex items-center px-1 pt-1 border-b-2 ${location.pathname === '/' ? 'border-blue-500' : 'border-transparent'} ${isActive('/')}`}>Home</Link>
              <Link to="/about" className={`inline-flex items-center px-1 pt-1 border-b-2 ${location.pathname === '/about' ? 'border-blue-500' : 'border-transparent'} ${isActive('/about')}`}>About</Link>
              
              {/* Models Dropdown - Desktop */}
              <div className="relative flex items-center" ref={modelsDropdownRef}>
                <button
                  id="desktop-models-button"
                  onClick={toggleModelsDropdown}
                  className={`inline-flex h-full items-center px-1 pt-1 border-b-2 ${isModelPage ? 'border-blue-500 text-blue-500 font-bold' : 'border-transparent text-gray-700 hover:text-blue-600'}`}
                >
                  Models
                  <svg className={`ml-1 h-5 w-5 transition-transform ${isModelsDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
                {isModelsDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1">
                    <Link to="/models/flood-model" className={`block px-4 py-2 text-sm ${currentModelPath === '/models/flood-model' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`} onClick={closeDropdowns}>Flood Model</Link>
                    <Link to="/models/storm-surge" className={`block px-4 py-2 text-sm ${currentModelPath === '/models/storm-surge' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`} onClick={closeDropdowns}>Storm Surge Model</Link>
                    <Link to="/models/coupled-model" className={`block px-4 py-2 text-sm ${currentModelPath === '/models/coupled-model' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'}`} onClick={closeDropdowns}>Tightly Coupled Model</Link>
                  </div>
                )}
              </div>
              <Link to="/team" className={`inline-flex items-center px-1 pt-1 border-b-2 ${location.pathname === '/team' ? 'border-blue-500' : 'border-transparent'} ${isActive('/team')}`}>Team</Link>
              <Link to="/contact" className={`inline-flex items-center px-1 pt-1 border-b-2 ${location.pathname === '/contact' ? 'border-blue-500' : 'border-transparent'} ${isActive('/contact')}`}>Contact</Link>
            </div>
          </div>

          {/* Right side: Auth links or User menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {!loadingAuth && user ? (
              <div className="relative" ref={userDropdownRef}>
                <button onClick={toggleUserDropdown} className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <UserCircle size={28} className="text-gray-600 hover:text-blue-600" />
                  <span className="ml-2 text-gray-700 hover:text-blue-600 hidden md:inline">{user.name}</span>
                </button>
                {isUserDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {/* <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={closeDropdowns}>Your Profile</Link> */}
                    {user.role === 'admin' && (
                      <Link to="/admin" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={closeDropdowns}>
                        <ShieldCheck size={16} className="mr-2 text-blue-600" /> Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <LogOut size={16} className="mr-2 text-red-500"/> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : !loadingAuth && (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center">
                  <LogIn size={18} className="mr-1"/> Login
                </Link>
                <Link to="/signup" className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md flex items-center">
                  <UserPlus size={18} className="mr-1"/> Sign Up
                </Link>
              </div>
            )}
            {loadingAuth && <div className="text-sm text-gray-500">Loading...</div>}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              ref={mobileMenuButtonRef}
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                           : <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden border-t border-gray-200`}>
        <div className="pt-2 pb-3 space-y-1">
          <Link to="/" className={mobileLinkClass('/')} onClick={toggleMenu}>Home</Link>
          <Link to="/about" className={mobileLinkClass('/about')} onClick={toggleMenu}>About</Link>
          
          {/* Mobile Models Dropdown */}
          <div>
            <button onClick={toggleModelsDropdown} className={`w-full text-left block pl-3 pr-4 py-2 border-l-4 ${isModelPage ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-transparent text-gray-600'} flex justify-between items-center`}>
              <span>Models</span>
              <svg className={`h-5 w-5 transition-transform ${isModelsDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
            {isModelsDropdownOpen && (
              <div className="pl-6 space-y-1 py-1">
                <Link to="/models/flood-model" className={mobileModelLinkClass('/models/flood-model')} onClick={toggleMenu}>Flood Model</Link>
                <Link to="/models/storm-surge" className={mobileModelLinkClass('/models/storm-surge')} onClick={toggleMenu}>Storm Surge Model</Link>
                <Link to="/models/coupled-model" className={mobileModelLinkClass('/models/coupled-model')} onClick={toggleMenu}>Tightly Coupled Model</Link>
              </div>
            )}
          </div>
          <Link to="/team" className={mobileLinkClass('/team')} onClick={toggleMenu}>Team</Link>
          <Link to="/contact" className={mobileLinkClass('/contact')} onClick={toggleMenu}>Contact</Link>
        </div>
        {/* Mobile Auth Links / User Info */}
        <div className="pt-4 pb-3 border-t border-gray-200">
          {!loadingAuth && user ? (
            <>
              <div className="flex items-center px-4 mb-2">
                <UserCircle size={32} className="text-gray-500 mr-3" />
                <div>
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                {user.role === 'admin' && (
                  <Link to="/admin" className={`${mobileLinkClass('/admin')} flex items-center`} onClick={toggleMenu}>
                     <ShieldCheck size={18} className="mr-2 text-blue-600" /> Admin Panel
                  </Link>
                )}
                {/* <Link to="/profile" className={mobileLinkClass('/profile')} onClick={toggleMenu}>Your Profile</Link> */}
                <button onClick={() => { handleLogout(); toggleMenu(); }} className={`${mobileLinkClass('/logout')} w-full text-left flex items-center`}>
                  <LogOut size={18} className="mr-2 text-red-500"/> Logout
                </button>
              </div>
            </>
          ) : !loadingAuth && (
            <div className="space-y-1 px-2">
              <Link to="/login" className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900" onClick={toggleMenu}>Login</Link>
              <Link to="/signup" className="block rounded-md px-3 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700" onClick={toggleMenu}>Sign Up</Link>
            </div>
          )}
           {loadingAuth && <div className="px-4 py-2 text-sm text-gray-500">Loading user...</div>}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
