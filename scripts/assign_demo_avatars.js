import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://jtgfrogbrkrllzdwzdrt.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0Z2Zyb2dicmtybGx6ZHd6ZHJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0ODMzOTcsImV4cCI6MjEwMTA1OTM5N30.WHFlicuJoJ2xSevb2-HvWgPml8Rwz28fTOFppQkvlYE';

const supabase = createClient(supabaseUrl, supabaseKey);

const DEMO_AVATARS = [
  '/demo-assets/avatar_sarah.jpg',
  '/demo-assets/avatar_michael.jpg',
  '/demo-assets/avatar_elena.jpg'
];

async function assignAvatars() {
  try {
    console.log('Suche nach CRM Kontakten ohne Avatar...');
    const { data: contacts, error } = await supabase.from('company_users').select('*');
    if (error) throw error;

    let updatedCount = 0;
    let avatarIndex = 0;

    for (const contact of (contacts || [])) {
      if (!contact.photo_url && !contact.avatar) {
        const assignedAvatar = DEMO_AVATARS[avatarIndex % DEMO_AVATARS.length];
        await supabase
          .from('company_users')
          .update({
            photo_url: assignedAvatar,
            avatar: assignedAvatar
          })
          .eq('id', contact.id);

        console.log(`- Avatar zugewiesen für: ${contact.name || 'Unbekannt'} -> ${assignedAvatar}`);
        avatarIndex++;
        updatedCount++;
      }
    }

    console.log(`\nFertig! Es wurden ${updatedCount} Kontakte mit Demo-Avataren aktualisiert.`);
    process.exit(0);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Avatare:', error);
    process.exit(1);
  }
}

assignAvatars();
