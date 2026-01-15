import path from "node:path";
import fsp from "node:fs/promises";

export function normalizeSlashes(p) {
    return p.split(path.sep).join("/");
}

function wildcardToRegExp(pattern) {
    // Very small glob: '*' matches any chars except path separators.
    // Also allow patterns like "dist" to match any segment named "dist".
    const escaped = pattern
        .trim()
        .replace(/[.+^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, "[^/]*");
    return new RegExp(`^${escaped}$`, "i");
}

export function buildIgnoreMatchers(patterns) {
    const cleaned = patterns
        .map((s) => s.trim())
        .filter((s) => s && !s.startsWith("#"));

    const regs = cleaned.map(wildcardToRegExp);

    return (relPath) => {
        const p = normalizeSlashes(relPath);
        const parts = p.split("/").filter(Boolean);
        return regs.some((re) => re.test(p) || parts.some((seg) => re.test(seg)));
    };
}

export async function readIgnoreFile(rootDir) {
    const ignorePath = path.join(rootDir, ".promptpackignore");
    try {
        const data = await fsp.readFile(ignorePath, "utf8");
        return data
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l && !l.startsWith("#"));
    } catch {
        return [];
    }
}
