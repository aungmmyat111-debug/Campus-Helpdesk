export type UserRole = 'Student' | 'Faculty' | 'Technician' | 'Administrator';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  roomNumber: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  eventActive: boolean;
  createdById: string;
  assignedToId?: string;
  createdAt: string;
  updatedAt: string;
  comments?: Comment[];
}