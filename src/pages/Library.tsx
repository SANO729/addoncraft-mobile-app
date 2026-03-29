import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { MinecraftAddonFile } from '../services/geminiService';
import { createMcPack, downloadBlob } from '../services/addonGenerator';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Heart, Download, User as UserIcon, Calendar, Package, X } from 'lucide-react';

interface Addon {
  id: string;
  authorId: string;
  authorName: string;
  name: string;
  description: string;
  files: MinecraftAddonFile[];
  likes: number;
  createdAt: any;
}

export function Library() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAddon, setSelectedAddon] = useState<Addon | null>(null);

  useEffect(() => {
    fetchAddons();
  }, []);

  const fetchAddons = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'addons'),
        where('isPublic', '==', true),
        orderBy('createdAt', 'desc'),
        limit(20)
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

  const handleLike = async (addonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, 'addons', addonId), {
        likes: increment(1)
      });
      setAddons(prev => prev.map(a => a.id === addonId ? { ...a, likes: a.likes + 1 } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async (addon: Addon, e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = await createMcPack({ name: addon.name, description: addon.description, files: addon.files });
    downloadBlob(blob, `${addon.name.toLowerCase().replace(/\s+/g, '_')}.mcpack`);
  };

  const filteredAddons = addons.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase">Biblioteca da Comunidade</h1>
          <p className="text-gray-400">Explore e baixe addons criados por outros jogadores.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          <input
            type="text"
            placeholder="Buscar addons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111] border border-[#222] rounded-2xl py-3 pl-12 pr-4 text-white focus:border-[#00ff00] transition-all"
          />
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-[#111] border border-[#222] rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredAddons.map((addon) => (
            <motion.div
              layoutId={addon.id}
              key={addon.id}
              onClick={() => setSelectedAddon(addon)}
              className="group bg-[#111] border border-[#222] rounded-3xl p-6 space-y-4 hover:border-[#00ff00]/50 hover:shadow-[0_0_20px_rgba(0,255,0,0.1)] transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-[#00ff00]/10 text-[#00ff00]">
                  <Package size={24} />
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={(e) => handleLike(addon.id, e)}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Heart size={18} />
                    <span className="text-sm font-bold">{addon.likes}</span>
                  </button>
                  <button
                    onClick={(e) => handleDownload(addon, e)}
                    className="p-2 bg-[#222] text-white rounded-lg hover:bg-[#333] transition-colors"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold group-hover:text-[#00ff00] transition-colors truncate">{addon.name}</h3>
                <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">{addon.description}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#222] text-xs text-gray-500 font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <UserIcon size={14} />
                  {addon.authorName}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  {addon.createdAt?.toDate().toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Addon Detail Modal */}
      <AnimatePresence>
        {selectedAddon && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAddon(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              layoutId={selectedAddon.id}
              className="relative w-full max-w-2xl bg-[#111] border border-[#222] rounded-3xl p-8 space-y-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedAddon(null)}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-[#00ff00]/10 text-[#00ff00]">
                    <Package size={32} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter">{selectedAddon.name}</h2>
                    <p className="text-[#00ff00] font-bold text-sm uppercase tracking-widest">Por {selectedAddon.authorName}</p>
                  </div>
                </div>
                <p className="text-gray-400 text-lg leading-relaxed">{selectedAddon.description}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Estrutura do Addon</h3>
                <div className="grid grid-cols-1 gap-2">
                  {selectedAddon.files.map((file, idx) => (
                    <div key={idx} className="p-4 bg-[#0a0a0a] border border-[#222] rounded-xl flex items-center justify-between">
                      <span className="text-sm font-mono text-gray-300">{file.path}</span>
                      <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">JSON</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={(e) => handleDownload(selectedAddon, e)}
                  className="flex-1 py-4 bg-[#00ff00] text-black font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(0,255,0,0.3)] transition-all flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  Baixar .mcpack
                </button>
                <button
                  onClick={(e) => handleLike(selectedAddon.id, e)}
                  className="px-8 py-4 bg-[#222] text-white font-bold rounded-2xl hover:bg-[#333] transition-all border border-[#333] flex items-center gap-2"
                >
                  <Heart size={20} />
                  {selectedAddon.likes}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
