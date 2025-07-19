import * as fs from 'node:fs';
import * as path from 'node:path';

const NODE_ENV = process.env.NODE_ENV?.trim() || 'dev';

function parseEnv() {
  const envFiles = [path.resolve(`.env.${NODE_ENV}`), path.resolve('.env')];

  const existingFile = envFiles.find(fs.existsSync);

  if (!existingFile) {
    throw new Error(
      `No environment file found. Please create one of: ${envFiles.join(', ')}`,
    );
  }

  return { path: existingFile };
}

export default parseEnv();
