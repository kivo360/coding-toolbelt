import { readIndex } from "../../lib/index-store";
import {
  buildSkillEmbeddings,
  loadEmbeddings,
  EMBEDDINGS_PATH,
  EMBEDDINGS_MODEL,
} from "../../lib/embeddings";
import { c, print, printErr } from "../../lib/output";

export async function runEmbed(args: string[]): Promise<number> {
  const json = args.includes("--json");
  const rebuild = args.includes("--rebuild");
  const status = args.includes("--status") || args.includes("--stats");

  if (status) return runStatus(json);

  const index = await readIndex();
  if (!index) {
    if (json) print(JSON.stringify({ error: "no-index" }));
    else printErr(c.red("No index found. Run `toolbelt skills reindex` first."));
    return 1;
  }

  const start = Date.now();
  let lastLog = 0;
  const total = Object.keys(index.skills).length;

  if (!json) {
    print(c.dim(`Loading model (${EMBEDDINGS_MODEL}, ~22 MB) — first run may take a few seconds…`));
  }

  try {
    const result = await buildSkillEmbeddings(index, {
      rebuild,
      onProgress: ({ done, total: pendingTotal, skill }) => {
        if (json) return;
        const now = Date.now();
        if (now - lastLog < 250 && done !== pendingTotal) return;
        lastLog = now;
        const pct = ((done / pendingTotal) * 100).toFixed(0);
        process.stdout.write(`\r  ${c.dim(`[${done}/${pendingTotal}]`)} ${pct}% — ${skill}`.padEnd(80) + "\r");
      },
    });

    const elapsed = Date.now() - start;
    const cached = total - countNew(result.skills, total);

    if (json) {
      print(
        JSON.stringify({
          path: EMBEDDINGS_PATH,
          model: result.model,
          dim: result.dim,
          totalSkills: total,
          cachedSkills: cached,
          elapsedMs: elapsed,
        })
      );
      return 0;
    }

    if (lastLog > 0) process.stdout.write("\n");
    print(
      c.green("✓") +
        ` Embedded ${c.bold(String(total))} skills in ${elapsed}ms ` +
        c.dim(`(${cached} cached)`)
    );
    print(c.dim(`  Model: ${result.model} (${result.dim} dim)`));
    print(c.dim(`  Wrote ${EMBEDDINGS_PATH}`));
    return 0;
  } catch (err) {
    if (json) print(JSON.stringify({ error: String(err instanceof Error ? err.message : err) }));
    else printErr(c.red("Embed failed: ") + (err instanceof Error ? err.message : String(err)));
    return 1;
  }
}

async function runStatus(json: boolean): Promise<number> {
  const idx = await loadEmbeddings();
  if (!idx) {
    if (json) print(JSON.stringify({ exists: false }));
    else print(c.dim("No embeddings index. Run `toolbelt skills embed`."));
    return 0;
  }
  const count = Object.keys(idx.skills).length;
  if (json) {
    print(
      JSON.stringify({
        exists: true,
        path: EMBEDDINGS_PATH,
        model: idx.model,
        dim: idx.dim,
        skills: count,
        generated: idx.generated,
      })
    );
    return 0;
  }
  print(c.bold("Embeddings index:"));
  print(`  ${c.dim("path:")}      ${EMBEDDINGS_PATH}`);
  print(`  ${c.dim("model:")}     ${idx.model}`);
  print(`  ${c.dim("dim:")}       ${idx.dim}`);
  print(`  ${c.dim("skills:")}    ${count}`);
  print(`  ${c.dim("generated:")} ${idx.generated}`);
  return 0;
}

function countNew(skills: Record<string, unknown>, _total: number): number {
  return Object.keys(skills).length;
}
