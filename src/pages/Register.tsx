import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Mail, Lock, User, UserPlus, AlertCircle, Loader2, Link as LinkIcon } from 'lucide-react';

import Logo from '../components/Logo';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('كلمات المرور غير متوافقة.');
      return;
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const trimmedEmail = email.trim().toLowerCase();
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      // Create user document in Firestore
      const isAdminEmail = trimmedEmail === 'hg61164@gmail.com';
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username,
        email: trimmedEmail,
        balance: 0,
        total_profit: 0,
        daily_profit: 0,
        vip_level: 0,
        is_admin: isAdminEmail,
        referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        referred_by: referralCode || null,
        created_at: serverTimestamp(),
      });

      navigate('/');
    } catch (err: any) {
      console.error("Registration Error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('البريد الإلكتروني مستخدم بالفعل.');
      } else if (err.code === 'auth/invalid-email') {
        setError('البريد الإلكتروني غير صالح.');
      } else if (err.code === 'auth/weak-password') {
        setError('كلمة المرور ضعيفة جداً.');
      } else {
        setError('فشل في إنشاء الحساب. تأكد من إدخال البيانات بشكل صحيح.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-8 pt-16 max-w-lg mx-auto bg-black text-white font-sans overflow-y-auto">
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
        className="bg-white/5 border border-white/10 rounded-[32px] p-8 shadow-2xl backdrop-blur-xl mb-12"
      >
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-xs font-tajawal text-gray-500 mb-2 mr-1 uppercase tracking-widest">اسم المستخدم</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-crypto-green/50 transition-colors outline-none text-right font-tajawal"
                placeholder="أدخل اسمك"
                required
              />
            </div>
          </div>

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

          <div className="grid grid-cols-1 gap-6">
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

            <div>
              <label className="block text-xs font-tajawal text-gray-500 mb-2 mr-1 uppercase tracking-widest">تأكيد كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-crypto-green/50 transition-colors outline-none text-right font-poppins"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-tajawal text-gray-500 mb-2 mr-1 uppercase tracking-widest">كود الإحالة (اختياري)</label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-crypto-green/50 transition-colors outline-none text-right uppercase font-poppins"
                placeholder="REFERRAL"
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
            disabled={loading}
            className="w-full bg-crypto-green hover:brightness-110 disabled:opacity-50 text-black font-black py-5 rounded-2xl flex items-center justify-center gap-2 transition-all mt-6 shadow-neon font-cairo text-lg"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <UserPlus size={20} strokeWidth={2.5} />
                <span>إنشاء حساب</span>
              </>
            )}
          </button>
        </form>
      </motion.div>

      <div className="text-center pb-12">
        <p className="text-gray-400 font-tajawal">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-crypto-green font-bold hover:underline ml-1">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
