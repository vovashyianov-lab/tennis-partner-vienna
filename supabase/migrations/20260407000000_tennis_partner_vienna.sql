/*
  Tennis Partner Vienna — Complete Database Schema
  Supabase Migration

  Tables:
    - profiles (player profiles, linked to auth.users)
    - locations (Vienna tennis clubs/courts)
    - games (match proposals)
    - game_players (players joined to a game)
    - availabilities (player availability windows)
    - availability_time_slots (time slots per availability)
    - notifications (in-app notifications)
    - groups (player groups)
    - group_members (group membership)
    - game_groups (games shared with groups)
*/

-- ═══════════════════════════════════════════════════════════════
-- 1. PROFILES (extends Supabase auth.users)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text UNIQUE NOT NULL DEFAULT '',
  phone text DEFAULT '',
  skill_level text CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'tournament')),
  district text,
  play_style text NOT NULL DEFAULT 'both' CHECK (play_style IN ('singles', 'doubles', 'both')),
  gender text NOT NULL DEFAULT 'other' CHECK (gender IN ('male', 'female', 'other')),
  avatar text,
  bio text DEFAULT '',
  whatsapp_consent boolean DEFAULT false,
  is_admin boolean DEFAULT false,
  blocked boolean DEFAULT false,
  blocked_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read profiles (needed for matching)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Users can delete own profile
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE USING (auth.uid() = id);


-- ═══════════════════════════════════════════════════════════════
-- 2. LOCATIONS (Vienna Tennis Clubs)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  address text NOT NULL,
  district text,
  phone text,
  website text,
  lat double precision,
  lng double precision,
  courts integer DEFAULT 0,
  surface text DEFAULT 'clay',
  booking_url text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active locations"
  ON locations FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage locations"
  ON locations FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );


-- ═══════════════════════════════════════════════════════════════
-- 3. GAMES (Match Proposals)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_type text NOT NULL DEFAULT 'mixed' CHECK (game_type IN ('mixed', 'male-only', 'female-only')),
  max_players integer NOT NULL DEFAULT 4,
  location_id uuid REFERENCES locations(id),
  required_levels text[] DEFAULT '{}',
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'full', 'completed', 'cancelled', 'deleted')),
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read public games
CREATE POLICY "Users can view public games"
  ON games FOR SELECT USING (
    is_public = true OR created_by = auth.uid()
  );

-- Authenticated users can create games
CREATE POLICY "Authenticated users can create games"
  ON games FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Creators can update their games
CREATE POLICY "Creators can update own games"
  ON games FOR UPDATE USING (auth.uid() = created_by);

-- Creators can delete their games
CREATE POLICY "Creators can delete own games"
  ON games FOR DELETE USING (auth.uid() = created_by);


-- ═══════════════════════════════════════════════════════════════
-- 4. GAME PLAYERS (Join table)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS game_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(game_id, player_id)
);

ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view game players"
  ON game_players FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join games"
  ON game_players FOR INSERT WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can leave games"
  ON game_players FOR DELETE USING (auth.uid() = player_id);


-- ═══════════════════════════════════════════════════════════════
-- 5. AVAILABILITIES
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS availabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  locations uuid[] DEFAULT '{}',
  notes text,
  duration text NOT NULL DEFAULT '48h' CHECK (duration IN ('24h', '48h', '1week', '2weeks')),
  is_public boolean DEFAULT true,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deleted', 'expired')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

ALTER TABLE availabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public availabilities"
  ON availabilities FOR SELECT USING (
    is_public = true OR player_id = auth.uid()
  );

CREATE POLICY "Users can create own availabilities"
  ON availabilities FOR INSERT WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Users can update own availabilities"
  ON availabilities FOR UPDATE USING (auth.uid() = player_id);

CREATE POLICY "Users can delete own availabilities"
  ON availabilities FOR DELETE USING (auth.uid() = player_id);


