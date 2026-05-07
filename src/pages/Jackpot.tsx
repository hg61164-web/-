import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp, runTransaction, doc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Trophy, Zap, AlertCircle, Loader2, Coins, History, Swords } from 'lucide-react';

interface Attempt {
  id: string;
  username: string;
  is_winner: boolean;
  created_at: any;
}

export default function Jackpot() {
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [recentAttempts, setRecentAttempts] = useState<Attempt[]>([]);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [showResult, setShowResult] = useState(false);

  const attemptCost = 1;
  const prizeAmount = 10000;

  useEffect(() => {
    if (!auth.currentUser) return;

    // User balance
    const unsubUser = onSnapshot(doc(db, 'users', auth.currentUser.uid), (doc) => {
      if (doc.exists()) setBalance(doc.data().balance);
    });

    // Recent attempts
    const q = query(
      collection(db, 'jackpot_attempts'),
      orderBy('created_at', 'desc'),
      limit(10)
    );
    const unsubAttempts = onSnapshot(q, (snapshot) => {
      setRecentAttempts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Attempt[]);
    });

    return () => { unsubUser(); unsubAttempts(); };
  }, []);

  const playJackpot = async () => {
    if (!auth.currentUser || balance < attemptCost) {
      alert('رصيد غير كافٍ');
      return;
    }

    setLoading(true);
    setGameResult(null);

    const userRef = doc(db, 'users', auth.currentUser.uid);
    const attemptRef = doc(collection(db, 'jackpot_attempts'));
    const txRef = doc(collection(db, 'transactions'));

    try {
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("User does not exist");
        
        const currentBalance = userDoc.data().balance;
        if (currentBalance < attemptCost) throw new Error("Insufficient balance");

        // 1 in 100 chance
        const isWinner = Math.random() < 0.01;
        const winAmount = isWinner ? prizeAmount : 0;
        const newBalance = currentBalance - attemptCost + winAmount;

        transaction.update(userRef, { 
          balance: newBalance,
          total_profit: (userDoc.data().total_profit || 0) + winAmount
        });

        transaction.set(attemptRef, {
          userId: auth.currentUser?.uid,
          username: auth.currentUser?.displayName || 'لاعب مجهول',
          cost: attemptCost,
          win_amount: winAmount,
          is_winner: isWinner,
          created_at: serverTimestamp(),
        });

        transaction.set(txRef, {
          userId: auth.currentUser?.uid,
          amount: attemptCost,
          type: 'jackpot_cost',
          status: 'completed',
          created_at: serverTimestamp(),
        });

        if (isWinner) {
          const winTxRef = doc(collection(db, 'transactions'));
          transaction.set(winTxRef, {
            userId: auth.currentUser?.uid,
            amount: winAmount,
            type: 'jackpot_win',
            status: 'completed',
            created_at: serverTimestamp(),
          });
        }

        setGameResult(isWinner ? 'win' : 'lose');
      });

      setShowResult(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'jackpot_attempts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-6 px-6 max-w-lg mx-auto bg-black min-h-screen text-white font-sans">
      {/* Jackpot Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white/5 rounded-[32px] p-8 mb-8 text-center border border-white/10 overflow-hidden shadow-2xl"
      >
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-crypto-green/10 blur-[60px]"></div>
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-purple-500/10 blur-[60px]"></div>
        
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
          transition={{ repeat: Infinity, duration: 5 }}
          className="relative z-10 w-20 h-20 bg-crypto-green rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-neon"
        >
          <Trophy size={40} className="text-black" strokeWidth={2.5} />
        </motion.div>

        <h2 className="text-xs text-crypto-green font-bold uppercase tracking-[4px] mb-2 font-poppins">Grand Prize</h2>
        <h1 className="text-5xl font-black font-poppins mb-8 tracking-tighter text-white tabular-nums">
          10,000 <span className="text-lg text-crypto-green">USDT</span>
        </h1>

        <div className="flex bg-white/5 rounded-2xl p-4 border border-white/5 justify-between items-center mb-8 relative z-10 backdrop-blur-md">
          <div className="text-right">
            <p className="text-[10px] text-gray-500 font-tajawal uppercase mb-1">تكلفة المحاولة</p>
            <p className="font-bold flex items-center gap-1 font-poppins">
              <Coins size={14} className="text-crypto-green" />
              1.00 USDT
            </p>
          </div>
          <div className="h-8 w-[1px] bg-white/10"></div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 font-tajawal uppercase mb-1">رصيدك الحالي</p>
            <p className="font-bold text-white font-poppins">{balance.toLocaleString()} USDT</p>
          </div>
        </div>

        <button
          onClick={playJackpot}
          disabled={loading || balance < attemptCost}
          className="relative z-10 w-full bg-crypto-green text-black font-black py-5 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-neon-strong font-cairo text-lg"
        >
          {loading ? <Loader2 className="animate-spin mx-auto" /> : <span className="flex items-center justify-center gap-2">جرب حظك الآن <Zap size={20} fill="currentColor" /></span>}
        </button>
      </motion.div>

      {/* Probability Alert */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3 items-start mb-8">
        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
        <p className="text-[11px] text-amber-500/80 font-tajawal leading-relaxed">
          فرصة الفوز بالجائزة الكبرى هي 1٪ لكل محاولة. يتم اختيار الفائزين عشوائياً بواسطة خوارزمية ذكية تضمن النزاهة التامة.
        </p>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <History size={16} className="text-green-500" />
            <h3 className="font-bold font-cairo text-sm">نشاط اللاعبين</h3>
          </div>
          <span className="text-[10px] text-gray-500 font-tajawal">آخر 10 محاولات</span>
        </div>
        
        <div className="space-y-3">
          {recentAttempts.map((attempt) => (
            <div key={attempt.id} className="bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${attempt.is_winner ? 'bg-crypto-green/20 text-crypto-green shadow-[0_0_10px_rgba(51,204,102,0.2)]' : 'bg-white/5 text-gray-500'}`}>
                  {attempt.is_winner ? <Trophy size={20} /> : <Swords size={20} />}
                </div>
                <div>
                  <p className="text-sm font-bold font-tajawal text-white">{attempt.username}</p>
                  <p className="text-[10px] text-gray-500 font-poppins">
                    {attempt.created_at?.toDate ? attempt.created_at.toDate().toLocaleTimeString('ar-EG') : ''}
                  </p>
                </div>
              </div>
              <div>
                {attempt.is_winner ? (
                  <span className="text-[10px] bg-crypto-green text-black font-black px-3 py-1 rounded-full shadow-neon">WINNER</span>
                ) : (
                  <span className="text-[10px] text-gray-500 font-poppins uppercase tracking-widest opacity-50">Lost</span>
                )}
              </div>
            </div>
          ))}
          {recentAttempts.length === 0 && (
            <div className="text-center py-8 opacity-20">
              <p className="text-xs font-tajawal">لا يوجد نشاط حالياً</p>
            </div>
          )}
        </div>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResult(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className={`relative glass p-10 rounded-[48px] text-center w-full max-w-sm ${gameResult === 'win' ? 'border-amber-500' : 'border-red-500/20'}`}
            >
              {gameResult === 'win' ? (
                <>
                  <motion.div
                    animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 text-black shadow-[0_0_50px_rgba(245,158,11,0.5)]"
                  >
                    <Trophy size={48} />
                  </motion.div>
                  <h2 className="text-3xl font-black font-cairo mb-4 text-amber-500">مبارك لك!</h2>
                  <p className="text-gray-300 font-tajawal mb-8">
                    لقد فزت بمبلغ <span className="text-green-500 font-bold">10,000 USDT</span>. تم إضافة المبلغ إلى رصيدك فوراً.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <Swords size={32} />
                  </div>
                  <h2 className="text-2xl font-bold font-cairo mb-4">حظاً أوفر!</h2>
                  <p className="text-gray-400 font-tajawal mb-8 leading-relaxed">
                    لم يحالفك الحظ هذه المرة. تذكر أن كل محاولة تقربك أكثر من الجائزة الكبرى.
                  </p>
                </>
              )}
              <button
                onClick={() => setShowResult(false)}
                className="w-full bg-white text-black font-bold py-4 rounded-2xl font-cairo"
              >
                إغلاق
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
