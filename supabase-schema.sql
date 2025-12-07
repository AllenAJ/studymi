-- Studymi Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- First, drop existing objects to start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS study_sets_updated_at ON study_sets;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at();
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own study sets" ON study_sets;
DROP POLICY IF EXISTS "Users can insert their own study sets" ON study_sets;
DROP POLICY IF EXISTS "Users can update their own study sets" ON study_sets;
DROP POLICY IF EXISTS "Users can delete their own study sets" ON study_sets;
DROP TABLE IF EXISTS study_sets;
DROP TABLE IF EXISTS profiles;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  gender TEXT,
  age_range TEXT,
  referral_source TEXT,
  study_areas JSONB DEFAULT '[]'::jsonb,
  goal TEXT,
  learning_sources JSONB DEFAULT '[]'::jsonb,
  first_topic TEXT,
  vibe TEXT DEFAULT 'focused',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study sets table
CREATE TABLE study_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  key_concepts JSONB DEFAULT '[]'::jsonb,
  flashcards JSONB DEFAULT '[]'::jsonb,
  quiz JSONB DEFAULT '[]'::jsonb,
  mind_map JSONB DEFAULT '{}'::jsonb,
  input_type TEXT DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_study_sets_user_id ON study_sets(user_id);
CREATE INDEX idx_study_sets_created_at ON study_sets(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for study_sets
CREATE POLICY "Users can view their own study sets"
  ON study_sets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sets"
  ON study_sets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sets"
  ON study_sets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sets"
  ON study_sets FOR DELETE
  USING (auth.uid() = user_id);

-- Function to handle profile creation on signup (with error handling)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail signup
    RAISE WARNING 'Error creating profile: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER study_sets_updated_at
  BEFORE UPDATE ON study_sets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

