import path from 'node:path';
import { fileURLToPath } from 'node:url';
const nextConfig = { output: 'export', outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)), images: { unoptimized: true } };
export default nextConfig;
