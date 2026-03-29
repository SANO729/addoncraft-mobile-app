import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Plus, Library, User as UserIcon, LogOut, LogIn, Zap } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  user: User | null;
}

export function Layout({ children, user }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/generator', icon: Plus, label: 'Create' },
    { path: '/converter', icon: Zap, label: 'Convert' },
    { path: '/library', icon: Library, label: 'Library' },
    { path: '/profile', icon: UserIcon, label: 'Profile' },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#00ff00] selection:text-black">
      {/* Sidebar / Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full md:top-0 md:left-0 md:w-20 md:h-full bg-[#111] border-t md:border-t-0 md:border-r border-[#222] z-50 flex md:flex-col items-center justify-around md:justify-center py-4 md:gap-8">
        <div className="hidden md:block mb-auto">
          <Link to="/" className="text-[#00ff00] font-bold text-2xl tracking-tighter">AC</Link>
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`p-3 rounded-xl transition-all duration-300 group relative ${
                isActive ? 'bg-[#00ff00] text-black shadow-[0_0_15px_rgba(0,255,0,0.4)]' : 'text-gray-400 hover:text-white hover:bg-[#222]'
              }`}
            >
              <Icon size={24} />
              <span className="absolute left-full ml-4 px-2 py-1 bg-[#222] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity hidden md:block whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          );
        })}

        <div className="md:mt-auto">
          {user ? (
            <button
              onClick={handleLogout}
              className="p-3 text-gray-400 hover:text-red-500 transition-colors"
            >
              <LogOut size={24} />
            </button>
          ) : (
            <Link
              to="/auth"
              className="p-3 text-gray-400 hover:text-[#00ff00] transition-colors"
            >
              <LogIn size={24} />
            </Link>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pb-24 md:pb-0 md:pl-20 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="p-6 md:p-12 max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00ff00]/5 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8b5cf6]/5 blur-[120px] pointer-events-none -z-10" />
    </div>
  );
}
