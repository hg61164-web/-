import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp, 
  runTransaction, 
  increment 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Check, X, Eye, Loader2, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Deposit {
  id: string;
  userId: string;
  username: string;
  amount: number;
  planId: string;
  planName: string;
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: any;
}

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'deposits'), orderBy('created_at', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setDeposits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Deposit[]);
    });
    return unsub;
  }, []);

  const handleAction = async (deposit: Deposit, status: 'approved' | 'rejected') => {
    setProcessing(deposit.id);
    try {
      const depositRef = doc(db, 'deposits', deposit.id);

      if (status === 'approved') {
        const userRef = doc(db, 'users', deposit.userId);
        const txRef = doc(collection(db, 'transactions'));
        
        await runTransaction(db, async (transaction) => {
          transaction.update(depositRef, { status: 'approved' });
          transaction.update(userRef, {
            balance: increment(deposit.amount),
            active_plan_id: deposit.planId,
            plan_start_date: serverTimestamp()
          });
          transaction.set(txRef, {
            userId: deposit.userId,
            amount: deposit.amount,
            type: 'deposit',
            status: 'approved',
            created_at: serverTimestamp()
          });
        });
      } else {
        await updateDoc(depositRef, { status: 'rejected' });
      }

      alert(`تم ${status === 'approved' ? 'قبول' : 'رفض'} الطلب بنجاح`);
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء معالجة الطلب');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-4">
      {deposits.map((dep) => (
        <div key={dep.id} className="glass rounded-3xl p-5 border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-white/5 ${dep.status === 'pending' ? 'text-amber-500' : dep.status === 'approved' ? 'text-green-500' : 'text-red-500'}`}>
                {dep.status === 'pending' ? <Clock size={20} /> : dep.status === 'approved' ? <Check size={20} /> : <X size={20} />}
              </div>
              <div>
                <h4 className="font-bold font-cairo text-sm text-gray-200">{dep.username}</h4>
                <p className="text-[10px] text-gray-500 font-tajawal">{dep.planName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold font-poppins">{dep.amount} USDT</p>
              <p className="text-[10px] text-gray-500">{dep.status.toUpperCase()}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setSelectedImage(dep.imageUrl)}
              className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-tajawal transition-all"
            >
              <Eye size={16} />
              عرض الإيصال
            </button>
            
            {dep.status === 'pending' && (
              <>
                <button
                  disabled={!!processing}
                  onClick={() => handleAction(dep, 'approved')}
                  className="w-12 h-12 bg-green-500/20 text-green-500 rounded-xl flex items-center justify-center hover:bg-green-500/30 transition-all"
                >
                  {processing === dep.id ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                </button>
                <button
                  disabled={!!processing}
                  onClick={() => handleAction(dep, 'rejected')}
                  className="w-12 h-12 bg-red-500/20 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500/30 transition-all"
                >
                  {processing === dep.id ? <Loader2 className="animate-spin" size={20} /> : <X size={20} />}
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {deposits.length === 0 && (
        <div className="text-center py-20 opacity-20">
          <AlertCircle className="mx-auto mb-4" size={48} />
          <p className="font-tajawal">لا توجد طلبات إيداع</p>
        </div>
      )}

      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-black/95"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-lg w-full"
            >
              <img src={selectedImage} alt="Receipt" className="w-full rounded-2xl shadow-2xl" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white"
              >
                <X size={32} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
