import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Shield, Clock, User, Activity } from 'lucide-react';
import { cn } from '../utils';

export default function AuditLogsTab() {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !currentUser || !currentUser.companyId) return;
    
    const safeCompanyId = currentUser.companyId || `comp_${currentUser.uid}`;
    const logsRef = collection(db, 'auditLogs');
    const q = query(
      logsRef, 
      where('companyId', '==', safeCompanyId),
      orderBy('timestamp', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching audit logs:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(language === 'de' ? 'de-DE' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-300 text-text-primary p-4 md:p-8">
      <div className="flex items-center gap-3">
        <Shield className="text-accent-ai" size={24} />
        <h2 className="text-2xl font-bold tracking-tight">Audit Logs & Security</h2>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-border bg-background/50">
          <h3 className="font-bold text-sm">System Activity History</h3>
          <p className="text-xs text-text-muted mt-1">
            Immutable log of critical actions performed within your company workspace.
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <span className="text-sm text-text-muted font-bold animate-pulse">Loading logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <span className="text-sm text-text-muted font-bold">No critical actions recorded yet.</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-background/80 sticky top-0 backdrop-blur-md text-xs font-bold text-text-muted uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-bold w-48">Timestamp</th>
                  <th className="px-6 py-4 font-bold">Action</th>
                  <th className="px-6 py-4 font-bold">User ID</th>
                  <th className="px-6 py-4 font-bold">Details</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-text-muted flex items-center gap-2">
                      <Clock size={14} className="opacity-50" />
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4 font-bold">
                      <span className="flex items-center gap-2">
                        <Activity size={14} className="text-accent-ai" />
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-text-muted flex items-center gap-2">
                      <User size={14} className="opacity-50" />
                      {log.userId}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-text-muted">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
