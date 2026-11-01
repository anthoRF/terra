import { randomBytes, randomUUID, createHash, timingSafeEqual, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import { ACTIVITY_IDS, validateAnswers, gradeActivity } from '../shared/content.js';

const scrypt = promisify(scryptCallback);
const hash = s => createHash('sha256').update(s).digest('hex');
const equal = (a, b) => timingSafeEqual(Buffer.from(hash(a)), Buffer.from(hash(b)));
const SESSION = 'terra_session';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const randomCode = n => Array.from(randomBytes(n), v => ALPHABET[v % ALPHABET.length]).join('');
const cleanCode = value => String(value || '').replace(/[\s-]/g, '').toUpperCase();
const formatted = s => s.match(/.{1,4}/g).join('-');
const iso = () => new Date().toISOString();
const HttpError = class extends Error { constructor(status, message, extra = {}) { super(message); this.status = status; this.extra = extra; } };
const fail = (status, message, extra) => { throw new HttpError(status, message, extra); };
const classCode = input => { const code = cleanCode(input); if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) fail(400, 'Revisa el código de clase de seis caracteres.'); return code; };
function aliasValue(input) {
  const alias = String(input || '').normalize('NFC').trim().replace(/\s+/g, ' ');
  if (!/^[\p{L}\p{N} _-]{2,24}$/u.test(alias)) fail(400, 'Usa un alias de 2 a 24 letras o números, sin datos personales.');
  return alias;
}
const aliasId = alias => hash(alias.normalize('NFC').toLocaleLowerCase('es')).slice(0, 32);
async function makeAuth(code, version = 1) { const salt = randomBytes(16).toString('hex'); return { salt, hash: (await scrypt(code, salt, 32)).toString('hex'), version }; }
async function matches(code, auth) { const actual = await scrypt(code, auth.salt, 32); return timingSafeEqual(actual, Buffer.from(auth.hash, 'hex')); }
function profile(student, classroom) { return { role: 'student', uid: student.uid, id: aliasId(student.alias), alias: student.alias, classCode: student.classCode, className: classroom?.name || student.classCode }; }
const progress = student => ({ drafts: student.drafts, attempts: student.attempts, updatedAt: student.updatedAt });

