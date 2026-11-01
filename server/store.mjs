import { mkdir, readFile, rename, unlink, open, readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

export class FileStore {
  constructor(directory) { this.directory = resolve(directory); }
  path(key) {
    if (!/^[a-zA-Z0-9_/-]+$/.test(key) || key.split('/').some(x => !x || x === '..' || x === '.')) throw new Error('Invalid store key');
    return join(this.directory, `${key}.json`);
  }
  async read(key) {
    try { const entry = JSON.parse(await readFile(this.path(key), 'utf8')); return { data: entry.data, etag: entry.etag }; }
    catch (e) { if (e.code === 'ENOENT') return null; throw e; }
  }
  async write(key, data, options = {}) {
    const path = this.path(key);
    await mkdir(join(path, '..'), { recursive: true });
    let lock;
    for (let i = 0; i < 100; i++) {
      try { lock = await open(`${path}.lock`, 'wx', 0o600); await lock.writeFile(JSON.stringify({ pid: process.pid })); break; }
      catch (e) {
        if (e.code !== 'EEXIST') throw e;
        try {
          const info = await stat(`${path}.lock`);
          let stale = Date.now() - info.mtimeMs > 60000;
          try { const owner = JSON.parse(await readFile(`${path}.lock`, 'utf8')); try { process.kill(owner.pid, 0); } catch (error) { if (error.code === 'ESRCH') stale = true; } } catch { if (Date.now() - info.mtimeMs > 3000) stale = true; }
          if (stale) await unlink(`${path}.lock`).catch(() => {});
        } catch { /* The active writer may just have released its lock. */ }
        await new Promise(r => setTimeout(r, 20));
      }
    }
    if (!lock) throw new Error('Store busy');
    const temp = `${path}.${randomUUID()}.tmp`;
    try {
      const previous = await this.read(key);
      if ((options.onlyIfNew && previous) || (options.onlyIfMatch && previous?.etag !== options.onlyIfMatch)) return false;
      const file = await open(temp, 'wx', 0o600);
      try { await file.writeFile(JSON.stringify({ etag: randomUUID(), data })); } finally { await file.close(); }
      await rename(temp, path);
      return true;
    } finally { await lock.close(); await unlink(`${path}.lock`).catch(() => {}); await unlink(temp).catch(() => {}); }
  }
  async delete(key) { await unlink(this.path(key)).catch(e => { if (e.code !== 'ENOENT') throw e; }); }
  async list(prefix) {
    const result = [];
    const visit = async (directory) => {
      let entries;
      try { entries = await readdir(directory, { withFileTypes: true }); } catch (e) { if (e.code === 'ENOENT') return; throw e; }
      for (const entry of entries) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) await visit(path);
        else if (entry.name.endsWith('.json')) {
          const key = path.slice(this.directory.length + 1).replaceAll('\\', '/').slice(0, -5);
          if (key.startsWith(prefix)) result.push(key);
        }
      }
    };
    await visit(this.directory);
    return result.sort();
  }
}

export class BlobStore {
  constructor(store) { this.store = store; }
  async read(key) { const result = await this.store.getWithMetadata(key, { type: 'json', consistency: 'strong' }); if (result && !result.etag) throw new Error('Missing storage revision'); return result; }
  async write(key, data, options = {}) { return (await this.store.setJSON(key, data, options)).modified; }
  async delete(key) { return this.store.delete(key); }
  async list(prefix) {
    const keys = [];
    for await (const page of this.store.list({ prefix, paginate: true })) keys.push(...page.blobs.map(b => b.key));
    return keys.sort();
  }
}
