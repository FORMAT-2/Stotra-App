// ============================================================
// Mock Data — For development without Supabase connection
// ============================================================

import { Deity, Category, Stotra, StotraVerse } from './types';

export const MOCK_DEITIES: Deity[] = [
  {
    id: '1', slug: 'shiva', name_english: 'Lord Shiva', name_sanskrit: 'शिवः',
    name_hindi: 'भगवान शिव', accent_color: '#7C3AED', display_order: 1,
    description: 'The Supreme Being who creates, protects, and transforms the universe.',
    created_at: new Date().toISOString(),
  },
  {
    id: '2', slug: 'vishnu', name_english: 'Lord Vishnu', name_sanskrit: 'विष्णुः',
    name_hindi: 'भगवान विष्णु', accent_color: '#2563EB', display_order: 2,
    description: 'The Preserver and Protector of the universe.',
    created_at: new Date().toISOString(),
  },
  {
    id: '3', slug: 'krishna', name_english: 'Lord Krishna', name_sanskrit: 'कृष्णः',
    name_hindi: 'भगवान कृष्ण', accent_color: '#1D4ED8', display_order: 3,
    description: 'The eighth avatar of Vishnu, speaker of the Bhagavad Gita.',
    created_at: new Date().toISOString(),
  },
  {
    id: '4', slug: 'rama', name_english: 'Lord Rama', name_sanskrit: 'रामः',
    name_hindi: 'भगवान राम', accent_color: '#059669', display_order: 4,
    description: 'Maryada Purushottam, the ideal man and divine king.',
    created_at: new Date().toISOString(),
  },
  {
    id: '5', slug: 'hanuman', name_english: 'Lord Hanuman', name_sanskrit: 'हनुमान्',
    name_hindi: 'भगवान हनुमान', accent_color: '#EA580C', display_order: 5,
    description: 'Symbol of strength, devotion, and selfless service.',
    created_at: new Date().toISOString(),
  },
  {
    id: '6', slug: 'ganesha', name_english: 'Lord Ganesha', name_sanskrit: 'गणेशः',
    name_hindi: 'भगवान गणेश', accent_color: '#D97706', display_order: 6,
    description: 'The remover of obstacles, worshipped first before all endeavors.',
    created_at: new Date().toISOString(),
  },
  {
    id: '7', slug: 'durga', name_english: 'Goddess Durga', name_sanskrit: 'दुर्गा',
    name_hindi: 'देवी दुर्गा', accent_color: '#DC2626', display_order: 7,
    description: 'The invincible warrior goddess, protector of the righteous.',
    created_at: new Date().toISOString(),
  },
  {
    id: '8', slug: 'lakshmi', name_english: 'Goddess Lakshmi', name_sanskrit: 'लक्ष्मीः',
    name_hindi: 'देवी लक्ष्मी', accent_color: '#D4AF37', display_order: 8,
    description: 'Goddess of wealth, fortune, beauty, and prosperity.',
    created_at: new Date().toISOString(),
  },
  {
    id: '9', slug: 'saraswati', name_english: 'Goddess Saraswati', name_sanskrit: 'सरस्वती',
    name_hindi: 'देवी सरस्वती', accent_color: '#E5E7EB', display_order: 9,
    description: 'Goddess of knowledge, music, arts, and learning.',
    created_at: new Date().toISOString(),
  },
  {
    id: '10', slug: 'surya', name_english: 'Lord Surya', name_sanskrit: 'सूर्यः',
    name_hindi: 'भगवान सूर्य', accent_color: '#F59E0B', display_order: 10,
    description: 'The Sun God, source of light, energy, and life force.',
    created_at: new Date().toISOString(),
  },
  {
    id: '11', slug: 'navagraha', name_english: 'Navagraha', name_sanskrit: 'नवग्रहाः',
    name_hindi: 'नवग्रह', accent_color: '#6366F1', display_order: 11,
    description: 'The nine celestial bodies influencing human destiny.',
    created_at: new Date().toISOString(),
  },
  {
    id: '12', slug: 'gayatri', name_english: 'Gayatri Devi', name_sanskrit: 'गायत्री',
    name_hindi: 'गायत्री देवी', accent_color: '#F472B6', display_order: 12,
    description: 'The personification of the sacred Gayatri Mantra.',
    created_at: new Date().toISOString(),
  },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: '1', slug: 'mantra', title_english: 'Mantras', title_hindi: 'मंत्र', description: 'Sacred syllables for chanting', display_order: 1, created_at: new Date().toISOString() },
  { id: '2', slug: 'stotra', title_english: 'Stotras', title_hindi: 'स्तोत्र', description: 'Devotional hymns', display_order: 2, created_at: new Date().toISOString() },
  { id: '3', slug: 'chalisa', title_english: 'Chalisa', title_hindi: 'चालीसा', description: 'Forty-verse devotional songs', display_order: 3, created_at: new Date().toISOString() },
  { id: '4', slug: 'aarti', title_english: 'Aarti', title_hindi: 'आरती', description: 'Devotional songs during worship', display_order: 4, created_at: new Date().toISOString() },
  { id: '5', slug: 'bhajan', title_english: 'Bhajans', title_hindi: 'भजन', description: 'Devotional songs of love', display_order: 5, created_at: new Date().toISOString() },
  { id: '6', slug: 'kavacham', title_english: 'Kavachams', title_hindi: 'कवच', description: 'Protective armor hymns', display_order: 6, created_at: new Date().toISOString() },
  { id: '7', slug: 'suktam', title_english: 'Suktams', title_hindi: 'सूक्तम्', description: 'Vedic hymns from Rigveda', display_order: 7, created_at: new Date().toISOString() },
];

