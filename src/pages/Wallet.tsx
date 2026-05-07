import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { 
  Wallet as WalletIcon, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  History, 
  ChevronRight, 
  RefreshCw,
  Plus,
  Minus
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface UserData {
  balance: number;
  total_profit: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'jackpot_cost' | 'jackpot_win';
  amount: number;
  status: string;
  created_at: any;
}

export default function Wallet() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'deposit') setActiveTab('deposit');
    if (tab === 'withdraw') setActiveTab('withdraw');
    if (tab === 'history') setActiveTab('history');
  }, [location]);

  useEffect(() => {
    if (!auth.currentUser) return;

    // User data
    const unsubUser = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
      if (doc.exists()) setUserData(doc.data() as UserData);
    });

    // Transactions
    const q = query(
      collection(db, 'transactions'), 
      where('userId', '==', auth.currentUser.uid),
      orderBy('created_at', 'desc')
    );
    const unsubTx = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[]);
    });

    return () => { unsubUser(); unsubTx(); };
  }, []);

  const handleWithdraw = async () => {
    if (!auth.currentUser || !userData) return;
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      alert('الرجاء إدخال مبلغ صحيح');
      return;
    }

    if (amount > userData.balance) {
      alert('رصيدك غير كافٍ لهذا السحب');
      return;
    }

    if (!walletAddress) {
      alert('الرجاء إدخال عنوان المحفظة');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'withdrawals'), {
        userId: auth.currentUser.uid,
        username: auth.currentUser.displayName,
        amount,
        wallet_address: walletAddress,
        status: 'pending',
        created_at: serverTimestamp()
      });
      
      setWithdrawAmount('');
      setWalletAddress('');
      alert('تم إرسال طلب السحب بنجاح. سيتم تطبيق عمولة 20% ومراجعة الطلب قبل التنفيذ.');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء إرسال طلب السحب.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-6 px-6 max-w-lg mx-auto bg-black min-h-screen text-white font-sans">
      {/* Wallet Balance Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white/5 rounded-[32px] p-8 mb-8 text-center border border-white/10 overflow-hidden shadow-2xl"
      >
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-crypto-green/10 blur-[80px]"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 bg-crypto-green rounded-full flex items-center justify-center mx-auto mb-4 border border-black shadow-neon">
            <WalletIcon className="text-black" size={32} strokeWidth={2.5} />
          </div>
          <p className="text-gray-400 font-tajawal mb-2">إجمالي الرصيد</p>
          <div className="flex items-baseline justify-center gap-2">
            <h1 className="text-5xl font-bold font-poppins text-white tabular-nums">{userData?.balance?.toLocaleString() || '0.00'}</h1>
            <span className="text-crypto-green font-bold uppercase">USDT</span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex bg-white/5 p-1.5 rounded-[22px] mb-8 border border-white/5 backdrop-blur-md">
        {[
          { id: 'deposit', label: 'إيداع', icon: Plus },
          { id: 'withdraw', label: 'سحب', icon: Minus },
          { id: 'history', label: 'سجل', icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[16px] font-cairo text-sm transition-all duration-300 ${
              activeTab === tab.id ? 'bg-crypto-green text-black font-bold shadow-neon' : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        {activeTab === 'deposit' && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl"></div>
              <div className="flex items-center gap-3 mb-6 relative">
                <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-500">
                  <RefreshCw size={20} />
                </div>
                <h3 className="font-bold font-cairo text-white">الإيداع عبر USDT <span className="text-blue-400">(TRC20)</span></h3>
              </div>
              <p className="text-gray-400 text-sm font-tajawal mb-8 leading-relaxed opacity-80">
                لإضافة رصيد إلى محفظتك، يرجى التوجه إلى صفحة الاستثمار واختيار الباقة التي ترغب في شرائها. سيتم إضافة مبلغ الباقة إلى رصيدك وتفعيلها فور تأكيد العملية.
              </p>
              <button 
                onClick={() => window.location.href = '/investment'}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 font-bold font-cairo text-white hover:bg-blue-500 hover:text-white hover:border-transparent transition-all flex items-center justify-center gap-2 group"
              >
                اذهب لاختيار باقة
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'withdraw' && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 shadow-2xl relative">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center text-red-500">
                  <ArrowDownCircle size={20} />
                </div>
                <h3 className="font-bold font-cairo text-white">طلب سحب جديد</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-tajawal text-gray-400 mb-2 mr-1 uppercase tracking-wider">المبلغ المراد سحبه (USDT)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-red-500/50 transition-colors text-right font-poppins text-lg"
                    placeholder="0.00"
                  />
                  <p className="text-[10px] text-gray-500 mt-2 text-right opacity-60">سيتم خصم 20% عمولة إدارية عند التنفيذ.</p>
                </div>

                <div>
                  <label className="block text-xs font-tajawal text-gray-400 mb-2 mr-1 uppercase tracking-wider">عنوان محفظة السحب (TRC20)</label>
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-red-500/50 transition-colors text-right font-mono text-sm"
                    placeholder="T..."
                  />
                </div>

                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex justify-between text-xs font-tajawal">
                    <span className="text-gray-400">العمولة (20%)</span>
                    <span className="text-red-400 font-poppins">-{parseFloat(withdrawAmount || '0') * 0.2} USDT</span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-sm items-center">
                    <span className="text-gray-400">المبلغ المستلم</span>
                    <span className="text-crypto-green text-xl font-poppins">{parseFloat(withdrawAmount || '0') * 0.8} USDT</span>
                  </div>
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={loading}
                  className="w-full bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 font-bold py-4 rounded-2xl font-cairo shadow-lg shadow-red-500/10"
                >
                  {loading ? 'جاري الإرسال...' : 'تأكيد طلب السحب'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-20 opacity-10">
                <History className="mx-auto mb-4" size={64} />
                <p className="font-tajawal text-xl">لا توجد عمليات سابقة</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'jackpot_win' ? 'bg-crypto-green/20 text-crypto-green shadow-[0_0_10px_rgba(51,204,102,0.1)]' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'jackpot_win' ? <Plus size={18} /> : <Minus size={18} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm font-cairo text-white">
                        {tx.type === 'deposit' && 'إيداع رصيد'}
                        {tx.type === 'withdrawal' && 'طلب سحب'}
                        {tx.type === 'profit' && 'أرباح استثمار'}
                        {tx.type === 'jackpot_cost' && 'مشاركة في الجاكبوت'}
                        {tx.type === 'jackpot_win' && 'فوز بالجاكبوت'}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-poppins opacity-70">
                        {tx.created_at?.toDate ? tx.created_at.toDate().toLocaleString('ar-EG') : 'جاري التحميل...'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold font-poppins text-base ${
                      tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'jackpot_win' ? 'text-crypto-green' : 'text-red-400'
                    }`}>
                      {tx.type === 'deposit' || tx.type === 'profit' || tx.type === 'jackpot_win' ? '+' : '-'}{tx.amount}
                    </p>
                    <p className={`text-[9px] font-tajawal font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                      tx.status === 'approved' ? 'bg-crypto-green/10 text-crypto-green' : tx.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {tx.status === 'approved' && 'مكتمل'}
                      {tx.status === 'pending' && 'قيد الانتظار'}
                      {tx.status === 'rejected' && 'مرفوض'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Add the doc import that was missing
import { doc } from 'firebase/firestore';
