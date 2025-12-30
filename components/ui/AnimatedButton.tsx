'use client';

import React from 'react';
import Link from 'next/link';

interface AnimatedButtonProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({ href, children, className = '' }) => {
  return (
    <div className={className}>
      <Link href={href}>
        <button
          className="relative w-40 h-14 border-[3px] border-[#F97316] outline-none bg-transparent text-white transition-all duration-1000 rounded-[0.3em] text-base font-bold cursor-pointer hover:shadow-[inset_0px_0px_25px_#F97316]"
          style={{
            borderStyle: 'ridge'
          }}
        >
          <span className="relative z-10">GET STARTED</span>
        </button>
      </Link>
    </div>
  );
};

export default AnimatedButton;

