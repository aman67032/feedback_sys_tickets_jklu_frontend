'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import AnimatedButton from '@/components/ui/AnimatedButton';
import { MessageSquare, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { getUser, isAuthenticated } from '@/lib/auth';
import FloatingLines from '@/components/ui/landingbg';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
    
    // Detect mobile device - debounced for performance
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    
    // Debounce resize listener for better performance
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 150);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative bg-black" style={{ WebkitOverflowScrolling: 'touch', willChange: 'auto' }}>
      {/* Animated Dark Background - Desktop */}
      {!isMobile && (
        <div className="absolute inset-0 z-0 pointer-events-auto hidden md:block">
          <FloatingLines 
           topColor="#FF9F00"
           bottomColor="#0000FC"
           intensity={1.0}
           rotationSpeed={0.3}
           glowAmount={0.005}
           pillarWidth={3.0}
           pillarHeight={0.4}
           noiseIntensity={0.5}
           pillarRotation={0}
           interactive={false}
           mixBlendMode="normal"
          />
        </div>
      )}
      
      {/* Mobile-optimized unique beautiful background */}
      {isMobile && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden w-screen h-screen mobile-bg-container" style={{ top: 0, left: 0, right: 0, bottom: 0 }}>
          {/* FloatingLines Background - Mobile optimized with lower settings for performance */}
          <div className="fixed inset-0 z-[0.5] pointer-events-auto w-screen h-screen">
            <FloatingLines 
              topColor="#FF9F00"
              bottomColor="#0040FC"
              intensity={0.6}
              rotationSpeed={0.15}
              glowAmount={0.003}
              pillarWidth={3.5}
              pillarHeight={0.3}
              noiseIntensity={0.2}
              pillarRotation={0}
              interactive={false}
              mixBlendMode="normal"
            />
          </div>
          
          {/* Additional CSS layers for depth */}
          <div className="mobile-bg-layer mobile-bg-layer-1"></div>
          <div className="mobile-bg-layer mobile-bg-layer-2"></div>
          
          {/* Animated mesh pattern */}
          <div className="mobile-mesh-pattern"></div>
          
          {/* Floating orbs for extra visual interest */}
          <div className="mobile-orb mobile-orb-1"></div>
          <div className="mobile-orb mobile-orb-2"></div>
        </div>
      )}
      
      {/* Desktop background with image overlay */}
      {!isMobile && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden hidden md:block">
          {/* Background Image for desktop too */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
            style={{
              backgroundImage: 'url(/mobile landingbg.jpg)',
            }}
          ></div>
        </div>
      )}
      
      {/* Dark overlay for better text readability */}
      <div className={`absolute inset-0 z-[1] pointer-events-none ${isMobile ? 'bg-black/15' : 'bg-black/40'}`}></div>

      {/* Main Content - Flex grow to fill remaining space */}
      <main className="flex-1 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 sm:py-8 relative z-10 pointer-events-none">
        <div className="text-center mb-6 sm:mb-8 pointer-events-auto">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 w-full mx-auto">
          <Link
          href="https://jklu.edu.in"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/white_jklu_logo.png"
            alt="JKLU Logo"
            width={isMobile ? 100 : 170}
            height={isMobile ? 100 : 170}
            className="sketch-logo-dark cursor-pointer"
            style={{ objectFit: "contain" }}
          />
        </Link>
        <Link
          href="#"
          target="_blank"
          rel="noopener noreferrer"
        >
            <Image
              src="/Feedback_sys_logo.png"
              alt="JKLU Feedback System Logo"
              width={isMobile ? 160 : 275}
              height={isMobile ? 160 : 275}
              className="sketch-logo-dark"
              style={{ objectFit: 'contain', filter: 'brightness(1.1)' }}
            />
          </Link>
          </div>
          
          {/* Main Title */}
          <h1 className="sketch-title-modern text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 leading-tight text-white px-2">
            JKLU Feedback Ticket System
          </h1>
          
          {/* Subtitle */}
          <p className="sketch-text-dark text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 text-white/90 px-2">
            Resolve Your Problem
          </p>
          
          {/* Description */}
          <p className="sketch-text-dark text-xs sm:text-sm md:text-base lg:text-lg text-white/70 max-w-2xl mx-auto mb-4 sm:mb-6 px-4">
            Got an issue? We've got your back! Submit your feedback and let's make things better together.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6 sm:mb-8 px-4">
            {isLoggedIn ? (
              <Link href="/dashboard" className="w-full sm:w-auto">
                <button
                  className="relative w-full sm:w-48 h-12 sm:h-14 border-[3px] border-white/80 outline-none bg-white/10 backdrop-blur-sm text-white transition-all duration-1000 rounded-[0.3em] text-sm sm:text-base font-bold cursor-pointer hover:shadow-[inset_0px_0px_25px_rgba(255,255,255,0.3)] hover:bg-white/20 hover:border-white group active:scale-95"
                  style={{
                    borderStyle: 'ridge'
                  }}
                >
                  <span className="relative z-10 tracking-wider flex items-center justify-center gap-2">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[0.3em]"></div>
                </button>
              </Link>
            ) : (
              <>
                <div className="w-full sm:w-auto">
                  <AnimatedButton href="/register" />
                </div>
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="sketch-button-dark text-sm sm:text-base px-6 py-3 h-auto w-full sm:w-auto">
                    Already have an account?
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 pointer-events-auto px-2 sm:px-0">
          {/* Mobile: Info cards (no button-like styling), Desktop: Interactive cards */}
          <div className={`${isMobile ? 'info-card-mobile' : 'sketch-card-dark'} p-4 sm:p-6 bg-white/5 backdrop-blur-md border border-white/20 rounded-lg ${isMobile ? 'text-center' : 'text-center sm:text-left'}`}>
            <div className={`${isMobile ? '' : 'sketch-icon-dark'} mb-3 flex justify-center sm:justify-start`}>
              <MessageSquare className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8 sm:h-10 sm:w-10'} text-[#3B82F6]`} />
            </div>
            <h3 className={`${isMobile ? 'text-sm font-semibold' : 'sketch-text-dark text-base sm:text-lg font-bold'} mb-2 text-white`}>
              Submit Feedback
            </h3>
            <p className={`${isMobile ? 'text-xs leading-relaxed' : 'sketch-text-dark text-xs sm:text-sm'} text-white/70`}>
              Share your concerns and feedback easily. Your voice matters!
            </p>
          </div>

          <div className={`${isMobile ? 'info-card-mobile' : 'sketch-card-dark'} p-4 sm:p-6 bg-white/5 backdrop-blur-md border border-white/20 rounded-lg ${isMobile ? 'text-center' : 'text-center sm:text-left'}`}>
            <div className={`${isMobile ? '' : 'sketch-icon-dark'} mb-3 flex justify-center sm:justify-start`}>
              <Zap className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8 sm:h-10 sm:w-10'} text-[#F97316]`} />
            </div>
            <h3 className={`${isMobile ? 'text-sm font-semibold' : 'sketch-text-dark text-base sm:text-lg font-bold'} mb-2 text-white`}>
              Quick Resolution
            </h3>
            <p className={`${isMobile ? 'text-xs leading-relaxed' : 'sketch-text-dark text-xs sm:text-sm'} text-white/70`}>
              Fast-track your problems. We work quickly to resolve issues.
            </p>
          </div>

          <div className={`${isMobile ? 'info-card-mobile' : 'sketch-card-dark'} p-4 sm:p-6 bg-white/5 backdrop-blur-md border border-white/20 rounded-lg ${isMobile ? 'text-center' : 'text-center sm:text-left'} sm:col-span-2 md:col-span-1`}>
            <div className={`${isMobile ? '' : 'sketch-icon-dark'} mb-3 flex justify-center sm:justify-start`}>
              <CheckCircle2 className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8 sm:h-10 sm:w-10'} text-[#3B82F6]`} />
            </div>
            <h3 className={`${isMobile ? 'text-sm font-semibold' : 'sketch-text-dark text-base sm:text-lg font-bold'} mb-2 text-white`}>
              Track Progress
            </h3>
            <p className={`${isMobile ? 'text-xs leading-relaxed' : 'sketch-text-dark text-xs sm:text-sm'} text-white/70`}>
              Monitor your ticket status and see resolutions in real-time.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 sm:py-4 flex-shrink-0 relative z-10 border-t border-white/20 backdrop-blur-sm pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pointer-events-auto">
          <p className="sketch-text-dark text-xs sm:text-sm font-bold text-white/90 mb-1">
            Council of Technical Affairs
          </p>
          <div className="sketch-text-dark text-xs text-white/70 space-y-0.5">
            <p>Suryaansh Sharma - General Secretary</p>
            <p>Aman Pratap Singh - Secretary</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
