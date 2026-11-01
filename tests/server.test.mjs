import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { FileStore, BlobStore } from '../server/store.mjs';
import { createApp } from '../server/app.mjs';
import { gradeActivity, validateAnswers, SPHERES } from '../shared/content.js';

async function fixture(t, options = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'terra-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const store = new FileStore(directory), teacherKey = randomUUID() + randomUUID();
  const app = createApp({ store, teacherKey, ...options });
  async function call(path, data, cookie, extraHeaders = {}) {
    const headers = { ...extraHeaders, ...(cookie ? { cookie } : {}), ...(data === undefined ? {} : { 'content-type': 'application/json' }) };
    const response = await app(new Request(`https://terra.test/api${path}`, { method: data === undefined ? 'GET' : 'POST', headers, ...(data === undefined ? {} : { body: JSON.stringify(data) }) }), { ip: 'test' });
    const content = await response.text();
    return { status: response.status, headers: response.headers, text: content, json: response.headers.get('content-type').includes('json') ? JSON.parse(content) : null, cookie: response.headers.get('set-cookie')?.split(';')[0] };
  }
  const teacher = await call('/teacher/login', { key: teacherKey }); assert.equal(teacher.status, 200);
  const classroom = await call('/teacher/classes', { name: 'Quinto A' }, teacher.cookie); assert.equal(classroom.status, 201);
  const code = classroom.json.classroom.code;
  const register = (alias = 'Explorador7') => call('/register', { alias, classCode: code });
  return { store, directory, app, teacherKey, teacher, code, call, register };
}

test('registro privado, acceso en otro dispositivo y permisos por rol', async t => {
  const f = await fixture(t, { production: true });
  const student = await f.register(); assert.equal(student.status, 201);
  assert.match(student.headers.get('set-cookie'), /HttpOnly/); assert.match(student.headers.get('set-cookie'), /Secure/); assert.match(student.headers.get('set-cookie'), /SameSite=Strict/);
  const me = await f.call('/me', undefined, student.cookie); assert.equal(me.json.user.alias, 'Explorador7'); assert.equal(me.json.auth, undefined); assert.ok(!me.text.includes('salt'));
  const login = await f.call('/login', { alias: 'explorador7', classCode: f.code, accessCode: student.json.accessCode }); assert.equal(login.status, 200); assert.equal(login.json.user.uid, me.json.user.uid);
  assert.equal((await f.call(`/teacher/students?class=${f.code}`, undefined, student.cookie)).status, 403);
  assert.equal((await f.call(`/teacher/students?class=${f.code}`)).status, 401);
  assert.equal((await f.register('EXPLORADOR7')).status, 409);
  assert.equal((await f.call('/login', { alias: 'Explorador7', classCode: f.code, accessCode: 'AAAA-BBBB-CCCC' })).status, 401);
  const stored = await f.store.read(`students/${f.code}/${me.json.user.id}`); assert.ok(stored.data.auth.hash); assert.ok(!JSON.stringify(stored).includes(student.json.accessCode));
});

test('el servidor calcula resultados, conserva intentos y hace envíos idempotentes', async t => {
  const f = await fixture(t), student = await f.register();
  const wrong = ['atmosphere', 'atmosphere', 'geosphere', 'biosphere'];
  const correct = ['hydrosphere', 'atmosphere', 'geosphere', 'biosphere'];
  const id = randomUUID();
  const first = await f.call('/attempt', { activity: 'discover', answers: wrong, requestId: id, result: { score: 999 } }, student.cookie);
  assert.equal(first.json.attempt.result.score, 3);
  const retry = await f.call('/attempt', { activity: 'discover', answers: wrong, requestId: id }, student.cookie); assert.equal(retry.json.attempts.length, 1);
  assert.equal((await f.call('/attempt', { activity: 'discover', answers: correct, requestId: id }, student.cookie)).status, 409);
  const second = await f.call('/attempt', { activity: 'discover', answers: correct, requestId: randomUUID() }, student.cookie); assert.equal(second.json.attempts.length, 2); assert.equal(second.json.attempts[0].result.score, 3); assert.equal(second.json.attempts[1].result.score, 4);
  const requests = await Promise.all([f.call('/attempt', { activity: 'build', answers: ['crust', 'mantle', 'core'], requestId: randomUUID() }, student.cookie), f.call('/attempt', { activity: 'connect', answers: [['biosphere', 'hydrosphere'], ['biosphere', 'geosphere'], ['biosphere', 'atmosphere']], requestId: randomUUID() }, student.cookie)]);
  assert.ok(requests.every(r => r.status === 200)); assert.equal((await f.call('/me', undefined, student.cookie)).json.attempts.length, 4);
  assert.equal((await f.call('/attempt', { activity: 'discover', answers: ['invalid'], requestId: randomUUID() }, student.cookie)).status, 400);
});

