'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { complaintAPI } from '@/lib/api';
import { Complaint } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Clock, CheckCircle } from 'lucide-react';

export default function Home() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await complaintAPI.getPublicComplaints();
        setComplaints(response.data.complaints);
      } catch (error) {
        console.error('Failed to fetch complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">JKLU Feedback System</h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Register</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Anonymous Complaint Management System
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Submit complaints anonymously. Your identity is hidden from administrators 
            and only visible to super admins. Track your complaints and view resolutions.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Submit Complaints
              </CardTitle>
              <CardDescription>
                Register and submit complaints anonymously to specific domains
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Track Progress
              </CardTitle>
              <CardDescription>
                Monitor your complaint status and resolution progress in real-time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                View Resolutions
              </CardTitle>
              <CardDescription>
                Access resolved complaints and their solutions publicly
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Recently Resolved Complaints</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-600">Loading complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">No resolved complaints yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {complaints.map((complaint) => (
                <Card key={complaint.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{complaint.title}</CardTitle>
                        <CardDescription>
                          {complaint.domainName} • Resolved {formatDistanceToNow(new Date(complaint.resolvedAt || complaint.createdAt || ''), { addSuffix: true })}
                        </CardDescription>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Resolved
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-gray-700">{complaint.description}</p>
                      {complaint.resolutionDetails && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">Resolution:</h4>
                          <p className="text-gray-700">{complaint.resolutionDetails}</p>
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
    </div>
  );
}
