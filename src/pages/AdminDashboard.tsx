import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, onSnapshot, doc, updateDoc, getDoc, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { 
  Users, 
  CreditCard, 
  ArrowDownCircle, 
  Settings as SettingsIcon, 
  Check, 
  X, 
  Eye, 
  TrendingUp,
  LayoutDashboard,
  ShieldCheck,
  Search
} from 'lucide-react';

// Sub-components
import AdminStats from '../components/admin/AdminStats';
import AdminDeposits from '../components/admin/AdminDeposits';
import AdminWithdrawals from '../components/admin/AdminWithdrawals';
import AdminUsers from '../components/admin/AdminUsers';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'stats' | 'deposits' | 'withdrawals' | 'users'>('stats');
  
  return (
    <div className="min-h-screen bg-[#050505] p-6 pb-24 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold font-cairo">لوحة التحكم</h1>
            <p className="text-amber-500/80 text-[10px] font-tajawal uppercase tracking-widest">Administrator Mode</p>
          </div>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          className="p-3 glass rounded-xl text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Admin Tabs */}
      <div className="grid grid-cols-4 gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'stats', label: 'إحصائيات', icon: LayoutDashboard },
          { id: 'deposits', label: 'إيداعات', icon: CreditCard },
          { id: 'withdrawals', label: 'سحوبات', icon: ArrowDownCircle },
          { id: 'users', label: 'مستخدمين', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-2xl font-cairo text-[10px] transition-all min-w-[80px] shadow-sm ${
              activeTab === tab.id ? 'bg-amber-500 text-black font-bold' : 'glass text-gray-500'
            }`}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {activeTab === 'stats' && <AdminStats />}
        {activeTab === 'deposits' && <AdminDeposits />}
        {activeTab === 'withdrawals' && <AdminWithdrawals />}
        {activeTab === 'users' && <AdminUsers />}
      </motion.div>
    </div>
  );
}
