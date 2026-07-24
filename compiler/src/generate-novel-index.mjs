// build/generate-directory-index.mjs

import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const EXCLUDED_DIRECTORIES = new Set([
  '.git',
  '.github',
  'build',
  'node_modules',
]);

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function generateNovelIndex() {
  // Resolve relative paths from the shell's current working directory.
  const targetDirectory = path.resolve('build');

  const entries = await readdir(targetDirectory, {
    withFileTypes: true,
  });

  const directories = entries
    .filter(
      entry =>
        entry.isDirectory() &&
        !entry.name.startsWith('.') &&
        !EXCLUDED_DIRECTORIES.has(entry.name),
    )
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: 'base',
    }));

  const navigation = directories.length
    ? directories
        .map(directory => {
          const label = escapeHtml(directory);
          const href = `./${encodeURIComponent(directory)}/novel.html`;

          return `      <li><a href="${href}">${label}</a></li>`;
        })
        .join('\n')
    : '      <li>No directories found.</li>';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Novel Directory</title>
  <style>
    body {
      max-width: 50rem;
      margin: 3rem auto;
      padding: 0 1.5rem;
      font-family: Georgia, serif;
      line-height: 1.6;
    }

    h1 {
      border-bottom: 1px solid #ccc;
      padding-bottom: 0.5rem;
    }

    li {
      margin: 0.75rem 0;
    }

    a {
      font-size: 1.15rem;
    }
  </style>
</head>
<body>
  <main>
    <h1>Novel Directory</h1>
    <ul>
${navigation}
    </ul>
  </main>
</body>
</html>
`;

  const outputFile = path.join(targetDirectory, 'index.html');

  await writeFile(outputFile, html, 'utf8');

  console.log(`Generated ${outputFile}`);
  console.log(`Linked ${directories.length} novels.`);
}

generateNovelIndex().catch(error => {
  console.error('Could not generate directory index:');
  console.error(error);
  process.exitCode = 1;
});