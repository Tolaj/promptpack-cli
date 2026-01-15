import path from "node:path";
import fsp from "node:fs/promises";

import { parseArgs, DEFAULT_OUT, DEFAULT_MAX_BYTES, DEFAULT_MAX_FILES } from "./cli/args.js";
import { printHelp } from "./cli/help.js";

import { DEFAULT_IGNORE } from "./ignore/defaults.js";
import { buildIgnoreMatchers, readIgnoreFile, normalizeSlashes } from "./ignore/ignoreMatcher.js";

import { walkDir } from "./fs/walkDir.js";
import { buildTree } from "./fs/tree.js";
import { isBinaryFile, readTextFileCapped } from "./fs/readFile.js";

import { buildMarkdownDoc } from "./markdown/builder.js";

export async function run({ argv = process.argv, cwd = process.cwd() } = {}) {
    const opts = parseArgs(argv);

    if (opts.help || !opts.folder) {
        printHelp({
            defaultOut: DEFAULT_OUT,
            defaultMaxBytes: DEFAULT_MAX_BYTES,
            defaultMaxFiles: DEFAULT_MAX_FILES
        });
        return { code: opts.help ? 0 : 1 };
    }

    const rootDirAbs = path.resolve(cwd, opts.folder);
    const rootStat = await fsp.stat(rootDirAbs).catch(() => null);
    if (!rootStat || !rootStat.isDirectory()) {
        console.error(`Error: folder not found or not a directory: ${rootDirAbs}`);
        return { code: 1 };
    }

    const ignoreFromFile = opts.useIgnoreFile ? await readIgnoreFile(rootDirAbs) : [];
    const ignorePatterns = [...DEFAULT_IGNORE, ...ignoreFromFile];
    const shouldIgnore = buildIgnoreMatchers(ignorePatterns);

    const entries = await walkDir(rootDirAbs, {
        includeHidden: opts.includeHidden,
        shouldIgnore,
        maxFiles: opts.maxFiles
    });

    const tree = buildTree(entries);

    // Read file contents (capped + binary detection)
    const fileContents = new Map();

    for (const e of entries) {
        if (e.isDir || e.rel === ".") continue;

        const rel = normalizeSlashes(e.rel);

        if (e.isSymlink) {
            fileContents.set(rel, { kind: "symlink" });
            continue;
        }

        if (shouldIgnore(rel)) continue;

        const binary = await isBinaryFile(e.abs);
        if (binary) {
            fileContents.set(rel, { kind: "binary" });
            continue;
        }

        try {
            const contentInfo = await readTextFileCapped(e.abs, opts.maxBytes);
            fileContents.set(rel, { kind: "text", ...contentInfo });
        } catch {
            fileContents.set(rel, { kind: "unreadable" });
        }
    }

    const finalDoc = buildMarkdownDoc({
        rootDir: normalizeSlashes(rootDirAbs),
        tree,
        entries,
        opts,
        fileContents
    });

    await fsp.writeFile(path.resolve(cwd, opts.outFile), finalDoc, "utf8");

    console.log(`✅ Wrote: ${opts.outFile}`);
    console.log(`Tip: Open it and copy-paste into ChatGPT/LLMs. Tree is at the top, then file-by-file contents.`);

    return { code: 0 };
}
