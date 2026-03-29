import { useState } from 'react';
import { User } from 'firebase/auth';
import { generateMinecraftAddon } from '../services/geminiService';
import { createMcPack, downloadBlob } from '../services/addonGenerator';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Upload, Loader2, AlertCircle, Download, FileCode } from 'lucide-react';

interface JavaConverterProps {
  user: User | null;
}

export function JavaConverter({ user }: JavaConverterProps) {
  const [modName, setModName] = useState('');
  const [modDescription, setModDescription] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!modName.trim()) return;
    
    setIsConverting(true);
    setError(null);
    setResult(null);

    try {
      // We use the same generation logic but with a specific prompt for conversion
      const prompt = `Convert this Java Edition mod to Bedrock Edition. 
      Mod Name: ${modName}
      Description: ${modDescription}
      
      Focus on recreating the core items, blocks, and entities in Bedrock format.`;
      
      const addon = await generateMinecraftAddon(prompt);
      setResult(addon);
    } catch (err) {
      console.error(err);
      setError('Erro ao converter o mod. Tente novamente.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = async () => {
    if (!result) return;
    const blob = await createMcPack(result);
    downloadBlob(blob, `${result.name.toLowerCase().replace(/\s+/g, '_')}_converted.mcpack`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="text-center space-y-4">
        <div className="inline-block p-3 rounded-2xl bg-yellow-400/10 text-yellow-400 mb-2">
          <Zap size={32} />
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase">Conversor Java → Bedrock</h1>
        <p className="text-gray-400">Nossa IA analisa mods Java e tenta recriar as funcionalidades para Minecraft PE.</p>
      </header>

      <div className="bg-[#111] border border-[#222] rounded-3xl p-8 space-y-6 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nome do Mod Java</label>
            <input
              type="text"
              value={modName}
              onChange={(e) => setModName(e.target.value)}
              placeholder="Ex: Twilight Forest"
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-2xl py-3 px-4 text-white focus:border-yellow-400 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Arquivo .jar (Opcional)</label>
            <div className="relative group">
              <input
                type="file"
                accept=".jar"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="w-full bg-[#0a0a0a] border border-[#222] border-dashed rounded-2xl py-3 px-4 text-gray-500 flex items-center gap-2 group-hover:border-yellow-400 transition-all">
                <Upload size={18} />
                <span>Selecionar arquivo...</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">O que este mod faz?</label>
          <textarea
            value={modDescription}
            onChange={(e) => setModDescription(e.target.value)}
            placeholder="Descreva os itens, blocos e mobs que você quer converter..."
            className="w-full h-32 bg-[#0a0a0a] border border-[#222] rounded-2xl p-4 text-white focus:border-yellow-400 transition-all resize-none"
          />
        </div>

        <button
          onClick={handleConvert}
          disabled={isConverting || !modName.trim()}
          className="w-full py-4 bg-yellow-400 text-black font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(250,204,21,0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {isConverting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Convertendo...
            </>
          ) : (
            <>
              <Zap size={20} />
              Iniciar Conversão
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111] border border-[#222] rounded-3xl p-8 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-yellow-400">Conversão Concluída!</h2>
                <p className="text-gray-400">Recriamos {result.files.length} arquivos para Bedrock.</p>
              </div>
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-xl hover:shadow-[0_0_15px_rgba(250,204,21,0.3)] transition-all flex items-center gap-2"
              >
                <Download size={18} />
                Baixar .mcpack
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.files.map((file: any, idx: number) => (
                <div key={idx} className="p-4 bg-[#0a0a0a] border border-[#222] rounded-xl flex items-center gap-3">
                  <FileCode size={18} className="text-yellow-400/50" />
                  <span className="text-sm font-mono text-gray-300 truncate">{file.path}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
