import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { Home } from './pages/Home';
import { Generator } from './pages/Generator';
import { Library } from './pages/Library';
import { Profile } from './pages/Profile';
import { Auth } from './pages/Auth';
import { JavaConverter } from './pages/JavaConverter';
import { Layout } from './components/Layout';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, User as UserIcon, Plus, Library as LibraryIcon, Home as HomeIcon, Zap } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-4 border-[#00ff00] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <Router>
      <Layout user={user}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/generator" element={<Generator user={user} />} />
          <Route path="/converter" element={<JavaConverter user={user} />} />
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </Layout>
    </Router>
  );
}
