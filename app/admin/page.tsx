'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import ColorBends from '@/components/ui/dashboardbg';
import Loader from '@/components/ui/Loader';
import { adminAPI, userAPI } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { User, Domain, AuditLog } from '@/lib/types';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { Users, MessageSquare, Activity, LogOut, Plus, Eye, ToggleLeft, ToggleRight, Filter, X } from 'lucide-react';

interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'sub_admin' | 'super_admin';
  studentId?: string;
  domainId?: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [creating, setCreating] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'student' | 'sub_admin' | 'super_admin'>('all');
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CreateUserData>();

  const watchedRole = watch('role');

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [usersRes, domainsRes, logsRes, dashboardRes] = await Promise.all([
        adminAPI.getUsers(),
        userAPI.getDomains(),
        adminAPI.getAuditLogs({ limit: 10 }),
        adminAPI.getDashboard()
      ]);

      // Normalize API shape to match frontend User type (is_active -> isActive)
      const normalizedUsers: User[] = usersRes.data.users.map((u: any) => ({
        ...u,
        isActive: u.isActive ?? u.is_active, // support both shapes
      }));

      setUsers(normalizedUsers);
      setDomains(domainsRes.data.domains);
      setAuditLogs(logsRes.data.logs);
      setDashboardStats(dashboardRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitUser = async (data: CreateUserData) => {
    setCreating(true);
    try {
      await adminAPI.createUser(data);
      toast.success('User created successfully!');
      reset();
      setShowCreateUser(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleUser = async (userItem: User) => {
    try {
      let payload: any = undefined;

      if (userItem.isActive) {
        const reason = window.prompt('Enter reason for disabling this account (required):');
        if (!reason) {
          toast.error('Disable reason is required.');
          return;
        }
        payload = { reason };
      }

      await adminAPI.toggleUser(userItem.id.toString(), payload);
      toast.success('User status updated successfully!');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const safeFormatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Invalid date';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-500/20 text-blue-300 border-blue-400';
      case 'sub_admin': return 'bg-purple-500/20 text-purple-300 border-purple-400';
      case 'super_admin': return 'bg-red-500/20 text-red-300 border-red-400';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black relative">
        <div className="absolute inset-0 z-0">
          <ColorBends 
            colors={['#F90316', '#FB923C', '#F00A74']}
            speed={0.3}
            scale={1.2}
            frequency={1.5}
            transparent={false}
          />
        </div>
        <div className="relative z-10">
          <Loader />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const filteredUsers = userRoleFilter === 'all'
    ? users
    : users.filter((u) => u.role === userRoleFilter);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Animated Background */}
      {!isMobile && (
        <div className="absolute inset-0 z-0 pointer-events-auto hidden md:block">
          <ColorBends 
            colors={['#F90316', '#FB923C', '#F00A74', '#F90316']}
            speed={0.3}
            scale={1.2}
            frequency={1.5}
            warpStrength={1.2}
            mouseInfluence={1}
            parallax={0.5}
            transparent={false}
          />
        </div>
      )}
      
      {/* Mobile-optimized gradient background */}
      {isMobile && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F90316]/20 via-black to-[#F00A74]/20"></div>
        </div>
      )}

      {/* Header */}
      <header className="py-4 sm:py-6 flex-shrink-0 overflow-visible relative z-10 border-b border-white/20 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="flex flex-col gap-4 sm:gap-0">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 pointer-events-auto w-full sm:w-auto justify-center sm:justify-start">
                <div className="flex flex-col text-center sm:text-left">
                  <h1 className="text-base sm:text-xl md:text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
                  <span className="text-xs sm:text-sm text-white/80 mb-1">
                    Super Admin Panel
                  </span>
                  <span className="text-[10px] sm:text-xs text-white/60">
                    Logged in as <span className="font-semibold">{user.name}</span> ({user.email})
                  </span>
                </div>
                <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-300 border-2 border-red-400 text-[10px] sm:text-xs font-medium uppercase tracking-wide">
                  Super Admin
                </span>
              </div>
              <div className="flex items-center flex-wrap justify-center gap-2 pointer-events-auto w-full sm:w-auto">
                <Link href="/dashboard" className="flex-1 sm:flex-none">
                  <button className="w-full sm:w-auto px-3 sm:px-4 py-2 border-2 border-white/30 bg-white/10 text-white rounded-lg hover:bg-white/20 hover:border-white/50 transition-all duration-300 text-xs sm:text-sm font-semibold">
                    User Dashboard
                  </button>
                </Link>
                <button 
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 border-2 border-white/30 bg-white/10 text-white rounded-lg hover:bg-white/20 hover:border-white/50 transition-all duration-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 py-6 sm:py-12 relative z-10 pointer-events-none">
        <div className="pointer-events-auto">
        {dashboardStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-12">
            <Card className="bg-white/10 border-2 border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 rounded-xl">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-white/80 mb-1">Total Users</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{dashboardStats.userStats.total}</p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-full bg-white/10 flex-shrink-0">
                    <Users className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-2 border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 rounded-xl">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-white/80 mb-1">Total Complaints</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{dashboardStats.complaintStats.total}</p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-full bg-blue-500/20 flex-shrink-0">
                    <MessageSquare className="h-4 w-4 sm:h-6 sm:w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-2 border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 rounded-xl">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-white/80 mb-1">Pending Complaints</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{dashboardStats.complaintStats.pending}</p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-full bg-orange-500/20 flex-shrink-0">
                    <Activity className="h-4 w-4 sm:h-6 sm:w-6 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-2 border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 rounded-xl">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-white/80 mb-1">Inactive Users</p>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{dashboardStats.userStats.inactive}</p>
                  </div>
                  <div className="p-2 sm:p-3 rounded-full bg-red-500/20 flex-shrink-0">
                    <Users className="h-4 w-4 sm:h-6 sm:w-6 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <Card className="bg-white/10 border-2 border-white/20 rounded-xl">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                <div className="flex-1">
                  <CardTitle className="text-lg sm:text-xl font-bold text-white mb-1">User Management</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-white/80">
                    Manage system users, roles, and access
                  </CardDescription>
                </div>
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 border-2 border-white/30 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 text-xs sm:text-sm font-bold flex items-center gap-2 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  Create User
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-white font-semibold">
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                  Filter by role:
                </span>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'student', label: 'Students' },
                    { value: 'sub_admin', label: 'Sub Admins' },
                    { value: 'super_admin', label: 'Super Admins' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setUserRoleFilter(opt.value as typeof userRoleFilter)}
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border-2 transition-colors active:scale-95 ${
                        userRoleFilter === opt.value
                          ? 'bg-orange-500/30 text-white border-orange-400'
                          : 'bg-white/10 text-white/80 border-white/30 hover:bg-white/20 hover:border-white/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {filteredUsers.length === 0 ? (
                  <p className="text-sm text-white/70 text-center py-4">
                    No users found for the selected filter.
                  </p>
                ) : (
                  filteredUsers.slice(0, 5).map((userItem) => (
                    <div key={userItem.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border-2 border-white/20 rounded-lg bg-white/5 hover:bg-white/10 transition-all gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-white text-sm sm:text-base">{userItem.name}</p>
                        <p className="text-xs sm:text-sm text-white/70">{userItem.email}</p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <span className={`inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold border-2 ${getRoleColor(userItem.role)}`}>
                          {userItem.role.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => handleToggleUser(userItem)}
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors active:scale-95"
                        >
                          {userItem.isActive ? (
                            <ToggleRight className="h-5 w-5 text-green-400" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-red-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-2 border-white/20 rounded-xl">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl font-bold text-white mb-1">Recent Activity</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-white/80">
                Latest system actions and changes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {auditLogs.length === 0 ? (
                  <p className="text-sm text-white/70 text-center py-4">No recent activity yet.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="p-3 sm:p-4 border-2 border-white/20 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-white text-sm sm:text-base">{log.action}</p>
                          <p className="text-xs sm:text-sm text-white/70">
                            {log.userName || 'System'} • {log.resourceType}
                          </p>
                        </div>
                        <p className="text-xs text-white/60">
                          {safeFormatDate(log.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {showCreateUser && (
          <Card className="bg-white/10 border-2 border-white/20 rounded-xl mb-6 sm:mb-8">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-row items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">Create New User</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-white/80">
                    Add a new user to the system
                  </CardDescription>
                </div>
                <button
                  onClick={() => setShowCreateUser(false)}
                  className="h-8 w-8 sm:h-10 sm:w-10 p-0 text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit(onSubmitUser)} className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-white mb-2">
                    Role <span className="text-red-400">*</span>
                  </label>
                  <select
                    {...register('role', { required: 'Role is required' })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-white/30 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  >
                    <option value="" className="bg-gray-800">Select a role</option>
                    <option value="student" className="bg-gray-800">Student</option>
                    <option value="sub_admin" className="bg-gray-800">Sub Admin</option>
                    <option value="super_admin" className="bg-gray-800">Super Admin</option>
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.role.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-white mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register('name', { 
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    })}
                    type="text"
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-white/30 bg-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-white mb-2">
                    Email <span className="text-red-400">*</span>
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
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-white/30 bg-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    placeholder="Enter email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>

                {watchedRole === 'student' && (
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-white mb-2">
                      Student ID <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register('studentId', { 
                        required: 'Student ID is required for students',
                        minLength: {
                          value: 5,
                          message: 'Student ID must be at least 5 characters'
                        }
                      })}
                      type="text"
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-white/30 bg-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                      placeholder="Enter student ID"
                    />
                    {errors.studentId && (
                      <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.studentId.message}</p>
                    )}
                  </div>
                )}

                {watchedRole === 'sub_admin' && (
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-white mb-2">
                      Domain <span className="text-red-400">*</span>
                    </label>
                    <select
                      {...register('domainId', { 
                        required: 'Domain is required for sub-admins',
                        valueAsNumber: true
                      })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-white/30 bg-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    >
                      <option value="" className="bg-gray-800">Select a domain</option>
                      {domains.map((domain) => (
                        <option key={domain.id} value={domain.id} className="bg-gray-800">
                          {domain.name}
                        </option>
                      ))}
                    </select>
                    {errors.domainId && (
                      <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.domainId.message}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-white mb-2">
                    Password <span className="text-red-400">*</span>
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
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-white/30 bg-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs sm:text-sm text-red-400">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button 
                    type="submit" 
                    disabled={creating}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 border-2 border-white/30 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 text-sm font-bold disabled:opacity-50 active:scale-95"
                  >
                    {creating ? 'Creating...' : 'Create User'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowCreateUser(false)}
                    className="w-full sm:w-auto px-6 py-2.5 border-2 border-white/30 bg-white/10 text-white rounded-lg hover:bg-white/20 hover:border-white/50 transition-all duration-300 text-sm font-semibold active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        </div>
      </main>
    </div>
  );
}
