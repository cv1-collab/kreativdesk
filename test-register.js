import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

console.log("Checking api/register-company.ts syntax...");
import('./api/register-company.js').then(m => console.log("Import success!")).catch(e => console.error("Import error:", e));
