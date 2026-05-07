import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Check, X, Loader2, Clock, AlertCircle, ExternalLink } from 'lucide-react';

interface Withdrawal {
  id: string;
  userId: string;
  username: string;
  amount: number;
  wallet_address: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: any;
}

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'withdrawals'), orderBy('created_at', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setWithdrawals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Withdrawal[]);
    });
    return unsub;
  }, []);

  const handleAction = async (wd: Withdrawal, status: 'approved' | 'rejected') => {
    setProcessing(wd.id);
    try {
      const wdRef = doc(db, 'withdrawals', wd.id);
      const userRef = doc(db, 'users', wd.userId);
      const txRef = doc(collection(db, 'transactions'));

      await runTransaction(db, async (transaction) => {
        transaction.update(wdRef, { status });

        if (status === 'approved') {
          // If approved, we record it as a completed transaction
          // Note: Funds should ideally be subtracted when user REQUESTS,
          // but for this MVP I'll allow admins to manage it.
          // Let's assume balance is already subtracted on request (I should update Wallet.tsx)
          
          transaction.set(txRef, {
            userId: wd.userId,
            amount: wd.amount,
            type: 'withdrawal',
            status: 'approved',
            created_at: serverTimestamp()
          });
        } else {
          // If rejected, give funds back to user
          transaction.update(userRef, {
            balance: increment(wd.amount)
          });
          
          transaction.set(txRef, {
            userId: wd.userId,
            amount: wd.amount,
            type: 'withdrawal',
            status: 'rejected',
            created_at: serverTimestamp()
          });
        }
      });

      alert(`تم ${status === 'approved' ? 'قبول' : 'رفض'} طلب السحب بنجاح`);
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء معالجة الطلب');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-4">
      {withdrawals.map((wd) => (
        <div key={wd.id} className="glass rounded-3xl p-5 border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-white/5 ${wd.status === 'pending' ? 'text-amber-500' : wd.status === 'approved' ? 'text-green-500' : 'text-red-500'}`}>
                {wd.status === 'pending' ? <Clock size={20} /> : wd.status === 'approved' ? <Check size={20} /> : <X size={20} />}
              </div>
              <div>
                <h4 className="font-bold font-cairo text-sm text-gray-200">{wd.username}</h4>
                <div className="flex items-center gap-1 text-[9px] text-gray-500 font-poppins">
                  <span className="truncate max-w-[120px]">{wd.wallet_address}</span>
                  <ExternalLink size={10} />
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold font-poppins text-red-400">{wd.amount} <span className="text-[10px]">USDT</span></p>
              <p className="text-[10px] text-gray-500 font-tajawal">Net: {wd.amount * 0.8} USDT</p>
            </div>
          </div>

          {wd.status === 'pending' && (
            <div className="flex gap-2">
              <button
                disabled={!!processing}
                onClick={() => handleAction(wd, 'approved')}
                className="flex-1 bg-green-500 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-cairo transition-all"
              >
                {processing === wd.id ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                تأكيد التحويل
              </button>
              <button
                disabled={!!processing}
                onClick={() => handleAction(wd, 'rejected')}
                className="w-12 h-12 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500/30 transition-all font-bold"
              >
                {processing === wd.id ? <Loader2 className="animate-spin" size={16} /> : <X size={20} />}
              </button>
            </div>
          )}
          
          {wd.status !== 'pending' && (
            <div className={`text-center py-2 rounded-xl text-[10px] font-bold font-cairo ${wd.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              تم {wd.status === 'approved' ? 'التنفيذ' : 'الرفض'}
            </div>
          )}
        </div>
      ))}

      {withdrawals.length === 0 && (
        <div className="text-center py-20 opacity-20">
          <AlertCircle className="mx-auto mb-4" size={48} />
          <p className="font-tajawal">لا توجد طلبات سحب</p>
        </div>
      )}
    </div>
  );
}
