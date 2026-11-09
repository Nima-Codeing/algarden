import { config } from 'dotenv';
import { join, resolve } from 'node:path';

const setupEnv = () => {
  // 環境変数を読み込む
  // NOTE: 相対パスだとdotenvがコマンドを実行した場所から探して見つからないため絶対パス
  const dir = join(__dirname, '..');
  config({ path: resolve(dir, '.env.test'), quiet: true });

  if (!process.env.DATABASE_URL) throw Error('Not found database url.');

  const { pathname } = new URL(process.env.DATABASE_URL);
  if (!pathname.endsWith('_test')) {
    const db_name = pathname.split('/').pop();
    throw Error('The connection target is not a test database: ' + db_name);
  }
};

setupEnv();
