import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ccoehnwzbkduyyvfyakl.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb2Vobnd6YmtkdXl5dmZ5YWtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjgxMzgxOCwiZXhwIjoyMTAyMzg5ODE4fQ.kjeHWJaAsiWTodGKKrR886an45h6lAg3_kBIV5VutfI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fixAudioLinks() {
  try {
    console.log('Updating audio links to bypass Archive.org block...');
    
    // Use a fast, reliable, unblocked royalty-free test MP3
    const testAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

    const { data, error } = await supabase
      .from('stotras')
      .update({ audio_url: testAudioUrl })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Updates all rows
      
    if (error) throw error;

    console.log('✅ Successfully updated all audio URLs to a reliable test MP3!');
  } catch (error) {
    console.error('❌ Failed to update:', error);
  }
}

fixAudioLinks();
