import React, { useMemo } from 'react';
import { Member, Task } from '@/types';
import { useAppContext } from '@/store';
import { differenceInDays, parseISO, isWithinInterval, addDays, startOfDay } from 'date-fns';
import { TaskBar } from './TaskBar';

interface MemberRowProps {
  member: Member;
  days: Date[];
  dayWidth: number;
}

export const MemberRow: React.FC<MemberRowProps> = ({ member, days, dayWidth }) => {
  const { getTasksForMember, startDate } = useAppContext();
  const tasks = getTasksForMember(member.id);

  // Layout tasks to avoid overlap
  const layoutTasks = useMemo(() => {
    const rows: Task[][] = [];
    
    tasks.forEach(task => {
      const start = parseISO(task.startDate);
      const end = parseISO(task.endDate);
      
      let placed = false;
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const hasOverlap = row.some(rTask => {
          const rStart = parseISO(rTask.startDate);
          const rEnd = parseISO(rTask.endDate);
          return start <= rEnd && end >= rStart;
        });
        
        if (!hasOverlap) {
          row.push(task);
          placed = true;
          break;
        }
      }
      
      if (!placed) {
        rows.push([task]);
      }
    });
    
    return rows;
  }, [tasks]);

  const rowHeight = Math.max(layoutTasks.length * 32 + 16, 96); // Min height 96px (h-24)

  return (
    <div className="relative border-b border-gray-100 group" style={{ height: rowHeight }}>
      {/* Tasks */}
      <div className="absolute inset-0 z-10 pt-2">
        {layoutTasks.map((row, rowIndex) => (
          row.map(task => {
            const taskStart = parseISO(task.startDate);
            const taskEnd = parseISO(task.endDate);
            
            // Calculate left position and width based on timeline start date
            const leftOffsetDays = differenceInDays(taskStart, startDate);
            const durationDays = differenceInDays(taskEnd, taskStart) + 1;
            
            const left = leftOffsetDays * dayWidth;
            const width = durationDays * dayWidth;
            
            // Only render if visible in timeline
            if (left + width < 0 || left > days.length * dayWidth) return null;

            return (
              <TaskBar
                key={task.id}
                task={task}
                left={left}
                width={width}
                top={rowIndex * 32}
                dayWidth={dayWidth}
              />
            );
          })
        ))}
      </div>
    </div>
  );
};
