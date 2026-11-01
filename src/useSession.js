import { useCallback, useEffect, useRef, useState } from 'react';
import { newDraft, ACTIVITY_IDS, gradeActivity } from '../shared/content.js';

export async function api(path, data, options = {}) {
  let response;
  try { response = await fetch(`/api${path}`, { method: data === undefined ? 'GET' : 'POST', credentials: 'same-origin', cache: 'no-store', headers: data === undefined ? {} : { 'Content-Type': 'application/json' }, ...(data === undefined ? {} : { body: JSON.stringify(data) }), signal: AbortSignal.timeout(18000), ...options }); }
  catch { throw Object.assign(new Error('No se pudo conectar. Tu respuesta sigue aquí; vuelve a intentar cuando tengas conexión.'), { status: 0 }); }
  const value = await response.json().catch(() => ({ error: 'No pudimos recuperar tu cuenta. Vuelve a intentarlo en unos momentos.' }));
  if (!response.ok) throw Object.assign(new Error(value.error || 'No se pudo completar la operación.'), { status: response.status, conflict: value.conflict });
  return value;
}
const initialDrafts = () => Object.fromEntries(ACTIVITY_IDS.map(id => [id, newDraft(id)]));
function requestId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16); globalThis.crypto.getRandomValues(bytes);
  bytes[6] = bytes[6] & 15 | 64; bytes[8] = bytes[8] & 63 | 128;
  const hex = Array.from(bytes, n => n.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
function readGuest() { try { const item = JSON.parse(localStorage.getItem('terra_guest_v1')); return item?.version === 1 ? item : null; } catch { return null; } }
const unpack = data => Object.fromEntries(ACTIVITY_IDS.map(id => [id, data?.[id]?.answers ?? newDraft(id)]));

export function useSession() {
  const guest = useRef(readGuest());
  const [user, setUser] = useState(null), [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState(guest.current?.attempts || []);
  const [drafts, setDrafts] = useState({ ...initialDrafts(), ...guest.current?.drafts });
  const [saveState, setSaveState] = useState('guest'), [saveError, setSaveError] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState(null), [available, setAvailable] = useState(true);
  const userRef = useRef(null), draftsRef = useRef(drafts), revisions = useRef({}), saved = useRef({}), inFlight = useRef(null), pendingIds = useRef({});
  draftsRef.current = drafts;
  const applySession = useCallback(data => {
    userRef.current = data.user;
    setUser(data.user); setSaveError(''); setAvailable(true);
    if (data.user?.role === 'student') {
      const next = unpack(data.drafts);
      revisions.current = Object.fromEntries(ACTIVITY_IDS.map(id => [id, data.drafts?.[id]?.revision || 0]));
      saved.current = Object.fromEntries(ACTIVITY_IDS.map(id => [id, JSON.stringify(next[id])]));
      draftsRef.current = next; setDrafts(next); setAttempts(data.attempts || []); setSaveState('saved'); setLastSavedAt(data.updatedAt);
    } else {
      const local = readGuest(); const next = { ...initialDrafts(), ...local?.drafts };
      draftsRef.current = next; setDrafts(next); setAttempts(local?.attempts || []); setSaveState('guest'); setLastSavedAt(null);
    }
  }, []);
  const refresh = useCallback(async () => { const data = await api('/me'); applySession(data); return data; }, [applySession]);
  useEffect(() => { let active = true; api('/me').then(data => { if (active) applySession(data); }).catch(() => { if (active) setAvailable(false); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [applySession]);

  useEffect(() => {
    if (loading || user) return;
    try { localStorage.setItem('terra_guest_v1', JSON.stringify({ version: 1, drafts, attempts })); } catch { setSaveError('El navegador no permite conservar el avance local. Ingresa para guardarlo en tu cuenta.'); }
  }, [drafts, attempts, user, loading]);

  const updateDraft = useCallback((id, value) => {
    setDrafts(previous => ({ ...previous, [id]: typeof value === 'function' ? value(previous[id]) : value }));
    setSaveError(''); setSaveState(userRef.current?.role === 'student' ? 'pending' : 'guest');
  }, []);
  const flush = useCallback(async () => {
    if (inFlight.current) return inFlight.current;
    const current = userRef.current;
    if (current?.role !== 'student') return;
    const job = (async () => {
      setSaveState('saving');
      try {
        do {
          for (const id of ACTIVITY_IDS) {
            const value = structuredClone(draftsRef.current[id]), encoded = JSON.stringify(value);
            if (saved.current[id] === encoded) continue;
            const data = await api('/draft', { activity: id, answers: value, revision: revisions.current[id] || 0 });
            if (userRef.current?.uid !== current.uid) return;
            revisions.current[id] = data.draft.revision; saved.current[id] = encoded; setLastSavedAt(data.savedAt);
          }
        } while (userRef.current?.uid === current.uid && ACTIVITY_IDS.some(id => saved.current[id] !== JSON.stringify(draftsRef.current[id])));
        if (userRef.current?.uid === current.uid) {
          setSaveState('saved'); setSaveError('');
          if (ACTIVITY_IDS.every(id => saved.current[id] === JSON.stringify(draftsRef.current[id]))) try { localStorage.removeItem(`terra_pending_${current.uid}`); } catch { /* optional local copy */ }
        }
      } catch (e) {
        if (userRef.current?.uid !== current.uid) return;
        setSaveState(e.status === 401 ? 'expired' : e.conflict ? 'conflict' : 'error'); setSaveError(e.message);
        // A local emergency copy is scoped to this account and contains no access code.
        try { localStorage.setItem(`terra_pending_${current.uid}`, JSON.stringify(draftsRef.current)); } catch { /* UI retains answers in memory. */ }
        throw e;
      }
    })();
    inFlight.current = job;
    try { return await job; } finally { inFlight.current = null; }
  }, []);
  useEffect(() => {
    if (loading || user?.role !== 'student' || ['conflict', 'error', 'expired'].includes(saveState)) return;
    if (ACTIVITY_IDS.every(id => saved.current[id] === JSON.stringify(drafts[id]))) return;
    const timer = setTimeout(() => { flush().catch(() => {}); }, 900);
    return () => clearTimeout(timer);
  }, [drafts, user, loading, flush, saveState]);
  useEffect(() => {
    if (saveState !== 'saved' || user?.role !== 'student') return;
    if (ACTIVITY_IDS.some(id => saved.current[id] !== JSON.stringify(drafts[id]))) setSaveState('pending');
  }, [saveState, drafts, user]);
  useEffect(() => {
    const warn = e => { if (userRef.current?.role === 'student' && ACTIVITY_IDS.some(id => saved.current[id] !== JSON.stringify(draftsRef.current[id]))) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, []);
  const submit = useCallback(async (activity, value) => {
    const result = gradeActivity(activity, value);
    const encoded = JSON.stringify(value);
    const previous = pendingIds.current[activity];
    const id = previous?.encoded === encoded ? previous.id : requestId();
    pendingIds.current[activity] = { id, encoded };
    if (userRef.current?.role === 'student') {
      try {
        if (saveState !== 'conflict') await flush();
        setSaveState('saving');
        const data = await api('/attempt', { activity, answers: value, requestId: id });
        setAttempts(data.attempts); setLastSavedAt(data.savedAt); setSaveState('saved'); setSaveError(''); delete pendingIds.current[activity];
        return data.attempt;
      } catch (e) {
        setSaveState(e.status === 401 ? 'expired' : e.conflict ? 'conflict' : 'error');
        setSaveError(e.message); throw e;
      }
    }
    const attempt = { id, activity, answers: structuredClone(value), result, createdAt: new Date().toISOString(), local: true };
    setAttempts(list => [...list, attempt]); delete pendingIds.current[activity]; return attempt;
  }, [flush, saveState]);
  const logout = useCallback(async () => {
    let flushed = true;
    if (userRef.current?.role === 'student') try { await flush(); } catch (e) { if (e.status === 401) flushed = false; else throw e; }
    await api('/logout', {}); const old = userRef.current;
    if (old?.uid && flushed) try { localStorage.removeItem(`terra_pending_${old.uid}`); } catch { /* optional local copy */ }
    applySession({ user: null });
  }, [applySession, flush]);
  const recoverLocalDraft = useCallback(() => {
    if (!userRef.current?.uid) return false;
    try {
      const value = JSON.parse(localStorage.getItem(`terra_pending_${userRef.current.uid}`));
      if (!value) return false;
      setDrafts({ ...initialDrafts(), ...value }); setSaveState('pending'); return true;
    } catch { return false; }
  }, []);
  const hasEmergency = user?.uid && (() => { try { return !!localStorage.getItem(`terra_pending_${user.uid}`); } catch { return false; } })();
  return { user, loading, attempts, drafts, updateDraft, submit, saveState, saveError, lastSavedAt, available, flush, refresh, applySession, logout, recoverLocalDraft, hasEmergency };
}
