import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Player } from '../types'

export function useAuth() {
  const [user, setUser] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        setLoading(false);
        return null;
      }

      setUser(data);
      setLoading(false);
      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      setLoading(false);
      return null;
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUser(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUser(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (userData: Partial<Player> & { password: string }) => {
    try {
      // Check if email already registered
      const { data: existingProfiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userData.email!);

      if (profileError) {
        console.error('Error checking existing profiles:', profileError);
        throw new Error('Error verifying existing profiles');
      }

      if (existingProfiles && existingProfiles.length > 0) {
        throw new Error('This email is already registered');
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email!,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
            skill_level: userData.skill_level,
            district: userData.district,
            play_style: userData.play_style,
            gender: userData.gender,
            avatar: userData.avatar,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([{
            id: authData.user.id,
            email: userData.email,
            name: userData.name || '',
            phone: userData.phone || '',
            skill_level: userData.skill_level || null,
            district: userData.district || null,
            play_style: userData.play_style || 'both',
            gender: userData.gender || 'other',
            avatar: userData.avatar || null,
            bio: userData.bio || '',
            whatsapp_consent: userData.whatsapp_consent || false,
          }], { onConflict: 'id' });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          throw new Error('Error creating user profile');
        }

        await fetchUser(authData.user.id);
        return authData.user;
      }
    } catch (error) {
      if (error instanceof Error) throw error;
      console.error('Error signing up:', error);
      throw new Error('Error creating account');
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password')
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email before logging in')
        }
        throw error
      }

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;
        return { success: true, user: profile };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const updateProfile = async (data: Partial<Player>) => {
    try {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          phone: data.phone,
          email: data.email,
          gender: data.gender,
          skill_level: data.skill_level,
          district: data.district,
          play_style: data.play_style,
          avatar: data.avatar,
          bio: data.bio,
          whatsapp_consent: data.whatsapp_consent,
        })
        .eq('id', user?.id)
        .select()
        .single();

      if (error) throw error;
      setUser(updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const googleData = session.user.user_metadata;
        const avatarUrl = googleData.picture || googleData.avatar_url;

        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        const { error: updateError } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            avatar: avatarUrl,
            name: googleData.full_name || googleData.name,
            email: session.user.email,
            ...(existingProfile && {
              phone: existingProfile.phone,
              play_style: existingProfile.play_style,
              gender: existingProfile.gender,
              skill_level: existingProfile.skill_level,
              district: existingProfile.district,
            }),
            ...(!existingProfile && {
              play_style: 'both',
              gender: 'other',
              created_at: new Date().toISOString()
            })
          }, { onConflict: 'id' });

        if (updateError) throw updateError;
        await fetchUser(session.user.id);
      }

      return data;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      if (!user) throw new Error('User not found');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Session not found. Please log in again.');

      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      try {
        await supabase.rpc('delete_user');
      } catch (authDeleteError) {
        console.warn('Auth deletion failed (expected if not admin):', authDeleteError);
      }

      await supabase.auth.signOut();
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    signInWithGoogle,
    deleteAccount
  };
}
