// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext'; // Import AuthProvider
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import FloodModel from './pages/FloodModel';
import StormSurgeModel from './pages/StormSurgeModel';
import TightlyCoupledModel from './pages/TightlyCoupledModel';
import TeamPage from './pages/TeamPage';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import LoginPage from './pages/LoginPage'; // New
import SignupPage from './pages/SignupPage'; // New
import AdminPage from './pages/AdminPage'; // New
import ProtectedRoute from './components/ProtectedRoute'; // New (for admin or user-specific routes)
import AdminRoute from './components/AdminRoute'; // New (for admin routes)
import { recordPageVisit, getVisitorStats as apiGetVisitorStats } from './services/api'; // For visitor tracking


// Component to handle page visit recording
const PageVisitTracker = () => {
  const location = useLocation();
  const { user } = useAuth(); // Get user to associate visit if logged in

  useEffect(() => {
    // Record visit on route change
    // console.log(`Page visited: ${location.pathname} by user: ${user ? user.email : 'anonymous'}`);
    recordPageVisit(location.pathname)
      .catch(err => console.warn("Failed to record page visit", err));
  }, [location, user]);

  return null; // This component does not render anything
};


function AppContent() {
  // const [visitorCount, setVisitorCount] = useState(0); // Will be fetched from backend
  // const [pageHits, setPageHits] = useState(0); // Will be fetched from backend
  const [siteStats, setSiteStats] = useState({ totalVisits: 0, uniqueVisitors: 0 });


  useEffect(() => {
    // Fetch initial site stats
    const fetchStats = async () => {
      try {
        const response = await apiGetVisitorStats(); // You'll need to create this API endpoint
        if (response && response.status === 'success') {
          setSiteStats({
            totalVisits: response.data.totalPageHits || 0, // Assuming backend provides this
            uniqueVisitors: response.data.totalUniqueVisitors || 0, // Assuming backend provides this
          });
        }
      } catch (error) {
        console.error("Could not fetch site stats", error);
      }
    };
    fetchStats();
    // Potentially refresh stats periodically or on certain events
  }, []);


  return (
    <div className="flex flex-col min-h-screen bg-slate-50"> {/* Added default bg */}
      <Navbar />
      <PageVisitTracker /> {/* Add the tracker here */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Model Pages (can be public or protected based on your needs) */}
          <Route path="/models/flood-model" element={<FloodModel />} />
          <Route path="/models/storm-surge" element={<StormSurgeModel />} />
          <Route path="/models/coupled-model" element={<TightlyCoupledModel />} />
          
          <Route path="/team" element={<TeamPage />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Admin Route */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            } 
          />
          {/* Example of a route that requires any logged-in user */}
          {/* <Route 
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          /> */}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer siteStats={siteStats} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider> {/* Wrap the entire app with AuthProvider */}
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
