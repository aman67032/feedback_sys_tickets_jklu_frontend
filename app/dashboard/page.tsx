'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import ColorBends from '@/components/ui/dashboardbg';
import { complaintAPI, userAPI } from '@/lib/api';
import { getUser, hasRole } from '@/lib/auth';
import { Complaint, ComplaintStats, Domain, User } from '@/lib/types';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { Plus, MessageSquare, Clock, CheckCircle, AlertCircle, LogOut, Eye, ArrowRight, CheckCheck, X, TrendingUp, FileText, Filter } from 'lucide-react';

interface ComplaintFormData {
  title: string;
  description: string;
  domainId: number;
  priority: 'low' | 'medium' | 'high';
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const resolvedComplaints = complaints.filter(c => c.status === 'resolved');
  const activeComplaints = complaints.filter(c => c.status !== 'resolved');
  const [stats, setStats] = useState<ComplaintStats | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showNewComplaint, setShowNewComplaint] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'rejected'>('all');
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');
  const router = useRouter();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ComplaintFormData>();

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [complaintsRes, statsRes, domainsRes] = await Promise.all([
        complaintAPI.getComplaints(),
        userAPI.getStats(),
        userAPI.getDomains()
      ]);
      
      setComplaints(complaintsRes.data.complaints);
      setStats(statsRes.data.stats);
      setDomains(domainsRes.data.domains);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitComplaint = async (data: ComplaintFormData) => {
    setSubmitting(true);
    try {
      await complaintAPI.createComplaint(data);
      toast.success('Complaint submitted successfully!');
      reset();
      setShowNewComplaint(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const handleMarkSeen = async (complaintId: number) => {
    try {
      await complaintAPI.markSeen(complaintId.toString());
      toast.success('Complaint marked as seen');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to mark as seen');
    }
  };

  const handleStatusUpdate = async (complaintId: number, status: string, resolutionDetails?: string) => {
    try {
      await complaintAPI.updateComplaint(complaintId.toString(), { status, resolutionDetails });
      toast.success('Complaint updated successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update complaint');
    }
  };

  const handleTransfer = async (complaintId: number, toDomainId: number, reason: string) => {
    try {
      await complaintAPI.transferComplaint(complaintId.toString(), { toDomainId, reason });
      toast.success('Complaint transferred successfully');
      setShowTransferModal(false);
      setSelectedComplaint(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to transfer complaint');
    }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black relative">
        <div className="absolute inset-0 z-0">
          <ColorBends 
            colors={['#F97316', '#FB923C', '#FDBA74']}
            speed={0.3}
            scale={1.2}
            frequency={1.5}
            transparent={true}
          />
        </div>
        <div className="relative z-10 animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white"></div>
      </div>
    );
  }

  if (!user) return null;

  const filteredActiveComplaints = activeComplaints.filter((complaint) => {
    if (statusFilter === 'all') return true;
    return complaint.status === statusFilter;
  });

  
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <ColorBends 
          colors={['#F97316', '#FB923C', '#FDBA74', '#F97316']}
          speed={0.3}
          scale={1.2}
          frequency={1.5}
          warpStrength={1.2}
          mouseInfluence={1}
          parallax={0.5}
          transparent={true}
        />
      </div>
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30 z-[1] pointer-events-none"></div>
      {/* Header */}
      <header className="py-6 flex-shrink-0 overflow-visible relative z-10 border-b border-white/20 backdrop-blur-sm pointer-events-none">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <div className="flex items-center gap-4 pointer-events-auto">
              <div className="flex items-center gap-3">
                <Image
                  src="/white_jklu_logo.png"
                  alt="JKLU Logo"
                  width={80}
                  height={80}
                  className="sketch-logo-dark"
                  style={{ objectFit: 'contain' }}
                />
                <Image
                  src="/Feedback_sys_logo.png"
                  alt="Feedback System Logo"
                  width={140}
                  height={140}
                  className="sketch-logo-dark"
                  style={{ objectFit: 'contain', filter: 'brightness(1.1)' }}
                />
              </div>
              <div className="flex flex-col leading-tight">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">JKLU Feedback Dashboard</h1>
                <span className="text-base sm:text-lg text-white/80 mb-2">
                  Welcome, {user.name}
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/30 text-white uppercase tracking-wide backdrop-blur-sm">
                    {user.role === 'student' && 'Student'}
                    {user.role === 'sub_admin' && 'Sub Admin'}
                    {user.role === 'super_admin' && 'Super Admin'}
                  </span>
                  {user.role === 'sub_admin' && user.domainName && (
                    <span className="px-3 py-1 rounded-full bg-white/10 border border-white/30 text-white backdrop-blur-sm">
                      Domain: {user.domainName}
                    </span>
                  )}
                </span>
              </div>
            </div>
            <nav className="flex items-center flex-wrap justify-center sm:justify-end gap-3 pointer-events-auto">
              <Link href="/">
                <button className="px-6 py-3 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 hover:border-white/50 transition-all duration-300 text-base font-semibold">
                  Home
                </button>
              </Link>
              {user.role === 'super_admin' && (
                <Link href="/admin">
                  <button className="px-6 py-3 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 hover:border-white/50 transition-all duration-300 text-base font-semibold">
                    Admin
                  </button>
                </Link>
              )}
              <button 
                className="px-6 py-3 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 hover:border-white/50 transition-all duration-300 text-base font-semibold flex items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-12 relative z-10 pointer-events-none">
        <div className="pointer-events-auto">
        {/* Stats Cards - Enhanced Design */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <Card className="bg-white/10 backdrop-blur-md border-2 border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 rounded-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white/80 mb-2">Total Complaints</p>
                    <p className="text-5xl font-bold text-white">{stats.total}</p>
                  </div>
                  <div className="p-4 rounded-full bg-white/10">
                    <MessageSquare className="h-8 w-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-2 border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 rounded-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white/80 mb-2">Pending</p>
                    <p className="text-5xl font-bold text-white">{stats.pending}</p>
                  </div>
                  <div className="p-4 rounded-full bg-orange-500/20">
                    <Clock className="h-8 w-8 text-orange-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-2 border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 rounded-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white/80 mb-2">In Progress</p>
                    <p className="text-5xl font-bold text-white">{stats.in_progress}</p>
                  </div>
                  <div className="p-4 rounded-full bg-blue-500/20">
                    <TrendingUp className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-2 border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 rounded-xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white/80 mb-2">Resolved</p>
                    <p className="text-5xl font-bold text-white">{stats.resolved}</p>
                  </div>
                  <div className="p-4 rounded-full bg-green-500/20">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* New Complaint Button - Only for Students */}
        {user.role === 'student' && (
          <div className="mb-10 flex justify-between items-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">My Complaints</h2>
            <button 
              onClick={() => setShowNewComplaint(true)}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 border-2 border-white/30 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 text-lg font-bold flex items-center gap-2 shadow-lg"
            >
              <Plus className="h-6 w-6" />
              New Complaint
            </button>
          </div>
        )}

        {/* New Complaint Form Modal */}
        {showNewComplaint && (
          <Card className="mb-10 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between p-8">
              <div>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-2">Submit New Complaint</CardTitle>
                <CardDescription className="text-lg text-white/80">
                  Fill in the details to submit a new complaint
                </CardDescription>
              </div>
              <button
                onClick={() => setShowNewComplaint(false)}
                className="h-10 w-10 p-0 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmitComplaint)} className="space-y-6">
                <div className="bg-orange-500/20 border-l-4 border-orange-400 p-6 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-6 w-6 text-orange-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-base text-white">
                        <strong>Important Notice:</strong> Please ensure not to write any inappropriate words. 
                        You are anonymous to the department you are sending this complaint to.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-semibold text-white mb-3">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      {...register('title', { 
                        required: 'Title is required',
                        minLength: {
                          value: 5,
                          message: 'Title must be at least 5 characters'
                        }
                      })}
                      type="text"
                      className="w-full px-6 py-4 border-2 border-white/30 bg-white/10 backdrop-blur-sm rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                      placeholder="Enter complaint title"
                    />
                    {errors.title && (
                      <p className="mt-2 text-base text-red-400">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-white mb-3">
                      Priority
                    </label>
                    <select
                      {...register('priority')}
                      className="w-full px-6 py-4 border-2 border-white/30 bg-white/10 backdrop-blur-sm rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                    >
                      <option value="low" className="bg-gray-800">Low</option>
                      <option value="medium" className="bg-gray-800">Medium</option>
                      <option value="high" className="bg-gray-800">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-semibold text-white mb-3">
                    Domain <span className="text-red-400">*</span>
                  </label>
                  <select
                    {...register('domainId', { 
                      required: 'Domain is required',
                      valueAsNumber: true
                    })}
                    className="w-full px-6 py-4 border-2 border-white/30 bg-white/10 backdrop-blur-sm rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                  >
                    <option value="" className="bg-gray-800">Select a domain</option>
                    {domains.map((domain) => (
                      <option key={domain.id} value={domain.id} className="bg-gray-800">
                        {domain.name}
                      </option>
                    ))}
                  </select>
                  {errors.domainId && (
                    <p className="mt-2 text-base text-red-400">{errors.domainId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-lg font-semibold text-white mb-3">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    {...register('description', { 
                      required: 'Description is required',
                      minLength: {
                        value: 10,
                        message: 'Description must be at least 10 characters'
                      }
                    })}
                    rows={6}
                    className="w-full px-6 py-4 border-2 border-white/30 bg-white/10 backdrop-blur-sm rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                    placeholder="Describe your complaint in detail..."
                  />
                  {errors.description && (
                    <p className="mt-2 text-base text-red-400">{errors.description.message}</p>
                  )}
                </div>

                <div className="flex space-x-4 pt-4">
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 border-2 border-white/30 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 text-lg font-bold disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Complaint'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowNewComplaint(false);
                      reset();
                    }}
                    className="px-8 py-4 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 hover:border-white/50 transition-all duration-300 text-lg font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Complaints Section with Tabs */}
        <div className="mb-10">
          {/* Quick Filters (role-aware) */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 text-base sm:text-lg text-white font-semibold">
              <Filter className="h-5 w-5 sm:h-6 sm:w-6" />
              Quick filters:
            </span>
            {['all', 'pending', 'in_progress', 'rejected'].map((value) => {
              const label =
                value === 'all'
                  ? 'All'
                  : value === 'in_progress'
                  ? 'In progress'
                  : value.charAt(0).toUpperCase() + value.slice(1);
              const isActive = statusFilter === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value as typeof statusFilter)}
                  className={`px-5 py-2 rounded-full text-base font-semibold border-2 transition-colors ${
                    isActive
                      ? 'bg-orange-500/30 text-white border-orange-400'
                      : 'bg-white/10 text-white/80 border-white/30 hover:bg-white/20 hover:border-white/50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 border-b-2 border-white/20 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-3 text-lg sm:text-xl font-bold transition-colors relative whitespace-nowrap ${
                activeTab === 'active'
                  ? 'text-orange-400'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              Active Complaints
              {activeTab === 'active' && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-orange-400 rounded-t"></span>
              )}
              {activeComplaints.length > 0 && (
                <span className={`ml-3 px-3 py-1 rounded-full text-base font-semibold ${
                  activeTab === 'active' ? 'bg-orange-500/30 text-white' : 'bg-white/10 text-white/60'
                }`}>
                  {activeComplaints.length}
                </span>
              )}
            </button>
            {resolvedComplaints.length > 0 && (
              <button
                onClick={() => setActiveTab('resolved')}
                className={`px-6 py-3 text-lg sm:text-xl font-bold transition-colors relative whitespace-nowrap ${
                  activeTab === 'resolved'
                    ? 'text-green-400'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Resolved Complaints
                {activeTab === 'resolved' && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-green-400 rounded-t"></span>
                )}
                <span className={`ml-3 px-3 py-1 rounded-full text-base font-semibold ${
                  activeTab === 'resolved' ? 'bg-green-500/30 text-white' : 'bg-white/10 text-white/60'
                }`}>
                  {resolvedComplaints.length}
                </span>
              </button>
            )}
          </div>

          {/* Active Complaints */}
          {activeTab === 'active' && (
            <div>
              {filteredActiveComplaints.length === 0 ? (
                <Card className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl">
                  <CardContent className="text-center py-16">
                    <FileText className="h-16 w-16 mx-auto mb-6 text-white/60" />
                    <p className="text-white text-xl sm:text-2xl font-semibold mb-6">
                      {statusFilter === 'all'
                        ? 'No active complaints found.'
                        : 'No complaints match the selected filter.'}
                    </p>
                    {user.role === 'student' && (
                      <button 
                        onClick={() => setShowNewComplaint(true)}
                        className="mt-6 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 border-2 border-white/30 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 text-lg font-bold flex items-center gap-2 mx-auto"
                      >
                        <Plus className="h-6 w-6" />
                        Create Your First Complaint
                      </button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-8">
                  {filteredActiveComplaints.map((complaint) => (
                    <Card key={complaint.id} className="bg-white/10 backdrop-blur-md border-2 border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 rounded-xl">
                      <CardHeader className="p-8">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-2xl sm:text-3xl flex items-center gap-3 text-white mb-3 font-bold">
                              {complaint.title}
                              {user?.role === 'student' && complaint.adminSeen && (
                                <span className="inline-flex items-center gap-2 text-base text-blue-400">
                                  <CheckCheck className="h-5 w-5" />
                                  Seen by admin
                                </span>
                              )}
                            </CardTitle>
                            <CardDescription className="text-lg text-white/80 flex items-center gap-3 flex-wrap">
                              <span className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                {complaint.domainName}
                              </span>
                              <span>•</span>
                              <span>{safeFormatDate(complaint.createdAt)}</span>
                              {user?.role === 'student' && complaint.adminSeen && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-400">Seen by admin</span>
                                </>
                              )}
                            </CardDescription>
                          </div>
                          <div className="flex gap-3 flex-wrap">
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-base font-semibold border-2 ${
                              complaint.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400' :
                              complaint.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300 border-blue-400' :
                              complaint.status === 'resolved' ? 'bg-green-500/20 text-green-300 border-green-400' :
                              'bg-red-500/20 text-red-300 border-red-400'
                            }`}>
                              {complaint.status.replace('_', ' ')}
                            </span>
                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-base font-semibold border-2 ${
                              complaint.priority === 'low' ? 'bg-gray-500/20 text-gray-300 border-gray-400' :
                              complaint.priority === 'medium' ? 'bg-orange-500/20 text-orange-300 border-orange-400' :
                              'bg-red-500/20 text-red-300 border-red-400'
                            }`}>
                              {complaint.priority}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-8 pt-0">
                        <div className="space-y-6">
                          <div className="bg-white/5 p-6 rounded-lg border-2 border-white/10">
                            <p className="text-white text-lg leading-relaxed">{complaint.description}</p>
                          </div>
                          
                          {user.role === 'super_admin' && complaint.studentName && (
                            <div className="text-lg text-white p-4 bg-blue-500/20 rounded-lg border-2 border-blue-400/30">
                              <strong>Student:</strong> {complaint.studentName} ({complaint.studentEmail})
                            </div>
                          )}
                          
                          {(user.role === 'sub_admin' || user.role === 'super_admin') && (
                            <div className="flex flex-wrap gap-3 pt-4">
                              {!complaint.adminSeen && (
                                <button 
                                  onClick={() => handleMarkSeen(complaint.id)}
                                  className="px-6 py-3 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 hover:border-white/50 transition-all duration-300 text-base font-semibold flex items-center gap-2"
                                >
                                  <Eye className="h-5 w-5" />
                                  Mark Seen
                                </button>
                              )}
                              {complaint.status === 'pending' && (
                                <button 
                                  onClick={() => handleStatusUpdate(complaint.id, 'in_progress')}
                                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 border-2 border-white/30 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 text-base font-bold flex items-center gap-2"
                                >
                                  <Clock className="h-5 w-5" />
                                  Start Progress
                                </button>
                              )}
                              {complaint.status === 'in_progress' && (
                                <>
                                  <button 
                                    onClick={() => {
                                      const resolution = prompt('Enter resolution details:');
                                      if (resolution) {
                                        handleStatusUpdate(complaint.id, 'resolved', resolution);
                                      }
                                    }}
                                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 border-2 border-white/30 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 text-base font-bold flex items-center gap-2"
                                  >
                                    <CheckCircle className="h-5 w-5" />
                                    Resolve
                                  </button>
                                  <button 
                                    onClick={() => handleStatusUpdate(complaint.id, 'rejected')}
                                    className="px-6 py-3 border-2 border-red-400/50 bg-red-500/20 backdrop-blur-sm text-red-300 rounded-lg hover:bg-red-500/30 hover:border-red-400 transition-all duration-300 text-base font-semibold flex items-center gap-2"
                                  >
                                    <AlertCircle className="h-5 w-5" />
                                    Reject
                                  </button>
                                </>
                              )}
                              {user.role === 'super_admin' && (
                                <button 
                                  onClick={() => {
                                    setSelectedComplaint(complaint);
                                    setShowTransferModal(true);
                                  }}
                                  className="px-6 py-3 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 hover:border-white/50 transition-all duration-300 text-base font-semibold flex items-center gap-2"
                                >
                                  <ArrowRight className="h-5 w-5" />
                                  Transfer
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Resolved Complaints */}
          {activeTab === 'resolved' && resolvedComplaints.length > 0 && (
            <div className="grid gap-8">
              {resolvedComplaints.map((complaint) => (
                <Card key={complaint.id} className="bg-white/10 backdrop-blur-md border-2 border-green-400/30 hover:bg-white/15 hover:border-green-400/50 transition-all duration-300 rounded-xl">
                  <CardHeader className="p-8">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-2xl sm:text-3xl flex items-center gap-3 text-white mb-3 font-bold">
                          {complaint.title}
                          {user?.role === 'student' && complaint.adminSeen && (
                            <CheckCheck className="h-6 w-6 text-blue-400" />
                          )}
                        </CardTitle>
                        <CardDescription className="text-lg text-white/80 flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            {complaint.domainName}
                          </span>
                          <span>•</span>
                          <span>Created {safeFormatDate(complaint.createdAt)}</span>
                          {complaint.resolvedAt && (
                            <>
                              <span>•</span>
                              <span className="text-green-400">Resolved {safeFormatDate(complaint.resolvedAt)}</span>
                            </>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex gap-3">
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-base font-semibold bg-green-500/20 text-green-300 border-2 border-green-400">
                          Resolved
                        </span>
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-base font-semibold border-2 ${
                          complaint.priority === 'low' ? 'bg-gray-500/20 text-gray-300 border-gray-400' :
                          complaint.priority === 'medium' ? 'bg-orange-500/20 text-orange-300 border-orange-400' :
                          'bg-red-500/20 text-red-300 border-red-400'
                        }`}>
                          {complaint.priority}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <div className="space-y-6">
                      <div className="bg-white/5 p-6 rounded-lg border-2 border-white/10">
                        <h5 className="font-bold text-xl text-white mb-3">Problem:</h5>
                        <p className="text-white text-lg leading-relaxed">{complaint.description}</p>
                      </div>
                      {complaint.resolutionDetails && (
                        <div className="bg-green-500/20 p-6 rounded-lg border-2 border-green-400/30">
                          <h5 className="font-bold text-xl text-green-300 mb-3 flex items-center gap-2">
                            <CheckCircle className="h-6 w-6" />
                            Solution:
                          </h5>
                          <p className="text-white text-lg leading-relaxed">{complaint.resolutionDetails}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        </div>
      </main>

      {/* Transfer Modal */}
      {showTransferModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between p-8">
              <div>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-2">Transfer Complaint</CardTitle>
                <CardDescription className="text-lg text-white/80">
                  Transfer "{selectedComplaint.title}" to another domain
                </CardDescription>
              </div>
              <button
                onClick={() => {
                  setShowTransferModal(false);
                  setSelectedComplaint(null);
                }}
                className="h-10 w-10 p-0 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const toDomainId = parseInt(formData.get('toDomainId') as string);
                const reason = formData.get('reason') as string;
                handleTransfer(selectedComplaint.id, toDomainId, reason);
              }} className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-white mb-3">
                    Target Domain <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="toDomainId"
                    className="w-full px-6 py-4 border-2 border-white/30 bg-white/10 backdrop-blur-sm rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                    required
                  >
                    <option value="" className="bg-gray-800">Select a domain</option>
                    {domains.filter(d => d.id !== selectedComplaint.domainId).map((domain) => (
                      <option key={domain.id} value={domain.id} className="bg-gray-800">
                        {domain.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-lg font-semibold text-white mb-3">
                    Transfer Reason <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="reason"
                    rows={5}
                    className="w-full px-6 py-4 border-2 border-white/30 bg-white/10 backdrop-blur-sm rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                    placeholder="Reason for transfer..."
                    required
                  />
                </div>
                <div className="flex space-x-4 pt-4">
                  <button 
                    type="submit" 
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 border-2 border-white/30 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-300 text-lg font-bold"
                  >
                    Transfer
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowTransferModal(false);
                      setSelectedComplaint(null);
                    }}
                    className="px-8 py-4 border-2 border-white/30 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 hover:border-white/50 transition-all duration-300 text-lg font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
