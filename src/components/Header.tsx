import React, { useEffect, useState } from 'react';
import { LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { GiTennisBall } from 'react-icons/gi';
import { Player, Notification } from '../types';
import NotificationBell from './notifications/NotificationBell';
import { formatDisplayName } from '../utils/nameUtils';

interface HeaderProps {
  user: Player | null;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onEditProfile: () => void;
  onLogoutClick: () => void;
  notifications: Notification[];
  onMarkNotificationAsRead: (notificationId: string) => void;
  onClearAllNotifications: () => void;
  onAdminPanelClick: () => void;
}

export default function Header({
  user,
  onLoginClick,
  onRegisterClick,
  onEditProfile,
  onLogoutClick,
  notifications,
  onMarkNotificationAsRead,
  onClearAllNotifications,
  onAdminPanelClick,
}: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={scrolled ? {
        padding: '0',
        background: 'rgba(168,196,144,0.85)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(255,255,255,0.18)',
      } : {
        background: 'transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <GiTennisBall className="w-6 h-6" style={{ color: 'var(--green-accent)' }} />
              <span
                className="font-heading text-xl tracking-widest uppercase"
                style={{ color: 'var(--green-dark)' }}
              >
                Tennis<span style={{ color: 'var(--green-accent)' }}>Partner</span>
              </span>
            </a>

            {user?.is_admin && (
              <button
                onClick={onAdminPanelClick}
                className="flex items-center gap-1 text-xs px-3 py-1 rounded-full transition-colors font-medium"
                style={{
                  background: 'rgba(255,255,255,0.35)',
                  color: 'var(--green-dark)',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </button>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <NotificationBell
                  notifications={notifications}
                  onMarkAsRead={onMarkNotificationAsRead}
                  onClearAll={onClearAllNotifications}
                />

                <button
                  onClick={onEditProfile}
                  className="flex items-center gap-2 transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-8 h-8 rounded-xl object-cover"
                      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.5)' }}
                    >
                      <GiTennisBall className="w-4 h-4" style={{ color: 'var(--green-accent)' }} />
                    </div>
                  )}
                  <span className="text-sm font-medium hidden sm:block" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {formatDisplayName(user.name)}
                  </span>
                </button>

                <button
                  onClick={onLogoutClick}
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full transition-all hover:opacity-80"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: 'var(--text-primary)',
                  }}
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block">Sign out</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onRegisterClick}
                  className="text-sm font-semibold px-5 py-2 rounded-full transition-all hover:-translate-y-px"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    background: 'var(--green-dark)',
                    color: '#fff',
                    letterSpacing: '0.3px',
                    boxShadow: '0 4px 12px rgba(26,58,26,0.25)',
                  }}
                >
                  Sign up
                </button>
                <button
                  onClick={onLoginClick}
                  className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full transition-all hover:opacity-80"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    color: 'var(--text-primary)',
                    background: 'rgba(255,255,255,0.25)',
                    border: '1px solid rgba(255,255,255,0.35)',
                  }}
                >
                  <LogIn className="w-4 h-4" />
                  Log in
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
