import { useState } from 'react';
import { Notification } from '../types';
import { supabase } from '../lib/supabase';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('hidden', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleClearAllNotifications = async (userId: string | undefined) => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  return {
    notifications,
    setNotifications,
    fetchNotifications,
    handleMarkNotificationAsRead,
    handleClearAllNotifications,
  };
}
