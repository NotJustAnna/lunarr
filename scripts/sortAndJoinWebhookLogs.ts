/*
 * This utility script parses webhook log files from `raw_logs`,
 * merges and joins them into JSON arrays to the `merged` folder.
 *
 * This code could be a bit be
 */
import * as fs from 'fs-extra';

async function main() {
  const rawLogs = `${__dirname}/raw_logs`;
  const dir = await fs.readdir(rawLogs);

  const result: Record<string, any[]> = {};

  await Promise.all(dir.map(async (name) => {
    const json = await fs.readJson(`${rawLogs}/${name}`);

    const k = json.request.path;
    const v = typeof json.body === 'string' ? JSON.parse(json.body) : json.body;

    if (!result[k]) {
      result[k] = [v];
    } else {
      result[k].push(v);
    }
  }));

  await Promise.all(Object.entries(result).map(async ([k, v]) => {
    const name = k.substring(1).replace(/\//g, '') + '.events.json';
    await fs.writeJson(`${__dirname}/merged/${name}`, v, { spaces: 2 });
  }));
}

main().catch(console.error);
