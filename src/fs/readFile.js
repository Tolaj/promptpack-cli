import fsp from "node:fs/promises";

// Quick heuristic: if first chunk contains a null byte, treat as binary
export async function isBinaryFile(absPath) {
    try {
        const fd = await fsp.open(absPath, "r");
        const buf = Buffer.alloc(4096);
        const { bytesRead } = await fd.read(buf, 0, buf.length, 0);
        await fd.close();

        for (let i = 0; i < bytesRead; i++) {
            if (buf[i] === 0) return true;
        }
        return false;
    } catch {
        return true; // unreadable -> skip as binary/unreadable
    }
}

export async function readTextFileCapped(absPath, maxBytes) {
    const stat = await fsp.stat(absPath);
    const size = stat.size;

    const fd = await fsp.open(absPath, "r");
    try {
        const toRead = Math.min(size, maxBytes);
        const buf = Buffer.alloc(toRead);
        await fd.read(buf, 0, toRead, 0);

        const text = buf.toString("utf8");
        const truncated = size > maxBytes;
        return { text, truncated, size };
    } finally {
        await fd.close();
    }
}
