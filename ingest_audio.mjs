import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

// --- CONFIGURATION ---
// Supabase credentials (extracted from your env)
const SUPABASE_URL = 'https://ccoehnwzbkduyyvfyakl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb2Vobnd6YmtkdXl5dmZ5YWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjgxMzgxOCwiZXhwIjoyMTAyMzg5ODE4fQ.kjeHWJaAsiWTodGKKrR886an45h6lAg3_kBIV5VutfI';
const BUCKET_NAME = 'stotra-audio';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// You can run this script to process all URLs in seed_stotras.json,
// or just provide a test mapping here:
const urlsToProcess = [
  {
    slug: 'maha-mrityunjaya-mantra',
    url: 'https://ia800302.us.archive.org/24/items/ShivaStotrasAndMantras/01-MahaMrityunjayaMantra.mp3',
    filename: 'maha-mrityunjaya-mantra.mp3'
  },
  {
    slug: 'gayatri-mantra',
    url: 'https://ia800302.us.archive.org/24/items/sanskrit-stothras/GayatriMantra.mp3',
    filename: 'gayatri-mantra.mp3'
  },
  {
    slug: 'shiva-tandava-stotram',
    url: 'https://ia800302.us.archive.org/24/items/ShivaStotrasAndMantras/ShivaTandavaStotram.mp3',
    filename: 'shiva-tandava-stotram.mp3'
  },
  {
    slug: 'hanuman-chalisa',
    url: 'https://ia800302.us.archive.org/24/items/sanskrit-stothras/HanumanChalisa.mp3',
    filename: 'hanuman-chalisa.mp3'
  }
];

/**
 * Downloads a file from a URL to a local path
 */
async function downloadFile(url, outputPath) {
  console.log(`Downloading: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      // Some servers block requests without a User-Agent
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }

  const fileStream = fs.createWriteStream(outputPath);
  await pipeline(response.body, fileStream);
  console.log(`Saved locally as ${outputPath}`);
}

/**
 * Uploads a local file to Supabase Storage and returns the public URL
 */
async function uploadToSupabase(localPath, filename) {
  console.log(`Uploading ${filename} to Supabase bucket '${BUCKET_NAME}'...`);
  
  const fileBuffer = fs.readFileSync(localPath);
  
  const { data, error } = await supabase
    .storage
    .from(BUCKET_NAME)
    .upload(filename, fileBuffer, {
      contentType: 'audio/mpeg',
      upsert: true // Overwrite if it already exists
    });

  if (error) {
    throw new Error(`Supabase Upload Error: ${error.message}`);
  }

  // Get the public URL
  const { data: publicUrlData } = supabase
    .storage
    .from(BUCKET_NAME)
    .getPublicUrl(filename);

  console.log(`Upload successful! Public URL: ${publicUrlData.publicUrl}`);
  return publicUrlData.publicUrl;
}

/**
 * Updates the audio_url in the Supabase database
 */
async function updateDatabase(slug, newAudioUrl) {
  console.log(`Updating database for slug '${slug}'...`);
  
  const { data, error } = await supabase
    .from('stotras')
    .update({ audio_url: newAudioUrl })
    .eq('slug', slug);

  if (error) {
    throw new Error(`Database Update Error: ${error.message}`);
  }

  console.log(`✅ Database updated successfully for ${slug}!`);
}

/**
 * Main Execution Flow
 */
async function run() {
  const tempDir = path.join(process.cwd(), 'temp_audio');
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }

  console.log('🚀 Starting Audio Ingestion Process...');

  for (const item of urlsToProcess) {
    const localPath = path.join(tempDir, item.filename);
    
    try {
      console.log(`\n--- Processing [${item.slug}] ---`);
      
      // 1. Download
      await downloadFile(item.url, localPath);
      
      // 2. Upload
      const publicUrl = await uploadToSupabase(localPath, item.filename);
      
      // 3. Update DB
      await updateDatabase(item.slug, publicUrl);
      
    } catch (error) {
      console.error(`❌ Failed processing ${item.slug}:`, error.message);
    }
  }

  console.log('\n🎉 All done! You can now safely delete the temp_audio folder.');
}

run();
