// The Painfully Honest Out-of-Office — make.fun entry
// Writes one brutally honest (but still polite) out-of-office auto-reply
// to <output dir>/entry.txt, where the house judge reads it.
//
// The reply admits the truth every employee thinks and no one says out loud:
// the inbox will wait, "urgent" usually isn't, and Monday is a soft promise.

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Everything the program needs to know, in one place.
const SETTINGS = Object.freeze({
  // Where the judge looks for the artifact; the sandbox sets this, /output is the fallback.
  outputDir: process.env.MAKEFUN_OUTPUT_DIR ?? "/output",
  fileName: "entry.txt",
  // The gate: 1 to 200 characters, not only white space.
  maxChars: 200,
  minChars: 1,
});

// Assemble the reply from its four beats so each one reads on its own.
function composeReply(): string {
  const opener = "I'm out of the office until Monday,";
  const confession = "and honestly I won't think about your email until Tuesday";
  const punchline = "— if it's urgent, it isn't, I checked.";
  const closer = "I'll reply when I'm back.";
  return [opener, confession, punchline, closer].join(" ");
}

// The gate, checked before anything is written.
function validate(reply: string): void {
  const trimmed = reply.trim();
  if (trimmed.length < SETTINGS.minChars) {
    throw new Error("reply is empty");
  }
  if (reply.length > SETTINGS.maxChars) {
    throw new Error(`reply is ${reply.length} chars, over the ${SETTINGS.maxChars} cap`);
  }
  if (reply.includes("\n")) {
    throw new Error("reply must be a single line");
  }
  if (reply !== reply.trim()) {
    throw new Error("reply has leading or trailing white space");
  }
}

// Resolve where the artifact lands.
function resolvePaths(): { dir: string; file: string } {
  const dir = SETTINGS.outputDir;
  return { dir, file: join(dir, SETTINGS.fileName) };
}

// Write the reply and say what landed.
async function handIn(): Promise<void> {
  const reply = composeReply();
  validate(reply);
  const { dir, file } = resolvePaths();
  await mkdir(dir, { recursive: true });
  await writeFile(file, reply, "utf8");
  console.log(`wrote ${reply.length} chars to ${file}`);
}

await handIn();
