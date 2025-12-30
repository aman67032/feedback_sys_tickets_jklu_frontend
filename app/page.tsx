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

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative bg-black">
      {/* Animated Dark Background */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
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
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 z-[1] pointer-events-none"></div>

      {/* Main Content - Flex grow to fill remaining space */}
      <main className="flex-1 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 relative z-10 pointer-events-none">
        <div className="text-center mb-8 pointer-events-auto">
          {/* Logo */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Image
              src="/white_jklu_logo.png"
              alt="JKLU Logo"
              width={170}
              height={170}
              className="sketch-logo-dark"
              style={{ objectFit: 'contain' }}
            />
            <Image
              src="/Feedback_sys_logo.png"
              alt="JKLU Feedback System Logo"
              width={275}
              height={275}
              className="sketch-logo-dark"
              style={{ objectFit: 'contain', filter: 'brightness(1.1)' }}
            />
          </div>
          
          {/* Main Title */}
          <h1 className="sketch-title-modern text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight text-white">
            JKLU Feedback Ticket System
          </h1>
          
          {/* Subtitle */}
          <p className="sketch-text-dark text-xl md:text-2xl lg:text-3xl font-bold mb-4 text-white/90">
            Resolve Your Problem
          </p>
          
          {/* Description */}
          <p className="sketch-text-dark text-sm md:text-base lg:text-lg text-white/70 max-w-2xl mx-auto mb-6">
            Got an issue? We've got your back! Submit your feedback and let's make things better together.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="sketch-button-dark-primary text-base px-6 py-3 h-auto">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <AnimatedButton href="/register" />
                <Link href="/login">
                  <Button size="lg" variant="outline" className="sketch-button-dark text-base px-6 py-3 h-auto">
                    Already have an account?
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 pointer-events-auto">
          <div className="sketch-card-dark p-6 bg-white/5 backdrop-blur-md border border-white/20 rounded-lg">
            <div className="sketch-icon-dark mb-3">
              <MessageSquare className="h-10 w-10 text-[#3B82F6]" />
            </div>
            <h3 className="sketch-text-dark text-lg font-bold mb-2 text-white">
              Submit Feedback
            </h3>
            <p className="sketch-text-dark text-sm text-white/70">
              Share your concerns and feedback easily. Your voice matters!
            </p>
          </div>

          <div className="sketch-card-dark p-6 bg-white/5 backdrop-blur-md border border-white/20 rounded-lg">
            <div className="sketch-icon-dark mb-3">
              <Zap className="h-10 w-10 text-[#F97316]" />
            </div>
            <h3 className="sketch-text-dark text-lg font-bold mb-2 text-white">
              Quick Resolution
            </h3>
            <p className="sketch-text-dark text-sm text-white/70">
              Fast-track your problems. We work quickly to resolve issues.
            </p>
          </div>

          <div className="sketch-card-dark p-6 bg-white/5 backdrop-blur-md border border-white/20 rounded-lg">
            <div className="sketch-icon-dark mb-3">
              <CheckCircle2 className="h-10 w-10 text-[#3B82F6]" />
            </div>
            <h3 className="sketch-text-dark text-lg font-bold mb-2 text-white">
              Track Progress
            </h3>
            <p className="sketch-text-dark text-sm text-white/70">
              Monitor your ticket status and see resolutions in real-time.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 flex-shrink-0 relative z-10 border-t border-white/20 backdrop-blur-sm pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pointer-events-auto">
          <p className="sketch-text-dark text-xs md:text-sm font-bold text-white/90 mb-1">
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
