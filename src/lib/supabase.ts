import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

/** A saved AI demo run, as stored in the `generations` table. */
export type Generation = {
  id: string;
  created_at: string;
  type: string;
  input_text: string;
  output_text: string;
};
