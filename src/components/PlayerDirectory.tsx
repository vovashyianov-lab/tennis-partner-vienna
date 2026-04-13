import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Player, SkillLevel, ViennaDistrict, PlayStyle } from '../types';
import PlayerCard from './PlayerCard';

const SKILL_LEVELS: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'tournament'];
const PLAY_STYLES: { value: PlayStyle; label: string }[] = [
  { value: 'singles', label: 'Singles' },
  { value: 'doubles', label: 'Doubles' },
  { value: 'both',    label: 'Both' },
];
const VIENNA_DISTRICTS: ViennaDistrict[] = [
  '1. Innere Stadt', '2. Leopoldstadt', '3. Landstraße',
  '4. Wieden', '5. Margareten', '6. Mariahilf',
  '7. Neubau', '8. Josefstadt', '9. Alsergrund',
  '10. Favoriten', '11. Simmering', '12. Meidling',
  '13. Hietzing', '14. Penzing', '15. Rudolfsheim-Fünfhaus',
  '16. Ottakring', '17. Hernals', '18. Währing',
  '19. Döbling', '20. Brigittenau', '21. Floridsdorf',
  '22. Donaustadt', '23. Liesing',
];

interface Filters {
  search: string;
  skillLevel: SkillLevel | '';
  district: ViennaDistrict | '';
  playStyle: PlayStyle | '';
}

interface PlayerDirectoryProps {
  currentUser: Player | null;
  onEditProfile: () => void;
}

const selectStyle: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  fontSize: 13,
  color: 'var(--text-primary)',
  background: 'rgba(255,255,255,0.70)',
  border: '1.5px solid rgba(0,0,0,0.10)',
  borderRadius: 10,
  padding: '10px 14px',
  cursor: 'pointer',
  fontWeight: 500,
  transition: 'border-color 0.2s, box-shadow 0.2s',
  outline: 'none',
  appearance: 'auto' as 'auto',
};

export default function PlayerDirectory({ currentUser, onEditProfile }: PlayerDirectoryProps) {
  const [players, setPlayers]   = useState<Player[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState<Filters>({
    search: '', skillLevel: '', district: '', playStyle: '',
  });

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('blocked', false)
        .order('created_at', { ascending: false });

      if (!error && data) setPlayers(data);
      setLoading(false);
    };
    fetchPlayers();
  }, []);

  const filtered = players.filter(p => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!p.name?.toLowerCase().includes(q) && !p.bio?.toLowerCase().includes(q)) return false;
    }
    if (filters.skillLevel && p.skill_level !== filters.skillLevel) return false;
    if (filters.district   && p.district    !== filters.district)   return false;
    if (filters.playStyle  && p.play_style  !== filters.playStyle)  return false;
    return true;
  });

  const update = (key: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    setFilters(f => ({ ...f, [key]: e.target.value }));

  const hasFilters = filters.search || filters.skillLevel || filters.district || filters.playStyle;

  return (
    <div className="max-w-6xl mx-auto pt-24 pb-16">

      {/* Hero heading */}
      <div className="text-center mb-10">
        <h2
          className="grass-heading mb-3"
          style={{ fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 1 }}
        >
          Find a partner
        </h2>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {players.length} players registered in Vienna
        </p>
      </div>

      {/* Filter bar */}
      <div
        className="flex flex-wrap gap-3 mb-8 p-5 transition-all duration-300"
        style={{
          background: 'rgba(255,255,255,0.50)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.40)',
          borderRadius: 'var(--radius)',
        }}
      >
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by name or bio…"
            value={filters.search}
            onChange={update('search')}
            style={{
              ...selectStyle,
              paddingLeft: 36,
              width: '100%',
              background: 'rgba(255,255,255,0.70)',
            }}
          />
        </div>

        {/* Skill level */}
        <select value={filters.skillLevel} onChange={update('skillLevel')} style={selectStyle}>
          <option value="">All levels</option>
          {SKILL_LEVELS.map(l => (
            <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
          ))}
        </select>

        {/* District */}
        <select value={filters.district} onChange={update('district')} style={selectStyle}>
          <option value="">All districts</option>
          {VIENNA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        {/* Play style */}
        <select value={filters.playStyle} onChange={update('playStyle')} style={selectStyle}>
          <option value="">Singles & Doubles</option>
          {PLAY_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {hasFilters && (
          <button
            onClick={() => setFilters({ search: '', skillLevel: '', district: '', playStyle: '' })}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:opacity-80 active:scale-[0.98]"
            style={{
              fontFamily: 'Inter, sans-serif',
              color: 'var(--text-muted)',
              background: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.35)' }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20" style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>
          <p className="text-lg font-medium">No players found</p>
          {hasFilters && <p className="text-sm mt-1">Try adjusting your filters</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(player => (
            <PlayerCard
              key={player.id}
              player={player}
              isOwnProfile={currentUser?.id === player.id}
              isLoggedIn={!!currentUser}
              onEditProfile={onEditProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
}
