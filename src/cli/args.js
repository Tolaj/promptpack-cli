export const DEFAULT_OUT = "promptpack.md";
export const DEFAULT_MAX_BYTES = 500_000;
export const DEFAULT_MAX_FILES = 10_000;

export function parseArgs(argv) {
    const args = argv.slice(2);

    const out = {
        folder: null,
        outFile: DEFAULT_OUT,
        maxBytes: DEFAULT_MAX_BYTES,
        maxFiles: DEFAULT_MAX_FILES,
        includeHidden: false,
        useIgnoreFile: true,
        help: false
    };

    for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (!a) continue;

        if (a === "--help" || a === "-h") {
            out.help = true;
            continue;
        }
        if (a === "--include-hidden") {
            out.includeHidden = true;
            continue;
        }
        if (a === "--no-ignorefile") {
            out.useIgnoreFile = false;
            continue;
        }
        if (a === "--out") {
            out.outFile = args[++i] ?? out.outFile;
            continue;
        }
        if (a === "--max-bytes") {
            out.maxBytes = Number(args[++i] ?? out.maxBytes);
            if (!Number.isFinite(out.maxBytes) || out.maxBytes < 1) out.maxBytes = DEFAULT_MAX_BYTES;
            continue;
        }
        if (a === "--max-files") {
            out.maxFiles = Number(args[++i] ?? out.maxFiles);
            if (!Number.isFinite(out.maxFiles) || out.maxFiles < 1) out.maxFiles = DEFAULT_MAX_FILES;
            continue;
        }

        // first positional is folder
        if (!out.folder && !a.startsWith("--")) out.folder = a;
    }

    return out;
}
