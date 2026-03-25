export type TaskStatus = 'done' | 'in-design' | 'to-discuss' | 'scheduled';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Member {
  id: string;
  name: string;
  avatar: string;
  role: string;
  maxCapacity: number;
}

export interface Task {
  id: string;
  title: string;
  requester: string;
  assigneeId: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  status: TaskStatus;
  tags: string[]; // Tag IDs
}
