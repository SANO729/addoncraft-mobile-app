import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, FacebookAuthProvider } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Mail, Lock, Chrome, Facebook, Sparkles } from 'lucide-react';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        createdAt: serverTimestamp(),
      }, { merge: true });
      navigate('/profile');
    } catch (err) {
      console.error(err);
      setError('Erro ao fazer login com Google.');
    }
  };

  const handleFacebookLogin = async () => {
    const provider = new FacebookAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        createdAt: serverTimestamp(),
      }, { merge: true });
      navigate('/profile');
    } catch (err) {
      console.error(err);
      setError('Erro ao fazer login com Facebook.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          createdAt: serverTimestamp(),
        });
      }
      navigate('/profile');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto py-8 md:py-12 px-4"
    >
      {/* Top Section */}
      <div className="text-center space-y-6 mb-10">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
          className="relative inline-block"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-[#22C55E] to-[#7C3AED] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <Sparkles className="text-white" size={40} />
          </div>
          <div className="absolute -inset-2 bg-gradient-to-br from-[#22C55E] to-[#7C3AED] rounded-2xl blur-xl opacity-30 -z-10 animate-pulse" />
        </motion.div>
        
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
            Bem-vindo ao <span className="text-[#22C55E]">AddonCraft AI</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            {isLogin ? 'Entre para continuar sua jornada criativa' : 'Crie sua conta e comece a construir'}
          </p>
        </div>
      </div>

      {/* Auth Card */}
      <div className="bg-[#111] border border-[#222] rounded-[2rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C3AED]/10 blur-3xl rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#22C55E]/10 blur-3xl rounded-full -ml-16 -mb-16" />

        <form onSubmit={handleEmailAuth} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#22C55E] transition-colors" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/50 transition-all outline-none"
                placeholder="Digite seu email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#22C55E] transition-colors" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#222] rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/50 transition-all outline-none"
                placeholder="Digite sua senha"
              />
            </div>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-red-500 text-xs font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-4 bg-[#22C55E] text-black font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.2)]"
          >
            {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
          </motion.button>
        </form>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#222]"></div></div>
          <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.3em]"><span className="bg-[#111] px-4 text-gray-500">ou continue com</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#1a1a1a', borderColor: '#7C3AED' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoogleLogin}
            className="py-3.5 bg-[#0a0a0a] text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 border border-[#222]"
          >
            <Chrome size={20} className="text-[#7C3AED]" />
            <span className="text-xs">Google</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: '#1a1a1a', borderColor: '#7C3AED' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFacebookLogin}
            className="py-3.5 bg-[#0a0a0a] text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 border border-[#222]"
          >
            <Facebook size={20} className="text-[#7C3AED]" />
            <span className="text-xs">Facebook</span>
          </motion.button>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 relative z-10">
          <p className="text-gray-500 text-xs font-medium">
            {isLogin ? 'Não tem conta?' : 'Já tem uma conta?'}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-[#22C55E] font-bold hover:underline uppercase tracking-tighter"
            >
              {isLogin ? 'Criar conta' : 'Fazer Login'}
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
