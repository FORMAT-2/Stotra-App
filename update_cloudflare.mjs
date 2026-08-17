import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ccoehnwzbkduyyvfyakl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb2Vobnd6YmtkdXl5dmZ5YWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjgxMzgxOCwiZXhwIjoyMTAyMzg5ODE4fQ.kjeHWJaAsiWTodGKKrR886an45h6lAg3_kBIV5VutfI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const updateMap = {
  'shiva-tandava-stotram': 'https://6193a7641e4be2a67adb9c94921ddd7c.r2.cloudflarestorage.com/Stotras & Ashtakams/shiva-tandav-stotram.mp3',
  'hanuman-chalisa': 'https://6193a7641e4be2a67adb9c94921ddd7c.r2.cloudflarestorage.com/Chalisas/shri-gayatri-chalisa.mp3',
  'vishnu-sahasranama': 'https://6193a7641e4be2a67adb9c94921ddd7c.r2.cloudflarestorage.com/Stotras & Ashtakams/shiva-sahasranaama-stotram.mp3',
  'gayatri-mantra': 'https://6193a7641e4be2a67adb9c94921ddd7c.r2.cloudflarestorage.com/Mantras (108 Jap)/shri-gayatri-mahamantra.mp3',
  'ganesh-aarti': 'https://6193a7641e4be2a67adb9c94921ddd7c.r2.cloudflarestorage.com/Mantras (108 Jap)/ganpati-beej-mantra.mp3',
  'lakshmi-aarti': 'https://6193a7641e4be2a67adb9c94921ddd7c.r2.cloudflarestorage.com/Stotras & Ashtakams/shri-gayatri-stotram.mp3',
  'durga-kavach': 'https://6193a7641e4be2a67adb9c94921ddd7c.r2.cloudflarestorage.com/Kavachams & Suktams/shri-gayatri-kavacham.mp3',
  'aditya-hridayam': 'https://6193a7641e4be2a67adb9c94921ddd7c.r2.cloudflarestorage.com/Stotras & Ashtakams/rudram-namakam-chamakam.mp3'
};

async function run() {
  console.log("Updating Supabase database with Cloudflare URLs...");
  for (const [slug, url] of Object.entries(updateMap)) {
    const { data, error } = await supabase.from('stotras').update({ audio_url: url }).eq('slug', slug);
    if (error) {
      console.error(`Error updating ${slug}:`, error.message);
    } else {
      console.log(`✅ Updated ${slug}`);
    }
  }
}

run();
