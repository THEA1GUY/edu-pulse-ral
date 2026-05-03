import { ShaderAnimation } from "@/components/ui/shader-animation";
import { DiaTextReveal } from "@/components/ui/dia-text-reveal";
import { motion } from "motion/react";
import { Sparkles, Brain, Zap, Globe, Cpu, ArrowRight } from "lucide-react";

interface DemoOneProps {
  onLaunch: () => void;
  theme?: 'light' | 'dark';
}

export default function DemoOne({ onLaunch, theme = 'dark' }: DemoOneProps) {
  const isLight = theme === 'light';

  return (
    <div className={`relative flex h-screen min-h-[700px] w-screen flex-col items-center justify-center overflow-hidden transition-colors duration-500 ${isLight ? 'bg-slate-50' : 'bg-black'}`}>
      <ShaderAnimation theme={theme} />
      
      <div className={`absolute inset-0 pointer-events-none ${isLight ? 'bg-gradient-to-b from-white/20 via-white/40 to-slate-50' : 'bg-gradient-to-b from-transparent via-transparent to-[#020617]'}`} />

      <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.5, 
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          className="badge-ai"
        >
          <Sparkles size={14} className="inline mr-2" />
          Powered by Agentic AI
        </motion.div>

        <h1 className={`text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <DiaTextReveal 
            text="The Pulse of Education" 
            textColor={isLight ? "#0f172a" : "#ffffff"}
            duration={2.5}
            delay={0.2}
            repeat={true}
            repeatDelay={1.5}
          />
        </h1>

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className={`max-w-2xl text-xl md:text-2xl font-medium leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-400'}`}
        >
          Transforming learning with <span className={isLight ? 'text-indigo-600 font-bold' : 'text-white'}>adaptive intelligence</span> and real-time insights for the next generation of educators.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="flex flex-col items-center gap-4 my-12"
        >
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-slate-500">Scroll to explore</span>
          <div className="w-px h-16 bg-gradient-to-b from-indigo-500 to-transparent opacity-50" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="flex flex-col sm:flex-row gap-6"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary" 
            onClick={onLaunch}
            style={{ width: 'auto', padding: '1.25rem 3.5rem' }}
          >
            Launch Dashboard
            <ArrowRight size={20} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary" 
            style={{ padding: '1.25rem 3.5rem' }}
          >
            Watch Demo
          </motion.button>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { icon: <Brain />, top: "20%", left: "15%", delay: 0 },
          { icon: <Zap />, top: "60%", right: "15%", delay: 1 },
          { icon: <Globe />, top: "15%", right: "20%", delay: 2 },
          { icon: <Cpu />, top: "70%", left: "20%", delay: 3 },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1],
              y: [0, -20, 0],
              x: [0, 10, 0]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity, 
              delay: item.delay,
              ease: "easeInOut"
            }}
            className={isLight ? "absolute text-indigo-600/30" : "absolute text-indigo-500/20"}
            style={{ top: item.top, left: item.left, right: item.right }}
          >
            {item.icon}
          </motion.div>
        ))}
      </div>

      {/* Floating Elements (Bottom portion cleaned up) */}
    </div>
  )
}
