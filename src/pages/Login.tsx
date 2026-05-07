import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInAnonymously } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { Mail, Lock, LogIn, ArrowRight, AlertCircle, Loader2, UserCircle } from 'lucide-react';
import Logo from '../components/Logo';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('خطأ في البريد الإلكتروني أو كلمة المرور. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    setError(null);
    try {
      const { user } = await signInAnonymously(auth);
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          username: `زائر_${Math.floor(Math.random() * 10000)}`,
          email: 'guest@tplus.com',
          balance: 0,
          total_profit: 0,
          daily_profit: 0,
          vip_level: 0,
          is_admin: false,
          referral_code: 'GUEST',
          referred_by: null,
          created_at: serverTimestamp()
        });
      }
      
      navigate('/');
    } catch (err: any) {
      console.error("Guest login error:", err);
      setError('حدث خطأ أثناء تسجيل الدخول كزائر. يرجى المحاولة لاحقاً.');
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-8 pt-16 max-w-lg mx-auto bg-black text-white font-sans">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <Logo size="lg" className="mb-6" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-[32px] p-8 shadow-2xl backdrop-blur-xl"
      >
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-tajawal text-gray-500 mb-2 mr-1 uppercase tracking-widest">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-crypto-green/50 transition-colors outline-none text-right font-poppins"
                placeholder="example@mail.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-tajawal text-gray-500 mb-2 mr-1 uppercase tracking-widest">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-crypto-green/50 transition-colors outline-none text-right font-poppins"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-tajawal"
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || guestLoading}
            className="w-full bg-crypto-green hover:brightness-110 disabled:opacity-50 text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 transition-all mt-6 shadow-neon font-cairo text-lg"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <LogIn size={20} strokeWidth={2.5} />
                <span>دخول</span>
              </>
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-black px-4 text-gray-500 font-tajawal uppercase tracking-wider">أو</span>
          </div>
        </div>

        <button
          onClick={handleGuestLogin}
          disabled={loading || guestLoading}
          className="w-full bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-tajawal"
        >
          {guestLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <UserCircle size={20} className="text-crypto-green" />
              <span>الدخول كزائر</span>
            </>
          )}
        </button>
      </motion.div>

      <div className="mt-8 text-center">
        <p className="text-gray-400 font-tajawal">
          ليس لديك حساب؟{' '}
          <Link to="/register" className="text-crypto-green font-bold hover:underline">
            إنشاء حساب جديد
          </Link>
        </p>
      </div>

      <div className="mt-auto py-8 flex justify-center opacity-30">
        <div className="flex items-center gap-2 text-xs font-poppins">
          <span>SECURED BY FIREBASE</span>
          <ArrowRight size={12} />
        </div>
      </div>
    </div>
  );
}
