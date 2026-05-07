import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Star, CheckCircle2, ShieldCheck, Copy, Upload, X, Loader2, Info } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  daily_income: number;
  stars: number;
}

export default function Investment() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [txId, setTxId] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const walletAddress = "THu2rWBXEFTNLtsTgVjSmB4ytgQVuMygHr";

  useEffect(() => {
    const q = query(collection(db, 'plans'), orderBy('price', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plansList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Plan[];
      setPlans(plansList);
      
      // If no plans, seed them (Demo feature)
      if (plansList.length === 0) {
        // This is usually done in admin but for initial build we can seed
        // seeds would go here if needed, but I'll assume they'll be added via logic or let's hardcode them for UI first
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    alert('تم نسخ العنوان بنجاح');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitRequest = async () => {
    if (!auth.currentUser || !selectedPlan || !image) return;
    setLoading(true);

    try {
      // In a real app, upload image to storage first
      // For this environment, we'll simulate imageUrl or use the base64 preview temporarily 
      // (Better to use a placeholder or actually upload if storage is ready)
      
      await addDoc(collection(db, 'deposits'), {
        userId: auth.currentUser.uid,
        username: auth.currentUser.displayName,
        amount: selectedPlan.price,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        txId,
        imageUrl: imagePreview, // Simplified for demo
        status: 'pending',
        created_at: serverTimestamp(),
      });

      setStep(3); // Success step
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء إرسال الطلب.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setStep(1);
    setSelectedPlan(null);
    setTxId('');
    setImage(null);
    setImagePreview(null);
  };

  return (
    <div className="pb-24 pt-6 px-6 max-w-lg mx-auto bg-black min-h-screen text-white font-sans">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-cairo mb-3 text-white">الباقات <span className="text-crypto-green">الاستثمارية</span></h2>
        <p className="text-gray-400 text-sm font-tajawal leading-relaxed">اختر الباقة المناسبة لك وابدأ في جني الأرباح اليومية مع منصة تداول بلس الاحترافية.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative bg-white/5 border rounded-[32px] p-6 flex flex-col justify-between group transition-all duration-300 ${plan.stars >= 3 ? 'border-crypto-green shadow-[0_0_40px_rgba(51,204,102,0.1)]' : 'border-white/10 hover:border-crypto-green'}`}
          >
            {plan.stars === 3 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-crypto-green text-black text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-tighter">الأكثر طلباً</div>
            )}
            
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-lg border border-white/10 group-hover:border-crypto-green/50 transition-colors">
                <div className="flex gap-0.5">
                  {[...Array(plan.stars)].map((_, i) => (
                    <Star key={i} size={10} fill="currentColor" className="text-crypto-green" />
                  ))}
                </div>
              </div>
              <div className="text-xs bg-white/5 px-3 py-1.5 rounded-full text-gray-400 border border-white/5">المستوى {plan.stars}</div>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-2 font-cairo text-white">{plan.name}</h4>
              <p className="text-4xl font-bold text-white mb-6 font-poppins">
                {plan.price} <span className="text-sm font-normal text-gray-500 uppercase">USDT</span>
              </p>
              
              <ul className="text-sm text-gray-400 space-y-3 mb-8 font-tajawal">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-crypto-green" />
                  ربح يومي: <span className="text-white font-bold">{plan.daily_income} USDT</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-crypto-green" />
                  دورة الاستثمار: <span className="text-white font-bold">30 يوم</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-crypto-green" />
                  مكافآت VIP إضافية
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                setSelectedPlan(plan);
                setShowModal(true);
              }}
              className={`w-full py-4 rounded-2xl text-sm font-bold font-cairo transition-all ${plan.stars >= 3 ? 'bg-crypto-green text-black shadow-lg shadow-crypto-green/20 hover:brightness-110' : 'bg-white/5 border border-white/10 group-hover:bg-crypto-green group-hover:text-black group-hover:border-transparent'}`}
            >
              شراء الآن
            </button>
          </motion.div>
        ))}

        {plans.length === 0 && (
          <div className="text-center py-20 opacity-20">
            <Loader2 className="animate-spin mx-auto mb-4" size={48} />
            <p className="font-tajawal text-lg">جاري تحميل الباقات...</p>
          </div>
        )}
      </div>

      {/* Buying Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm glass rounded-[40px] p-8 border-white/10"
            >
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>

              {step === 1 && (
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-500">
                    <Info size={32} />
                  </div>
                  <h3 className="text-xl font-bold font-cairo mb-4">تعليمات التحويل</h3>
                  <div className="bg-white/5 rounded-2xl p-4 text-sm text-gray-300 font-tajawal text-right mb-6 space-y-3 leading-relaxed">
                    <p>1. قم بتحويل مبلغ <span className="text-green-500 font-bold">{selectedPlan?.price} USDT</span></p>
                    <p>2. استخدم شبكة <span className="text-amber-500 font-bold">TRC20</span> حصراً.</p>
                    <p>3. قم بنسخ العنوان أدناه وفتحه في محفظتك (Binance, Bybit, etc.)</p>
                    <p>4. بعد التحويل، ارفع صورة إيصال العملية.</p>
                  </div>
                  
                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4 mb-8">
                    <p className="text-[10px] text-gray-500 mb-2 uppercase text-center">Wallet Address (TRC20)</p>
                    <div className="flex items-center gap-3">
                      <code className="text-xs text-green-400 break-all text-center flex-1">{walletAddress}</code>
                      <button onClick={handleCopy} className="p-2 bg-green-500/10 rounded-lg text-green-500">
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    className="w-full bg-green-500 text-black font-bold py-4 rounded-2xl font-cairo neon-glow"
                  >
                    تأكيد والذهاب لرفع الإيصال
                  </button>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h3 className="text-xl font-bold font-cairo mb-6 text-center">رفع إيصال الدفع</h3>
                  
                  <div className="space-y-6">
                    <div className="relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label 
                        htmlFor="receipt-upload"
                        className="flex flex-col items-center justify-center w-full aspect-video rounded-3xl border-2 border-dashed border-white/10 hover:border-green-500/30 bg-white/5 cursor-pointer transition-all overflow-hidden"
                      >
                        {imagePreview ? (
                          <img src={imagePreview} alt="Receipt" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <Upload className="text-gray-500 group-hover:text-green-500 mb-2" size={32} />
                            <span className="text-xs text-gray-400 font-tajawal">اختر صورة أو اسحبها هنا</span>
                          </>
                        )}
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2 mr-1">رقم العملية TxID (اختياري)</label>
                      <input
                        type="text"
                        value={txId}
                        onChange={(e) => setTxId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 focus:border-green-500/50 transition-colors outline-none text-right placeholder:opacity-30"
                        placeholder="أدخل معرّف العملية هنا"
                      />
                    </div>

                    <button
                      disabled={!image || loading}
                      onClick={handleSubmitRequest}
                      className="w-full bg-green-500 disabled:opacity-50 text-black font-bold py-4 rounded-2xl font-cairo flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : 'إرسال للمراجعة'}
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-2xl font-bold font-cairo mb-3">تم الإرسال بنجاح!</h3>
                  <p className="text-gray-400 font-tajawal mb-8">
                    طلبك الآن قيد المراجعة. سيتم تفعيل الباقة فور تأكيد التحويل من قِبل الإدارة. عادة ما يستغرق الأمر من 10 إلى 30 دقيقة.
                  </p>
                  <button
                    onClick={closeModal}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl font-cairo"
                  >
                    العودة للرئيسية
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mt-8 glass rounded-2xl p-4 flex items-start gap-3 border-amber-500/20">
        <ShieldCheck className="text-amber-500 shrink-0 mt-1" size={20} />
        <p className="text-[11px] text-gray-400 font-tajawal leading-relaxed">
          جميع الاستثمارات تتم تحت إشراف أمني متطور. يرجى التأكد من التحويل للعنوان الصحيح والاحتفاظ بنسخة من الإيصال. نحن غير مسؤولين عن أي خطأ ناتج عن إدخال عنوان غير صحيح.
        </p>
      </div>
    </div>
  );
}
