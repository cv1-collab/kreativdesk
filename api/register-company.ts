import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

import { demoTemplates } from '../src/utils/demoTemplates.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { uid, email, inviteToken, enterpriseData } = req.body;

  if (!uid || !email) {
    return res.status(400).json({ error: 'Missing uid or email' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  const auth = getAuth();
  const db = getFirestore();
  let decodedToken;
  
  try {
    decodedToken = await auth.verifyIdToken(idToken);
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }

  if (decodedToken.uid !== uid) {
    return res.status(403).json({ error: 'Forbidden: UID mismatch' });
  }

  try {
    const now = new Date().toISOString();
    let assignedCompanyId = `comp_${uid}`;
    let assignedRole = 'owner';
    let isInvite = false;

    const batch = db.batch();

    // 1. Process Invite if present
    if (inviteToken) {
      const inviteRef = db.collection('invites').doc(inviteToken);
      const inviteSnap = await inviteRef.get();
      if (inviteSnap.exists) {
        const inviteData = inviteSnap.data();
        if (inviteData?.status === 'pending' && inviteData.email === email) {
          assignedCompanyId = inviteData.companyId;
          assignedRole = inviteData.role || 'Mitarbeiter';
          isInvite = true;
          
          batch.update(inviteRef, {
            status: 'accepted',
            acceptedBy: uid,
            acceptedAt: now
          });
          
          // Increment seats
          const companyRef = db.collection('companies').doc(assignedCompanyId);
          batch.update(companyRef, {
            usedSeats: FieldValue.increment(1)
          });
        }
      }
    }

    const trialEndDate = new Date((new Date()).getTime() + (30 * 24 * 60 * 60 * 1000));
    const isEnterprise = !!enterpriseData;
    const plan = isEnterprise ? 'Enterprise' : 'Expert Trial';
    const maxSeats = isEnterprise ? 50 : 1;
    const companyName = enterpriseData?.companyName || `${email.split('@')[0] || 'User'}s Workspace`;

    // 2. Create User
    batch.set(db.collection('users').doc(uid), {
      email: email, createdAt: now, role: assignedRole, companyId: assignedCompanyId,
      hasActiveSubscription: true, plan: plan, trialEndsAt: trialEndDate.toISOString(), hasSeenTour: false 
    });

    // 3. If NOT an invite, create company and onboarding data
    if (!isInvite) {
      const newCompanyId = assignedCompanyId;
      const newProjectId = `proj_${Date.now()}`;
      const tpl = demoTemplates.construction;

      batch.set(db.collection('companies').doc(newCompanyId), {
        id: newCompanyId, name: companyName, plan: plan,
        maxSeats: maxSeats, usedSeats: 1, ownerId: uid, trialEndsAt: trialEndDate.toISOString(), createdAt: now
      });

      batch.set(db.collection('projects').doc(newProjectId), {
        id: newProjectId, name: tpl.project.name, description: tpl.project.description,
        companyId: newCompanyId, ownerId: uid, status: 'active', createdAt: now, memberIds: [uid],
        siteLocation: tpl.project.siteLocation, cam1Url: ''
      });

      batch.set(db.collection('projectMembers').doc(`pm-${newProjectId}-${uid}`), {
        companyId: newCompanyId, projectId: newProjectId, userId: uid, role: 'Projektleitung', joinedAt: now
      });

      // Finance
      batch.set(db.collection('financeData').doc(`finance_${newProjectId}`), {
        projectId: newProjectId, companyId: newCompanyId, activeVersionId: 'v1',
        versions: [{
          id: 'v1', name: 'Startbudget', createdAt: now, status: 'approved',
          groups: tpl.financeGroups.map((g: any, gIdx: number) => ({
            id: `g_${gIdx}`, pos: g.pos, title: g.title,
            items: g.items.map((i: any, iIdx: number) => ({
              id: `item_${gIdx}_${iIdx}`, pos: i.pos, title: i.title, description: i.description || '',
              unit: i.unit || 'Pausch.', qty: i.qty || 1, unitPrice: i.unitPrice || 0,
              type: i.type || 'cost',
              total: (i.qty || 1) * (i.unitPrice || 0)
            }))
          }))
        }]
      });

      // Schedules
      batch.set(db.collection('schedules').doc(`schedule_${newProjectId}`), {
        projectId: newProjectId, companyId: newCompanyId, ownerId: uid,
        name: 'Initialer Projektplan', createdAt: now, isPublic: false,
        tasks: (tpl.tasks || []).map((t: any) => {
          const start = new Date(Date.now() + (t.daysOffsetStart || 0) * 86400000).toISOString().split('T')[0];
          const end = new Date(Date.now() + (t.daysOffsetEnd || 0) * 86400000).toISOString().split('T')[0];
          return { id: t.id, title: t.title, startDate: start, endDate: end, progress: t.progress || 0, status: t.status || 'Geplant', color: t.color };
        }),
        smartMarkers: (tpl.smartMarkers || []).map((m: any) => {
          const date = new Date(Date.now() + (m.daysOffset || 0) * 86400000).toISOString().split('T')[0];
          return { id: m.id, date: date, label: m.title, color: m.color };
        })
      });

      // Pitch Deck Slides
      for (const slide of tpl.pitchDeck.slides) {
        batch.set(db.collection('slides').doc(`slide_${newProjectId}_${slide.id}`), {
          title: slide.title, content: slide.content || '', 
          projectId: newProjectId, companyId: newCompanyId, ownerId: uid, 
          layout: slide.layout || 'split', order_index: slide.order_index || 0, 
          imageUrl: slide.imageUrl || '', fontSize: 36, createdAt: now
        });
      }

      // Defects
      for (let i = 0; i < tpl.defects.length; i++) {
        const d = tpl.defects[i];
        batch.set(db.collection('defects').doc(`defect_${newProjectId}_${i}`), {
          title: d.title, description: d.description || '', projectId: newProjectId, companyId: newCompanyId, reporterId: uid,
          priority: d.priority || 'Mittel', status: d.status || 'Offen', trade: d.trade || '', location: d.location || '',
          imageUrl: d.imageUrl || '', createdAt: now
        });
      }

      // Documents
      if (tpl.documents) {
        for (let i = 0; i < tpl.documents.length; i++) {
          const docItem = tpl.documents[i];
          batch.set(db.collection('documents').doc(`doc_${newProjectId}_${i}`), {
            companyId: newCompanyId, projectId: newProjectId, name: docItem.name, category: docItem.category || 'plans', 
            url: docItem.url || '', type: docItem.type || (docItem.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'), 
            size: '2.4 MB', isFolder: false, ownerId: uid, createdAt: now
          });
        }
      }

      // Transactions
      if (tpl.transactions) {
        for (let i = 0; i < tpl.transactions.length; i++) {
          const tx = tpl.transactions[i];
          batch.set(db.collection('transactions').doc(`tx_${newProjectId}_${i}`), {
            id: tx.id, companyId: newCompanyId, projectId: newProjectId, createdBy: uid,
            category: tx.category, amount: tx.amount, date: tx.date || now,
            description: tx.description, title: tx.title, status: tx.status, createdAt: now
          });
        }
      }

      // Time Entries
      if (tpl.timeEntries) {
        for (let i = 0; i < tpl.timeEntries.length; i++) {
          const te = tpl.timeEntries[i];
          batch.set(db.collection('timeEntries').doc(`te_${newProjectId}_${i}`), {
            id: te.id, companyId: newCompanyId, projectId: newProjectId, userId: uid,
            description: te.description, hours: te.hours, date: te.date || now, createdAt: now
          });
        }
      }

      // Additional Members (Mock)
      if (tpl.members) {
        for (let i = 0; i < tpl.members.length; i++) {
          const m = tpl.members[i];
          const fakeUserId = `demo_user_${i}`;
          batch.set(db.collection('users').doc(fakeUserId), {
            email: m.email, name: m.name, role: m.role, companyId: newCompanyId,
            photoURL: m.photoURL, createdAt: now
          });
          batch.set(db.collection('projectMembers').doc(`pm-${newProjectId}-${fakeUserId}`), {
            companyId: newCompanyId, projectId: newProjectId, userId: fakeUserId, role: m.role, joinedAt: now
          });
        }
      }

      batch.set(db.collection('whiteboards').doc(newProjectId), {
        companyId: newCompanyId, projectId: newProjectId, elements: '[]', createdAt: now
      });
    }

    // Commit all batched writes
    await batch.commit();

    // 4. Set Custom Claims
    const userRecord = await auth.getUser(uid);
    const currentClaims = userRecord.customClaims || {};

    await auth.setCustomUserClaims(uid, {
      ...currentClaims,
      companyId: assignedCompanyId,
      role: assignedRole
    });

    return res.status(200).json({ success: true, companyId: assignedCompanyId, role: assignedRole });

  } catch (error: any) {
    console.error("Registration Error:", error);
    return res.status(500).json({ error: 'Failed to register', details: error.message });
  }
}
