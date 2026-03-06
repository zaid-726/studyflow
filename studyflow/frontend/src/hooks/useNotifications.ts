import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { isToday, isTomorrow, parseISO } from 'date-fns';
import { toast } from 'sonner';

export function useNotifications() {
  const { tasks } = useStore();

  useEffect(() => {
    // Check for notifications every minute
    const checkDeadlines = () => {
      const now = new Date();
      
      // Only notify during reasonable hours (e.g., 8 AM to 10 PM)
      if (now.getHours() < 8 || now.getHours() > 22) return;

      const activeTasks = tasks.filter(t => t.status !== 'done');

      activeTasks.forEach(task => {
        const taskDate = parseISO(task.date);
        
        // Notify for tasks due today that haven't been started
        if (isToday(taskDate) && task.status === 'todo') {
          // Check if we already notified for this task today (using localStorage to persist across reloads)
          const notifiedKey = `notified_${task.id}_today`;
          if (!localStorage.getItem(notifiedKey)) {
            toast.warning(`Task due today: ${task.title}`, {
              description: `Subject: ${task.subject} | Duration: ${task.duration}m`,
              action: {
                label: 'Start Timer',
                onClick: () => window.location.href = '/timer'
              },
            });
            localStorage.setItem(notifiedKey, 'true');
          }
        }

        // Notify for tasks due tomorrow (only once per day)
        if (isTomorrow(taskDate)) {
          const notifiedKey = `notified_${task.id}_tomorrow`;
          if (!localStorage.getItem(notifiedKey)) {
            toast.info(`Upcoming task tomorrow: ${task.title}`, {
              description: `Subject: ${task.subject} | Duration: ${task.duration}m`,
            });
            localStorage.setItem(notifiedKey, 'true');
          }
        }
      });
    };

    // Run immediately on mount
    checkDeadlines();

    // Set up interval to check periodically
    const intervalId = setInterval(checkDeadlines, 60 * 1000); // Check every minute

    return () => clearInterval(intervalId);
  }, [tasks]);
}
