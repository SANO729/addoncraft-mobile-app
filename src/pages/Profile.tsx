import { useState, useEffect } from 'react';
import { User, signOut } from 'firebase/auth';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { MinecraftAddonFile } from '../services/geminiService';
import { createMcPack, downloadBlob } from '../services/addonGenerator';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Trash2, Download, LogOut, User as UserIcon, Settings, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Addon {
  id: string;
  name: string;
  description: string;
  files: MinecraftAddonFile[];
  createdAt: any;
}

interface ProfileProps {
  user: User | null;
}

export function Profile({ user }: ProfileProps) {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchUserAddons();
  }, [user]);

  const fetchUserAddons = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'addons'),
        where('authorId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const fetchedAddons = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Addon[];
      setAddons(fetchedAddons);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addonId: string) => {
    if (!confirm('Tem certeza que deseja excluir este addon?')) return;
    try {
      await deleteDoc(doc(db, 'addons', addonId));
      setAddons(prev => prev.filter(a => a.id !== addonId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async (addon: Addon) => {
    const blob = await createMcPack({ name: addon.name, description: addon.description, files: addon.files });
    downloadBlob(blob, `${addon.name.toLowerCase().replace(/\s+/g, '_')}.mcpack`);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="space-y-12">
      {/* Profile Header */}
      <header className="bg-[#111] border border-[#222] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="relative">
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#00ff00] to-[#8b5cf6] p-1">
            <div className="w-full h-full rounded-[22px] bg-[#111] flex items-center justify-center overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={48} className="text-gray-500" />
              )}
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 p-2 bg-[#00ff00] text-black rounded-xl shadow-lg">
            <Shield size={16} />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase">{user.displayName || 'Criador'}</h1>
          <p className="text-gray-400 font-medium">{user.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-4">
            <span className="px-4 py-1.5 bg-[#222] rounded-full text-xs font-bold uppercase tracking-widest text-[#00ff00] border border-[#333]">
              {addons.length} Addons Criados
            </span>
            <span className="px-4 py-1.5 bg-[#222] rounded-full text-xs font-bold uppercase tracking-widest text-gray-400 border border-[#333]">
              Membro desde 2026
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="p-3 bg-[#222] text-gray-400 rounded-xl hover:text-white transition-colors border border-[#333]">
            <Settings size={24} />
          </button>
          <button
            onClick={handleLogout}
            className="p-3 bg-[#222] text-gray-400 rounded-xl hover:text-red-500 transition-colors border border-[#333]"
          >
            <LogOut size={24} />
          </button>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ff00]/5 blur-[80px] -z-10" />
      </header>

      {/* User Addons */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3">
            <Package className="text-[#00ff00]" /> Meus Projetos
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-48 bg-[#111] border border-[#222] rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : addons.length === 0 ? (
          <div className="text-center py-24 bg-[#111] border border-[#222] rounded-3xl space-y-4">
            <Package size={48} className="mx-auto text-gray-600" />
            <p className="text-gray-400">Você ainda não criou nenhum addon.</p>
            <button
              onClick={() => navigate('/generator')}
              className="text-[#00ff00] font-bold hover:underline"
            >
              Criar meu primeiro addon →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addons.map((addon) => (
              <motion.div
                key={addon.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111] border border-[#222] rounded-3xl p-6 flex items-center justify-between group hover:border-[#333] transition-all"
              >
                <div className="space-y-1">
                  <h3 className="text-xl font-bold group-hover:text-[#00ff00] transition-colors">{addon.name}</h3>
                  <p className="text-gray-500 text-sm line-clamp-1">{addon.description}</p>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest pt-2">
                    {addon.createdAt?.toDate().toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(addon)}
                    className="p-3 bg-[#222] text-white rounded-xl hover:bg-[#333] transition-colors border border-[#333]"
                  >
                    <Download size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(addon.id)}
                    className="p-3 bg-[#222] text-gray-400 rounded-xl hover:text-red-500 transition-colors border border-[#333]"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
