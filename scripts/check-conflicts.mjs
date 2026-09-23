import { opendir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import process from 'node:process';

const root = process.cwd();
const ignoredDirectories = new Set(['.git', 'node_modules', '.expo', 'coverage', 'dist']);
const conflictMarker = /^(<<<<<<<|=======|>>>>>>>)(?: .*)?$/m;
const conflicts = [];

async function inspectDirectory(directory) {
  const entries = await opendir(directory);
  for await (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) await inspectDirectory(join(directory, entry.name));
      continue;
    }
    if (!entry.isFile()) continue;

    const path = join(directory, entry.name);
    const contents = await readFile(path);
    if (contents.includes(0)) continue;
    if (conflictMarker.test(contents.toString('utf8'))) conflicts.push(relative(root, path));
  }
}

await inspectDirectory(root);

if (conflicts.length) {
  console.error('Unresolved Git conflict markers found:');
  for (const file of conflicts) console.error(`- ${file}`);
  process.exitCode = 1;
} else {
  console.log('No unresolved Git conflict markers found.');
}
