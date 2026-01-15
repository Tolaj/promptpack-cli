import path from "node:path";

export function extToFenceLanguage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const base = path.basename(filePath).toLowerCase();

    if (base === "dockerfile") return "dockerfile";
    if (base === "makefile") return "makefile";

    const map = {
        ".js": "javascript",
        ".mjs": "javascript",
        ".cjs": "javascript",
        ".ts": "typescript",
        ".tsx": "tsx",
        ".jsx": "jsx",
        ".json": "json",
        ".jsonc": "jsonc",
        ".yaml": "yaml",
        ".yml": "yaml",
        ".md": "markdown",
        ".txt": "text",
        ".html": "html",
        ".css": "css",
        ".scss": "scss",
        ".less": "less",
        ".py": "python",
        ".go": "go",
        ".rs": "rust",
        ".java": "java",
        ".kt": "kotlin",
        ".sh": "bash",
        ".zsh": "zsh",
        ".ps1": "powershell",
        ".sql": "sql",
        ".xml": "xml",
        ".toml": "toml",
        ".ini": "ini",
        ".env": "dotenv"
    };

    return map[ext] || "";
}
