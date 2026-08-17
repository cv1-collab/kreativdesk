import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function testCompanySave() {
  const { data: comp } = await supabaseAdmin.from('companies').select('*').limit(1).single();
  console.log("Existing company:", comp);

  const { data, error } = await supabaseAdmin.from('companies').update({
    name: comp.name,
    contact_person: 'Test Contact',
    email: 'test@example.com',
    phone: '+41 79 123 45 67',
    website: 'https://www.kreativdesk.ch',
    uid: 'CHE-123.456.789',
    vat: 'CHE-123.456.789 MWST',
    address: 'Bahnhofstrasse 1',
    zip: '8001',
    city: 'Zürich',
    iban: 'CH00 0000 0000 0000 0000 0',
    webhook_url: 'https://example.com/webhook',
    primary_color: '#10b981'
  }).eq('id', comp.id).select();

  console.log("Update Result:", { data, error });
}

testCompanySave();
