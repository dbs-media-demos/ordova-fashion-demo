// Runs several commands, split by "+", against the URL that with-server.mjs set.
//   node scripts/with-server.mjs node scripts/run-many.mjs node scripts/a.mjs / + node scripts/b.mjs /v2 375
import { spawnSync } from "node:child_process";
const cmds = [[]];
for (const a of process.argv.slice(2)) {
  if (a === "+") cmds.push([]);
  else cmds.at(-1).push(a);
}
for (const [cmd, ...args] of cmds.filter((c) => c.length)) {
  console.log("\n## " + [cmd, ...args].join(" "));
  spawnSync(cmd, args, { stdio: "inherit", env: process.env });
}
