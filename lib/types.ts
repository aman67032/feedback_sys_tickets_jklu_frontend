export interface User {
  id: number;
  email: string;
  role: 'student' | 'sub_admin' | 'super_admin';
  name: string;
  studentId?: string;
  domainId?: number;
  domainName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Domain {
  id: number;
  name: string;
  description: string;
}

export interface Complaint {
  id: number;
  title: string;
  description: string;
  domainId: number;
  domainName: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  resolutionDetails?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  adminSeen?: boolean;
  adminReadAt?: string;
  studentName?: string;
  studentEmail?: string;
  studentId?: string;
}

export interface ComplaintStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  rejected: number;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface AuditLog {
  id: number;
  action: string;
  resourceType: string;
  resourceId?: number;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  userName?: string;
  userEmail?: string;
}
