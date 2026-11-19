import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = resolve(fileURLToPath(new URL('./app', import.meta.url)));
const argumentIndex = process.argv.indexOf('--port');
const portValue = argumentIndex < 0 ? 8080 : Number(process.argv[argumentIndex + 1]);
const port = Number.isInteger(portValue) && portValue > 0 && portValue < 65536 ? portValue : 8080;
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8'
};

createServer((request, response) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const requestedFile = resolve(join(appRoot, normalize(pathname)));
  if (requestedFile !== appRoot && !requestedFile.startsWith(appRoot + sep)) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const file = statSync(requestedFile);
    if (!file.isFile()) throw new Error('Not a file');
    response.writeHead(200, {
      'content-type': mimeTypes[extname(requestedFile).toLowerCase()] ?? 'application/octet-stream',
      'content-length': file.size,
      'cache-control': 'no-store'
    });
    createReadStream(requestedFile).pipe(response);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`LEONIDA ATLAS is available at http://localhost:${port}`);
});
