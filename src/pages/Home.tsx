import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Package, Users, ArrowRight } from 'lucide-react';

export function Home() {
  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative py-12 md:py-24 overflow-hidden">
        <div className="relative z-10 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 rounded-full bg-[#00ff00]/10 border border-[#00ff00]/20 text-[#00ff00] text-sm font-medium mb-4"
          >
            Powered by Gemini AI
          </motion.div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none">
            CRIE ADDONS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff00] to-[#8b5cf6]">
              COM INTELIGÊNCIA
            </span>
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Transforme suas ideias em addons funcionais para Minecraft Bedrock em segundos. 
            Sem código, sem complicações, apenas criatividade.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8">
            <Link
              to="/generator"
              className="px-8 py-4 bg-[#00ff00] text-black font-bold rounded-2xl hover:shadow-[0_0_30px_rgba(0,255,0,0.4)] transition-all flex items-center gap-2 group"
            >
              Começar a Criar <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/library"
              className="px-8 py-4 bg-[#222] text-white font-bold rounded-2xl hover:bg-[#333] transition-all border border-[#333]"
            >
              Explorar Biblioteca
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          icon={Sparkles}
          title="IA Addon Creator"
          description="Digite o que você quer e nossa IA gera manifestos, itens, blocos e scripts automaticamente."
          color="text-[#00ff00]"
        />
        <FeatureCard
          icon={Zap}
          title="Conversor Java → Bedrock"
          description="Envie seus mods Java e deixe nossa IA tentar converter para o formato Bedrock (.mcpack)."
          color="text-yellow-400"
        />
        <FeatureCard
          icon={Package}
          title="Exportação Fácil"
          description="Baixe seus projetos diretamente em .mcpack ou .mcaddon prontos para importar no Minecraft."
          color="text-[#8b5cf6]"
        />
      </section>

      {/* Community Teaser */}
      <section className="bg-[#111] border border-[#222] rounded-3xl p-12 text-center space-y-6">
        <Users className="mx-auto text-[#00ff00]" size={48} />
        <h2 className="text-3xl font-bold">Comunidade AddonCraft</h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Junte-se a milhares de criadores. Compartilhe seus addons, receba feedback e descubra criações incríveis de outros jogadores.
        </p>
        <Link to="/library" className="inline-block text-[#00ff00] font-bold hover:underline">
          Ver todos os addons →
        </Link>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-8 bg-[#111] border border-[#222] rounded-3xl space-y-4 hover:border-[#333] transition-all"
    >
      <div className={`p-3 rounded-2xl bg-white/5 w-fit ${color}`}>
        <Icon size={32} />
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}
