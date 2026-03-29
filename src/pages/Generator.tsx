import { useState } from 'react';
import { User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { generateMinecraftAddon, GeneratedAddon } from '../services/geminiService';
import { createMcPack, downloadBlob } from '../services/addonGenerator';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Download, Save, FileJson, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GeneratorProps {
  user: User | null;
}

export function Generator({ user }: GeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [addon, setAddon] = useState<GeneratedAddon | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setAddon(null);

    try {
      const result = await generateMinecraftAddon(prompt);
      setAddon(result);
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao gerar o addon. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!addon) return;
    const blob = await createMcPack(addon);
    downloadBlob(blob, `${addon.name.toLowerCase().replace(/\s+/g, '_')}.mcpack`);
  };

  const handleSave = async () => {
    if (!user || !addon) {
      navigate('/auth');
      return;
    }

    setIsSaving(true);
    try {
      await addDoc(collection(db, 'addons'), {
        authorId: user.uid,
        authorName: user.displayName || 'Anônimo',
        name: addon.name,
        description: addon.description,
        prompt: prompt,
        files: addon.files,
        likes: 0,
        isPublic: true,
        createdAt: serverTimestamp(),
      });
      alert('Addon salvo com sucesso na biblioteca!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar addon.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-black tracking-tighter">CRIADOR DE ADDONS IA</h1>
        <p className="text-gray-400">Descreva o que você quer criar e deixe a IA fazer o resto.</p>
      </header>

      {/* Input Section */}
      <div className="bg-[#111] border border-[#222] rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Seu Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Uma espada de diamante que solta raios ao bater em mobs..."
            className="w-full h-32 bg-[#0a0a0a] border border-[#222] rounded-2xl p-4 text-white placeholder-gray-600 focus:border-[#00ff00] focus:ring-1 focus:ring-[#00ff00] transition-all resize-none"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-4 bg-[#00ff00] text-black font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(0,255,0,0.3)] disabled:opacity-50 disabled:hover:shadow-none transition-all flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Gerando Addon...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Gerar Addon
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Section */}
      <AnimatePresence>
        {addon && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-[#111] border border-[#222] rounded-3xl p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#00ff00]">{addon.name}</h2>
                  <p className="text-gray-400">{addon.description}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 bg-[#222] text-white font-bold rounded-xl hover:bg-[#333] transition-all flex items-center gap-2 border border-[#333]"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Salvar
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-[#00ff00] text-black font-bold rounded-xl hover:shadow-[0_0_15px_rgba(0,255,0,0.3)] transition-all flex items-center gap-2"
                  >
                    <Download size={18} />
                    Baixar .mcpack
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <FileJson size={16} /> Arquivos Gerados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {addon.files.map((file, idx) => (
                    <div key={idx} className="p-4 bg-[#0a0a0a] border border-[#222] rounded-xl flex items-center justify-between group">
                      <span className="text-sm font-mono text-gray-300 truncate mr-4">{file.path}</span>
                      <button 
                        onClick={() => alert(file.content)}
                        className="text-xs text-[#00ff00] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Ver Código
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
