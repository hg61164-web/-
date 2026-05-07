import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { 
  Wallet, 
  TrendingUp, 
  Star, 
  ArrowUpRight, 
  ArrowDownLeft, 
  LayoutGrid, 
  Trophy,
  Bell,
  ChevronRight,
  Gamepad
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

interface UserData {
  balance: number;
  total_profit: number;
  daily_profit: number;
  vip_level: number;
  username: string;
}

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
      if (doc.exists()) {
        setUserData(doc.data() as UserData);
      }
    });

    return () => unsubscribe();
  }, []);

  const stats = [
    { label: 'الأرباح اليومية', value: userData?.daily_profit || 0, icon: TrendingUp, color: 'text-green-400' },
    { label: 'إجمالي الأرباح', value: userData?.total_profit || 0, icon: Star, color: 'text-yellow-400' },
  ];

  return (
    <div className="pb-24 pt-6 px-6 max-w-lg mx-auto bg-black min-h-screen text-white font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <Logo size="sm" />
        <div className="flex items-center gap-4">
          <div className="bg-white/5 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
            <div className="w-2 h-2 bg-crypto-green rounded-full animate-pulse"></div>
            <span className="text-[10px] text-gray-400 font-tajawal">خادم نشط</span>
          </div>
          <button className="w-10 h-10 rounded-full glass flex items-center justify-center relative">
            <Bell size={20} className="text-gray-400" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-black animate-pulse"></span>
          </button>
        </div>
      </header>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white/5 rounded-[32px] p-8 border border-white/10 overflow-hidden shadow-2xl mb-8"
      >
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-crypto-green/10 blur-[50px]"></div>
        <p className="text-gray-400 text-sm mb-2 font-tajawal">إجمالي الرصيد</p>
        <h2 className="text-4xl font-bold mb-6 tabular-nums font-poppins flex items-center gap-2">
          {userData?.balance?.toLocaleString() || '0.00'} 
          <span className="text-crypto-green text-lg uppercase">USDT</span>
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <Link to="/wallet?tab=deposit" className="bg-crypto-green text-black font-bold p-4 rounded-2xl flex flex-col items-center gap-2 shadow-[0_0_20px_rgba(51,204,102,0.3)] hover:brightness-110 transition-all font-tajawal">
            <ArrowUpRight size={20} />
            <span className="text-sm">إيداع</span>
          </Link>
          <Link to="/wallet?tab=withdraw" className="bg-white/5 text-white border border-white/10 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/10 transition-all font-tajawal">
            <ArrowDownLeft size={20} />
            <span className="text-sm">سحب</span>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center transition-all hover:bg-white/10">
          <p className="text-[10px] text-gray-500 uppercase mb-1 font-tajawal">ربح اليوم</p>
          <p className="text-crypto-green font-bold font-poppins text-lg">+{userData?.daily_profit || 0}</p>
        </div>
        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center transition-all hover:bg-white/10">
          <p className="text-[10px] text-gray-500 uppercase mb-1 font-tajawal">الإجمالي</p>
          <p className="text-white font-bold font-poppins text-lg">+{userData?.total_profit || 0}</p>
        </div>
      </div>

      {/* Fast Access */}
      <div className="mb-8 p-6 glass rounded-[32px]">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-lg font-bold font-cairo">الوصول السريع</h3>
          <p className="text-crypto-green text-sm cursor-pointer font-tajawal">عرض الكل</p>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: LayoutGrid, label: 'VIP', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30', path: '/profile' },
            { icon: TrendingUp, label: 'باقات', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30', path: '/investment' },
            { icon: Gamepad, label: 'Jackpot', color: 'bg-purple-500/20 text-purple-500 border-purple-500/30', path: '/jackpot' },
            { icon: Trophy, label: 'جوائز', color: 'bg-crypto-green/20 text-crypto-green border-crypto-green/30', path: '/jackpot' },
          ].map((item) => (
            <Link key={item.label} to={item.path} className="flex flex-col items-center gap-2 group">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.color} border transition-transform group-hover:scale-110 group-active:scale-95`}>
                <item.icon size={24} />
              </div>
              <span className="text-[10px] text-gray-400 font-tajawal">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Special Offer */}
      <div className="bg-gradient-to-l from-orange-600/20 to-transparent border border-orange-500/30 rounded-[32px] p-6 flex items-center justify-between mb-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl -z-10 group-hover:bg-orange-500/20 transition-all"></div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-orange-500/20">🎰</div>
          <div>
            <h4 className="font-bold font-cairo text-sm">الجائزة الكبرى: <span className="text-orange-500">10,000 USDT</span></h4>
            <p className="text-xs text-gray-400 font-tajawal">شارك الآن مقابل 1 USDT فقط</p>
          </div>
        </div>
        <Link to="/jackpot" className="bg-white text-black px-4 py-2 rounded-xl font-bold text-xs transition-all hover:bg-gray-200">العب الآن</Link>
      </div>
    </div>
  );
}
