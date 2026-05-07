import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <motion.h1
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-9xl font-black font-poppins text-white/5 mb-[-2rem]"
      >
        404
      </motion.h1>
      <h2 className="text-2xl font-bold font-cairo mb-4">عذراً، الصفحة غير موجودة</h2>
      <p className="text-gray-500 font-tajawal mb-8">ربما تم حذف الصفحة أو الرابط غير صحيح.</p>
      <Link
        to="/"
        className="flex items-center gap-2 bg-green-500 text-black font-bold px-8 py-4 rounded-2xl font-cairo shadow-lg shadow-green-500/10"
      >
        <Home size={20} />
        العودة للرئيسية
      </Link>
    </div>
  );
}
