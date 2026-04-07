import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard, BrainCircuit } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] animate-gradient flex flex-col">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-indigo-500 rounded-lg group-hover:bg-indigo-600 transition-colors">
            <BrainCircuit className="text-white h-6 w-6" />
          </div>
          <span className="text-2xl font-bold text-gradient">SkillSync AI</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-white">{user.displayName || user.email.split('@')[0]}</span>
                <span className="text-xs text-gray-400 capitalize">Pro Member</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-red-400"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="px-4 py-2 text-gray-300 hover:text-white transition-colors">Login</Link>
            <Link to="/signup" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
              Get Started
            </Link>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 text-center">
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} SkillSync AI. Powered by spaCy & React.
        </p>
      </footer>
    </div>
  );
};

export default Layout;
