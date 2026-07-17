import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export async function decodeStorageState(encoded, service) {
  if (!encoded) return undefined;
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "job-auth-"));
  const target = path.join(dir, `${service}.json`);
  await fs.writeFile(target, Buffer.from(encoded, "base64"), { mode: 0o600 });
  return target;
}
