import type { SkillFrontmatter } from "../types";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;

export function parseFrontmatter(content: string): {
  frontmatter: SkillFrontmatter;
  body: string;
} {
  const match = content.match(FRONTMATTER_RE);
  if (!match) return { frontmatter: {}, body: content };
  const yaml = match[1];
  const body = content.slice(match[0].length).replace(/^\r?\n/, "");
  return { frontmatter: parseYaml(yaml), body };
}

function parseYaml(input: string): SkillFrontmatter {
  const result: Record<string, unknown> = {};
  const lines = input.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line || /^\s*#/.test(line)) {
      i++;
      continue;
    }
    const kv = line.match(/^([a-zA-Z][a-zA-Z0-9_-]*):\s*(.*)$/);
    if (!kv) {
      i++;
      continue;
    }
    const [, key, rawValue] = kv;
    const value = rawValue.trim();

    if (value === "" || value === "|" || value === ">" || value === ">-" || value === "|-" || value === ">+" || value === "|+") {
      // Peek next non-empty line: if it's a list item, parse as list
      let peek = i + 1;
      while (peek < lines.length && lines[peek] === "") peek++;
      if (
        peek < lines.length &&
        value === "" &&
        /^\s+-\s+/.test(lines[peek])
      ) {
        const items: string[] = [];
        let j = i + 1;
        while (j < lines.length) {
          const next = lines[j];
          if (next === "") { j++; continue; }
          const list = next.match(/^\s+-\s+(.*)$/);
          if (!list) break;
          items.push(list[1].trim().replace(/^["']|["']$/g, ""));
          j++;
        }
        result[key] = items;
        i = j;
        continue;
      }

      const block: string[] = [];
      const blockMode = value === "|" || value === "|-" || value === "|+" ? "literal" : "folded";
      i++;
      while (i < lines.length) {
        const next = lines[i];
        if (next === "") {
          block.push("");
          i++;
          continue;
        }
        if (/^[a-zA-Z][a-zA-Z0-9_-]*:/.test(next) || next === "---") break;
        if (/^\s+/.test(next) || block.length === 0) {
          block.push(next.replace(/^\s+/, ""));
          i++;
          continue;
        }
        break;
      }
      const joined =
        blockMode === "folded"
          ? block.join(" ").replace(/\s+/g, " ").trim()
          : block.join("\n").replace(/\n+$/, "");
      result[key] = joined;
      continue;
    }

    if (value.startsWith("[") && value.endsWith("]")) {
      result[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
      i++;
      continue;
    }

    const items: string[] = [];
    let j = i + 1;
    while (j < lines.length) {
      const next = lines[j];
      const list = next.match(/^\s+-\s+(.*)$/);
      if (!list) break;
      items.push(list[1].trim().replace(/^["']|["']$/g, ""));
      j++;
    }
    if (items.length > 0) {
      result[key] = items;
      i = j;
      continue;
    }

    result[key] = stripQuotes(value);
    i++;
  }
  return result as SkillFrontmatter;
}

function stripQuotes(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}
