import path from "node:path";
import fsp from "node:fs/promises";
import { normalizeSlashes } from "../ignore/ignoreMatcher.js";

/**
 * @typedef {{ rel: string, abs: string, isDir: boolean, isSymlink?: boolean }} Entry
 */

export async function walkDir(rootDir, options) {
    const { includeHidden, shouldIgnore, maxFiles } = options;

    /** @type {Entry[]} */
    const entries = [];
    let fileCount = 0;

    async function walk(currentAbs) {
        const rel = path.relative(rootDir, currentAbs) || ".";
        const relNorm = normalizeSlashes(rel);

        if (relNorm !== "." && shouldIgnore(relNorm)) return;

        const stat = await fsp.lstat(currentAbs);
        const name = path.basename(currentAbs);

        if (!includeHidden && name.startsWith(".") && relNorm !== ".") return;

        if (stat.isSymbolicLink()) {
            // Avoid following symlinks (prevent loops)
            entries.push({ rel: relNorm, abs: currentAbs, isDir: false, isSymlink: true });
            return;
        }

        if (stat.isDirectory()) {
            entries.push({ rel: relNorm, abs: currentAbs, isDir: true });
            const children = await fsp.readdir(currentAbs);
            children.sort((a, b) => a.localeCompare(b));
            for (const child of children) {
                await walk(path.join(currentAbs, child));
            }
            return;
        }

        if (stat.isFile()) {
            fileCount++;
            if (fileCount > maxFiles) {
                throw new Error(
                    `Safety stop: exceeded --max-files (${maxFiles}). Narrow the folder or increase the limit.`
                );
            }
            entries.push({ rel: relNorm, abs: currentAbs, isDir: false });
        }
    }

    await walk(rootDir);

    // dirs first, then files, both by rel
    entries.sort((a, b) => {
        if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
        return a.rel.localeCompare(b.rel);
    });

    return entries;
}
