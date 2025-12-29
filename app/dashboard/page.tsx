'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { complaintAPI, userAPI } from '@/lib/api';
import { getUser, hasRole } from '@/lib/auth';
import { Complaint, ComplaintStats, Domain, User } from '@/lib/types';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { Plus, MessageSquare, Clock, CheckCircle, AlertCircle, LogOut, Eye, ArrowRight, CheckCheck } from 'lucide-react';

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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
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

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(to bottom right, #FFFBF4, #D8CFBC)' }}
    >
      <header className="shadow-sm border-b" style={{ background: '#FFFBF4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold" style={{ color: '#11120D' }}>Dashboard</h1>
              <span className="ml-4 text-sm" style={{ color: '#565449' }}>
                Welcome, {user.name}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm" style={{ color: '#565449' }}>
                {user.role === 'student' ? 'Student' : user.role === 'sub_admin' ? 'Sub Admin' : 'Super Admin'}
              </span>
              <Button variant="outline" className="sketch-button-auth" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-[#FFFBF4] border-[#D8CFBC]">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MessageSquare className="h-8 w-8" style={{ color: '#565449' }} />
                  <div className="ml-4">
                    <p className="text-sm font-medium" style={{ color: '#565449' }}>Total</p>
                    <p className="text-2xl font-bold" style={{ color: '#11120D' }}>{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#FFFBF4] border-[#D8CFBC]">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8" style={{ color: '#C96A12' }} />
                  <div className="ml-4">
                    <p className="text-sm font-medium" style={{ color: '#565449' }}>Pending</p>
                    <p className="text-2xl font-bold" style={{ color: '#11120D' }}>{stats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#FFFBF4] border-[#D8CFBC]">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8" style={{ color: '#565449' }} />
                  <div className="ml-4">
                    <p className="text-sm font-medium" style={{ color: '#565449' }}>In Progress</p>
                    <p className="text-2xl font-bold" style={{ color: '#11120D' }}>{stats.in_progress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#FFFBF4] border-[#D8CFBC]">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8" style={{ color: '#73865f' }} />
                  <div className="ml-4">
                    <p className="text-sm font-medium" style={{ color: '#565449' }}>Resolved</p>
                    <p className="text-2xl font-bold" style={{ color: '#11120D' }}>{stats.resolved}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {user.role === 'student' && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#11120D' }}>My Complaints</h2>
              <Button onClick={() => setShowNewComplaint(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Complaint
              </Button>
            </div>

            {showNewComplaint && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Submit New Complaint</CardTitle>
                  <CardDescription>
                    Fill in the details to submit a new complaint
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmitComplaint)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Title
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
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Enter complaint title"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Domain
                      </label>
                      <select
                        {...register('domainId', { 
                          required: 'Domain is required',
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <select
                        {...register('priority')}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        {...register('description', { 
                          required: 'Description is required',
                          minLength: {
                            value: 10,
                            message: 'Description must be at least 10 characters'
                          }
                        })}
                        rows={4}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Describe your complaint in detail"
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                      )}
                    </div>

                    <div className="flex space-x-4">
                      <Button type="submit" loading={submitting} disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Complaint'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowNewComplaint(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Resolved Complaints Section */}
        {resolvedComplaints.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Resolved Complaints ({resolvedComplaints.length})
            </h2>
            <div className="grid gap-4">
              {resolvedComplaints.map((complaint) => (
                <Card key={complaint.id} className="border-green-200 bg-green-50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {complaint.title}
                          {user?.role === 'student' && complaint.adminSeen && (
                            <CheckCheck className="h-4 w-4 text-blue-600" />
                          )}
                        </CardTitle>
                        <CardDescription>
                          {complaint.domainName} • {safeFormatDate(complaint.createdAt)}
                          {complaint.resolvedAt && (
                            <span className="ml-2 text-green-600">
                              • Resolved {safeFormatDate(complaint.resolvedAt)}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Resolved
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border border-green-200">
                        <h5 className="font-medium text-green-800 text-sm mb-2">Problem:</h5>
                        <p className="text-gray-700 text-sm">{complaint.description}</p>
                      </div>
                      {complaint.resolutionDetails && (
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                          <h5 className="font-medium text-green-800 text-sm mb-2">Solution:</h5>
                          <p className="text-gray-700 text-sm">{complaint.resolutionDetails}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Active Complaints Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {user.role === 'student' ? 'Your Complaints' : 'Active Complaints'} ({activeComplaints.length})
          </h2>
          {activeComplaints.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">No complaints found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeComplaints.map((complaint) => (
                <Card key={complaint.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {complaint.title}
                          {user?.role === 'student' && complaint.adminSeen && (
                            <CheckCheck className="h-4 w-4 text-blue-600" />
                          )}
                        </CardTitle>
                        <CardDescription>
                          {complaint.domainName} • {safeFormatDate(complaint.createdAt)}
                          {user?.role === 'student' && complaint.adminSeen && (
                            <span className="ml-2 text-blue-600">• Seen by admin</span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                          {complaint.status.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-2">{complaint.description}</p>
                    {complaint.status === 'resolved' && complaint.resolutionDetails && (
                      <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Problem & Solution
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-green-800 text-sm">Problem:</h5>
                            <p className="text-gray-700 text-sm">{complaint.description}</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-green-800 text-sm">Solution:</h5>
                            <p className="text-gray-700 text-sm">{complaint.resolutionDetails}</p>
                          </div>
                          {complaint.resolvedAt && (
                            <p className="text-xs text-green-600">
                              Resolved {safeFormatDate(complaint.resolvedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {user.role === 'super_admin' && complaint.studentName && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Student:</strong> {complaint.studentName} ({complaint.studentEmail})
                      </div>
                    )}
                    {(user.role === 'sub_admin' || user.role === 'super_admin') && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {!complaint.adminSeen && (
                          <Button 
                            size="sm" 
                            onClick={() => handleMarkSeen(complaint.id)}
                            className="text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Mark Seen
                          </Button>
                        )}
                        {complaint.status === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleStatusUpdate(complaint.id, 'in_progress')}
                            className="text-xs"
                          >
                            <Clock className="h-3 w-3 mr-1" />
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
                              className="text-xs"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Resolve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusUpdate(complaint.id, 'rejected')}
                              className="text-xs"
                            >
                              <AlertCircle className="h-3 w-3 mr-1" />
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
                            className="text-xs"
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            Transfer
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {showTransferModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Transfer Complaint</CardTitle>
              <CardDescription>
                Transfer "{selectedComplaint.title}" to another domain
              </CardDescription>
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
                  <label className="block text-sm font-medium text-gray-700">
                    Target Domain
                  </label>
                  <select
                    name="toDomainId"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                  <label className="block text-sm font-medium text-gray-700">
                    Transfer Reason
                  </label>
                  <textarea
                    name="reason"
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Reason for transfer"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <Button type="submit">Transfer</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowTransferModal(false);
                      setSelectedComplaint(null);
                    }}
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