export const MOCK_STOTRAS: Stotra[] = [
  {
    id: '1', slug: 'shiva-tandava-stotram',
    title_english: 'Shiva Tandava Stotram', title_sanskrit: 'शिवताण्डवस्तोत्रम्', title_hindi: 'शिव तांडव स्तोत्रम्',
    deity_id: '1', category_id: '2', duration_seconds: 420,
    audio_url: 'https://6193a7641e4be2a67adb9c94921ddd7c.r2.cloudflarestorage.com/Stotras & Ashtakams/shiva-tandav-stotram.mp3', reciter_name: 'Traditional Recitation',
    significance_english: 'Composed by Ravana, this powerful stotra describes the cosmic dance of Lord Shiva.',
    is_featured: true, is_published: true, view_count: 15420, play_count: 8340,
    day_of_week: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    deity: MOCK_DEITIES[0], category: MOCK_CATEGORIES[1],
  },
  {
    id: '2', slug: 'hanuman-chalisa',
    title_english: 'Hanuman Chalisa', title_sanskrit: 'हनुमान चालीसा', title_hindi: 'हनुमान चालीसा',
    deity_id: '5', category_id: '3', duration_seconds: 600,
    audio_url: 'https://6193a7641e4be2a67adb9c94921ddd7c.r2.cloudflarestorage.com/Chalisas/shri-gayatri-chalisa.mp3', reciter_name: 'Traditional Recitation',
    significance_english: 'Composed by Tulsidas, this 40-verse hymn praises Lord Hanuman.',
    is_featured: true, is_published: true, view_count: 25640, play_count: 18200,
    day_of_week: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    deity: MOCK_DEITIES[4], category: MOCK_CATEGORIES[2],
  },
  {
    id: '3', slug: 'vishnu-sahasranama',
    title_english: 'Vishnu Sahasranama', title_sanskrit: 'विष्णुसहस्रनामस्तोत्रम्', title_hindi: 'विष्णु सहस्रनाम',
    deity_id: '2', category_id: '2', duration_seconds: 1800,
    audio_url: 'https://6193a7641e4be2a67adb9c94921ddd7c.r2.cloudflarestorage.com/Stotras & Ashtakams/shiva-sahasranaama-stotram.mp3', reciter_name: 'Traditional Recitation',
    significance_english: 'The thousand names of Lord Vishnu from the Mahabharata.',
    is_featured: true, is_published: true, view_count: 12380, play_count: 6450,
    day_of_week: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    deity: MOCK_DEITIES[1], category: MOCK_CATEGORIES[1],
  },
  {
    id: '4', slug: 'gayatri-mantra',
    title_english: 'Gayatri Mantra', title_sanskrit: 'गायत्री मन्त्रम्', title_hindi: 'गायत्री मंत्र',
    deity_id: '12', category_id: '1', duration_seconds: 180,
    audio_url: 'https://6193a7641e4be2a67adb9c94921ddd7c.r2.cloudflarestorage.com/Mantras (108 Jap)/shri-gayatri-mahamantra.mp3', reciter_name: 'Traditional Recitation',
    significance_english: 'The supreme Vedic mantra from the Rigveda. Chanting 108 times brings spiritual illumination.',
    is_featured: true, is_published: true, view_count: 32100, play_count: 22450,
    day_of_week: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    deity: MOCK_DEITIES[11], category: MOCK_CATEGORIES[0],
  },
  {
    id: '5', slug: 'ganesh-aarti',
    title_english: 'Ganesh Aarti - Jai Ganesh Deva', title_sanskrit: 'गणेश आरती', title_hindi: 'गणेश आरती',
    deity_id: '6', category_id: '4', duration_seconds: 300,
    audio_url: 'https://6193a7641e4be2a67adb9c94921ddd7c.r2.cloudflarestorage.com/Mantras (108 Jap)/ganpati-beej-mantra.mp3', reciter_name: 'Traditional Recitation',
    significance_english: 'The beloved aarti of Lord Ganesha, sung to remove obstacles.',
    is_featured: true, is_published: true, view_count: 18900, play_count: 14200,
    day_of_week: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    deity: MOCK_DEITIES[5], category: MOCK_CATEGORIES[3],
  },
  {
    id: '6', slug: 'lakshmi-aarti',
    title_english: 'Lakshmi Aarti - Om Jai Lakshmi Mata', title_sanskrit: 'लक्ष्मी आरती', title_hindi: 'लक्ष्मी आरती',
    deity_id: '8', category_id: '4', duration_seconds: 360,
    audio_url: 'https://6193a7641e4be2a67adb9c94921ddd7c.r2.cloudflarestorage.com/Stotras & Ashtakams/shri-gayatri-stotram.mp3', reciter_name: 'Traditional Recitation',
    significance_english: 'The sacred aarti of Goddess Lakshmi for wealth and prosperity.',
    is_featured: false, is_published: true, view_count: 9400, play_count: 5600,
    day_of_week: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    deity: MOCK_DEITIES[7], category: MOCK_CATEGORIES[3],
  },
  {
    id: '7', slug: 'durga-kavach',
    title_english: 'Durga Kavach', title_sanskrit: 'दुर्गा कवचम्', title_hindi: 'दुर्गा कवच',
    deity_id: '7', category_id: '6', duration_seconds: 540,
    audio_url: 'https://6193a7641e4be2a67adb9c94921ddd7c.r2.cloudflarestorage.com/Kavachams & Suktams/shri-gayatri-kavacham.mp3', reciter_name: 'Traditional Recitation',
    significance_english: 'The protective armor of Goddess Durga from the Markandeya Purana.',
    is_featured: false, is_published: true, view_count: 7800, play_count: 4200,
    day_of_week: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    deity: MOCK_DEITIES[6], category: MOCK_CATEGORIES[5],
  },
  {
    id: '8', slug: 'aditya-hridayam',
    title_english: 'Aditya Hridayam', title_sanskrit: 'आदित्यहृदयम्', title_hindi: 'आदित्य हृदयम्',
    deity_id: '10', category_id: '2', duration_seconds: 720,
    audio_url: 'https://6193a7641e4be2a67adb9c94921ddd7c.r2.cloudflarestorage.com/Stotras & Ashtakams/rudram-namakam-chamakam.mp3', reciter_name: 'Traditional Recitation',
    significance_english: 'The heart of the Sun God, taught by sage Agastya to Lord Rama.',
    is_featured: false, is_published: true, view_count: 6200, play_count: 3100,
    day_of_week: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    deity: MOCK_DEITIES[9], category: MOCK_CATEGORIES[1],
  },
];

