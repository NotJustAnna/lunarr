/*
 * This utility script parses arrays from `merged` and generates a
 * lookup report to the `lookup/report.json` file.
 *
 * This script is stupidly complicated because it's a bit of a hack,
 * but since it's a one-off, it's okay. I had to do this because
 * Node was OOM-ing if I split the code into multiple functions.
 */
import * as fs from 'fs-extra';

function substringToNth(str: string, n: number) {
  let index = -1;
  for (let i = 1; i <= n; i++) {
    index = str.indexOf('[', index + 1);
    if (index === -1) {
      console.error(`Could not find ${n}th '[' in ${str}`);
      break;
    }
  }

  return str.substring(0, index + 1);
}

async function main() {
  const merged = `${__dirname}/merged`;
  const dir = await fs.readdir(merged);

  const result: Record<string, string[]> = {};

  function recurse(obj: any, prefix: string = '') {
    if (obj !== null && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        for (const v of obj) {
          const i = obj.indexOf(v);
          recurse(v, `${prefix}[${i}]`);
        }
      } else {
        for (const [k, v] of Object.entries(obj)) {
          recurse(v, prefix.length === 0 ? k : `${prefix}.${k}`);
        }
      }
      return;
    }

    const str = String(obj);
    if (!result[str]) {
      result[str] = [prefix];
      return;
    } else if (!result[str].includes(prefix)) {
      result[str].push(prefix);
    }
  }

  await Promise.all(dir.map(async (name) => {
    const json: any[] = await fs.readJson(`${merged}/${name}`);
    console.log(`Processing ${name} with ${json.length} entries`);
    for (let element of json) {
      recurse(element, name.replace(/\.events\.json$/, 'Event'));
    }
  }));

  // remove entries from lookup that are a single key
  console.log(`Removing single-key entries...`);
  let r = 0;
  for (const k in result) {
    if (result[k].length === 1) {
      delete result[k];
      r++;
    }
  }
  console.log(`  Removed ${r} single-value entries`);

  // count the most amounts of '[' and ']' pairs in a single key
  // this is used to determine the maximum number of passes
  let max = 0;
  for (const k in result) {
    for (const v of result[k]) {
      const count = v.split('[').length - 1;
      if (count > max) {
        max = count;
      }
    }
  }

  console.log('Merging lookup keys...');
  let keysRemoved = 0;
  for (let n = 1; n <= max; n++) {
    for (const k in result) {
      const arrayLikeEntries = result[k].filter(v => (v.match(/\[/g) || []).length === n);

      const grouped = arrayLikeEntries.reduce((acc, v) => {
        const prefix = substringToNth(v, n);
        const end = v.indexOf(']', prefix.length + 1);
        const suffix = v.substring(end);
        const subscript = v.substring(prefix.length, end);
        let key = prefix + '***' + suffix;
        if (!acc[key]) {
          acc[key] = [subscript];
        } else {
          acc[key].push(subscript);
        }
        return acc;
      }, {} as Record<string, string[]>);

      let r = 0;
      for (const groupK in grouped) {
        if (grouped[groupK].length === 1) {
          delete grouped[groupK];
          r++;
        } else {
          const copy = [...grouped[groupK]];
          // sort arrays
          grouped[groupK].sort((a, b) => {
            let aIsInt = !isNaN(a as any) && !isNaN(parseInt(a));
            let bIsInt = !isNaN(b as any) && !isNaN(parseInt(b));
            // integers first
            if (aIsInt && !bIsInt) {
              return -1;
            }
            if (!aIsInt && bIsInt) {
              return 1;
            }
            // if both are integers, sort by number
            if (aIsInt && bIsInt) {
              return parseInt(a) - parseInt(b);
            }
            // if both are strings, sort by string
            return a.localeCompare(b);
          });

          if (grouped[groupK].filter(v => !isNaN(v as any) && !isNaN(parseInt(v))).length > 1) {
            for (let i = 0; i < grouped[groupK].length; i++) {
              const element = grouped[groupK][i];
              if (!isNaN(element as any) && !isNaN(parseInt(element))) {
                const start = parseInt(element);
                let end = start;
                while (grouped[groupK].length > i + 1 && !isNaN(grouped[groupK][i + 1] as any) && !isNaN(parseInt(grouped[groupK][i + 1]))) {
                  const next = parseInt(grouped[groupK][i + 1]);
                  if (next === end + 1) {
                    end = next;
                    grouped[groupK].splice(i + 1, 1);
                  } else {
                    break;
                  }
                }
                if (start !== end) {
                  grouped[groupK][i] = `${start}-${end}`;
                }
              }
            }
          }

          let toRemove = copy.map(v => groupK.replace(/\*\*\*/, v));
          result[k] = result[k].filter(v => !toRemove.includes(v)).concat(groupK.replace(/\*\*\*/, grouped[groupK].join(',')));
          keysRemoved += copy.length - 1;
        }
      }
    }
  }
  console.log(`  Removed ${keysRemoved} keys by merging`);

  console.log(`Writing lookup report...`);
  await fs.writeJson(`${__dirname}/lookup/report.json`, result, { spaces: 2 });
}

main().catch(console.error);
