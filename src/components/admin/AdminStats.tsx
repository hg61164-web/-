import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { TrendingUp, Users, Wallet, Trophy, RefreshCw, Zap } from 'lucide-react';

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalVolume: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const usersSnap = await getDocs(collection(db, 'users'));
    const depositsSnap = await getDocs(query(collection(db, 'deposits'), where('status', '==', 'approved')));
    const withdrawalsSnap = await getDocs(query(collection(db, 'withdrawals'), where('status', '==', 'approved')));
    
    let depSum = 0;
    depositsSnap.forEach(d => depSum += d.data().amount || 0);

    let withSum = 0;
    withdrawalsSnap.forEach(w => withSum += w.data().amount || 0);

    setStats({
      totalUsers: usersSnap.size,
      totalDeposits: depSum,
      totalWithdrawals: withSum,
      totalVolume: depSum + withSum
    });
  };

  const seedPlans = async () => {
    const plans = [
      { name: "نجمة 0", price: 0, daily_income: 0, stars: 0 },
      { name: "نجمتان", price: 30, daily_income: 7.5, stars: 2 },
      { name: "3 نجوم", price: 101, daily_income: 26, stars: 3 },
      { name: "4 نجوم", price: 303, daily_income: 81, stars: 4 },
      { name: "5 نجوم", price: 606, daily_income: 173, stars: 5 },
      { name: "6 نجوم", price: 1515, daily_income: 459, stars: 6 },
      { name: "7 نجوم", price: 3535, daily_income: 1178, stars: 7 },
      { name: "8 نجوم", price: 10010, daily_income: 3708, stars: 8 },
      { name: "9 نجوم", price: 30030, daily_income: 13650, stars: 9 },
      { name: "10 نجوم", price: 80080, daily_income: 53386, stars: 10 },
      { name: "11 نجمة", price: 200000, daily_income: 153846, stars: 11 },
    ];

    const batch = writeBatch(db);
    plans.forEach(plan => {
      const planRef = doc(collection(db, 'plans'));
      batch.set(planRef, plan);
    });

    await batch.commit();
    alert('تم إضافة الباقات بنجاح!');
  };

  const cards = [
    { label: 'إجمالي المستخدمين', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
    { label: 'إجمالي الإيداعات', value: stats.totalDeposits, icon: Wallet, color: 'text-green-400' },
    { label: 'إجمالي السحوبات', value: stats.totalWithdrawals, icon: RefreshCw, color: 'text-red-400' },
    { label: 'حجم التداولات', value: stats.totalVolume, icon: TrendingUp, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="glass rounded-3xl p-5 border-white/5">
            <div className={`p-2 bg-white/5 rounded-xl w-10 h-10 flex items-center justify-center mb-4 ${card.color}`}>
              <card.icon size={20} />
            </div>
            <p className="text-[10px] text-gray-500 font-tajawal mb-1">{card.label}</p>
            <p className="text-lg font-bold font-poppins">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-3xl p-6 border-amber-500/20 bg-amber-500/5">
        <h3 className="font-bold font-cairo mb-4 flex items-center gap-2">
          <Zap size={18} className="text-amber-500" />
          إجراءات سريعة
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={seedPlans}
            className="bg-white/10 hover:bg-white/20 py-3 rounded-2xl text-xs font-bold font-cairo transition-all"
          >
            تهيئة الباقات (Seed)
          </button>
          <button 
            onClick={() => alert('تحت التطوير')}
            className="bg-amber-500 text-black py-3 rounded-2xl text-xs font-bold font-cairo transition-all"
          >
            توزيع الأرباح اليومية
          </button>
        </div>
      </div>
    </div>
  );
}
