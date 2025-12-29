'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { adminAPI, userAPI } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { User, Domain, AuditLog } from '@/lib/types';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { Users, MessageSquare, Activity, LogOut, Plus, Eye, ToggleLeft, ToggleRight, Filter } from 'lucide-react';

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
  const router = useRouter();
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CreateUserData>();

  const watchedRole = watch('role');

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
      
      setUsers(usersRes.data.users);
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

  const handleToggleUser = async (userId: number) => {
    try {
      await adminAPI.toggleUser(userId.toString());
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
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'sub_admin': return 'bg-purple-100 text-purple-800';
      case 'super_admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(to bottom right, #FFFBF4, #D8CFBC)' }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) return null;

  const filteredUsers = userRoleFilter === 'all'
    ? users
    : users.filter((u) => u.role === userRoleFilter);

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(to bottom right, #FFFBF4, #D8CFBC)' }}
    >
      <header className="shadow-sm border-b" style={{ background: '#FFFBF4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-16 gap-3 py-3 sm:py-0">
            <div className="flex flex-col sm:flex-row items-center text-center sm:text-left">
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#11120D' }}>Admin Dashboard</h1>
                <span className="text-xs sm:text-sm" style={{ color: '#565449' }}>
                  Super Admin Panel
                </span>
                <span className="mt-1 text-[11px] sm:text-xs text-gray-700">
                  Logged in as <span className="font-semibold">{user.name}</span> ({user.email})
                </span>
              </div>
              <span className="mt-2 sm:mt-0 sm:ml-4 px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-medium bg-red-50 text-red-700 border border-red-200 uppercase tracking-wide">
                Super Admin
              </span>
            </div>
            <div className="flex items-center flex-wrap justify-center sm:justify-end gap-2">
              <Link href="/dashboard">
                <Button variant="outline" className="sketch-button-auth w-full sm:w-auto">User Dashboard</Button>
              </Link>
              <Button variant="outline" className="sketch-button-auth w-full sm:w-auto" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {dashboardStats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="sketch-card bg-white/90 backdrop-blur-sm border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#565449' }}>Total Users</p>
                    <p className="text-3xl font-bold" style={{ color: '#11120D' }}>{dashboardStats.userStats.total}</p>
                  </div>
                  <div className="p-3 rounded-full" style={{ background: 'rgba(86, 84, 73, 0.1)' }}>
                    <Users className="h-6 w-6" style={{ color: '#565449' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="sketch-card bg-white/90 backdrop-blur-sm border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#565449' }}>Total Complaints</p>
                    <p className="text-3xl font-bold" style={{ color: '#11120D' }}>{dashboardStats.complaintStats.total}</p>
                  </div>
                  <div className="p-3 rounded-full" style={{ background: 'rgba(147, 211, 174, 0.15)' }}>
                    <MessageSquare className="h-6 w-6" style={{ color: '#73865f' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="sketch-card bg-white/90 backdrop-blur-sm border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#565449' }}>Pending Complaints</p>
                    <p className="text-3xl font-bold" style={{ color: '#11120D' }}>{dashboardStats.complaintStats.pending}</p>
                  </div>
                  <div className="p-3 rounded-full" style={{ background: 'rgba(249, 168, 34, 0.15)' }}>
                    <Activity className="h-6 w-6" style={{ color: '#C96A12' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="sketch-card bg-white/90 backdrop-blur-sm border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#565449' }}>Inactive Users</p>
                    <p className="text-3xl font-bold" style={{ color: '#11120D' }}>{dashboardStats.userStats.inactive}</p>
                  </div>
                  <div className="p-3 rounded-full" style={{ background: 'rgba(201, 106, 18, 0.12)' }}>
                    <Users className="h-6 w-6" style={{ color: '#C96A12' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="sketch-card bg-white/90 border-2 border-[#D8CFBC]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>User Management</CardTitle>
                <Button onClick={() => setShowCreateUser(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </div>
              <CardDescription>
                Manage system users, roles, and access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1 text-xs text-gray-700">
                  <Filter className="h-3 w-3" />
                  Filter by role:
                </span>
                <div className="flex flex-wrap gap-2">
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
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        userRoleFilter === opt.value
                          ? 'bg-orange-100 text-orange-800 border-orange-300'
                          : 'bg-white text-gray-700 border-[#D8CFBC] hover:bg-gray-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredUsers.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    No users found for the selected filter.
                  </p>
                ) : (
                  filteredUsers.slice(0, 5).map((userItem) => (
                    <div key={userItem.id} className="flex items-center justify-between p-3 border rounded-lg bg-white/70">
                      <div>
                        <p className="font-medium">{userItem.name}</p>
                        <p className="text-xs text-gray-600">{userItem.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(userItem.role)}`}>
                          {userItem.role.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => handleToggleUser(userItem.id)}
                          className="p-1 rounded hover:bg-gray-100"
                        >
                          {userItem.isActive ? (
                            <ToggleRight className="h-5 w-5 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-5 w-5 text-red-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="sketch-card bg-white/90 border-2 border-[#D8CFBC]">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest system actions and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.length === 0 ? (
                  <p className="text-sm text-gray-600">No recent activity yet.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="p-3 border rounded-lg bg-white/70">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{log.action}</p>
                          <p className="text-xs text-gray-600">
                            {log.userName || 'System'} • {log.resourceType}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
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
          <Card className="bg-[#FFFBF4] border-[#D8CFBC]">
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
              <CardDescription>
                Add a new user to the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmitUser)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    {...register('role', { required: 'Role is required' })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select a role</option>
                    <option value="student">Student</option>
                    <option value="sub_admin">Sub Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {watchedRole === 'student' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Student ID
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
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter student ID"
                    />
                    {errors.studentId && (
                      <p className="mt-1 text-sm text-red-600">{errors.studentId.message}</p>
                    )}
                  </div>
                )}

                {watchedRole === 'sub_admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Domain
                    </label>
                    <select
                      {...register('domainId', { 
                        required: 'Domain is required for sub-admins',
                        valueAsNumber: true
                      })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select a domain</option>
                      {domains.map((domain) => (
                        <option key={domain.id} value={domain.id}>
                          {domain.name}
                        </option>
                      ))}
                    </select>
                    {errors.domainId && (
                      <p className="mt-1 text-sm text-red-600">{errors.domainId.message}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" loading={creating} disabled={creating}>
                    {creating ? 'Creating...' : 'Create User'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateUser(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
