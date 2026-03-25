import React, { useMemo, useState } from 'react';
import { addDays, format, isSameMonth, isToday } from 'date-fns';
import { useAppContext } from '@/store';
import { MemberRow } from './MemberRow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Check, X, Edit2 } from 'lucide-react';
import { Member } from '@/types';

export const Timeline: React.FC = () => {
  const { viewMode, startDate, members, tasks, searchQuery, addMember, updateMember, t } = useAppContext();
  
  const { daysCount, dayWidth } = useMemo(() => {
    switch (viewMode) {
      case '14-days': return { daysCount: 14, dayWidth: 80 };
      case '60-days': return { daysCount: 60, dayWidth: 40 };
      case '180-days': return { daysCount: 180, dayWidth: 30 };
      case '365-days': return { daysCount: 365, dayWidth: 20 };
      default: return { daysCount: 14, dayWidth: 80 };
    }
  }, [viewMode]);

  const filteredMembers = useMemo(() => {
    if (!searchQuery) return members;
    const query = searchQuery.toLowerCase();
    return members.filter(member => {
      const memberMatches = member.name.toLowerCase().includes(query);
      const hasMatchingTasks = tasks.some(task => 
        task.assigneeId === member.id && 
        task.title.toLowerCase().includes(query)
      );
      return memberMatches || hasMatchingTasks;
    });
  }, [members, tasks, searchQuery]);

  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');

  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');

  const days = useMemo(() => {
    return Array.from({ length: daysCount }).map((_, i) => addDays(startDate, i));
  }, [startDate, daysCount]);

  const months = useMemo(() => {
    const result: { month: Date; colSpan: number }[] = [];
    let currentMonth = startDate;
    let span = 0;

    days.forEach((day, index) => {
      if (isSameMonth(day, currentMonth)) {
        span++;
      } else {
        result.push({ month: currentMonth, colSpan: span });
        currentMonth = day;
        span = 1;
      }
      if (index === days.length - 1) {
        result.push({ month: currentMonth, colSpan: span });
      }
    });
    return result;
  }, [days, startDate]);

  const handleEditStart = (member: Member) => {
    setEditingMemberId(member.id);
    setEditName(member.name);
    setEditRole(member.role);
  };

  const handleEditSave = (id: string) => {
    if (editName.trim() && editRole.trim()) {
      updateMember(id, { name: editName, role: editRole });
    }
    setEditingMemberId(null);
  };

  const handleAddMember = () => {
    if (newName.trim() && newRole.trim()) {
      addMember({
        id: `m${Date.now()}`,
        name: newName,
        role: newRole,
        avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
        maxCapacity: 3,
      });
      setNewName('');
      setNewRole('');
      setIsAddingMember(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border rounded-lg shadow-sm overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="min-w-max">
          {/* Header */}
          <div className="flex border-b bg-gray-50/80 sticky top-0 z-20">
            {/* Sidebar Header */}
            <div className="w-64 shrink-0 border-r p-4 flex items-center justify-between bg-gray-50/80 sticky left-0 z-30">
              <span className="font-medium text-sm text-gray-500 uppercase tracking-wider">{t('teamMembers')}</span>
            </div>

            {/* Timeline Header */}
            <div className="flex-1 relative">
              <div className="flex flex-col">
                {/* Months Row */}
                <div className="flex border-b border-gray-200">
                  {months.map((m, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 border-r border-gray-200 truncate"
                      style={{ width: m.colSpan * dayWidth }}
                    >
                      {format(m.month, 'MMMM yyyy')}
                    </div>
                  ))}
                </div>
                {/* Days Row */}
                <div className="flex">
                  {days.map((day, i) => {
                    const isCurrentDay = isToday(day);
                    return (
                      <div
                        key={i}
                        className={`flex flex-col items-center justify-center py-2 border-r border-gray-200 shrink-0 ${
                          isCurrentDay ? 'bg-blue-50' : ''
                        }`}
                        style={{ width: dayWidth }}
                      >
                        <span className={`text-[10px] uppercase ${isCurrentDay ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                          {format(day, 'EEE')}
                        </span>
                        <span className={`text-sm ${isCurrentDay ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                          {format(day, 'd')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex relative">
            {/* Sidebar Members */}
            <div className="w-64 shrink-0 border-r bg-white sticky left-0 z-10">
              {filteredMembers.map((member) => (
                <div key={member.id} className="h-24 border-b p-4 flex items-center gap-3 group relative">
                  <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                  
                  {editingMemberId === member.id ? (
                    <div className="flex-1 space-y-1">
                      <Input 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        className="h-6 text-sm px-1 py-0" 
                        placeholder={t('memberName')}
                      />
                      <Input 
                        value={editRole} 
                        onChange={(e) => setEditRole(e.target.value)} 
                        className="h-6 text-xs px-1 py-0 text-gray-500" 
                        placeholder={t('role')}
                      />
                      <div className="flex gap-1 mt-1">
                        <Button size="icon" variant="ghost" className="h-5 w-5 text-green-600" onClick={() => handleEditSave(member.id)}>
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-5 w-5 text-red-600" onClick={() => setEditingMemberId(null)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{member.name}</div>
                      <div className="text-xs text-gray-500 truncate">{member.role}</div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleEditStart(member)}
                      >
                        <Edit2 className="w-3 h-3 text-gray-400" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {/* Add Member Row */}
              <div className="h-24 border-b p-4 flex items-center justify-center bg-gray-50/50">
                {isAddingMember ? (
                  <div className="w-full space-y-2">
                    <Input 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)} 
                      className="h-7 text-sm" 
                      placeholder={t('memberName')}
                    />
                    <Input 
                      value={newRole} 
                      onChange={(e) => setNewRole(e.target.value)} 
                      className="h-7 text-xs" 
                      placeholder={t('role')}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={() => setIsAddingMember(false)}>{t('cancel')}</Button>
                      <Button size="sm" className="h-6 text-xs px-2 bg-blue-600" onClick={handleAddMember}>{t('add')}</Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="ghost" 
                    className="w-full h-full border-2 border-dashed border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                    onClick={() => setIsAddingMember(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {t('addMember')}
                  </Button>
                )}
              </div>
            </div>

            {/* Timeline Grid & Tasks */}
            <div className="flex-1 relative">
              {/* Background Grid */}
              <div className="absolute inset-0 flex pointer-events-none">
                {days.map((day, i) => (
                  <div
                    key={i}
                    className={`border-r border-gray-100 h-full shrink-0 ${isToday(day) ? 'bg-blue-50/30' : ''}`}
                    style={{ width: dayWidth }}
                  />
                ))}
              </div>

              {/* Member Rows (Tasks) */}
              <div className="relative z-0">
                {filteredMembers.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    days={days}
                    dayWidth={dayWidth}
                  />
                ))}
                {/* Empty row for the "Add Member" space */}
                <div className="h-24 border-b border-gray-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
