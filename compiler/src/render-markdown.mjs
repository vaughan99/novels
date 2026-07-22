import { writeFile } from "node:fs/promises";
import path from "node:path";

export async function renderMarkdown(manuscript, buildDirectory, novel) {
    const mdFile = path.join(
        buildDirectory,
        novel + '.md'
    );
    console.log(`Rendering manuscript MD to ${mdFile}`);

    await writeFile(mdFile, manuscript, "utf8");

    return mdFile;
}