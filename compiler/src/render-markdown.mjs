import { mkdir } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { generateTOC, insertTOC } from "./toc.mjs";


export async function renderMarkdown(manuscript, buildDir) {
    const mdFile = path.join(
        buildDir,
        'novel.md'
    );

    // Add a TOC to the Markdown file.
    const toc = generateTOC(manuscript, {
        minLevel: 2,
        maxLevel: 4,
    });
    const manuscriptWithTOC = insertTOC(manuscript, toc);

    console.log(`Rendering manuscript MD to ${mdFile}`);
    await writeFile(mdFile, manuscriptWithTOC, "utf8");

    return mdFile;
}