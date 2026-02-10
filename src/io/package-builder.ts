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

  const entries = fs.readdirSync(scenarioDir);
  for (const entry of entries) {
    const fullPath = path.join(scenarioDir, entry);
    if (fs.statSync(fullPath).isFile()) {
      archive.file(fullPath, { name: entry });
    }
  }

  await archive.finalize();
  await done;
}
