import React, { useState, useRef } from 'react';
import { Task } from '@/types';
import { useAppContext } from '@/store';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { addDays, format, parseISO } from 'date-fns';

interface TaskBarProps {
  task: Task;
  left: number;
  width: number;
  top: number;
  dayWidth: number;
}

export const TaskBar: React.FC<TaskBarProps> = ({ task, left, width, top, dayWidth }) => {
  const { tags, members, updateTask, deleteTask, t } = useAppContext();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Edit form state
  const [editTitle, setEditTitle] = useState(task.title);
  const [editRequester, setEditRequester] = useState(task.requester);
  const [editStatus, setEditStatus] = useState(task.status);
  const [editAssigneeId, setEditAssigneeId] = useState(task.assigneeId);
  const [editStartDate, setEditStartDate] = useState(task.startDate);
  const [editEndDate, setEditEndDate] = useState(task.endDate);
  
  const taskTags = tags.filter(t => task.tags.includes(t.id));

  const handleDragStart = (e: React.DragEvent) => {
    if (isResizing) {
      e.preventDefault();
      return;
    }
    setIsDragging(true);
    setDragOffset(e.clientX);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (isResizing) return;
    setIsDragging(false);
    const deltaX = e.clientX - dragOffset;
    const daysShift = Math.round(deltaX / dayWidth);
    
    if (daysShift !== 0) {
      const newStart = format(addDays(parseISO(task.startDate), daysShift), 'yyyy-MM-dd');
      const newEnd = format(addDays(parseISO(task.endDate), daysShift), 'yyyy-MM-dd');
      updateTask(task.id, { startDate: newStart, endDate: newEnd });
    }
  };

  const handleResizeStart = (e: React.MouseEvent, direction: 'left' | 'right') => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(direction);
    
    const startX = e.clientX;
    const initialStart = parseISO(task.startDate);
    const initialEnd = parseISO(task.endDate);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const daysShift = Math.round(deltaX / dayWidth);
      
      if (direction === 'left') {
        const newStart = addDays(initialStart, daysShift);
        if (newStart <= initialEnd) {
          updateTask(task.id, { startDate: format(newStart, 'yyyy-MM-dd') });
        }
      } else {
        const newEnd = addDays(initialEnd, daysShift);
        if (newEnd >= initialStart) {
          updateTask(task.id, { endDate: format(newEnd, 'yyyy-MM-dd') });
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleSaveEdit = () => {
    updateTask(task.id, {
      title: editTitle,
      requester: editRequester,
      status: editStatus as any,
      assigneeId: editAssigneeId,
      startDate: editStartDate,
      endDate: editEndDate,
    });
    setIsEditDialogOpen(false);
  };

  const handleDelete = () => {
    if (confirm(t('confirmDelete'))) {
      deleteTask(task.id);
      setIsEditDialogOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-500';
      case 'in-design': return 'bg-blue-500';
      case 'to-discuss': return 'bg-amber-500';
      case 'scheduled': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            className={`absolute h-7 rounded-md shadow-sm border border-gray-200/50 flex items-center px-2 cursor-grab active:cursor-grabbing transition-transform group ${isDragging || isResizing ? 'opacity-80 z-50' : 'hover:scale-[1.02] z-10'}`}
            style={{
              left: `${left}px`,
              width: `${width}px`,
              top: `${top}px`,
              backgroundColor: '#f3f4f6',
              borderColor: '#e5e7eb',
            }}
            draggable={!isResizing}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={() => setIsEditDialogOpen(true)}
          >
            {/* Left Resize Handle */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize opacity-0 group-hover:opacity-100 bg-black/10 hover:bg-black/20 rounded-l-md"
              onMouseDown={(e) => handleResizeStart(e, 'left')}
            />

            {/* Status Indicator */}
            <div className={`w-1.5 h-1.5 rounded-full mr-2 shrink-0 ${getStatusColor(task.status)}`} />
            
            {/* Title */}
            <span className="text-xs font-medium text-gray-800 truncate select-none">
              {task.title}
            </span>

            {/* Right Resize Handle */}
            <div 
              className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize opacity-0 group-hover:opacity-100 bg-black/10 hover:bg-black/20 rounded-r-md"
              onMouseDown={(e) => handleResizeStart(e, 'right')}
            />
          </TooltipTrigger>
          <TooltipContent side="top" className="w-64 p-3 shadow-xl bg-gray-900 text-white border-gray-800">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-white">{task.title}</h4>
              
              <div className="text-xs text-gray-300 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                <span>{t('dates')}:</span>
                <span className="font-medium text-white">
                  {task.startDate} - {task.endDate}
                </span>

                <span>{t('status')}:</span>
                <span className="font-medium text-white flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                  {task.status === 'done' ? t('done') : 
                   task.status === 'in-design' ? t('inDesign') : 
                   task.status === 'to-discuss' ? t('toDiscuss') : 
                   t('scheduled')}
                </span>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('editTask')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">{t('title')}</Label>
              <Input id="title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="requester" className="text-right">{t('requester')}</Label>
              <Input id="requester" value={editRequester} onChange={(e) => setEditRequester(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignee" className="text-right">{t('assignee')}</Label>
              <div className="col-span-3">
                <Select value={editAssigneeId} onValueChange={setEditAssigneeId}>
                  <SelectTrigger>
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">{t('status')}</Label>
              <div className="col-span-3">
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
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
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">{t('startDate')}</Label>
              <Input id="startDate" type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">{t('endDate')}</Label>
              <Input id="endDate" type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="destructive" onClick={handleDelete}>{t('deleteTask')}</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>{t('cancel')}</Button>
              <Button onClick={handleSaveEdit}>{t('saveChanges')}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
