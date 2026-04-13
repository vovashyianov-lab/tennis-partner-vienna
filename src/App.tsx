import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useUserManagement } from './hooks/useUserManagement';
import { useLocations } from './hooks/useLocations';
import { useNotifications } from './hooks/useNotifications';
import { supabase } from './lib/supabase';

import Header from './components/Header';
import Footer from './components/Footer';
import PlayerDirectory from './components/PlayerDirectory';
import LoginForm from './components/LoginForm';
import PlayerRegistration from './components/PlayerRegistration';
import ProfilePanel from './components/ProfilePanel';
import Modal from './components/modals/Modal';
import AdminPanel from './components/admin/AdminPanel';

function App() {
  const { user, signIn, signOut } = useAuth();
  const { handleBlockUser, handleUnblockUser } = useUserManagement();
  const { locations, setLocations } = useLocations();
  const { notifications, fetchNotifications, handleMarkNotificationAsRead, handleClearAllNotifications } = useNotifications();

  const [showLogin,        setShowLogin]        = useState(false);
  const [showRegister,     setShowRegister]     = useState(false);
  const [showProfile,      setShowProfile]      = useState(false);
  const [showAdmin,        setShowAdmin]        = useState(false);
  const [prefillData,      setPrefillData]      = useState<Record<string, string> | null>(null);

  // Read landing-page pre-fill from sessionStorage
  useEffect(() => {
    const raw    = sessionStorage.getItem('tp_prefill');
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'register' && raw) {
      try { setPrefillData(JSON.parse(raw)); setShowRegister(true); }
      catch { /* invalid JSON */ }
      finally { sessionStorage.removeItem('tp_prefill'); }
    }
  }, []);

  // Fetch notifications when user logs in
  useEffect(() => {
    if (user) fetchNotifications(user.id);
  }, [user?.id]);

  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      const result = await signIn(data.email, data.password);
      if (result.success) {
        await fetchNotifications(result.user.id);
        setShowLogin(false);
      }
    } catch (err) {
      throw err; // LoginForm handles the error display
    }
  };

  const userNotifications = user
    ? notifications.filter(n => n.user_id === user.id)
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        user={user}
        onLoginClick={() => setShowLogin(true)}
        onRegisterClick={() => setShowRegister(true)}
        onEditProfile={() => setShowProfile(true)}
        onLogoutClick={signOut}
        notifications={userNotifications}
        onMarkNotificationAsRead={handleMarkNotificationAsRead}
        onClearAllNotifications={() => handleClearAllNotifications(user?.id)}
        onAdminPanelClick={() => setShowAdmin(true)}
      />

      <main className="flex-grow container mx-auto px-4">
        <PlayerDirectory
          currentUser={user}
          onEditProfile={() => setShowProfile(true)}
        />
      </main>

      <Footer />

      {showLogin && (
        <LoginForm
          isOpen={showLogin}
          onSubmit={handleLogin}
          onClose={() => setShowLogin(false)}
          onRegisterClick={() => { setShowLogin(false); setShowRegister(true); }}
        />
      )}

      {showRegister && (
        <PlayerRegistration
          isOpen={showRegister}
          onClose={() => { setShowRegister(false); setPrefillData(null); }}
          onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }}
          prefillData={prefillData}
        />
      )}

      {showProfile && user && (
        <ProfilePanel
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          onLogout={signOut}
        />
      )}

      {showAdmin && user?.is_admin && (
        <Modal isOpen={showAdmin} onClose={() => setShowAdmin(false)} title="Admin panel">
          <AdminPanel
            locations={locations}
            games={[]}
            availabilities={[]}
            onAddLocation={async (location) => {
              const { data, error } = await supabase.from('locations').insert([location]).select().single();
              if (error) throw error;
              setLocations(prev => [...prev, data]);
            }}
            onEditLocation={async (id, data) => {
              const { error } = await supabase.from('locations').update(data).eq('id', id);
              if (error) throw error;
              setLocations(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
            }}
            onDeleteLocation={(id) => console.log('Delete location:', id)}
            onDeleteGame={async () => {}}
            onDeleteAvailability={async () => {}}
            onBlockUser={handleBlockUser}
            onUnblockUser={handleUnblockUser}
            onClose={() => setShowAdmin(false)}
          />
        </Modal>
      )}
    </div>
  );
}

export default App;
