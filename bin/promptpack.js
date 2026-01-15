#!/usr/bin/env node

import { run } from "../src/index.js";

run()
    .then(({ code }) => process.exit(code))
    .catch((err) => {
        console.error("Fatal:", err?.message || err);
        process.exit(1);
    });
