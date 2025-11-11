import fs from 'fs';
import path from 'path';
import { register } from 'tsconfig-paths';

const candidateConfigs = [
  '../../../tsconfig.base.json',
  '../../../tsconfig.json',
  '../tsconfig.app.json',
  '../tsconfig.json',
];

let registered = false;

for (const relativePath of candidateConfigs) {
  const configPath = path.resolve(__dirname, relativePath);
  if (!fs.existsSync(configPath)) {
    continue;
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const { compilerOptions } = config;
    if (!compilerOptions?.paths) {
      continue;
    }

    const baseDir = path.dirname(configPath);
    const baseUrl = path.resolve(baseDir, compilerOptions.baseUrl ?? '.');

    register({
      baseUrl,
      paths: compilerOptions.paths,
    });

    registered = true;
    break;
  } catch (error) {
    console.warn(
      `Failed to register tsconfig paths from ${configPath}. Trying next candidate.`,
      error,
    );
  }
}

if (!registered) {
  console.warn(
    'Could not locate a tsconfig with path mappings; @shared/* imports may fail.',
  );
}
