import archiver from 'archiver';
import * as fs from 'node:fs';
import * as path from 'node:path';

export async function buildPackage(scenarioDir: string, outputPath: string): Promise<void> {
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip');

  const done = new Promise<void>((resolve, reject) => {
    output.on('close', resolve);
    archive.on('error', reject);
  });

  archive.pipe(output);

  // Include subfolders: images are often referenced as e.g. "img/map.png", and
  // Valkyrie 3.23+ looks up translated media in language subfolders ("img/German/map.png")
  for (const entry of fs.readdirSync(scenarioDir, { recursive: true, encoding: 'utf8' })) {
    const fullPath = path.join(scenarioDir, entry);
    const isHidden = entry.split(path.sep).some(part => part.startsWith('.'));
    if (isHidden || entry.endsWith('.valkyrie') || path.resolve(fullPath) === path.resolve(outputPath)) continue;
    if (fs.statSync(fullPath).isFile()) {
      archive.file(fullPath, { name: entry.split(path.sep).join('/') });
    }
  }

  await archive.finalize();
  await done;
}
