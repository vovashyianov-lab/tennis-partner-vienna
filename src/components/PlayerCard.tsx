import React from 'react';
import { MessageCircle, MapPin } from 'lucide-react';
import { GiTennisBall as TennisBall } from 'react-icons/gi';
import { Player } from '../types';

const SKILL_COLORS: Record<string, { bg: string; color: string }> = {
  beginner:     { bg: 'rgba(186,230,253,0.7)', color: '#075985' },
  intermediate: { bg: 'rgba(254,215,170,0.7)', color: '#92400e' },
  advanced:     { bg: 'rgba(187,247,208,0.7)', color: '#14532d' },
  tournament:   { bg: 'rgba(233,213,255,0.7)', color: '#581c87' },
};

const AVATAR_BG: string[] = [
  'linear-gradient(135deg,#4a8c3f,#2d5a27)',
  'linear-gradient(135deg,#6abf5e,#4a8c3f)',
  'linear-gradient(135deg,#2d5a27,#1a3a1a)',
  'linear-gradient(135deg,#1a3a1a,#4a8c3f)',
];

const PLAY_STYLE_LABEL: Record<string, string> = {
  singles: 'Singles',
  doubles: 'Doubles',
  both:    'Singles & Doubles',
};

interface PlayerCardProps {
  player: Player;
  isOwnProfile: boolean;
  isLoggedIn: boolean;
  onEditProfile?: () => void;
}

export default function PlayerCard({ player, isOwnProfile, isLoggedIn, onEditProfile }: PlayerCardProps) {
  const whatsappUrl = player.phone
    ? `https://wa.me/${player.phone.replace(/\D/g, '')}`
    : null;

  /* deterministic gradient from player id */
  const avatarBg = AVATAR_BG[(player.id?.charCodeAt(0) ?? 0) % AVATAR_BG.length];

  return (
    <div
      className="flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 relative cursor-pointer group"
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.4)',
        borderRadius: 'var(--radius)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}
    >
      {/* Grass strip at top */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 3,
          background: "url('/grass-texture.jpg') center / cover",
          borderRadius: 'var(--radius) var(--radius) 0 0',
          opacity: 0.75,
        }}
      />

      {/* Subtle hover overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          borderRadius: 'var(--radius)',
          background: 'linear-gradient(135deg, rgba(74,140,63,0.05) 0%, transparent 50%)',
        }}
      />

      {/* Avatar + name */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-3 relative">
        {player.avatar ? (
          <img
            src={player.avatar}
            alt={player.name}
            className="shrink-0 object-cover transition-all duration-300 group-hover:scale-105"
            style={{ width: 48, height: 48, borderRadius: 14 }}
          />
        ) : (
          <div
            className="shrink-0 flex items-center justify-center transition-all duration-300 group-hover:scale-105"
            style={{ width: 48, height: 48, borderRadius: 14, background: avatarBg, boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.15)' }}
          >
            <span className="text-white font-bold text-lg" style={{ fontFamily: 'Fredoka One, cursive' }}>
              {player.name?.[0]?.toUpperCase() ?? <TennisBall className="w-5 h-5 text-white" />}
            </span>
          </div>
        )}

        <div className="min-w-0">
          <p
            className="truncate leading-tight"
            style={{
              fontFamily: 'Fredoka One, cursive',
              fontSize: 17,
              color: 'var(--green-dark)',
              letterSpacing: '0.3px',
            }}
          >
            {player.name}
            {isOwnProfile && (
              <span className="ml-2 text-xs font-normal" style={{ color: 'var(--green-accent)', fontFamily: 'Inter, sans-serif' }}>you</span>
            )}
          </p>
          {player.district && (
            <p className="flex items-center gap-1 mt-0.5 truncate"
              style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}
            >
              <MapPin className="w-3 h-3 shrink-0" />
              {player.district}
            </p>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 px-5 pb-3">
        {player.skill_level && (() => {
          const c = SKILL_COLORS[player.skill_level] ?? { bg: 'rgba(229,231,235,0.7)', color: '#374151' };
          return (
            <span
              className="text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize"
              style={{ background: c.bg, color: c.color, fontFamily: 'Inter, sans-serif', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              {player.skill_level}
            </span>
          );
        })()}
        {player.play_style && (
          <span
            className="text-xs font-medium px-2.5 py-0.5 rounded-full"
            style={{ background: 'rgba(229,231,235,0.6)', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', border: '1px solid rgba(0,0,0,0.06)' }}
          >
            {PLAY_STYLE_LABEL[player.play_style]}
          </span>
        )}
      </div>

      {/* Bio */}
      {player.bio && (
        <p
          className="px-5 pb-3 line-clamp-2 leading-snug"
          style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}
        >
          {player.bio}
        </p>
      )}

      {/* Action */}
      <div className="mt-auto px-5 pb-5 pt-1">
        {isOwnProfile ? (
          <button
            onClick={onEditProfile}
            className="w-full text-sm font-semibold py-2.5 rounded-xl transition-all hover:-translate-y-px active:scale-[0.98]"
            style={{
              fontFamily: 'Inter, sans-serif',
              border: '1.5px solid rgba(74,140,63,0.35)',
              color: 'var(--green-mid)',
              background: 'rgba(255,255,255,0.5)',
            }}
          >
            Edit profile
          </button>
        ) : isLoggedIn && player.whatsapp_consent && whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 text-sm font-semibold py-2.5 rounded-xl transition-all hover:-translate-y-px active:scale-[0.98]"
            style={{
              fontFamily: 'Inter, sans-serif',
              background: '#25D366',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(37,211,102,0.25)',
            }}
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        ) : !isLoggedIn ? (
          <p
            className="text-center py-2"
            style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}
          >
            Sign in to contact
          </p>
        ) : null}
      </div>
    </div>
  );
}
