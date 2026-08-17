const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ccoehnwzbkduyyvfyakl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjb2Vobnd6YmtkdXl5dmZ5YWtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MTM4MTgsImV4cCI6MjEwMjM4OTgxOH0.gBohMVC5-JEQAfxC3tC8wANknlDpMwLo_DqyGuyYXGA';
const supabase = createClient(supabaseUrl, supabaseKey);

const deities = [
  {
    slug: 'shiva',
    name_english: 'Lord Shiva',
    name_sanskrit: 'शिव',
    accent_color: '#3B82F6', // Blue
    display_order: 1,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Raja_Ravi_Varma%2C_Shiva_Family.jpg/800px-Raja_Ravi_Varma%2C_Shiva_Family.jpg'
  },
  {
    slug: 'krishna',
    name_english: 'Lord Krishna',
    name_sanskrit: 'कृष्ण',
    accent_color: '#8B5CF6', // Purple
    display_order: 2,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Raja_Ravi_Varma%2C_Krishna_with_cows.jpg/800px-Raja_Ravi_Varma%2C_Krishna_with_cows.jpg'
  },
  {
    slug: 'rama',
    name_english: 'Lord Rama',
    name_sanskrit: 'राम',
    accent_color: '#F59E0B', // Orange
    display_order: 3,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Rama_Darbar.jpg/800px-Rama_Darbar.jpg'
  },
  {
    slug: 'hanuman',
    name_english: 'Lord Hanuman',
    name_sanskrit: 'हनुमान',
    accent_color: '#EF4444', // Red
    display_order: 4,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Hanuman_fetches_the_herb-bearing_mountain.jpg/800px-Hanuman_fetches_the_herb-bearing_mountain.jpg'
  },
  {
    slug: 'ganesha',
    name_english: 'Lord Ganesha',
    name_sanskrit: 'गणेश',
    accent_color: '#F97316', // Orange
    display_order: 5,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Ganesha_by_Raja_Ravi_Varma.jpg/800px-Ganesha_by_Raja_Ravi_Varma.jpg'
  },
  {
    slug: 'vishnu',
    name_english: 'Lord Vishnu',
    name_sanskrit: 'विष्णु',
    accent_color: '#0EA5E9', // Sky Blue
    display_order: 6,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Vishnu_by_Raja_Ravi_Varma.jpg/800px-Vishnu_by_Raja_Ravi_Varma.jpg'
  },
  {
    slug: 'surya',
    name_english: 'Lord Surya',
    name_sanskrit: 'सूर्य',
    accent_color: '#EAB308', // Yellow
    display_order: 7,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Surya_by_Raja_Ravi_Varma.jpg/800px-Surya_by_Raja_Ravi_Varma.jpg'
  },
  {
    slug: 'durga',
    name_english: 'Goddess Durga',
    name_sanskrit: 'दुर्गा',
    accent_color: '#DC2626', // Red
    display_order: 8,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Durga_by_Raja_Ravi_Varma.jpg/800px-Durga_by_Raja_Ravi_Varma.jpg'
  },
  {
    slug: 'lakshmi',
    name_english: 'Goddess Lakshmi',
    name_sanskrit: 'लक्ष्मी',
    accent_color: '#EC4899', // Pink
    display_order: 9,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Lakshmi_by_Raja_Ravi_Varma.jpg/800px-Lakshmi_by_Raja_Ravi_Varma.jpg'
  },
  {
    slug: 'saraswati',
    name_english: 'Goddess Saraswati',
    name_sanskrit: 'सरस्वती',
    accent_color: '#F472B6', // Pink light
    display_order: 10,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Saraswati_by_Raja_Ravi_Varma.jpg/800px-Saraswati_by_Raja_Ravi_Varma.jpg'
  },
  {
    slug: 'gayatri',
    name_english: 'Goddess Gayatri',
    name_sanskrit: 'गायत्री',
    accent_color: '#D946EF', // Fuchsia
    display_order: 11,
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Gayatri_Mantra.jpg/800px-Gayatri_Mantra.jpg'
  },
  {
    slug: 'general',
    name_english: 'General / All',
    name_sanskrit: 'सार्वभौमिक',
    accent_color: '#D4AF37', // Gold
    display_order: 12,
    image_url: 'https://images.unsplash.com/photo-1545232979-fbf68fe9b1af?q=80&w=1000&auto=format&fit=crop'
  }
];

async function seed() {
  console.log('Inserting deities into Supabase...');
  for (const deity of deities) {
    // Generate UUID if not provided by DB automatically (assuming DB handles UUID default)
    // But since this might be an upsert based on slug, we use slug as unique constraint if possible
    // Alternatively, just insert.
    
    // Check if exists
    const { data: existing } = await supabase.from('deities').select('id').eq('slug', deity.slug).single();
    
    if (existing) {
      console.log(`Updating ${deity.name_english}...`);
      const { error } = await supabase.from('deities').update(deity).eq('id', existing.id);
      if (error) console.error(`Error updating ${deity.slug}:`, error.message);
    } else {
      console.log(`Inserting ${deity.name_english}...`);
      const { error } = await supabase.from('deities').insert(deity);
      if (error) console.error(`Error inserting ${deity.slug}:`, error.message);
    }
  }
  console.log('Finished seeding deities.');
}

seed();
