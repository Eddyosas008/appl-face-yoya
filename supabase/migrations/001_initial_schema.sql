-- ============================================
-- FACE YOGA APP - INITIAL DATABASE SCHEMA
-- ============================================
-- Supabase PostgreSQL schema for cloud sync

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  age INTEGER CHECK (age >= 13 AND age <= 120),
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER PREFERENCES
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  primary_goals TEXT[] DEFAULT '{}',
  focus_zones TEXT[] DEFAULT '{}',
  preferred_duration INTEGER DEFAULT 10 CHECK (preferred_duration IN (5, 10, 15, 20)),
  preferred_time TEXT DEFAULT 'flexible' CHECK (preferred_time IN ('matin', 'midi', 'soir', 'flexible')),
  reminder_enabled BOOLEAN DEFAULT FALSE,
  reminder_time TIME,
  experience_level TEXT DEFAULT 'nouveau' CHECK (experience_level IN ('nouveau', 'quelques_essais', 'regulier')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- USER HEALTH INFO
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_health_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contraindications TEXT[] DEFAULT '{}',
  recent_procedures BOOLEAN DEFAULT FALSE,
  procedure_details TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- USER PROGRESS
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_minutes INTEGER DEFAULT 0,
  completed_exercises TEXT[] DEFAULT '{}',
  completed_programs TEXT[] DEFAULT '{}',
  current_program_id TEXT,
  weekly_goal INTEGER DEFAULT 5,
  weekly_progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- PROGRAM PROGRESS (active program tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS public.program_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  current_day INTEGER DEFAULT 1,
  completed_days INTEGER[] DEFAULT '{}',
  last_session_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_program_progress_user ON public.program_progress(user_id);

-- ============================================
-- SESSION HISTORY
-- ============================================
CREATE TABLE IF NOT EXISTS public.session_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  program_id TEXT,
  program_day INTEGER,
  total_duration INTEGER NOT NULL, -- minutes
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  face_feel TEXT CHECK (face_feel IN ('tendu', 'normal', 'detendu', 'revitalise')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_session_history_user ON public.session_history(user_id);
CREATE INDEX idx_session_history_date ON public.session_history(session_date DESC);

-- ============================================
-- COMPLETED EXERCISES (per session)
-- ============================================
CREATE TABLE IF NOT EXISTS public.completed_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.session_history(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  duration INTEGER NOT NULL, -- seconds
  skipped BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_completed_exercises_session ON public.completed_exercises(session_id);

-- ============================================
-- BADGES
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon TEXT,
  badge_category TEXT CHECK (badge_category IN ('streak', 'completion', 'exploration', 'milestone')),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);

-- ============================================
-- DAILY ENTRIES (Journal)
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  session_completed BOOLEAN DEFAULT FALSE,
  session_id UUID REFERENCES public.session_history(id),
  morning_feel TEXT CHECK (morning_feel IN ('tendu', 'normal', 'detendu', 'revitalise')),
  evening_feel TEXT CHECK (evening_feel IN ('tendu', 'normal', 'detendu', 'revitalise')),
  tension_areas TEXT[],
  water_intake INTEGER,
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entry_date)
);

CREATE INDEX idx_daily_entries_user ON public.daily_entries(user_id);
CREATE INDEX idx_daily_entries_date ON public.daily_entries(entry_date DESC);

-- ============================================
-- DAILY PHOTOS
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  daily_entry_id UUID NOT NULL REFERENCES public.daily_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  photo_type TEXT CHECK (photo_type IN ('before', 'after', 'progress')),
  taken_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_daily_photos_entry ON public.daily_photos(daily_entry_id);

-- ============================================
-- USER SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'fr' CHECK (language IN ('fr', 'en')),
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'auto')),
  sound_enabled BOOLEAN DEFAULT TRUE,
  haptic_enabled BOOLEAN DEFAULT TRUE,
  show_animations BOOLEAN DEFAULT TRUE,
  data_collection BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- FAVORITE EXERCISES
-- ============================================
CREATE TABLE IF NOT EXISTS public.favorite_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

CREATE INDEX idx_favorite_exercises_user ON public.favorite_exercises(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_health_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_exercises ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own health info" ON public.user_health_info FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own program progress" ON public.program_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own session history" ON public.session_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own completed exercises" ON public.completed_exercises FOR ALL
  USING (session_id IN (SELECT id FROM public.session_history WHERE user_id = auth.uid()));
CREATE POLICY "Users own badges" ON public.user_badges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own daily entries" ON public.daily_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own daily photos" ON public.daily_photos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own favorites" ON public.favorite_exercises FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS: AUTO-UPDATE updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_health_info_updated_at BEFORE UPDATE ON public.user_health_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_program_progress_updated_at BEFORE UPDATE ON public.program_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_daily_entries_updated_at BEFORE UPDATE ON public.daily_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FUNCTION: Create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  INSERT INTO public.user_preferences (user_id) VALUES (NEW.id);
  INSERT INTO public.user_health_info (user_id) VALUES (NEW.id);
  INSERT INTO public.user_progress (user_id) VALUES (NEW.id);
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
