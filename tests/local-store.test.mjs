import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, utimes } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FileStore } from '../server/store.mjs';

test('recupera un bloqueo abandonado después de interrumpir el servidor local', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'terra-recovery-')); t.after(() => rm(directory, { recursive: true, force: true }));
  const store = new FileStore(directory);
  await store.write('record', { answer: 'crust' });
  await writeFile(store.path('record') + '.lock', JSON.stringify({ pid: 2147483647 }));
  assert.equal(await store.write('record', { answer: 'mantle' }), true);
  assert.deepEqual((await store.read('record')).data, { answer: 'mantle' });
  await writeFile(store.path('record') + '.lock', '');
  const old = new Date(Date.now() - 61000); await utimes(store.path('record') + '.lock', old, old);
  assert.equal(await store.write('record', { answer: 'core' }), true);
  assert.deepEqual((await store.read('record')).data, { answer: 'core' });
});
