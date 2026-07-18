#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const readme = await readFile(resolve(repoRoot, 'README.md'), 'utf8');
const outputDirectory = resolve(repoRoot, '.superpowers');
const outputPath = resolve(outputDirectory, 'profile-preview.html');
const document = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>QuBenhao GitHub Profile Preview</title>
  <style>
    :root { color-scheme: light dark; }
    body { margin: 0; background: Canvas; color: CanvasText; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .markdown-body { box-sizing: border-box; width: min(832px, 100%); margin: 0 auto; padding: 24px 16px; }
    img { max-width: 100%; box-sizing: content-box; }
    p { margin: 0 0 16px; }
  </style>
</head>
<body>
  <article class="markdown-body">
${readme}
  </article>
</body>
</html>
`;

await mkdir(outputDirectory, { recursive: true });
await writeFile(outputPath, document, 'utf8');
console.log(outputPath);
