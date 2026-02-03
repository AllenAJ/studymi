import { createClient } from '@supabase/supabase-js';

// Supabase configuration - read from environment variables
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types for our database
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  gender?: string;
  age_range?: string;
  referral_source?: string;
  study_areas?: string[];
  goal?: string;
  learning_sources?: string[];
  first_topic?: string;
  vibe: string;
  created_at: string;
}

export interface StoredStudySet {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  key_concepts: string[];
  flashcards: { front: string; back: string }[];
  quiz: { question: string; options: string[]; correctAnswerIndex: number }[];
  mind_map: any;
  input_type: string;
  created_at: string;
}

// Auth helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Profile helpers
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const upsertProfile = async (profile: Partial<UserProfile> & { id: string }) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile)
    .select()
    .single();
  return { data, error };
};

// Study sets helpers
export const saveStudySet = async (userId: string, studySet: any) => {
  const { data, error } = await supabase
    .from('study_sets')
    .insert({
      user_id: userId,
      title: studySet.title,
      summary: studySet.summary,
      detailed_notes: studySet.detailedNotes,
      key_concepts: studySet.keyConcepts,
      flashcards: studySet.flashcards,
      quiz: studySet.quiz,
      mind_map: studySet.mindMap,
      input_type: studySet.type || 'text',
    })
    .select()
    .single();
  return { data, error };
};

export const getStudySets = async (userId: string) => {
  const { data, error } = await supabase
    .from('study_sets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const deleteStudySet = async (studySetId: string) => {
  const { error } = await supabase
    .from('study_sets')
    .delete()
    .eq('id', studySetId);
  return { error };
};

export const deleteAllStudySets = async (userId: string) => {
  const { error } = await supabase
    .from('study_sets')
    .delete()
    .eq('user_id', userId);
  return { error };
};

export const submitFeedback = async (userId: string, rating: number, text: string) => {
  const { data, error } = await supabase
    .from('feedback')
    .insert({
      user_id: userId,
      rating,
      text,
    })
    .select()
    .single();
  return { data, error };
};

export const deleteUserAccount = async () => {
  // Sign out - actual account deletion would need admin API
  const { error } = await supabase.auth.signOut();
  return { error };
};


// Waitlist helper
export const joinWaitlist = async (email: string, utmParams: any = {}) => {
  const { data, error } = await supabase
    .from('waitlist')
    .insert({
      email,
      ...utmParams,
    })
    .select()
    .single();
  return { data, error };
};
