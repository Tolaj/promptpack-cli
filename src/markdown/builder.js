import { extToFenceLanguage } from "../fs/languageMap.js";

function escapeMd(text) {
    // keep minimal; code is fenced anyway
    return text.replace(/\r\n/g, "\n");
}

export function buildMarkdownDoc({ rootDir, tree, entries, opts, fileContents }) {
    const outParts = [];

    outParts.push(`# PromptPack Output\n`);
    outParts.push(`**Root:** \`${rootDir}\``);
    outParts.push(`**Generated:** ${new Date().toISOString()}`);
    outParts.push(`\n---\n`);

    outParts.push(`## 1) Folder Structure\n`);
    outParts.push("```txt");
    outParts.push(tree);
    outParts.push("```");

    outParts.push(`\n<!-- PAGE BREAK: FILE CONTENTS BELOW -->\n`);
    outParts.push(`## 2) File Contents\n`);

    const files = entries.filter((e) => !e.isDir && e.rel !== ".");
    for (const f of files) {
        const info = fileContents.get(f.rel);

        outParts.push(`\n### ${f.rel}\n`);

        if (!info) {
            outParts.push(`(Skipped: unknown reason)\n`);
            continue;
        }

        if (info.kind === "symlink") {
            outParts.push(`(Skipped: symlink)\n`);
            continue;
        }
        if (info.kind === "binary") {
            outParts.push(`(Skipped: binary or unreadable file)\n`);
            continue;
        }
        if (info.kind === "unreadable") {
            outParts.push(`(Skipped: could not read)\n`);
            continue;
        }

        const lang = extToFenceLanguage(f.rel);
        const fence = lang ? `\`\`\`${lang}` : "```";

        outParts.push(fence);
        outParts.push(escapeMd(info.text).replace(/\n?$/, "\n"));
        outParts.push("```");

        if (info.truncated) {
            outParts.push(
                `\n> ⚠️ Truncated: file size ${info.size} bytes exceeded limit ${opts.maxBytes} bytes.\n`
            );
        }
    }

    return outParts.join("\n");
}
