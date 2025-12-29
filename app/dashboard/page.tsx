'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
      <div
        className="min-h-screen flex items-center justify-center sketch-bg"
        style={{ background: 'linear-gradient(to bottom right, #FFEFD5, #E0F7E9)' }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#F9A822' }}></div>
      </div>
    );
  }

  if (!user) return null;

  const filteredActiveComplaints = activeComplaints.filter((complaint) => {
    if (statusFilter === 'all') return true;
    return complaint.status === statusFilter;
  });


  
  return (
    <div
      className="min-h-screen sketch-bg"
      style={{ background: 'linear-gradient(to bottom right, #FFEFD5, #E0F7E9)' }}
    >
      {/* Enhanced Header */}
      <header className="sketch-border-bottom py-0 flex-shrink-0 overflow-visible relative z-10" style={{ background: 'rgba(255, 251, 244, 0.95)', backdropFilter: 'blur(10px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Image
                  src="/black_jklu_logo.png"
                  alt="JKLU Logo"
                  width={60}
                  height={60}
                  className="sketch-logo"
                  style={{ objectFit: 'contain' }}
                />
                <Image
                  src="/Feedback_sys_logo.png"
                  alt="Feedback System Logo"
                  width={110}
                  height={110}
                  className="sketch-logo w-16 h-16 sm:w-28 sm:h-28"
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="flex flex-col leading-tight">
                <h1 className="text-lg sm:text-xl font-bold sketch-text" style={{ color: '#1f2937' }}>JKLU Feedback Dashboard</h1>
                <span className="text-xs sm:text-sm sketch-text" style={{ color: '#73865f' }}>
                  Welcome, {user.name}
                </span>
                <span className="mt-1 inline-flex items-center gap-2 text-[11px] sm:text-xs font-medium">
                  <span className="px-2 py-0.5 rounded-full bg-white/70 border border-[#D8CFBC] uppercase tracking-wide">
                    {user.role === 'student' && 'Student'}
                    {user.role === 'sub_admin' && 'Sub Admin'}
                    {user.role === 'super_admin' && 'Super Admin'}
                  </span>
                  {user.role === 'sub_admin' && user.domainName && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                      Domain: {user.domainName}
                    </span>
                  )}
                </span>
              </div>
            </div>
            <nav className="flex items-center flex-wrap justify-center sm:justify-end gap-2">
              <Link href="/">
                <Button variant="outline" className="sketch-button text-xs sm:text-sm px-4 py-2 h-auto w-full sm:w-auto">
                  Home
                </Button>
              </Link>
              {user.role === 'super_admin' && (
                <Link href="/admin">
                  <Button variant="outline" className="sketch-button text-xs sm:text-sm px-4 py-2 h-auto w-full sm:w-auto">
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="outline" className="sketch-button text-xs sm:text-sm px-4 py-2 h-auto w-full sm:w-auto" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats Cards - Enhanced Design */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="sketch-card bg-white/90 backdrop-blur-sm border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium sketch-text mb-1" style={{ color: '#565449' }}>Total Complaints</p>
                    <p className="text-3xl font-bold sketch-text" style={{ color: '#1f2937' }}>{stats.total}</p>
                  </div>
                  <div className="p-3 rounded-full" style={{ background: 'rgba(86, 84, 73, 0.1)' }}>
                    <MessageSquare className="h-6 w-6" style={{ color: '#565449' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="sketch-card bg-white/90 backdrop-blur-sm border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium sketch-text mb-1" style={{ color: '#C96A12' }}>Pending</p>
                    <p className="text-3xl font-bold sketch-text" style={{ color: '#1f2937' }}>{stats.pending}</p>
                  </div>
                  <div className="p-3 rounded-full" style={{ background: 'rgba(249, 168, 34, 0.15)' }}>
                    <Clock className="h-6 w-6" style={{ color: '#F9A822' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="sketch-card bg-white/90 backdrop-blur-sm border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium sketch-text mb-1" style={{ color: '#4B9BEC' }}>In Progress</p>
                    <p className="text-3xl font-bold sketch-text" style={{ color: '#1f2937' }}>{stats.in_progress}</p>
                  </div>
                  <div className="p-3 rounded-full" style={{ background: 'rgba(75, 195, 236, 0.15)' }}>
                    <TrendingUp className="h-6 w-6" style={{ color: '#4B9BEC' }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="sketch-card bg-white/90 backdrop-blur-sm border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium sketch-text mb-1" style={{ color: '#73865f' }}>Resolved</p>
                    <p className="text-3xl font-bold sketch-text" style={{ color: '#1f2937' }}>{stats.resolved}</p>
                  </div>
                  <div className="p-3 rounded-full" style={{ background: 'rgba(43, 184, 116, 0.15)' }}>
                    <CheckCircle className="h-6 w-6" style={{ color: '#2BBAA5' }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* New Complaint Button - Only for Students */}
        {user.role === 'student' && (
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold sketch-text" style={{ color: '#1f2937' }}>My Complaints</h2>
            <Button 
              onClick={() => setShowNewComplaint(true)}
              className="sketch-button-primary"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Complaint
            </Button>
          </div>
        )}

        {/* New Complaint Form Modal */}
        {showNewComplaint && (
          <Card className="mb-8 sketch-card bg-white/95 backdrop-blur-sm border-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="sketch-text text-xl" style={{ color: '#1f2937' }}>Submit New Complaint</CardTitle>
                <CardDescription className="sketch-text">
                  Fill in the details to submit a new complaint
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewComplaint(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmitComplaint)} className="space-y-5">
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-amber-800 sketch-text">
                        <strong>Important Notice:</strong> Please ensure not to write any inappropriate words. 
                        You are anonymous to the department you are sending this complaint to.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium sketch-text mb-2" style={{ color: '#1f2937' }}>
                      Title <span className="text-red-500">*</span>
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
                      className="w-full px-4 py-2 border-2 rounded-md sketch-border focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{ 
                        borderColor: '#D8CFBC'
                      }}
                      placeholder="Enter complaint title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium sketch-text mb-2" style={{ color: '#1f2937' }}>
                      Priority
                    </label>
                    <select
                      {...register('priority')}
                      className="w-full px-4 py-2 border-2 rounded-md sketch-border focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{ 
                        borderColor: '#D8CFBC'
                      }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium sketch-text mb-2" style={{ color: '#1f2937' }}>
                    Domain <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('domainId', { 
                      required: 'Domain is required',
                      valueAsNumber: true
                    })}
                    className="w-full px-4 py-2 border-2 rounded-md sketch-border focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ 
                      borderColor: '#D8CFBC'
                    }}
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

                <div>
                  <label className="block text-sm font-medium sketch-text mb-2" style={{ color: '#1f2937' }}>
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('description', { 
                      required: 'Description is required',
                      minLength: {
                        value: 10,
                        message: 'Description must be at least 10 characters'
                      }
                    })}
                    rows={5}
                    className="w-full px-4 py-2 border-2 rounded-md sketch-border placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ 
                      borderColor: '#D8CFBC'
                    }}
                    placeholder="Describe your complaint in detail..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="flex space-x-4 pt-2">
                  <Button type="submit" loading={submitting} disabled={submitting} className="sketch-button-primary">
                    {submitting ? 'Submitting...' : 'Submit Complaint'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowNewComplaint(false);
                      reset();
                    }}
                    className="sketch-button"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Complaints Section with Tabs */}
        <div className="mb-8">
          {/* Quick Filters (role-aware) */}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-700">
              <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
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
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    isActive
                      ? 'bg-orange-100 text-orange-800 border-orange-300'
                      : 'bg-white/80 text-gray-700 border-[#D8CFBC] hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 border-b-2 overflow-x-auto pb-1" style={{ borderColor: '#D8CFBC' }}>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold sketch-text transition-colors relative whitespace-nowrap ${
                activeTab === 'active'
                  ? 'text-orange-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Active Complaints
              {activeTab === 'active' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></span>
              )}
              {activeComplaints.length > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'active' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {activeComplaints.length}
                </span>
              )}
            </button>
            {resolvedComplaints.length > 0 && (
              <button
                onClick={() => setActiveTab('resolved')}
                className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold sketch-text transition-colors relative whitespace-nowrap ${
                  activeTab === 'resolved'
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Resolved Complaints
                {activeTab === 'resolved' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></span>
                )}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
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
                <Card className="sketch-card bg-white/90 backdrop-blur-sm">
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto mb-4" style={{ color: '#D8CFBC' }} />
                    <p className="text-gray-600 sketch-text text-lg">
                      {statusFilter === 'all'
                        ? 'No active complaints found.'
                        : 'No complaints match the selected filter.'}
                    </p>
                    {user.role === 'student' && (
                      <Button 
                        onClick={() => setShowNewComplaint(true)}
                        className="mt-4 sketch-button-primary"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Complaint
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {filteredActiveComplaints.map((complaint) => (
                    <Card key={complaint.id} className="sketch-card bg-white/90 backdrop-blur-sm border-2 hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-xl flex items-center gap-2 sketch-text mb-2" style={{ color: '#1f2937' }}>
                              {complaint.title}
                              {user?.role === 'student' && complaint.adminSeen && (
                                <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                                  <CheckCheck className="h-4 w-4" />
                                  Seen by admin
                                </span>
                              )}
                            </CardTitle>
                            <CardDescription className="sketch-text flex items-center gap-2 flex-wrap">
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                {complaint.domainName}
                              </span>
                              <span>•</span>
                              <span>{safeFormatDate(complaint.createdAt)}</span>
                              {user?.role === 'student' && complaint.adminSeen && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-600">Seen by admin</span>
                                </>
                              )}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
                              {complaint.status.replace('_', ' ')}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>
                              {complaint.priority}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg border" style={{ borderColor: '#D8CFBC' }}>
                            <p className="text-gray-700 sketch-text">{complaint.description}</p>
                          </div>
                          
                          {user.role === 'super_admin' && complaint.studentName && (
                            <div className="text-sm sketch-text p-3 bg-blue-50 rounded-lg" style={{ color: '#1f2937' }}>
                              <strong>Student:</strong> {complaint.studentName} ({complaint.studentEmail})
                            </div>
                          )}
                          
                          {(user.role === 'sub_admin' || user.role === 'super_admin') && (
                            <div className="flex flex-wrap gap-2 pt-2">
                              {!complaint.adminSeen && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleMarkSeen(complaint.id)}
                                  className="sketch-button"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Mark Seen
                                </Button>
                              )}
                              {complaint.status === 'pending' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleStatusUpdate(complaint.id, 'in_progress')}
                                  className="sketch-button-primary"
                                >
                                  <Clock className="h-4 w-4 mr-1" />
                                  Start Progress
                                </Button>
                              )}
                              {complaint.status === 'in_progress' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    onClick={() => {
                                      const resolution = prompt('Enter resolution details:');
                                      if (resolution) {
                                        handleStatusUpdate(complaint.id, 'resolved', resolution);
                                      }
                                    }}
                                    className="sketch-button-primary"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Resolve
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleStatusUpdate(complaint.id, 'rejected')}
                                    className="sketch-button"
                                  >
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              {user.role === 'super_admin' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedComplaint(complaint);
                                    setShowTransferModal(true);
                                  }}
                                  className="sketch-button"
                                >
                                  <ArrowRight className="h-4 w-4 mr-1" />
                                  Transfer
                                </Button>
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
            <div className="grid gap-6">
              {resolvedComplaints.map((complaint) => (
                <Card key={complaint.id} className="sketch-card bg-white/90 backdrop-blur-sm border-2 border-green-200 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl flex items-center gap-2 sketch-text mb-2" style={{ color: '#1f2937' }}>
                          {complaint.title}
                          {user?.role === 'student' && complaint.adminSeen && (
                            <CheckCheck className="h-5 w-5 text-blue-600" />
                          )}
                        </CardTitle>
                        <CardDescription className="sketch-text flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {complaint.domainName}
                          </span>
                          <span>•</span>
                          <span>Created {safeFormatDate(complaint.createdAt)}</span>
                          {complaint.resolvedAt && (
                            <>
                              <span>•</span>
                              <span className="text-green-600">Resolved {safeFormatDate(complaint.resolvedAt)}</span>
                            </>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          Resolved
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg border" style={{ borderColor: '#D8CFBC' }}>
                        <h5 className="font-semibold sketch-text mb-2" style={{ color: '#1f2937' }}>Problem:</h5>
                        <p className="text-gray-700 sketch-text">{complaint.description}</p>
                      </div>
                      {complaint.resolutionDetails && (
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h5 className="font-semibold sketch-text mb-2 flex items-center gap-2" style={{ color: '#2BBAA5' }}>
                            <CheckCircle className="h-5 w-5" />
                            Solution:
                          </h5>
                          <p className="text-gray-700 sketch-text">{complaint.resolutionDetails}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Transfer Modal */}
      {showTransferModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md sketch-card bg-white/95 backdrop-blur-sm border-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="sketch-text" style={{ color: '#1f2937' }}>Transfer Complaint</CardTitle>
                <CardDescription className="sketch-text">
                  Transfer "{selectedComplaint.title}" to another domain
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowTransferModal(false);
                  setSelectedComplaint(null);
                }}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const toDomainId = parseInt(formData.get('toDomainId') as string);
                const reason = formData.get('reason') as string;
                handleTransfer(selectedComplaint.id, toDomainId, reason);
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium sketch-text mb-2" style={{ color: '#1f2937' }}>
                    Target Domain <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="toDomainId"
                    className="w-full px-4 py-2 border-2 rounded-md sketch-border focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ 
                      borderColor: '#D8CFBC'
                    }}
                    required
                  >
                    <option value="">Select a domain</option>
                    {domains.filter(d => d.id !== selectedComplaint.domainId).map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium sketch-text mb-2" style={{ color: '#1f2937' }}>
                    Transfer Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="reason"
                    rows={4}
                    className="w-full px-4 py-2 border-2 rounded-md sketch-border placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ 
                      borderColor: '#D8CFBC'
                    }}
                    placeholder="Reason for transfer..."
                    required
                  />
                </div>
                <div className="flex space-x-4 pt-2">
                  <Button type="submit" className="sketch-button-primary">Transfer</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowTransferModal(false);
                      setSelectedComplaint(null);
                    }}
                    className="sketch-button"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
