import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Search, User, Trash2, Edit2, ShieldAlert, Check, X, Loader2 } from 'lucide-react';

interface UserData {
  uid: string;
  username: string;
  email: string;
  balance: number;
  vip_level: number;
  is_admin: boolean;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [newBalance, setNewBalance] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsub = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ ...doc.data() })) as UserData[]);
    });
    return unsub;
  }, []);

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateBalance = async () => {
    if (!editingUser) return;
    try {
      await updateDoc(doc(db, 'users', editingUser.uid), {
        balance: parseFloat(newBalance)
      });
      alert('تم تحديث الرصيد بنجاح');
      setEditingUser(null);
    } catch (error) {
      alert('خطأ في التحديث');
    }
  };

  const toggleAdmin = async (user: UserData) => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        is_admin: !user.is_admin
      });
    } catch (error) {
      alert('خطأ في تغيير الصلاحيات');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 outline-none focus:border-amber-500/50 transition-colors text-right"
          placeholder="بحث عن مستخدم..."
        />
      </div>

      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div key={user.uid} className="glass rounded-2xl p-4 border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user.is_admin ? 'bg-amber-500/20 text-amber-500' : 'bg-white/5 text-gray-500'}`}>
                  <User size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-xs font-cairo flex items-center gap-2">
                    {user.username}
                    {user.is_admin && <span className="text-[8px] bg-amber-500 text-black px-1 rounded uppercase">Admin</span>}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-poppins">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold font-poppins text-xs text-green-500">{user.balance || 0} USDT</p>
                <p className="text-[10px] text-gray-500 font-tajawal">VIP {user.vip_level || 0}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setEditingUser(user);
                  setNewBalance(user.balance.toString());
                }}
                className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-lg text-[10px] font-cairo transition-all flex items-center justify-center gap-2"
              >
                <Edit2 size={12} />
                تعديل الرصيد
              </button>
              <button 
                onClick={() => toggleAdmin(user)}
                className={`p-2 rounded-lg transition-all ${user.is_admin ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}
                title={user.is_admin ? 'إزالة الإشراف' : 'جعل مشرف'}
              >
                <ShieldAlert size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Balance Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="glass rounded-3xl p-8 w-full max-w-sm border-amber-500/20">
            <h3 className="text-lg font-bold font-cairo mb-6 text-center">تعديل رصيد {editingUser.username}</h3>
            <div className="space-y-4">
              <input
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 text-center text-xl font-bold font-poppins outline-none focus:border-amber-500/50"
              />
              <div className="flex gap-3">
                <button 
                  onClick={handleUpdateBalance}
                  className="flex-1 bg-amber-500 text-black font-bold py-3 rounded-xl font-cairo"
                >
                  حفظ
                </button>
                <button 
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-white/10 text-white font-bold py-3 rounded-xl font-cairo"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
