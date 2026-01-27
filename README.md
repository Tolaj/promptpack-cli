# PromptPack CLI

Generate a single LLM-friendly Markdown document from a folder:
- Folder tree first
- Then each file with path header + code block

## Install (local dev)
```sh
npm i
npm link
```
## Run
```sh
promptpack . --out promptpack.md
```

## Options
- --max-bytes <n> (default 500000)
- --max-files <n> (default 10000)
- --include-hidden
- --no-ignorefile (ignores .promptpackignore)

## Ignore
Create `.promptpackignore` in your project root to exclude paths (simple `*` wildcards supported).
