import { getStore } from '@netlify/blobs';
import { BlobStore } from '../../server/store.mjs';
import { createApp } from '../../server/app.mjs';

export default async (request, context) => {
  try {
    const store = new BlobStore(getStore({ name: 'terra-v1', consistency: 'strong' }));
    return await createApp({ store, teacherKey: process.env.DOCENTE_CLAVE || '', production: true })(request, { ip: context.ip });
  } catch {
    console.error('Terra: storage_initialization_failed');
    return new Response(JSON.stringify({ error: 'El almacenamiento no está disponible en este momento. Conserva tu respuesta y vuelve a intentarlo.' }), { status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
  }
};
export const config = { path: '/api/*' };
