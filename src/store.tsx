import React, { createContext, useContext, useState, useMemo } from 'react';
import { Member, Task, Tag } from './types';
import { addDays, format, subDays } from 'date-fns';
import { Language, translations } from './i18n';

interface AppState {
  members: Member[];
  tasks: Task[];
  tags: Tag[];
  viewMode: '14-days' | '60-days' | '180-days' | '365-days';
  startDate: Date;
  language: Language;
  searchQuery: string;
}

interface AppContextType extends AppState {
  setViewMode: (mode: '14-days' | '60-days' | '180-days' | '365-days') => void;
  setStartDate: (date: Date) => void;
  setSearchQuery: (query: string) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasksForMember: (memberId: string) => Task[];
  addMember: (member: Member) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const today = new Date();

const mockMembers: Member[] = [
  { id: 'm1', name: 'Alice Chen', role: 'UI/UX Designer', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d', maxCapacity: 3 },
  { id: 'm2', name: 'Bob Smith', role: 'Brand Designer', avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d', maxCapacity: 2 },
  { id: 'm3', name: 'Charlie Liu', role: '3D Artist', avatar: 'https://i.pravatar.cc/150?u=a04258114e29026702d', maxCapacity: 2 },
  { id: 'm4', name: 'Diana Prince', role: 'UX Researcher', avatar: 'https://i.pravatar.cc/150?u=a048581f4e29026701d', maxCapacity: 4 },
];

const mockTags: Tag[] = [
  { id: 't1', name: 'UI/UX', color: 'bg-blue-100 text-blue-800' },
  { id: 't2', name: 'Brand', color: 'bg-purple-100 text-purple-800' },
  { id: 't3', name: '3D', color: 'bg-emerald-100 text-emerald-800' },
  { id: 't4', name: 'Marketing', color: 'bg-orange-100 text-orange-800' },
];

const mockTasks: Task[] = [
  {
    id: 'task1',
    title: 'Dashboard Redesign',
    requester: 'Product Team',
    assigneeId: 'm1',
    startDate: format(today, 'yyyy-MM-dd'),
    endDate: format(addDays(today, 5), 'yyyy-MM-dd'),
    status: 'in-design',
    tags: ['t1'],
  },
  {
    id: 'task2',
    title: 'New Logo Concepts',
    requester: 'Marketing',
    assigneeId: 'm2',
    startDate: format(subDays(today, 2), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 3), 'yyyy-MM-dd'),
    status: 'in-design',
    tags: ['t2', 't4'],
  },
  {
    id: 'task3',
    title: '3D Mascot Animation',
    requester: 'Brand Team',
    assigneeId: 'm3',
    startDate: format(addDays(today, 2), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 10), 'yyyy-MM-dd'),
    status: 'scheduled',
    tags: ['t3'],
  },
  {
    id: 'task4',
    title: 'User Interviews',
    requester: 'Product Team',
    assigneeId: 'm4',
    startDate: format(today, 'yyyy-MM-dd'),
    endDate: format(addDays(today, 7), 'yyyy-MM-dd'),
    status: 'to-discuss',
    tags: ['t1'],
  },
  {
    id: 'task5',
    title: 'Mobile App Wireframes',
    requester: 'Product Team',
    assigneeId: 'm1',
    startDate: format(addDays(today, 4), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 12), 'yyyy-MM-dd'),
    status: 'scheduled',
    tags: ['t1'],
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [tags] = useState<Tag[]>(mockTags);
  const [viewMode, setViewMode] = useState<'14-days' | '60-days' | '180-days' | '365-days'>('14-days');
  const [startDate, setStartDate] = useState<Date>(subDays(today, 7)); // Start 7 days before today to show past tasks
  const [language, setLanguage] = useState<Language>('zh');
  const [searchQuery, setSearchQuery] = useState('');

  const addTask = (task: Task) => setTasks((prev) => [...prev, task]);
  const updateTask = (id: string, updates: Partial<Task>) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  const deleteTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const addMember = (member: Member) => setMembers((prev) => [...prev, member]);
  const updateMember = (id: string, updates: Partial<Member>) =>
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  const deleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setTasks((prev) => prev.filter((t) => t.assigneeId !== id));
  };

  const getTasksForMember = (memberId: string) => {
    const memberTasks = tasks.filter((t) => t.assigneeId === memberId);
    if (!searchQuery) return memberTasks;
    
    const query = searchQuery.toLowerCase();
    const member = members.find(m => m.id === memberId);
    const memberMatches = member?.name.toLowerCase().includes(query);
    
    if (memberMatches) return memberTasks;
    return memberTasks.filter(t => t.title.toLowerCase().includes(query));
  };

  const t = (key: keyof typeof translations['en']) => translations[language][key];

  const value = {
    members,
    tasks,
    tags,
    viewMode,
    startDate,
    language,
    searchQuery,
    setViewMode,
    setStartDate,
    setSearchQuery,
    addTask,
    updateTask,
    deleteTask,
    getTasksForMember,
    addMember,
    updateMember,
    deleteMember,
    setLanguage,
    t,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