-- ═══════════════════════════════════════════════════════════════
-- 6. AVAILABILITY TIME SLOTS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS availability_time_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  availability_id uuid NOT NULL REFERENCES availabilities(id) ON DELETE CASCADE,
  day_of_week text NOT NULL CHECK (day_of_week IN ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')),
  start_time time NOT NULL,
  end_time time NOT NULL
);

ALTER TABLE availability_time_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view time slots"
  ON availability_time_slots FOR SELECT USING (true);

CREATE POLICY "Users can manage own time slots"
  ON availability_time_slots FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM availabilities WHERE id = availability_id AND player_id = auth.uid())
  );

CREATE POLICY "Users can delete own time slots"
  ON availability_time_slots FOR DELETE USING (
    EXISTS (SELECT 1 FROM availabilities WHERE id = availability_id AND player_id = auth.uid())
  );


-- ═══════════════════════════════════════════════════════════════
-- 7. NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  hidden boolean DEFAULT false,
  game_id uuid REFERENCES games(id) ON DELETE SET NULL,
  availability_id uuid REFERENCES availabilities(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create notifications"
  ON notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════════
-- 8. GROUPS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT true,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public groups are viewable by all"
  ON groups FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update groups"
  ON groups FOR UPDATE USING (auth.uid() = created_by);


-- ═══════════════════════════════════════════════════════════════
-- 9. GROUP MEMBERS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view group members"
  ON group_members FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join groups"
  ON group_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can leave groups"
  ON group_members FOR DELETE USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════════
-- 10. GAME GROUPS (games shared with groups)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS game_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  UNIQUE(game_id, group_id)
);

ALTER TABLE game_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view game groups"
  ON game_groups FOR SELECT USING (true);

CREATE POLICY "Game creators can manage game groups"
  ON game_groups FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM games WHERE id = game_id AND created_by = auth.uid())
  );


-- ═══════════════════════════════════════════════════════════════
-- 11. SEED DATA — Vienna Tennis Clubs
-- ═══════════════════════════════════════════════════════════════
INSERT INTO locations (name, address, district, phone, lat, lng, courts, surface, active) VALUES
  ('TC Hietzing', 'Auhofstraße 150, 1130 Wien', '13. Hietzing', '+43 1 877 6054', 48.1845, 16.2678, 12, 'clay', true),
  ('TC Prater', 'Rustenschacherallee 2, 1020 Wien', '2. Leopoldstadt', '+43 1 728 5353', 48.2117, 16.4056, 8, 'clay', true),
  ('WAT Stadlau', 'Erzherzog-Karl-Straße 108, 1220 Wien', '22. Donaustadt', '+43 1 203 2143', 48.2282, 16.4562, 6, 'clay', true),
  ('Colony Club', 'Rustenschacherallee 4, 1020 Wien', '2. Leopoldstadt', '+43 1 728 2424', 48.2112, 16.4045, 10, 'clay', true),
  ('TC Wien Mitte', 'Invalidenstraße 7, 1030 Wien', '3. Landstraße', '+43 1 712 6565', 48.2005, 16.3855, 6, 'hard', true),
  ('ÖTV Tennis Center', 'Eisgrubengasse 2-6, 1100 Wien', '10. Favoriten', '+43 1 799 1590', 48.1580, 16.3534, 14, 'clay', true),
  ('TC Donaupark', 'Arbeiterstrandbadstraße 128, 1220 Wien', '22. Donaustadt', '+43 1 263 1816', 48.2365, 16.4123, 8, 'clay', true),
  ('Tennispoint Wien', 'Brünner Straße 388, 1210 Wien', '21. Floridsdorf', '+43 1 290 3636', 48.2712, 16.3989, 10, 'hard', true),
  ('TC Arsenal', 'Arsenalstraße 1, 1030 Wien', '3. Landstraße', '+43 1 798 4242', 48.1834, 16.3890, 5, 'clay', true),
  ('TC Döbling', 'Heiligenstädter Straße 305, 1190 Wien', '19. Döbling', '+43 1 370 2741', 48.2543, 16.3512, 7, 'clay', true)
ON CONFLICT (name) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════
-- 12. HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function for user self-deletion (called via RPC)
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
