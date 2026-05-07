import React from 'react';
import { TrendingUp, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20'
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 40
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className={cn(
        "relative rounded-2xl bg-black border border-white/10 flex items-center justify-center p-2 shadow-neon group overflow-hidden",
        sizes[size]
      )}>
        {/* Stylized T and + concept */}
        <div className="relative flex items-center justify-center">
          <span className={cn(
             "font-black text-white leading-none transform -skew-x-12",
             size === 'sm' ? 'text-xl' : size === 'md' ? 'text-3xl' : 'text-5xl'
          )}>T</span>
          <Plus 
            className="text-crypto-green absolute -top-1 -right-1" 
            size={iconSizes[size] / 1.5} 
            strokeWidth={3} 
          />
        </div>
        
        {/* Candlestick motif bottom */}
        <div className="absolute bottom-1 left-2 right-2 flex items-end justify-center gap-0.5 opacity-40">
          <div className="w-1 h-3 bg-crypto-green rounded-full"></div>
          <div className="w-1 h-5 bg-crypto-green rounded-full"></div>
          <div className="w-1 h-4 bg-crypto-green rounded-full"></div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-tr from-crypto-green/10 to-transparent opacity-50"></div>
      </div>
      
      {showText && (
        <div className="text-center">
          <h1 className={cn(
            "font-black text-white font-cairo",
            size === 'sm' ? 'text-sm' : size === 'md' ? 'text-xl' : 'text-3xl'
          )}>
            تداول <span className="text-crypto-green">بلس</span>
          </h1>
          {size === 'lg' && (
            <p className="text-[10px] text-gray-500 font-tajawal mt-1 tracking-widest uppercase">
              استثمر بذكاء .. تداول بثقة
            </p>
          )}
        </div>
      )}
    </div>
  );
}
