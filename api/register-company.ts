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

const demoTemplates = {
  construction: {
    project: { name: 'Einfamilienhaus Muster', description: 'Neubau Einfamilienhaus in Holzbauweise.', siteLocation: 'Musterstrasse 12, 8000 Zürich' },
    financeGroups: [
      {
        pos: '100', title: 'Planung & Bewilligungen',
        items: [
          { pos: '101', title: 'Architekturleistungen', description: 'Vorprojekt bis Ausführungsplanung', unit: 'Pausch.', qty: 1, unitPrice: 85000, type: 'cost' },
          { pos: '102', title: 'Bauingenieur', description: 'Statik und Baugrube', unit: 'Pausch.', qty: 1, unitPrice: 18500, type: 'cost' }
        ]
      },
      {
        pos: '200', title: 'Rohbau',
        items: [
          { pos: '201', title: 'Aushub & Baumeister', description: 'Fundament, Bodenplatte, Wände UG', unit: 'Pausch.', qty: 1, unitPrice: 145000, type: 'cost' },
          { pos: '202', title: 'Holzbau', description: 'Elementbau Wände & Dach', unit: 'Pausch.', qty: 1, unitPrice: 280000, type: 'cost' }
        ]
      }
    ],
    tasks: [
      { id: 't1', title: 'Baueingabe', daysOffsetStart: 0, daysOffsetEnd: 30, progress: 100, status: 'Abgeschlossen', color: 'bg-blue-500' },
      { id: 't2', title: 'Aushub', daysOffsetStart: 45, daysOffsetEnd: 60, progress: 50, status: 'In Bearbeitung', color: 'bg-orange-500' },
      { id: 't3', title: 'Rohbau / Holzbau', daysOffsetStart: 60, daysOffsetEnd: 90, progress: 0, status: 'Geplant', color: 'bg-purple-500' },
      { id: 't4', title: 'Innenausbau', daysOffsetStart: 90, daysOffsetEnd: 150, progress: 0, status: 'Geplant', color: 'bg-green-500' }
    ],
    smartMarkers: [
      { id: 'm1', title: 'Baustart', daysOffset: 45, color: 'bg-green-500' },
      { id: 'm2', title: 'Aufrichte', daysOffset: 90, color: 'bg-blue-500' }
    ],
    pitchDeck: {
      slides: [
        { id: 's1', title: 'Projekt Vision', content: 'Ein modernes und nachhaltiges Zuhause für die Zukunft.', layout: 'split', order_index: 0, imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop' },
        { id: 's2', title: 'Architektur', content: 'Klare Linien, viel Tageslicht und natürliche Materialien prägen den Entwurf.', layout: 'full_image', order_index: 1, imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000&auto=format&fit=crop' }
      ]
    },
    defects: [
      { title: 'Kratzer im Fensterglas', description: 'Fensterfront Südseite hat einen ca. 5cm langen Kratzer.', priority: 'Mittel', status: 'Offen', trade: 'Fensterbauer', location: 'EG Wohnzimmer', imageUrl: '' },
      { title: 'Steckdose ohne Strom', description: 'Steckdose neben der Tür funktioniert nicht.', priority: 'Hoch', status: 'In Bearbeitung', trade: 'Elektriker', location: 'OG Schlafzimmer', imageUrl: '' }
    ]
  }
};

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
          
          await inviteRef.update({
            status: 'accepted',
            acceptedBy: uid,
            acceptedAt: now
          });
          
          // Increment seats
          const companyRef = db.collection('companies').doc(assignedCompanyId);
          await companyRef.update({
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
    await db.collection('users').doc(uid).set({
      email: email, createdAt: now, role: assignedRole, companyId: assignedCompanyId,
      hasActiveSubscription: true, plan: plan, trialEndsAt: trialEndDate.toISOString(), hasSeenTour: false 
    });

    // 3. If NOT an invite, create company and onboarding data
    if (!isInvite) {
      const newCompanyId = assignedCompanyId;
      const newProjectId = `proj_${Date.now()}`;
      const tpl = demoTemplates.construction;

      await db.collection('companies').doc(newCompanyId).set({
        id: newCompanyId, name: companyName, plan: plan,
        maxSeats: maxSeats, usedSeats: 1, ownerId: uid, trialEndsAt: trialEndDate.toISOString(), createdAt: now
      });

      await db.collection('projects').doc(newProjectId).set({
        id: newProjectId, name: tpl.project.name, description: tpl.project.description,
        companyId: newCompanyId, ownerId: uid, status: 'active', createdAt: now, memberIds: [uid],
        siteLocation: tpl.project.siteLocation, cam1Url: ''
      });

      await db.collection('projectMembers').doc(`pm-${newProjectId}-${uid}`).set({
        companyId: newCompanyId, projectId: newProjectId, userId: uid, role: 'Projektleitung', joinedAt: now
      });

      // Finance
      await db.collection('financeData').doc(`finance_${newProjectId}`).set({
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
      await db.collection('schedules').doc(`schedule_${newProjectId}`).set({
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
        await db.collection('slides').doc(`slide_${newProjectId}_${slide.id}`).set({
          title: slide.title, content: slide.content || '', 
          projectId: newProjectId, companyId: newCompanyId, ownerId: uid, 
          layout: slide.layout || 'split', order_index: slide.order_index || 0, 
          imageUrl: slide.imageUrl || '', fontSize: 36, createdAt: now
        });
      }

      // Defects
      for (let i = 0; i < tpl.defects.length; i++) {
        const d = tpl.defects[i];
        await db.collection('defects').doc(`defect_${newProjectId}_${i}`).set({
          title: d.title, description: d.description || '', projectId: newProjectId, companyId: newCompanyId, reporterId: uid,
          priority: d.priority || 'Mittel', status: d.status || 'Offen', trade: d.trade || '', location: d.location || '',
          imageUrl: d.imageUrl || '', createdAt: now
        });
      }

      await db.collection('documents').doc(`doc_${Date.now()}`).set({
        companyId: newCompanyId, projectId: newProjectId, name: 'Projekt-Übersicht.pdf', category: 'plans', 
        url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop', 
        type: 'application/pdf', size: '2.4 MB', isFolder: false, ownerId: uid, createdAt: now
      });

      await db.collection('whiteboards').doc(newProjectId).set({
        companyId: newCompanyId, projectId: newProjectId, elements: '[]', createdAt: now
      });
    }

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