export const MOCK_VERSES: StotraVerse[] = [
  {
    id: 'v1', stotra_id: '4', verse_number: 1,
    start_time_ms: 0, end_time_ms: 15000,
    sanskrit_text: 'ॐ भूर्भुवः स्वः',
    transliteration_iast: 'Oṃ bhūr bhuvaḥ svaḥ',
    meaning_english: 'Om, the three realms — Earth, Atmosphere, and Heaven',
    meaning_hindi: 'ॐ, तीनों लोक — भूलोक, भुवर्लोक और स्वर्गलोक',
    created_at: new Date().toISOString(),
  },
  {
    id: 'v2', stotra_id: '4', verse_number: 2,
    start_time_ms: 15000, end_time_ms: 35000,
    sanskrit_text: 'तत्सवितुर्वरेण्यम्',
    transliteration_iast: 'tat saviturvareṇyam',
    meaning_english: 'That divine radiance of the Creator which is most adorable',
    meaning_hindi: 'उस श्रेष्ठ सृष्टिकर्ता सविता देव का वह उत्तम तेज',
    created_at: new Date().toISOString(),
  },
  {
    id: 'v3', stotra_id: '4', verse_number: 3,
    start_time_ms: 35000, end_time_ms: 55000,
    sanskrit_text: 'भर्गो देवस्य धीमहि',
    transliteration_iast: 'bhargo devasya dhīmahi',
    meaning_english: 'We meditate upon that divine light',
    meaning_hindi: 'हम उस दिव्य प्रकाश का ध्यान करते हैं',
    created_at: new Date().toISOString(),
  },
  {
    id: 'v4', stotra_id: '4', verse_number: 4,
    start_time_ms: 55000, end_time_ms: 75000,
    sanskrit_text: 'धियो यो नः प्रचोदयात्',
    transliteration_iast: 'dhiyo yo naḥ pracodayāt',
    meaning_english: 'May it inspire and illuminate our intellect',
    meaning_hindi: 'जो हमारी बुद्धि को सन्मार्ग पर प्रेरित करे',
    created_at: new Date().toISOString(),
  },
];

