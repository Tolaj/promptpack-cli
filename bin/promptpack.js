#!/usr/bin/env node

import { parseArgs, DEFAULT_OUT, DEFAULT_MAX_BYTES, DEFAULT_MAX_FILES } from "../src/cli/args.js";
import { printHelp } from "../src/cli/help.js";

const opts = parseArgs(process.argv);

if (opts.help || !opts.folder) {
    printHelp({
        defaultOut: DEFAULT_OUT,
        defaultMaxBytes: DEFAULT_MAX_BYTES,
        defaultMaxFiles: DEFAULT_MAX_FILES
    });
    process.exit(opts.help ? 0 : 1);
}

console.log("Parsed options:", opts);
process.exit(0);
