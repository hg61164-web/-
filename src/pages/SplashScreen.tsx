import { motion } from 'framer-motion';

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative"
      >
        <div className="w-24 h-24 bg-green-500 rounded-2xl flex items-center justify-center transform rotate-12 neon-glow">
          <span className="text-black font-bold text-4xl transform -rotate-12">T+</span>
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -inset-4 bg-green-500/20 blur-2xl rounded-full"
        />
      </motion.div>
      
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-3xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent font-cairo"
      >
        تداول بلس
      </motion.h1>
      
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "200px" }}
        transition={{ delay: 0.8, duration: 1.5 }}
        className="mt-6 h-1 w-[200px] bg-green-500/20 rounded-full overflow-hidden"
      >
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          className="h-full w-1/2 bg-green-500 shadow-[0_0_15px_rgba(51,204,102,1)]"
        />
      </motion.div>
    </div>
  );
}