test('los borradores evitan sobrescrituras concurrentes y se aíslan por estudiante', async t => {
  const f = await fixture(t), a = await f.register('Aventura1'), b = await f.register('Aventura2');
  const first = await f.call('/draft', { activity: 'build', answers: ['mantle'], revision: 0, uid: b.json.user.uid }, a.cookie); assert.equal(first.status, 200); assert.equal(first.json.draft.revision, 1);
  const conflicting = await f.call('/draft', { activity: 'build', answers: ['crust'], revision: 0 }, a.cookie); assert.equal(conflicting.status, 409); assert.equal(conflicting.json.conflict, true);
  assert.deepEqual((await f.call('/me', undefined, b.cookie)).json.drafts, {});
  const updates = await Promise.all([f.call('/draft', { activity: 'build', answers: ['crust'], revision: 1 }, a.cookie), f.call('/draft', { activity: 'build', answers: ['core'], revision: 1 }, a.cookie)]);
  assert.deepEqual(updates.map(u => u.status).sort(), [200, 409]);
  assert.equal((await f.call('/me', undefined, a.cookie)).json.drafts.build.revision, 2);
});

test('persistencia tras reiniciar, cierre de sesión y recuperación de resultados', async t => {
  const f = await fixture(t), student = await f.register();
  await f.call('/attempt', { activity: 'build', answers: ['crust', 'mantle', 'core'], requestId: randomUUID() }, student.cookie);
  const reopened = createApp({ store: new FileStore(f.directory), teacherKey: f.teacherKey });
  const res = await reopened(new Request('https://terra.test/api/me', { headers: { cookie: student.cookie } })); assert.equal((await res.json()).attempts.length, 1);
  const logout = await f.call('/logout', {}, student.cookie); assert.match(logout.headers.get('set-cookie'), /Max-Age=0/); assert.equal((await f.call('/me', undefined, student.cookie)).json.user, null);
  const recovered = await f.call('/login', { alias: student.json.user.alias, classCode: f.code, accessCode: student.json.accessCode }); assert.equal(recovered.json.attempts.length, 1);
});

test('restablecer un código invalida las sesiones anteriores y conserva los aprendizajes', async t => {
  const f = await fixture(t), student = await f.register();
  await f.call('/attempt', { activity: 'build', answers: ['core', 'mantle', 'crust'], requestId: randomUUID() }, student.cookie);
  const reset = await f.call('/teacher/reset', { classCode: f.code, id: student.json.user.id }, f.teacher.cookie); assert.equal(reset.status, 200);
  assert.equal((await f.call('/me', undefined, student.cookie)).json.user, null);
  assert.equal((await f.call('/login', { alias: student.json.user.alias, classCode: f.code, accessCode: student.json.accessCode })).status, 401);
  const login = await f.call('/login', { alias: student.json.user.alias, classCode: f.code, accessCode: reset.json.accessCode }); assert.equal(login.status, 200); assert.equal(login.json.attempts.length, 1);
});

test('caducidad de sesiones y cambio de clave docente', async t => {
  let clock = Date.now(); const f = await fixture(t, { now: () => clock });
  const student = await f.register(); clock += 8 * 86400000;
  assert.equal((await f.call('/me', undefined, student.cookie)).json.user, null);
  assert.equal((await f.call('/teacher/classes', undefined, f.teacher.cookie)).status, 401);
  const fresh = await f.call('/teacher/login', { key: f.teacherKey });
  const rotated = createApp({ store: f.store, teacherKey: randomUUID() });
  assert.equal((await rotated(new Request('https://terra.test/api/teacher/classes', { headers: { cookie: fresh.cookie } }))).status, 401);
});

test('panel docente y CSV no exponen credenciales; fórmulas de hoja de cálculo neutralizadas', async t => {
  const f = await fixture(t), student = await f.register('-Explorador');
  await f.call('/attempt', { activity: 'challenge', answers: { surface: [...SPHERES], inside: ['crust', 'mantle', 'core'], sentences: ['El aire y el agua son componentes del planeta.', 'El corte me permitió observar las capas del interior.'] }, requestId: randomUUID() }, student.cookie);
  const list = await f.call(`/teacher/students?class=${f.code}`, undefined, f.teacher.cookie);
  assert.equal(list.json.students.length, 1); assert.ok(!list.text.includes('"auth"')); assert.ok(!list.text.includes(student.json.accessCode)); assert.equal(list.json.students[0].attempts[0].result.needsReview, true);
  const csv = await f.call(`/teacher/export?class=${f.code}`, undefined, f.teacher.cookie);
  assert.equal(csv.status, 200); assert.match(csv.headers.get('content-type'), /text\/csv/); assert.ok(csv.text.includes('"\'-Explorador"')); assert.ok(!csv.text.includes(student.json.accessCode)); assert.ok(csv.text.includes('El corte me permitió'));
});

