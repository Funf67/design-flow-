import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/store';
import { Task, TaskStatus } from '@/types';
import { format } from 'date-fns';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, initialDate }) => {
  const { members, tags, addTask, t } = useAppContext();
  
  const [title, setTitle] = useState('');
  const [requester, setRequester] = useState('');
  const [assigneeId, setAssigneeId] = useState(members[0]?.id || '');
  const [startDate, setStartDate] = useState(initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
  const [status, setStatus] = useState<TaskStatus>('scheduled');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      requester,
      assigneeId,
      startDate,
      endDate,
      status,
      tags: selectedTags,
    };
    
    addTask(newTask);
    onClose();
    
    // Reset form
    setTitle('');
    setRequester('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('createNewTask')}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t('title')}</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Dashboard Redesign" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="requester">{t('requester')}</Label>
              <Input id="requester" value={requester} onChange={e => setRequester(e.target.value)} required placeholder="e.g. Product Team" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignee">{t('assignee')}</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger id="assignee">
                  <SelectValue placeholder={t('selectAssignee')} />
                </SelectTrigger>
                <SelectContent>
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t('startDate')}</Label>
              <Input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">{t('endDate')}</Label>
              <Input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">{t('status')}</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
              <SelectTrigger id="status">
                <SelectValue placeholder={t('selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="done">{t('done')}</SelectItem>
                <SelectItem value="in-design">{t('inDesign')}</SelectItem>
                <SelectItem value="to-discuss">{t('toDiscuss')}</SelectItem>
                <SelectItem value="scheduled">{t('scheduled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{t('createTask')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
