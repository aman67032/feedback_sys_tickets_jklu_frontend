'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { MessageSquare, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { getUser, isAuthenticated } from '@/lib/auth';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  return (
    <div className="min-h-screen sketch-bg flex flex-col overflow-x-hidden relative" style={{
      background: 'linear-gradient(to bottom right, #FAECCB,rgba(75, 195, 236, 0.35),rgba(249, 168, 34, 0.4),rgb(43, 184, 116))'
    }}>
      {/* Unique Background with Gradients and Tickets */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Enhanced Gradients */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom right, rgba(250, 236, 203, 0.4), rgba(147, 211, 174, 0.3), rgba(43, 186, 165, 0.4))'
        }}></div>
        <div className="absolute top-0 left-0 w-1/2 h-full" style={{
          background: 'linear-gradient(to right, rgba(147, 211, 174, 0.2), transparent)'
        }}></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-full" style={{
          background: 'linear-gradient(to left, rgba(43, 186, 165, 0.2), transparent)'
        }}></div>
        <div className="absolute top-1/3 left-0 w-full h-1/3" style={{
          background: 'linear-gradient(to bottom, rgba(249, 168, 34, 0.1), transparent, rgba(249, 102, 53, 0.1))'
        }}></div>
        
        {/* Refined SVG Ticket Shapes */}
        <svg className="absolute top-32 left-20 w-48 h-32 transform rotate-6 opacity-30" viewBox="0 0 192 128">
          <rect x="8" y="0" width="176" height="128" rx="6" fill="rgba(250, 236, 203, 0.3)" stroke="rgba(249, 168, 34, 0.5)" strokeWidth="2" strokeDasharray="4 4"/>
          <circle cx="8" cy="64" r="6" fill="rgba(147, 211, 174, 0.2)" stroke="rgba(249, 168, 34, 0.4)" strokeWidth="2"/>
          <circle cx="184" cy="64" r="6" fill="rgba(147, 211, 174, 0.2)" stroke="rgba(249, 168, 34, 0.4)" strokeWidth="2"/>
          <line x1="0" y1="64" x2="8" y2="64" stroke="rgba(249, 168, 34, 0.4)" strokeWidth="2" strokeDasharray="2 2"/>
          <line x1="184" y1="64" x2="192" y2="64" stroke="rgba(249, 168, 34, 0.4)" strokeWidth="2" strokeDasharray="2 2"/>
        </svg>
        
        <svg className="absolute top-64 right-32 w-56 h-36 transform -rotate-3 opacity-40" viewBox="0 0 224 144">
          <rect x="10" y="0" width="204" height="144" rx="8" fill="rgba(249, 168, 34, 0.2)" stroke="rgba(249, 102, 53, 0.6)" strokeWidth="2.5" strokeDasharray="5 5"/>
          <circle cx="10" cy="72" r="7" fill="rgba(43, 186, 165, 0.25)" stroke="rgba(249, 102, 53, 0.5)" strokeWidth="2.5"/>
          <circle cx="214" cy="72" r="7" fill="rgba(43, 186, 165, 0.25)" stroke="rgba(249, 102, 53, 0.5)" strokeWidth="2.5"/>
          <line x1="0" y1="72" x2="10" y2="72" stroke="rgba(249, 102, 53, 0.5)" strokeWidth="2.5" strokeDasharray="3 3"/>
          <line x1="214" y1="72" x2="224" y2="72" stroke="rgba(249, 102, 53, 0.5)" strokeWidth="2.5" strokeDasharray="3 3"/>
        </svg>
        
        <svg className="absolute bottom-40 left-1/4 w-52 h-32 transform rotate-12 opacity-35" viewBox="0 0 208 128">
          <rect x="9" y="0" width="190" height="128" rx="7" fill="rgba(147, 211, 174, 0.2)" stroke="rgba(43, 186, 165, 0.5)" strokeWidth="2" strokeDasharray="4 4"/>
          <circle cx="9" cy="64" r="6" fill="rgba(249, 168, 34, 0.3)" stroke="rgba(43, 186, 165, 0.5)" strokeWidth="2"/>
          <circle cx="199" cy="64" r="6" fill="rgba(249, 168, 34, 0.3)" stroke="rgba(43, 186, 165, 0.5)" strokeWidth="2"/>
          <line x1="0" y1="64" x2="9" y2="64" stroke="rgba(43, 186, 165, 0.5)" strokeWidth="2" strokeDasharray="2 2"/>
          <line x1="199" y1="64" x2="208" y2="64" stroke="rgba(43, 186, 165, 0.5)" strokeWidth="2" strokeDasharray="2 2"/>
        </svg>
        
        <svg className="absolute top-1/2 right-20 w-44 h-28 transform -rotate-6 opacity-30" viewBox="0 0 176 112">
          <rect x="8" y="0" width="160" height="112" rx="6" fill="rgba(250, 236, 203, 0.15)" stroke="rgba(249, 168, 34, 0.4)" strokeWidth="2" strokeDasharray="4 4"/>
          <circle cx="8" cy="56" r="5" fill="rgba(43, 186, 165, 0.2)" stroke="rgba(249, 168, 34, 0.4)" strokeWidth="2"/>
          <circle cx="168" cy="56" r="5" fill="rgba(43, 186, 165, 0.2)" stroke="rgba(249, 168, 34, 0.4)" strokeWidth="2"/>
          <line x1="0" y1="56" x2="8" y2="56" stroke="rgba(249, 168, 34, 0.4)" strokeWidth="2" strokeDasharray="2 2"/>
          <line x1="168" y1="56" x2="176" y2="56" stroke="rgba(249, 168, 34, 0.4)" strokeWidth="2" strokeDasharray="2 2"/>
        </svg>
        
        <svg className="absolute bottom-24 right-1/3 w-48 h-30 transform rotate-3 opacity-40" viewBox="0 0 192 120">
          <rect x="9" y="0" width="174" height="120" rx="7" fill="rgba(249, 102, 53, 0.15)" stroke="rgba(249, 102, 53, 0.5)" strokeWidth="2.5" strokeDasharray="5 5"/>
          <circle cx="9" cy="60" r="6" fill="rgba(147, 211, 174, 0.2)" stroke="rgba(249, 102, 53, 0.5)" strokeWidth="2.5"/>
          <circle cx="183" cy="60" r="6" fill="rgba(147, 211, 174, 0.2)" stroke="rgba(249, 102, 53, 0.5)" strokeWidth="2.5"/>
          <line x1="0" y1="60" x2="9" y2="60" stroke="rgba(249, 102, 53, 0.5)" strokeWidth="2.5" strokeDasharray="3 3"/>
          <line x1="183" y1="60" x2="192" y2="60" stroke="rgba(249, 102, 53, 0.5)" strokeWidth="2.5" strokeDasharray="3 3"/>
        </svg>
        
        <svg className="absolute top-20 right-1/2 w-40 h-24 transform -rotate-9 opacity-35" viewBox="0 0 160 96">
          <rect x="7" y="0" width="146" height="96" rx="5" fill="rgba(43, 186, 165, 0.2)" stroke="rgba(249, 168, 34, 0.45)" strokeWidth="2" strokeDasharray="4 4"/>
          <circle cx="7" cy="48" r="5" fill="rgba(249, 168, 34, 0.25)" stroke="rgba(249, 168, 34, 0.45)" strokeWidth="2"/>
          <circle cx="153" cy="48" r="5" fill="rgba(249, 168, 34, 0.25)" stroke="rgba(249, 168, 34, 0.45)" strokeWidth="2"/>
          <line x1="0" y1="48" x2="7" y2="48" stroke="rgba(249, 168, 34, 0.45)" strokeWidth="2" strokeDasharray="2 2"/>
          <line x1="153" y1="48" x2="160" y2="48" stroke="rgba(249, 168, 34, 0.45)" strokeWidth="2" strokeDasharray="2 2"/>
        </svg>
        
        {/* Additional gradient overlays */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{
          background: 'radial-gradient(circle, rgba(249, 168, 34, 0.15), rgba(249, 168, 34, 0.1), transparent)'
        }}></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl" style={{
          background: 'radial-gradient(circle, rgba(43, 186, 165, 0.15), rgba(43, 186, 165, 0.1), transparent)'
        }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-2xl" style={{
          background: 'radial-gradient(circle, rgba(147, 211, 174, 0.1), transparent, transparent)'
        }}></div>
      </div>
      {/* Sketchy Header */}
      <header className="sketch-border-bottom py-0 flex-shrink-0 overflow-visible relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 py-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image
                src="/black_jklu_logo.png"
                alt="JKLU Logo"
                width={68}
                height={68}
                className="sketch-logo"
                style={{ objectFit: 'contain' }}
              />
              <Image
                src="/Feedback_sys_logo.png"
                alt="JKLU Feedback System Logo"
                width={110}
                height={110}
                className="sketch-logo"
                style={{ objectFit: 'contain' }}
              />
            </div>
            <nav className="flex flex-wrap justify-center sm:justify-end gap-2">
              {isLoggedIn ? (
                <Link href="/dashboard">
                  <Button className="sketch-button-primary text-sm px-4 py-2 h-auto w-full sm:w-auto">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="sketch-button text-sm px-4 py-2 h-auto w-full sm:w-auto">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="sketch-button-primary text-sm px-4 py-2 h-auto w-full sm:w-auto">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content - Flex grow to fill remaining space */}
      <main className="flex-1 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-4 relative z-10">
        <div className="text-center mb-6">
          {/* Main Title with Sketch Effect */}
          <h1 className="sketch-title text-4xl md:text-6xl lg:text-7xl font-black mb-3 leading-tight" style={{ color: '#1f2937' }}>
            JKLU Feedback
            <br />
            <span style={{ color: '#fe8348' }}>Ticket System</span>
          </h1>
          
          {/* Subtitle */}
          <p className="sketch-text text-xl md:text-2xl lg:text-3xl font-bold mb-3" style={{ color: '#73865f' }}>
            Resolve Your Problem
          </p>
          
          {/* Description */}
          <p className="sketch-text text-sm md:text-base lg:text-lg text-gray-700 max-w-2xl mx-auto mb-4">
            Got an issue? We've got your back! Submit your feedback and let's make things better together.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="sketch-button-primary text-base px-6 py-3 h-auto">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="sketch-button-primary text-base px-6 py-3 h-auto">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="sketch-button text-base px-6 py-3 h-auto">
                    Already have an account?
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="sketch-card p-4 bg-white/80 backdrop-blur-sm">
            <div className="sketch-icon mb-2">
              <MessageSquare className="h-8 w-8" style={{ color: '#F9A822' }} />
            </div>
            <h3 className="sketch-text text-lg font-bold mb-2" style={{ color: '#2BBAA5' }}>
              Submit Feedback
            </h3>
            <p className="sketch-text text-sm" style={{ color: '#1f2937' }}>
              Share your concerns and feedback easily. Your voice matters!
            </p>
          </div>

          <div className="sketch-card p-4 bg-white/80 backdrop-blur-sm">
            <div className="sketch-icon mb-2">
              <Zap className="h-8 w-8" style={{ color: '#F96635' }} />
            </div>
            <h3 className="sketch-text text-lg font-bold mb-2" style={{ color: '#2BBAA5' }}>
              Quick Resolution
            </h3>
            <p className="sketch-text text-sm" style={{ color: '#1f2937' }}>
              Fast-track your problems. We work quickly to resolve issues.
            </p>
          </div>

          <div className="sketch-card p-4 bg-white/80 backdrop-blur-sm">
            <div className="sketch-icon mb-2">
              <CheckCircle2 className="h-8 w-8" style={{ color: '#93D3AE' }} />
            </div>
            <h3 className="sketch-text text-lg font-bold mb-2" style={{ color: '#2BBAA5' }}>
              Track Progress
            </h3>
            <p className="sketch-text text-gray-700 text-sm">
              Monitor your ticket status and see resolutions in real-time.
            </p>
          </div>
        </div>

        {/* Decorative Sketch Elements */}
        <div className="relative hidden md:block">
          <div className="sketch-doodle absolute top-0 left-10 opacity-20">
            <svg width="150" height="150" viewBox="0 0 200 200">
              <path
                d="M20,100 Q50,50 100,100 T180,100"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-orange-400"
              />
            </svg>
          </div>
          <div className="sketch-doodle absolute bottom-0 right-10 opacity-20">
            <svg width="120" height="120" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r="60" fill="none" stroke="currentColor" strokeWidth="3" className="text-yellow-400" />
            </svg>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="sketch-border-top py-2 flex-shrink-0 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="sketch-text text-xs md:text-sm font-bold text-gray-800 mb-1">
            Council of Technical Affairs
          </p>
          <div className="sketch-text text-xs text-gray-600 space-y-0.5">
            <p>Suryaansh Sharma - General Secretary</p>
            <p>Aman Pratap Singh - Secretary</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