test('inscripciones cerradas, eliminación de datos y validación de origen', async t => {
  const f = await fixture(t), student = await f.register();
  assert.equal((await f.call('/teacher/class-status', { classCode: f.code, closed: true }, f.teacher.cookie)).status, 200);
  assert.equal((await f.register('OtraPersona')).status, 400);
  assert.equal((await f.call('/login', { alias: student.json.user.alias, classCode: f.code, accessCode: student.json.accessCode })).status, 200);
  assert.equal((await f.call('/draft', { activity: 'build', answers: [], revision: 0 }, student.cookie, { origin: 'https://otro.test' })).status, 403);
  assert.equal((await f.call('/teacher/delete', { classCode: f.code, id: student.json.user.id }, student.cookie)).status, 403);
  assert.equal((await f.call('/teacher/delete', { classCode: f.code, id: student.json.user.id }, f.teacher.cookie)).status, 200);
  assert.equal((await f.call('/me', undefined, student.cookie)).json.user, null);
  assert.equal((await f.call(`/teacher/students?class=${f.code}`, undefined, f.teacher.cookie)).json.students.length, 0);
});

test('límites de acceso, formularios malformados y clave sin configurar', async t => {
  const f = await fixture(t);
  for (let i = 0; i < 7; i++) assert.equal((await f.call('/teacher/login', { key: 'incorrecta' })).status, 401);
  assert.equal((await f.call('/teacher/login', { key: 'incorrecta' })).status, 429);
  const unset = createApp({ store: f.store });
  assert.equal((await unset(new Request('https://terra.test/api/teacher/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }))).status, 503);
  assert.equal((await f.app(new Request('https://terra.test/api/register', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: '{}' }))).status, 415);
  assert.equal((await f.app(new Request('https://terra.test/api/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' }))).status, 400);
  assert.equal((await f.call('/register', { alias: '<script>alert(1)</script>', classCode: f.code })).status, 400);
});

test('contrato del adaptador Netlify: JSON, escrituras condicionales y paginación', async () => {
  const entries = new Map();
  const mock = {
    getWithMetadata: async (key, options) => { assert.equal(options.type, 'json'); assert.equal(options.consistency, 'strong'); return entries.get(key) || null; },
    setJSON: async (key, data, options) => { if (options.onlyIfNew && entries.has(key) || options.onlyIfMatch && entries.get(key)?.etag !== options.onlyIfMatch) return { modified: false }; entries.set(key, { data, etag: 'v1' }); return { modified: true }; },
    delete: async key => entries.delete(key),
    list: async function* (options) { assert.equal(options.paginate, true); yield { blobs: [{ key: 'students/A/1' }] }; yield { blobs: [{ key: 'students/A/2' }] }; },
  };
  const store = new BlobStore(mock); assert.equal(await store.write('a', { value: 1 }, { onlyIfNew: true }), true); assert.equal(await store.write('a', {}, { onlyIfNew: true }), false); assert.deepEqual((await store.read('a')).data, { value: 1 }); assert.deepEqual(await store.list('students/'), ['students/A/1', 'students/A/2']); await store.delete('a'); assert.equal(await store.read('a'), null);
});

test('la evaluación acepta el orden de selección y excluye el texto libre de la puntuación', () => {
  assert.equal(gradeActivity('connect', [['hydrosphere', 'biosphere'], ['geosphere', 'biosphere'], ['atmosphere', 'biosphere']]).score, 3);
  assert.throws(() => validateAnswers('build', ['crust', 'crust', 'core'], true));
  assert.throws(() => gradeActivity('challenge', { surface: [...SPHERES], inside: ['crust', 'mantle', 'core'], sentences: ['ok', 'no'] }));
  const result = gradeActivity('challenge', { surface: [...SPHERES], inside: ['crust', 'mantle', 'core'], sentences: ['Texto que deberá revisar una persona docente.', 'Otra explicación que requiere revisión humana.'] });
  assert.equal(result.score, 7); assert.equal(result.needsReview, true);
});

test('revisión docente persistente, visible para su estudiante y protegida por rol', async t => {
  const f = await fixture(t), student = await f.register();
  const attemptId = randomUUID();
  const answers = { surface: SPHERES, inside: ['crust','mantle','core'], sentences: ['Los componentes incluyen agua, aire, rocas y seres vivos.', 'El manto se encuentra entre la corteza y el núcleo terrestre.'] };
  assert.equal((await f.call('/attempt', { activity:'challenge', answers, requestId:attemptId }, student.cookie)).status, 200);
  const review = { classCode:f.code, id:student.json.user.id, attemptId, feedback:'Identificaste bien las capas. Explica un ejemplo de la hidrósfera.' };
  assert.equal((await f.call('/teacher/review', review)).status, 401);
  assert.equal((await f.call('/teacher/review', review, student.cookie)).status, 403);
  assert.equal((await f.call('/teacher/review', {...review, feedback:'a'}, f.teacher.cookie)).status, 400);
  assert.equal((await f.call('/teacher/review', {...review, attemptId:randomUUID()}, f.teacher.cookie)).status, 404);
  const saved = await f.call('/teacher/review', review, f.teacher.cookie);
  assert.equal(saved.status, 200); assert.equal(saved.json.attempts[0].review.feedback, review.feedback);
  assert.equal(saved.json.attempts[0].result.score, 7);
  const me = await f.call('/me', undefined, student.cookie);
  assert.equal(me.json.attempts[0].review.feedback, review.feedback);
  assert.ok(me.json.attempts[0].review.reviewedAt);
  const other = await f.register('OtroAlias');
  assert.equal((await f.call('/me', undefined, other.cookie)).json.attempts.length, 0);
  const csv = await f.call(`/teacher/export?class=${f.code}`, undefined, f.teacher.cookie);
  assert.ok(csv.text.includes('Comentario docente')); assert.ok(csv.text.includes(review.feedback));
});

test('registro con alias, grupo automático y acceso sin código de clase', async t => {
  const f = await fixture(t);
  const results = await Promise.all([f.call('/register', {alias:'NuevoAlias'}), f.call('/register', {alias:'OtroNuevo'})]);
  assert.ok(results.every(r=>r.status===201));
  const student=results[0]; assert.equal(student.json.user.classCode,'TERRA2');
  const login=await f.call('/login',{alias:'nuevoalias',accessCode:student.json.accessCode});
  assert.equal(login.status,200); assert.equal(login.json.user.uid,student.json.user.uid);
  assert.equal((await f.call('/register',{alias:'NuevoAlias'})).status,409);
  const classes=await f.call('/teacher/classes',undefined,f.teacher.cookie);
  assert.equal(classes.json.classes[0].code,'TERRA2');
  const list=await f.call('/teacher/students?class=TERRA2',undefined,f.teacher.cookie);
  assert.equal(list.json.students.length,2);
  assert.equal((await f.call('/login',{alias:'NuevoAlias',accessCode:'AAAA-BBBB-CCCC'})).status,401);
  await f.call('/teacher/class-status',{classCode:'TERRA2',closed:true},f.teacher.cookie);
  assert.equal((await f.call('/register',{alias:'NoSeRegistra'})).status,400);
  assert.equal((await f.call('/login',{alias:'NuevoAlias',accessCode:student.json.accessCode})).status,200);
});

test('los accesos anteriores y alias repetidos recuperan la cuenta correcta sin clase', async t => {
  const f=await fixture(t), old=await f.register('AliasCompartido');
  const current=await f.call('/register',{alias:'AliasCompartido'});
  assert.equal(current.status,201);
  await f.call('/attempt',{activity:'build',answers:['crust','mantle','core'],requestId:randomUUID()},old.cookie);
  const legacy=await f.call('/login',{alias:'AliasCompartido',accessCode:old.json.accessCode});
  assert.equal(legacy.status,200); assert.equal(legacy.json.user.uid,old.json.user.uid); assert.equal(legacy.json.attempts.length,1);
  const fresh=await f.call('/login',{alias:'AliasCompartido',accessCode:current.json.accessCode});
  assert.equal(fresh.status,200); assert.equal(fresh.json.user.uid,current.json.user.uid); assert.equal(fresh.json.attempts.length,0);
  const reset=await f.call('/teacher/reset',{classCode:f.code,id:old.json.user.id},f.teacher.cookie);
  assert.equal((await f.call('/login',{alias:'AliasCompartido',accessCode:old.json.accessCode})).status,401);
  const recovered=await f.call('/login',{alias:'AliasCompartido',accessCode:reset.json.accessCode});
  assert.equal(recovered.status,200); assert.equal(recovered.json.attempts.length,1);
});