// Deity emoji icons (used when no image is loaded)
export const DEITY_ICONS: Record<string, string> = {
  shiva: '🔱',
  vishnu: '🪷',
  krishna: '🦚',
  rama: '🏹',
  hanuman: '🐒',
  ganesha: '🐘',
  durga: '🦁',
  lakshmi: '🪔',
  saraswati: '🎵',
  surya: '☀️',
  navagraha: '🌟',
  gayatri: '🙏',
};

export const DEITY_IMAGES: Record<string, any> = {
  shiva: require('../assets/images/deities/shiva.jpg'),
  krishna: require('../assets/images/deities/krishna.jpg'),
  rama: require('../assets/images/deities/rama.jpg'),
  hanuman: require('../assets/images/deities/hanuman.jpg'),
  ganesha: require('../assets/images/deities/ganesha.jpg'),
  vishnu: require('../assets/images/deities/vishnu.jpg'),
  surya: require('../assets/images/deities/surya.jpg'),
  durga: require('../assets/images/deities/durga.jpg'),
  lakshmi: require('../assets/images/deities/lakshmi.jpg'),
  saraswati: require('../assets/images/deities/saraswati.jpg'),
  gayatri: require('../assets/images/deities/gayatri.jpg'),
  general: require('../assets/images/deities/general.jpg'),
};

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Helper: format duration
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Helper: get stotra for today
export function getDailyDarshan(): Stotra | undefined {
  const today = new Date().getDay();
  return MOCK_STOTRAS.find(s => s.day_of_week === today);
}

// Helper: Resolve Deity Image
export function getDeityImageSource(deity?: Deity) {
  if (deity?.slug && DEITY_IMAGES[deity.slug.toLowerCase()]) {
    return DEITY_IMAGES[deity.slug.toLowerCase()];
  }
  return DEITY_IMAGES['general'];
}

// Helper: Resolve Stotra Cover Image
export function getStotraImageSource(stotra: Stotra) {
  if (stotra.cover_image_url) {
    return { uri: stotra.cover_image_url };
  }
  // Stotra uses its deity's image as fallback
  return getDeityImageSource(stotra.deity);
}
