import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Pages
import SplashScreen from './pages/SplashScreen';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Investment from './pages/Investment';
import Wallet from './pages/Wallet';
import Jackpot from './pages/Jackpot';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

// Components
import BottomNav from './components/BottomNav';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setIsAdmin(userDoc.data().is_admin || false);
          }
        } else {
          // Auto guest login if no user
          const { signInAnonymously } = await import('firebase/auth');
          const { setDoc, serverTimestamp } = await import('firebase/firestore');
          const credential = await signInAnonymously(auth);
          const guestUser = credential.user;
          
          const userRef = doc(db, 'users', guestUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: guestUser.uid,
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
          setUser(guestUser);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <SplashScreen />;

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-500/30 selection:text-green-500 font-cairo" dir="rtl">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<Home />} />
        <Route path="/investment" element={<Investment />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/jackpot" element={<Jackpot />} />
        <Route path="/profile" element={<Profile />} />
        
        <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {!isAuthPage && <BottomNav />}
    </div>
  );
}
