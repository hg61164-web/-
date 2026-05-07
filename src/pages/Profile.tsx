import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { 
  User as UserIcon, 
  Settings, 
  Shield, 
  LogOut, 
  ChevronLeft, 
  Copy, 
  CreditCard,
  Share2,
  Lock,
  MessageCircle,
  LayoutDashboard
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface UserData {
  username: string;
  email: string;
  balance: number;
  vip_level: number;
  referral_code: string;
  is_admin: boolean;
  plan_name?: string;
  created_at: any;
}

export default function Profile() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
      if (doc.exists()) {
        setUserData(doc.data() as UserData);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const copyReferral = () => {
    if (userData?.referral_code) {
      navigator.clipboard.writeText(userData.referral_code);
      alert('تم نسخ الكود بنجاح');
    }
  };

  const menuItems = [
    { label: 'إعدادات الحساب', icon: Settings, color: 'text-gray-400' },
    { label: 'الأمان والخصوصية', icon: Shield, color: 'text-blue-400' },
    { label: 'وسائل الدفع', icon: CreditCard, color: 'text-gray-400' },
    { label: 'تواصل معنا', icon: MessageCircle, color: 'text-green-400' },
  ];

  return (
    <div className="pb-24 pt-6 px-6 max-w-lg mx-auto bg-black min-h-screen text-white font-sans">
      {/* Profile Header */}
      <div className="flex flex-col items-center mb-10 pt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-6"
        >
          <div className="w-28 h-28 rounded-[40px] bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-crypto-green/5 blur-2xl group-hover:bg-crypto-green/10 transition-colors"></div>
            <UserIcon size={56} className="text-crypto-green relative z-10" strokeWidth={1.5} />
          </div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute -bottom-2 -right-2 w-10 h-10 bg-crypto-green border-4 border-black rounded-2xl flex items-center justify-center text-black font-black text-sm shadow-neon"
          >
            {userData?.vip_level || 0}
          </motion.div>
        </motion.div>
        <h2 className="text-2xl font-bold font-cairo text-white">{userData?.username || 'جاري التحميل...'}</h2>
        <p className="text-gray-500 text-sm font-poppins mt-1">{userData?.email || 'guest@tplus.com'}</p>
        
        {userData?.is_admin && (
          <Link 
            to="/admin"
            className="mt-6 flex items-center gap-2 bg-amber-500/10 text-amber-500 px-6 py-2 rounded-full text-xs font-bold font-cairo border border-amber-500/20 hover:bg-amber-500/20 transition-all shadow-lg shadow-amber-500/5"
          >
            <LayoutDashboard size={16} />
            لوحة تحكم المشرف
          </Link>
        )}
      </div>

      {/* Referral Card */}
      <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-crypto-green/5 blur-3xl"></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <p className="text-xs text-gray-400 font-tajawal uppercase tracking-widest">برنامج الإحالة</p>
          <Share2 size={16} className="text-crypto-green" />
        </div>
        <div className="flex items-center justify-between bg-black/40 rounded-2xl p-4 border border-white/5 relative z-10">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">كود الإحالة الخاص بك</p>
            <p className="font-bold font-poppins text-white text-lg tracking-widest">{userData?.referral_code || '------'}</p>
          </div>
          <button onClick={copyReferral} className="p-3.5 bg-crypto-green text-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-neon">
            <Copy size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Menu List */}
      <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden mb-8 shadow-2xl">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            className={`w-full flex items-center justify-between p-5 hover:bg-white/10 transition-all group ${
              i !== menuItems.length - 1 ? 'border-b border-white/5' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-2.5 bg-white/5 rounded-xl border border-white/5 group-hover:border-white/20 transition-all ${item.color}`}>
                <item.icon size={20} />
              </div>
              <span className="font-cairo text-sm text-gray-300 font-semibold">{item.label}</span>
            </div>
            <ChevronLeft size={18} className="text-gray-600 group-hover:text-white group-hover:-translate-x-1 transition-all" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-black py-5 rounded-[24px] transition-all font-cairo border border-red-500/20 mb-8"
      >
        <LogOut size={20} strokeWidth={2.5} />
        <span>تسجيل الخروج</span>
      </button>

      <div className="text-center opacity-30 pb-4">
        <p className="text-[10px] font-poppins uppercase tracking-[4px] text-gray-400">Tadawul Plus Professional v1.2</p>
      </div>
    </div>
  );
}