export function createApp({ store, teacherKey = '', production = false, now = () => Date.now() }) {
  const configured = teacherKey.trim().length >= 16;
  // New accounts join a shared group automatically; existing groups remain intact.
  async function defaultClass() {
    const key = 'classes/TERRA2';
    const old = await store.read(key);
    if (old) return old;
    await store.write(key, { code: 'TERRA2', name: 'Participantes de Terra', system: true, createdAt: iso(), closed: false }, { onlyIfNew: true });
    return await store.read(key);
  }
  async function mutate(key, fn) {
    for (let i = 0; i < 8; i++) {
      const current = await store.read(key);
      if (!current) fail(404, 'Este registro ya no está disponible.');
      const next = await fn(structuredClone(current.data));
      if (await store.write(key, next, { onlyIfMatch: current.etag })) return next;
    }
    fail(409, 'Hay otra operación en curso. Vuelve a intentarlo.');
  }
  async function rate(key, limit, windowMs) {
    const slot = Math.floor(now() / windowMs);
    const path = `limits/${hash(`${key}-${slot}`)}`;
    for (let i = 0; i < 8; i++) {
      const old = await store.read(path);
      if (old && old.data.count >= limit) fail(429, 'Demasiados intentos. Espera unos minutos antes de volver a intentar.');
      if (await store.write(path, { count: (old?.data.count || 0) + 1, expires: (slot + 1) * windowMs }, old ? { onlyIfMatch: old.etag } : { onlyIfNew: true })) return;
    }
    fail(429, 'Hay muchos accesos a la vez. Espera un momento.');
  }
  async function issueSession(data, headers) {
    const token = randomBytes(32).toString('hex');
    const age = data.role === 'teacher' ? 8 * 3600 : 7 * 86400;
    await store.write(`sessions/${hash(token)}`, { ...data, expires: now() + age * 1000, teacherVersion: data.role === 'teacher' ? hash(teacherKey) : undefined });
    headers.set('Set-Cookie', `${SESSION}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${production ? '; Secure' : ''}`);
  }
  async function session(req) {
    const token = req.headers.get('cookie')?.split(';').map(s => s.trim()).find(s => s.startsWith(`${SESSION}=`))?.slice(SESSION.length + 1);
    if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
    const key = `sessions/${hash(token)}`;
    const found = await store.read(key);
    if (!found) return null;
    const s = found.data;
    if (s.expires <= now() || (s.role === 'teacher' && (!configured || s.teacherVersion !== hash(teacherKey)))) { await store.delete(key); return null; }
    if (s.role === 'student') {
      const student = await store.read(s.studentKey);
      if (!student || student.data.auth.version !== s.authVersion) { await store.delete(key); return null; }
      return { ...s, student: student.data, tokenKey: key };
    }
    return { ...s, tokenKey: key };
  }
  async function requireRole(req, role) { const s = await session(req); if (!s) fail(401, 'Tu sesión ha terminado. Vuelve a ingresar para guardar.'); if (s.role !== role) fail(403, 'Este acceso es solo para docentes.'); return s; }
  async function body(req) {
    if (!req.headers.get('content-type')?.includes('application/json')) fail(415, 'Envía la información desde el formulario.');
    if (Number(req.headers.get('content-length')) > 24000) fail(413, 'La información es demasiado extensa.');
    const raw = await req.text();
    if (Buffer.byteLength(raw) > 24000) fail(413, 'La información es demasiado extensa.');
    try { const value = JSON.parse(raw); if (!value || Array.isArray(value) || typeof value !== 'object') throw Error(); return value; } catch { fail(400, 'No se pudo leer el formulario. Revisa tus datos.'); }
  }
  const studentKey = (code, id) => { if (!/^[a-f0-9]{32}$/.test(String(id))) fail(400, 'Participante no válido.'); return `students/${classCode(code)}/${id}`; };
  const sanitized = fn => { try { return fn(); } catch (e) { fail(400, e.message); } };

  return async function app(req, context = {}) {
    const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers });
    try {
      const url = new URL(req.url);
      const path = url.pathname.replace(/\/$/, '');
      const method = req.method;
      if (!['GET', 'POST'].includes(method)) fail(405, 'Operación no disponible.');
      if (method === 'POST') {
        const origin = req.headers.get('origin');
        if (origin && origin !== url.origin) fail(403, 'El formulario debe enviarse desde este sitio.');
      }
      const ip = context.ip || 'local';
      if (path === '/api/health' && method === 'GET') return json({ ok: true, teacherConfigured: configured, storage: production ? 'netlify' : 'local', version: '1.2.0' });
      if (path === '/api/me' && method === 'GET') {
        const s = await session(req);
        if (!s) return json({ user: null, teacherConfigured: configured });
        if (s.role === 'teacher') return json({ user: { role: 'teacher' } });
        const classroom = await store.read(`classes/${s.student.classCode}`);
        return json({ user: profile(s.student, classroom?.data), ...progress(s.student) });
      }
      if (path === '/api/logout' && method === 'POST') {
        const s = await session(req); if (s) await store.delete(s.tokenKey);
        headers.set('Set-Cookie', `${SESSION}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${production ? '; Secure' : ''}`);
        return json({ ok: true });
      }
      if (path === '/api/teacher/login' && method === 'POST') {
        if (!configured) fail(503, 'El acceso docente no está disponible en este momento. Inténtalo más tarde.');
        await rate(`teacher-${ip}`, 8, 15 * 60000);
        const data = await body(req);
        if (typeof data.key !== 'string' || data.key.length > 200 || !equal(data.key, teacherKey)) fail(401, 'La clave docente no es correcta.');
        await issueSession({ role: 'teacher' }, headers);
        return json({ user: { role: 'teacher' } });
      }
      if (path === '/api/register' && method === 'POST') {
        await rate(`register-${ip}`, 100, 30 * 60000);
        const data = await body(req), alias = aliasValue(data.alias);
        const code = data.classCode ? classCode(data.classCode) : 'TERRA2';
        const classroom = data.classCode ? await store.read(`classes/${code}`) : await defaultClass();
        if (!classroom || classroom.data.closed) fail(400, 'Los registros están cerrados en este momento. Consulta con tu docente.');
        const members = await store.list(`students/${code}/`);
        if (members.length >= 150) fail(400, 'Esta clase alcanzó su límite de participantes. Consulta con tu docente.');
        const accessCode = randomCode(12), key = `students/${code}/${aliasId(alias)}`;
        const student = { uid: randomUUID(), alias, classCode: code, auth: await makeAuth(accessCode), drafts: {}, attempts: [], createdAt: iso(), updatedAt: iso() };
        if (!await store.write(key, student, { onlyIfNew: true })) fail(409, 'Ese alias ya está en uso. Elige otro o ingresa si es tuyo.');
        await issueSession({ role: 'student', studentKey: key, authVersion: student.auth.version }, headers);
        return json({ user: profile(student, classroom.data), accessCode: formatted(accessCode), ...progress(student) }, 201);
      }
      if (path === '/api/login' && method === 'POST') {
        const data = await body(req), alias = aliasValue(data.alias), accessCode = cleanCode(data.accessCode);
        await rate(`login-ip-${ip}`, 40, 15 * 60000);
        await rate(`login-${ip}-${hash(alias.toLocaleLowerCase('es'))}`, 12, 15 * 60000);
        const code = data.classCode ? classCode(data.classCode) : null;
        if (!/^[A-HJ-NP-Z2-9]{12}$/.test(accessCode)) fail(401, 'Revisa tu alias y tu código personal.');
        const groupKeys = code ? [`classes/${code}`] : await store.list('classes/');
        let match = null;
        // A code disambiguates aliases from older groups without asking for a class code.
        for (const groupKey of groupKeys) {
          const groupCode = groupKey.slice('classes/'.length);
          const key = `students/${groupCode}/${aliasId(alias)}`;
          const found = await store.read(key);
          if (found && await matches(accessCode, found.data.auth)) {
            if (match) fail(401, 'No se pudo identificar el acceso. Consulta con tu docente.');
            match = { key, student: found.data, groupCode };
          }
        }
        if (!match) fail(401, 'Revisa tu alias y tu código personal.');
        await issueSession({ role: 'student', studentKey: match.key, authVersion: match.student.auth.version }, headers);
        const classroom = await store.read(`classes/${match.groupCode}`);
        return json({ user: profile(match.student, classroom?.data), ...progress(match.student) });
      }
      if (path === '/api/draft' && method === 'POST') {
        const s = await requireRole(req, 'student'), data = await body(req);
        if (!ACTIVITY_IDS.includes(data.activity) || !Number.isInteger(data.revision) || data.revision < 0) fail(400, 'Borrador no válido.');
        const answers = sanitized(() => validateAnswers(data.activity, data.answers));
        const student = await mutate(s.studentKey, student => {
          const current = student.drafts[data.activity];
          if ((current?.revision || 0) !== data.revision) fail(409, 'Hay un borrador más reciente en otro dispositivo. Recupera el avance guardado antes de continuar.', { conflict: true });
          student.drafts[data.activity] = { answers, revision: data.revision + 1, updatedAt: iso() };
          student.updatedAt = iso(); return student;
        });
        return json({ draft: student.drafts[data.activity], savedAt: student.updatedAt });
      }
      if (path === '/api/attempt' && method === 'POST') {
        const s = await requireRole(req, 'student'), data = await body(req);
        if (!ACTIVITY_IDS.includes(data.activity) || !/^[a-f0-9-]{36}$/.test(String(data.requestId))) fail(400, 'Intento no válido.');
        const answers = sanitized(() => validateAnswers(data.activity, data.answers, true));
        const result = gradeActivity(data.activity, answers);
        const student = await mutate(s.studentKey, student => {
          const prior = student.attempts.find(a => a.id === data.requestId);
          if (prior) { if (prior.activity !== data.activity || JSON.stringify(prior.answers) !== JSON.stringify(answers)) fail(409, 'Este envío ya se utilizó para otra respuesta.'); return student; }
          if (student.attempts.length >= 100) fail(400, 'Ya hay 100 intentos guardados. Consulta con tu docente antes de continuar.');
          student.attempts.push({ id: data.requestId, activity: data.activity, answers, result, createdAt: iso() });
          student.updatedAt = iso(); return student;
        });
        return json({ attempt: student.attempts.find(a => a.id === data.requestId), attempts: student.attempts, savedAt: student.updatedAt });
      }
      if (path.startsWith('/api/teacher/')) {
        await requireRole(req, 'teacher');
        if (path === '/api/teacher/classes' && method === 'GET') {
          await defaultClass();
          const keys = await store.list('classes/');
          const classes = [];
          for (const key of keys) { const entry = await store.read(key); if (entry) classes.push(entry.data); }
          return json({ classes: classes.sort((a, b) => Number(!!b.system) - Number(!!a.system) || b.createdAt.localeCompare(a.createdAt)) });
        }
        if (path === '/api/teacher/classes' && method === 'POST') {
          const data = await body(req), name = String(data.name || '').trim();
          if (name.length < 2 || name.length > 60) fail(400, 'Escribe un nombre de clase de 2 a 60 caracteres.');
          if ((await store.list('classes/')).length >= 30) fail(400, 'Hay 30 clases. Utiliza una clase existente.');
          for (let i = 0; i < 5; i++) {
            const classroom = { code: randomCode(6), name, createdAt: iso(), closed: false };
            if (await store.write(`classes/${classroom.code}`, classroom, { onlyIfNew: true })) return json({ classroom }, 201);
          }
          fail(409, 'No se pudo crear el código. Inténtalo otra vez.');
        }
        if ((path === '/api/teacher/students' || path === '/api/teacher/export') && method === 'GET') {
          const code = classCode(url.searchParams.get('class'));
          const classroom = await store.read(`classes/${code}`); if (!classroom) fail(404, 'La clase ya no está disponible.');
          const students = [], keys = await store.list(`students/${code}/`);
          for (let start = 0; start < keys.length; start += 8) {
            const batch = await Promise.all(keys.slice(start, start + 8).map(key => store.read(key)));
            for (const found of batch) {
              if (!found) continue;
              const student = found.data;
              students.push({ ...profile(student, classroom.data), createdAt: student.createdAt, ...progress(student) });
            }
          }
          students.sort((a, b) => a.alias.localeCompare(b.alias, 'es'));
          if (path.endsWith('/students')) return json({ classroom: classroom.data, students });
          const cell = v => { let text = String(v ?? ''); if (/^[\s]*[=+@-]/.test(text) || /^[\t\r]/.test(text)) text = `'${text}`; return `"${text.replaceAll('"', '""')}"`; };
          const rows = [['Alias', 'Clase', 'Actividad', 'Intento', 'Fecha (Ecuador)', 'Aciertos', 'Total', 'Respuestas', 'Explicación 1', 'Explicación 2', 'Comentario docente', 'Fecha de revisión']];
          for (const student of students) {
            if (!student.attempts.length) rows.push([student.alias, classroom.data.name, 'Sin intentos', '', '', '', '', '', '', '', '', '']);
            const counts = {};
            for (const attempt of student.attempts) rows.push([student.alias, classroom.data.name, attempt.activity, counts[attempt.activity] = (counts[attempt.activity] || 0) + 1, new Date(attempt.createdAt).toLocaleString('es-EC', { timeZone: 'America/Guayaquil' }), attempt.result.score, attempt.result.total, JSON.stringify(attempt.answers), ...(attempt.answers.sentences || ['', '']), attempt.review?.feedback || '', attempt.review?.reviewedAt ? new Date(attempt.review.reviewedAt).toLocaleString('es-EC', {timeZone:'America/Guayaquil'}) : '']);
          }
          headers.set('Content-Type', 'text/csv; charset=utf-8'); headers.set('Content-Disposition', `attachment; filename="Terra_${code}_resultados.csv"`);
          return new Response('\uFEFF' + rows.map(row => row.map(cell).join(';')).join('\r\n'), { headers });
        }
        if (path === '/api/teacher/review' && method === 'POST') {
          const data = await body(req), key = studentKey(data.classCode, data.id);
          if (typeof data.feedback !== 'string' || data.feedback.trim().length < 3 || data.feedback.length > 1000 || typeof data.attemptId !== 'string') fail(400, 'Escribe un comentario de 3 a 1000 caracteres.');
          const student = await mutate(key, student => {
            const attempt = student.attempts.find(a => a.id === data.attemptId && a.activity === 'challenge');
            if (!attempt) fail(404, 'No encontramos esa ficha. Actualiza los resultados.');
            attempt.review = { feedback: data.feedback.trim(), reviewedAt: iso() };
            student.updatedAt = iso(); return student;
          });
          return json({ attempts: student.attempts });
        }
        if (path === '/api/teacher/reset' && method === 'POST') {
          const data = await body(req), key = studentKey(data.classCode, data.id), accessCode = randomCode(12);
          const auth = await makeAuth(accessCode);
          await mutate(key, student => { student.auth = { ...auth, version: student.auth.version + 1 }; student.updatedAt = iso(); return student; });
          return json({ accessCode: formatted(accessCode) });
        }
        if (path === '/api/teacher/delete' && method === 'POST') {
          const data = await body(req), key = studentKey(data.classCode, data.id);
          await store.delete(key); return json({ ok: true });
        }
        if (path === '/api/teacher/class-status' && method === 'POST') {
          const data = await body(req), code = classCode(data.classCode);
          if (typeof data.closed !== 'boolean') fail(400, 'Estado no válido.');
          const classroom = await mutate(`classes/${code}`, c => ({ ...c, closed: data.closed }));
          return json({ classroom });
        }
      }
      fail(404, 'No encontramos esta operación.');
    } catch (e) {
      if (e instanceof HttpError) return json({ error: e.message, ...e.extra }, e.status);
      console.error('Terra API:', e.name, e.code || 'operation_failed');
      return json({ error: 'No se pudo completar la operación. Conserva tu respuesta y vuelve a intentarlo.' }, 503);
    }
  };
}
