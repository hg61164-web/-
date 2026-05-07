import { NavLink } from 'react-router-dom';
import { Home, TrendingUp, Gamepad, Wallet, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { path: '/', icon: Home, label: 'الرئيسية' },
  { path: '/investment', icon: TrendingUp, label: 'الاستثمار' },
  { path: '/jackpot', icon: Gamepad, label: 'الألعاب' },
  { path: '/wallet', icon: Wallet, label: 'المحفظة' },
  { path: '/profile', icon: User, label: 'حسابي' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-6 pb-8 pt-2">
      <div className="max-w-lg mx-auto h-20 bg-white/5 border border-white/10 rounded-[28px] flex justify-around items-center px-4 backdrop-blur-xl shadow-2xl relative">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-1 p-3 transition-colors cursor-pointer relative"
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={cn(isActive ? "text-crypto-green" : "text-gray-500")} 
                />
                <span className={cn(
                  "text-[10px] font-tajawal transition-all", 
                  isActive ? "text-crypto-green font-bold" : "text-gray-500 font-normal"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="nav-active"
                    className="absolute -bottom-1 w-1 h-1 bg-crypto-green rounded-full shadow-[0_0_8px_#33CC66]"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
