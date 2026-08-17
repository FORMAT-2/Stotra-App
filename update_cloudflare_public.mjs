import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ccoehnwzbkduyyvfyakl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb2Vobnd6YmtkdXl5dmZ5YWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjgxMzgxOCwiZXhwIjoyMTAyMzg5ODE4fQ.kjeHWJaAsiWTodGKKrR886an45h6lAg3_kBIV5VutfI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const baseUrl = 'https://pub-bc8b5f501d00477189474e308500d4fd.r2.dev/';

const updateMap = {
  'shiva-tandava-stotram': 'Stotras & Ashtakams/shiva-tandav-stotram.mp3',
  'hanuman-chalisa': 'Chalisas/shri-gayatri-chalisa.mp3',
  'vishnu-sahasranama': 'Stotras & Ashtakams/shiva-sahasranaama-stotram.mp3',
  'gayatri-mantra': 'Mantras (108 Jap)/shri-gayatri-mahamantra.mp3',
  'ganesh-aarti': 'Mantras (108 Jap)/ganpati-beej-mantra.mp3',
  'lakshmi-aarti': 'Stotras & Ashtakams/shri-gayatri-stotram.mp3',
  'durga-kavach': 'Kavachams & Suktams/shri-gayatri-kavacham.mp3',
  'aditya-hridayam': 'Stotras & Ashtakams/rudram-namakam-chamakam.mp3'
};

async function run() {
  console.log("Updating Supabase database with Public Cloudflare URLs...");
  for (const [slug, path] of Object.entries(updateMap)) {
    // IMPORTANT: We must encode the path because folders like "Stotras & Ashtakams" contain spaces and ampersands
    // encodeURI handles spaces -> %20 and & -> %26 (Wait, encodeURI does NOT encode &! We might need encodeURIComponent for parts)
    
    const parts = path.split('/');
    const encodedPath = parts.map(p => encodeURIComponent(p)).join('/');
    
    const fullUrl = baseUrl + encodedPath;
    
    const { data, error } = await supabase.from('stotras').update({ audio_url: fullUrl }).eq('slug', slug);
    if (error) {
      console.error(`Error updating ${slug}:`, error.message);
    } else {
      console.log(`✅ Updated ${slug} -> ${fullUrl}`);
    }
  }
}

run();
