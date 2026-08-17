import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://ccoehnwzbkduyyvfyakl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb2Vobnd6YmtkdXl5dmZ5YWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjgxMzgxOCwiZXhwIjoyMTAyMzg5ODE4fQ.kjeHWJaAsiWTodGKKrR886an45h6lAg3_kBIV5VutfI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const PUBLIC_BASE_URL = 'https://pub-bc8b5f501d00477189474e308500d4fd.r2.dev/';

const DEITIES = {
  shiva: '50c8f030-68a6-488f-ae10-4cbf0987166d',
  krishna: '352871d1-afba-4929-b437-1c345d07227b',
  rama: 'f662e999-d81c-4a70-ab41-f677c3e0cc72',
  hanuman: 'dcc7648b-ef72-4e82-89d3-7cadc05dadd0',
  ganesha: '579ee94b-136a-4dc3-bdc3-b6503daff8a2',
  vishnu: '34443818-7d30-4a75-811d-6dc9e684df7b',
  surya: '0b194d67-d38c-4937-a26d-485b59079051',
  durga: 'dc52a442-a3c2-42f3-9159-bb15337d7350',
  lakshmi: 'e3f882da-08aa-4bbc-a070-f819fe238370',
  saraswati: '46a4c667-0d5a-4ad2-82fe-2a73444fdcd0',
  gayatri: '40036690-6b3c-4c86-9368-14b25d3eba15',
  general: '3dea88eb-211b-49d3-9981-8c2d2e0ddf7e'
};

const CATEGORIES = {
  mantra: '78721f2f-4589-4a2f-b96a-1850a5f6c17c',
  vedic_mantra: '4aea87b0-d8e6-47d2-a4a0-1ffedeebb8c5',
  stotra: '02d94b93-9652-4c7f-bac9-709597952f39',
  chalisa: '52879bf4-d97e-4eb5-a095-4a4f377fc528'
};

function getDeityId(slug) {
  if (slug.includes('shiva') || slug.includes('rudra') || slug.includes('linga') || slug.includes('nataraja') || slug.includes('mrityunjaya')) return DEITIES.shiva;
  if (slug.includes('krishna') || slug.includes('gopala') || slug.includes('govinda') || slug.includes('achyuta')) return DEITIES.krishna;
  if (slug.includes('rama') || slug.includes('ram')) return DEITIES.rama;
  if (slug.includes('hanuman') || slug.includes('maruti') || slug.includes('anjaneya') || slug.includes('bajrang')) return DEITIES.hanuman;
  if (slug.includes('ganesh') || slug.includes('ganpati') || slug.includes('vinayaka')) return DEITIES.ganesha;
  if (slug.includes('vishnu') || slug.includes('narayana') || slug.includes('hari')) return DEITIES.vishnu;
  if (slug.includes('surya') || slug.includes('aditya') || slug.includes('bhaskar')) return DEITIES.surya;
  if (slug.includes('durga') || slug.includes('bhavani') || slug.includes('amba') || slug.includes('devi')) return DEITIES.durga;
  if (slug.includes('lakshmi') || slug.includes('mahalakshmi')) return DEITIES.lakshmi;
  if (slug.includes('saraswati')) return DEITIES.saraswati;
  if (slug.includes('gayatri')) return DEITIES.gayatri;
  return DEITIES.general;
}

function getCategoryId(categoryStr) {
  if (categoryStr.includes('Mantras (108 Jap)')) return CATEGORIES.mantra;
  if (categoryStr.includes('Chalisas')) return CATEGORIES.chalisa;
  return CATEGORIES.stotra;
}

function toTitleCase(slug) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function run() {
  const jsonRaw = fs.readFileSync('../../downloads/final_stotras.json', 'utf-8');
  const allData = JSON.parse(jsonRaw);

  // Filter only mp3s
  const mp3s = allData.filter(d => d.audio_url && d.audio_url.endsWith('.mp3'));
  console.log(`Found ${mp3s.length} MP3 files to import.`);

  let insertedCount = 0;

  for (const item of mp3s) {
    const slug = item.slug;
    const deityId = getDeityId(slug);
    const categoryId = getCategoryId(item.category);
    const titleEnglish = toTitleCase(slug);

    // Extract path from the original S3 URL
    const originalUrl = item.audio_url; // https://6193...cloudflarestorage.com/Category/filename.mp3
    const urlParts = originalUrl.split('.com/');
    if (urlParts.length !== 2) {
      console.warn(`Could not parse URL for ${slug}: ${originalUrl}`);
      continue;
    }
    const pathString = urlParts[1];
    
    // Properly encode the path (e.g. Stotras & Ashtakams/shiva.mp3 -> Stotras%20%26%20Ashtakams/shiva.mp3)
    const encodedPath = pathString.split('/').map(p => encodeURIComponent(p)).join('/');
    const finalUrl = PUBLIC_BASE_URL + encodedPath;

    const record = {
      slug: slug,
      title_english: titleEnglish,
      title_sanskrit: titleEnglish + " (Sanskrit)",
      title_hindi: titleEnglish,
      deity_id: deityId,
      category_id: categoryId,
      audio_url: finalUrl,
      duration_seconds: 180,
      reciter_name: 'Traditional Recitation',
      significance_english: 'Sacred Stotra for spiritual upliftment.',
      is_featured: false,
      view_count: Math.floor(Math.random() * 5000)
    };

    const { data, error } = await supabase.from('stotras').upsert(record, { onConflict: 'slug' });
    
    if (error) {
      console.error(`❌ Failed to upsert ${slug}:`, error.message);
    } else {
      console.log(`✅ Upserted ${slug} (Deity: ${deityId})`);
      insertedCount++;
    }
  }

  console.log(`\n🎉 Successfully imported ${insertedCount}/${mp3s.length} songs into Supabase!`);
}

run();
