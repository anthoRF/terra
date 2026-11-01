export function nodeAdapter(app) {
  return async (req, res, next) => {
    if (!req.url?.startsWith('/api/')) return next?.();
    try {
      const chunks = []; let size = 0;
      for await (const chunk of req) { size += chunk.length; if (size > 24000) { res.writeHead(413, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'El formulario es demasiado extenso.' })); return; } chunks.push(chunk); }
      const protocol = req.headers['x-forwarded-proto']?.split(',')[0].trim() || 'http';
      const request = new Request(`${protocol}://${req.headers.host}${req.url}`, { method: req.method, headers: req.headers, ...(['GET', 'HEAD'].includes(req.method) ? {} : { body: Buffer.concat(chunks) }) });
      const response = await app(request, { ip: req.socket.remoteAddress || 'local' });
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch { res.writeHead(503, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'El servidor local no pudo responder. Vuelve a intentarlo.' })); }
  };
}
