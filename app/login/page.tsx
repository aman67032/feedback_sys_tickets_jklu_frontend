'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { authAPI } from '@/lib/api';
import { setToken, setUser } from '@/lib/auth';
import toast from 'react-hot-toast';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const response = await authAPI.login(data);
      setToken(response.data.token);
      setUser(response.data.user);
      toast.success('Login successful!');
      
      const redirectPath = response.data.user.role === 'super_admin' ? '/admin' : '/dashboard';
      router.push(redirectPath);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen flex items-center justify-center relative overflow-hidden px-4 sm:px-6 lg:px-8"
      style={{
        background: 'linear-gradient(to bottom right, #FFFBF4, #D8CFBC, #565449)'
      }}
    >
      {/* background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(216, 207, 188, 0.2)' }} />
        <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full blur-3xl" style={{ background: 'rgba(86, 84, 73, 0.15)' }} />
        <div className="absolute top-1/3 right-1/4 w-52 h-24 rounded-3xl rotate-6" style={{ background: 'rgba(255, 251, 244, 0.2)' }} />
      </div>

      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="hidden lg:flex flex-col justify-center rounded-2xl border-2 backdrop-blur-md p-8 shadow-2xl sketch-card" style={{ 
          borderColor: '#565449',
          background: 'rgba(255, 251, 244, 0.4)'
        }}>
          <h2 className="sketch-title text-4xl font-black mb-3" style={{ color: '#11120D' }}>
            Welcome Back
          </h2>
          <p className="sketch-text text-lg" style={{ color: '#565449' }}>
            Sign in to track your tickets, updates, and resolutions.
          </p>
          <div className="mt-6 space-y-2 text-sm" style={{ color: '#11120D' }}>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: '#565449' }} />
              Secure login with JWT session
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: '#565449' }} />
              Instant dashboard redirect based on role
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full" style={{ background: '#565449' }} />
              Keep your tickets in sync across devices
            </div>
          </div>
        </div>

        <div className="sketch-card backdrop-blur-md border-2 shadow-2xl rounded-2xl p-8" style={{
          background: 'rgba(255, 251, 244, 0.9)',
          borderColor: '#D8CFBC'
        }}>
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold" style={{ color: '#11120D' }}>
              Sign in
            </h2>
            <p className="text-sm mt-2" style={{ color: '#565449' }}>
              or{' '}
              <Link href="/register" className="font-semibold" style={{ color: '#565449' }}>
                create a new account
              </Link>
            </p>
          </div>

          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium" style={{ color: '#11120D' }}>
                    Email address
                  </label>
                  <input
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm sm:text-sm"
                    style={{
                      border: '1px solid #D8CFBC',
                      background: '#FFFBF4',
                      color: '#11120D'
                    }}
                    placeholder="you@college.edu"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#565449';
                      e.target.style.outline = 'none';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D8CFBC';
                    }}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm" style={{ color: '#565449' }}>{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#11120D' }}>
                    Password
                  </label>
                  <input
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                    type="password"
                    className="mt-1 block w-full px-3 py-2 rounded-md shadow-sm sm:text-sm"
                    style={{
                      border: '1px solid #D8CFBC',
                      background: '#FFFBF4',
                      color: '#11120D'
                    }}
                    placeholder="••••••••"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#565449';
                      e.target.style.outline = 'none';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D8CFBC';
                    }}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm" style={{ color: '#565449' }}>{errors.password.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full sketch-button-primary-auth text-base py-3"
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
