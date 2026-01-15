export function printHelp({ defaultOut, defaultMaxBytes, defaultMaxFiles }) {
    console.log(`
PromptPack CLI — generate an LLM-friendly document from a folder.

Usage:
  promptpack <folder> [options]

Options:
  --out <file>         Output Markdown filename (default: ${defaultOut})
  --max-bytes <n>      Max bytes per file before truncation (default: ${defaultMaxBytes})
  --max-files <n>      Safety limit on number of files (default: ${defaultMaxFiles})
  --include-hidden     Include hidden files/dirs (dotfiles). Default: false
  --no-ignorefile      Do not read .promptpackignore
  --help, -h           Show this help

Examples:
  promptpack . --out promptpack.md
  promptpack ./apps/api --max-bytes 200000 --include-hidden
`.trim());
}
