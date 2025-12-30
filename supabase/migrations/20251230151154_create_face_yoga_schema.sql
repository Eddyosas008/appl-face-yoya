/*
  # Create Face Yoga App Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key) - references auth.users
      - `first_name` (text) - user's first name
      - `age` (integer) - user's age
      - `avatar_url` (text) - URL to avatar image in storage
      - `onboarding_completed` (boolean) - whether onboarding is done
      - `onboarding_completed_at` (timestamptz) - when onboarding was completed
      - `created_at` (timestamptz) - creation timestamp
      - `updated_at` (timestamptz) - last update timestamp
      
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `primary_goals` (text[]) - array of user goals
      - `focus_zones` (text[]) - facial zones to focus on
      - `preferred_duration` (integer) - preferred session duration in minutes
      - `preferred_time` (text) - preferred time of day
      - `reminder_enabled` (boolean) - whether reminders are on
      - `reminder_time` (text) - time for reminders
      - `experience_level` (text) - user's experience level
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
    - `user_health_info`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `contraindications` (text[]) - health contraindications
      - `recent_procedures` (boolean) - had recent facial procedures
      - `procedure_details` (text) - details about procedures
      - `notes` (text) - additional health notes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
    - `user_progress`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `current_streak` (integer) - current consecutive days
      - `longest_streak` (integer) - longest streak achieved
      - `total_sessions` (integer) - total sessions completed
      - `total_minutes` (integer) - total minutes practiced
      - `completed_exercises` (text[]) - IDs of completed exercises
      - `completed_programs` (text[]) - IDs of completed programs
      - `current_program_id` (text) - ID of current program
      - `current_program_data` (jsonb) - current program progress data
      - `weekly_goal` (integer) - sessions per week goal
      - `weekly_progress` (integer) - sessions this week
      - `badges` (jsonb) - earned badges array
      - `updated_at` (timestamptz)
      
    - `session_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `session_date` (timestamptz) - when session occurred
      - `program_id` (text) - ID of program if applicable
      - `program_day` (integer) - day in program
      - `exercises` (jsonb) - array of completed exercises
      - `total_duration` (integer) - total minutes
      - `mood` (integer) - mood rating 1-5
      - `face_feel` (text) - how face feels
      - `notes` (text) - session notes
      - `created_at` (timestamptz)
      
    - `daily_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `entry_date` (date) - date of entry
      - `session_completed` (boolean) - whether session was done
      - `session_id` (uuid) - reference to session if completed
      - `morning_feel` (text) - morning face feeling
      - `evening_feel` (text) - evening face feeling
      - `tension_areas` (text[]) - areas with tension
      - `water_intake` (integer) - glasses of water
      - `sleep_quality` (integer) - rating 1-5
      - `stress_level` (integer) - rating 1-5
      - `notes` (text) - daily notes
      - `photos` (jsonb) - array of photo data
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
    - `user_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `language` (text) - app language
      - `theme` (text) - app theme
      - `sound_enabled` (boolean) - sounds on/off
      - `haptic_enabled` (boolean) - haptics on/off
      - `show_animations` (boolean) - animations on/off
      - `data_collection` (boolean) - analytics consent
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  age integer,
  avatar_url text,
  onboarding_completed boolean DEFAULT false,
  onboarding_completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  primary_goals text[] DEFAULT '{}',
  focus_zones text[] DEFAULT '{}',
  preferred_duration integer DEFAULT 10,
  preferred_time text DEFAULT 'flexible',
  reminder_enabled boolean DEFAULT false,
  reminder_time text DEFAULT '08:00',
  experience_level text DEFAULT 'nouveau',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_health_info table
CREATE TABLE IF NOT EXISTS user_health_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  contraindications text[] DEFAULT '{}',
  recent_procedures boolean DEFAULT false,
  procedure_details text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  total_sessions integer DEFAULT 0,
  total_minutes integer DEFAULT 0,
  completed_exercises text[] DEFAULT '{}',
  completed_programs text[] DEFAULT '{}',
  current_program_id text,
  current_program_data jsonb,
  weekly_goal integer DEFAULT 5,
  weekly_progress integer DEFAULT 0,
  badges jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Create session_history table
CREATE TABLE IF NOT EXISTS session_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  session_date timestamptz DEFAULT now(),
  program_id text,
  program_day integer,
  exercises jsonb DEFAULT '[]'::jsonb,
  total_duration integer DEFAULT 0,
  mood integer,
  face_feel text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create daily_entries table
CREATE TABLE IF NOT EXISTS daily_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  entry_date date NOT NULL,
  session_completed boolean DEFAULT false,
  session_id uuid REFERENCES session_history(id),
  morning_feel text,
  evening_feel text,
  tension_areas text[] DEFAULT '{}',
  water_intake integer,
  sleep_quality integer,
  stress_level integer,
  notes text,
  photos jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, entry_date)
);

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  language text DEFAULT 'fr',
  theme text DEFAULT 'dark',
  sound_enabled boolean DEFAULT true,
  haptic_enabled boolean DEFAULT true,
  show_animations boolean DEFAULT true,
  data_collection boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_session_history_user_date ON session_history(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_entries_user_date ON daily_entries(user_id, entry_date DESC);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_health_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for user_health_info
CREATE POLICY "Users can view own health info"
  ON user_health_info FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own health info"
  ON user_health_info FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own health info"
  ON user_health_info FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for user_progress
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for session_history
CREATE POLICY "Users can view own sessions"
  ON session_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sessions"
  ON session_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions"
  ON session_history FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions"
  ON session_history FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for daily_entries
CREATE POLICY "Users can view own entries"
  ON daily_entries FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own entries"
  ON daily_entries FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own entries"
  ON daily_entries FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own entries"
  ON daily_entries FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_health_info_updated_at
  BEFORE UPDATE ON user_health_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_entries_updated_at
  BEFORE UPDATE ON daily_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();