// ─── Tennis Partner Vienna — Type Definitions ────────────────────────

// Tennis-only skill levels (simplified from NTRP for casual players)
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'tournament';

// Vienna districts
export type ViennaDistrict =
  | '1. Innere Stadt' | '2. Leopoldstadt' | '3. Landstraße'
  | '4. Wieden' | '5. Margareten' | '6. Mariahilf'
  | '7. Neubau' | '8. Josefstadt' | '9. Alsergrund'
  | '10. Favoriten' | '11. Simmering' | '12. Meidling'
  | '13. Hietzing' | '14. Penzing' | '15. Rudolfsheim-Fünfhaus'
  | '16. Ottakring' | '17. Hernals' | '18. Währing'
  | '19. Döbling' | '20. Brigittenau' | '21. Floridsdorf'
  | '22. Donaustadt' | '23. Liesing';

export type PlayStyle = 'singles' | 'doubles' | 'both';
export type Gender = 'male' | 'female' | 'other';

// ─── Player ──────────────────────────────────────────────────────────
export interface Player {
  id: string;
  name: string;
  phone: string;          // WhatsApp number
  email: string;
  password: string;
  skill_level?: SkillLevel;
  district?: ViennaDistrict;
  play_style: PlayStyle;
  gender: Gender;
  avatar?: string;
  is_admin?: boolean;
  blocked?: boolean;
  blocked_at?: string;
  created_at?: string;
  updated_at?: string;
  whatsapp_consent?: boolean;  // opted in for WhatsApp notifications
  bio?: string;                // short player bio
}

// ─── Game / Match Proposal ───────────────────────────────────────────
export type GameType = 'mixed' | 'male-only' | 'female-only';

export interface GameProposal {
  id: string;
  createdBy: Player;
  gameType: GameType;
  maxPlayers: number;       // 2 for singles, 4 for doubles
  location_id: string;
  requiredLevels: SkillLevel[];
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  players: Player[];
  status: 'open' | 'full' | 'completed' | 'cancelled' | 'deleted';
  is_public: boolean;
  created_at: string;
}

// ─── Availability ────────────────────────────────────────────────────
export type AvailabilityDuration = '24h' | '48h' | '1week' | '2weeks';

export interface TimeSlot {
  day: string;       // 'monday' | 'tuesday' | ... | 'sunday'
  startTime: string; // "08:00"
  endTime: string;   // "10:00"
}

export interface Availability {
  id: string;
  player: Player;
  locations: string[];       // location IDs
  timeSlots: TimeSlot[];
  notes?: string;
  duration: AvailabilityDuration;
  createdAt: string;
  expiresAt: string;
  is_public: boolean;
  status?: 'active' | 'deleted' | 'expired';
}

// ─── Location (Vienna Tennis Clubs) ──────────────────────────────────
export interface Location {
  id: string;
  name: string;
  address: string;
  district: ViennaDistrict;
  phone?: string;
  website?: string;
  lat?: number;
  lng?: number;
  courts?: number;          // number of courts
  surface?: string;         // clay, hard, grass, indoor
  booking_url?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

// ─── Notification ────────────────────────────────────────────────────
export interface Notification {
  id: string;
  user_id: string;
  type: 'match_found' | 'game_invitation' | 'game_joined' | 'game_cancelled' | 'system';
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  hidden?: boolean;
  game_id?: string;
  availability_id?: string;
}

// ─── Group ───────────────────────────────────────────────────────────
export interface Group {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_by: string;
  created_at: string;
  member_count?: number;
}
