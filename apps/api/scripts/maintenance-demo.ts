import { GardenData, TodoData } from '@algarden/shared';

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
};

const TARGET_NODE = 150;
const BASE_URL = requireEnv('BASE_URL');
const EMAIL = requireEnv('DEMO_EMAIL');
const PASSWORD = requireEnv('DEMO_PASSWORD');
const NAME = 'demo';

const signIn = () =>
  fetch(`${BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

const main = async () => {
  // サインイン
  let signInRes = await signIn();

  if (signInRes.status === 400) {
    // ユーザーがまだ存在していない場合、作成してから再度サインイン
    const signUpRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: NAME, email: EMAIL, password: PASSWORD }),
    });
    if (!signUpRes.ok) throw new Error(`signup failed: ${signUpRes.status}`);
    signInRes = await signIn();
  }

  if (!signInRes.ok) throw new Error(`signin failed: ${signInRes.status}`);
  const cookie = signInRes.headers.getSetCookie()[0].split(';')[0];

  // Garden 取得
  const gardenRes = await fetch(`${BASE_URL}/gardens`, {
    headers: { Cookie: cookie },
  });
  if (!gardenRes.ok) throw new Error(`get garden failed: ${gardenRes.status}`);

  const garden = (await gardenRes.json()) as GardenData;
  const nodeCount = garden.plants.flatMap((p) => p.plantNodes).length;

  // Todo 取得
  const todoRes = await fetch(`${BASE_URL}/todos`, {
    headers: { Cookie: cookie },
  });
  if (!todoRes.ok) throw new Error(`get todos failed: ${todoRes.status}`);

  // 未完了 Todo 削除
  const todos = (await todoRes.json()) as TodoData[];
  const incompletes = todos.filter((t) => !t.isCompleted);
  for (const del of incompletes) {
    const deleteRes = await fetch(`${BASE_URL}/todos/${del.id}`, {
      method: 'DELETE',
      headers: { Cookie: cookie },
    });
    if (!deleteRes.ok) throw new Error(`delete: ${deleteRes.status}`);
  }

  let maxCompleteMs = 0;

  for (let i = nodeCount; i < TARGET_NODE; i++) {
    // Todo 生成
    const createRes = await fetch(`${BASE_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ title: `task-demo-${i}` }),
    });
    if (!createRes.ok) throw new Error(`create failed: ${createRes.status}`);
    const todo = (await createRes.json()) as TodoData;

    // Todo 開始
    const startRes = await fetch(`${BASE_URL}/todos/${todo.id}/start`, {
      method: 'PATCH',
      headers: { Cookie: cookie },
    });
    if (!startRes.ok) throw new Error(`start failed: ${startRes.status}`);

    // Todo 完了
    const startedAt = performance.now();
    const completeRes = await fetch(`${BASE_URL}/todos/${todo.id}/complete`, {
      method: 'PATCH',
      headers: { Cookie: cookie },
    });
    const ms = Math.round(performance.now() - startedAt);
    if (!completeRes.ok)
      throw new Error(`complete failed: ${completeRes.status}`);

    maxCompleteMs = Math.max(maxCompleteMs, ms);
    console.log(`${i + 1}/${TARGET_NODE} complete: ${ms}ms`);
  }

  console.log(`max complete: ${maxCompleteMs}ms`);
};

void main();
