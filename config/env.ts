import * as fs from 'fs';
import * as path from 'path';

const isProd = process.env.NODE_ENV === 'production';

function parseEnv() {
  const localEnv = path.resolve('.env');
  const prodEnv = path.resolve('.env.prod');

  if (!fs.existsSync(localEnv) && !fs.existsSync(prodEnv)) {
    throw new Error(
      'No environment file found. Please create a .env or .env.prod file.',
    );
  }

  const filePath = isProd && fs.existsSync(prodEnv) ? prodEnv : localEnv;

  // const config = dotenv.parse(fs.readFileSync(filePath));

  return { path: filePath };
}

export default parseEnv();
