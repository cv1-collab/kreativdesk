import handler from './api/register-company.js';

const req = {
  method: 'POST',
  body: {
    uid: 'dummy-uid-123',
    email: 'test@example.com'
  },
  headers: {
    authorization: 'Bearer dummy-token'
  }
};

const res = {
  status: (code) => {
    console.log("Status:", code);
    return {
      json: (data) => console.log("JSON:", data)
    };
  }
};

// We need to mock auth.verifyIdToken and getFirestore
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// But the file uses actual firebase-admin.
// Let's just bundle server.ts and try a curl to our local server!
