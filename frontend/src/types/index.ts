export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'EMPLOYEE';
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  owner: User;
  totalTasks: number;
  doneTasks: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE';
  createdAt: string;
  assignedTo: User | null;
}

export interface AuthState {
  token: string;
  username: string;
  role: string;
}
