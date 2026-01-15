import { normalizeSlashes } from "../ignore/ignoreMatcher.js";

export function buildTree(entries) {
    const lines = [];
    lines.push(".");

    const items = entries
        .filter((e) => e.rel !== ".")
        .map((e) => ({
            rel: e.rel,
            parts: normalizeSlashes(e.rel).split("/"),
            isDir: e.isDir
        }));

    const dirSet = new Set(items.filter((i) => i.isDir).map((i) => i.rel));
    const printed = new Set();

    function ensurePrinted(pathStr, depth, isLastStack) {
        if (printed.has(pathStr)) return;
        printed.add(pathStr);

        const parts = pathStr.split("/");
        const name = parts[parts.length - 1];

        let prefix = "";
        for (let i = 0; i < depth; i++) {
            prefix += isLastStack[i] ? "   " : "│  ";
        }
        const branch = isLastStack[depth] ? "└─ " : "├─ ";
        lines.push(prefix + branch + name + (dirSet.has(pathStr) ? "/" : ""));
    }

    const byParent = new Map();
    for (const it of items) {
        const full = it.parts.join("/");
        const parent = it.parts.slice(0, -1).join("/") || ".";
        if (!byParent.has(parent)) byParent.set(parent, []);
        byParent.get(parent).push(full);
    }
    for (const [, arr] of byParent) arr.sort((a, b) => a.localeCompare(b));

    function dfs(parent, depth, isLastStack) {
        const children = byParent.get(parent) || [];
        children.forEach((child, idx) => {
            const isLast = idx === children.length - 1;
            const nextStack = [...isLastStack];
            nextStack[depth] = isLast;

            ensurePrinted(child, depth, nextStack);

            if (dirSet.has(child)) dfs(child, depth + 1, nextStack);
        });
    }

    dfs(".", 0, []);
    return lines.join("\n");
}
