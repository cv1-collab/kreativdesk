import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

async function testBucketCreation() {
  const bucketsToCreate = ['defects', 'blueprints', 'bim-models'];
  
  for (const b of bucketsToCreate) {
    console.log(`Creating bucket '${b}'...`);
    const { data, error } = await supabaseAdmin.storage.createBucket(b, {
      public: true
    });
    console.log(`Bucket '${b}' result:`, { data, error });
  }
}

testBucketCreation();
