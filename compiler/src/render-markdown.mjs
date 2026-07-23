import { mkdir } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import path from "node:path";

export async function renderMarkdown(manuscript, buildDir) {
    const mdFile = path.join(
        buildDir,
        'novel.md'
    );
    console.log(`Rendering manuscript MD to ${mdFile}`);

    await writeFile(mdFile, manuscript, "utf8");

    return mdFile;
}