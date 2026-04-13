import { supabase } from '../lib/supabase';

export function useUserManagement() {
  const handleBlockUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ blocked: true, blocked_at: new Date().toISOString() })
      .eq('id', userId);
    if (error) throw error;
  };

  const handleUnblockUser = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ blocked: false, blocked_at: null })
      .eq('id', userId);
    if (error) throw error;
  };

  return { handleBlockUser, handleUnblockUser };
}
