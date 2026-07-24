import { mkdir } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { generateTOC, insertTOC, addBackToTOCLinks } from "./toc.mjs";


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
    let manuscriptWithTOC = insertTOC(manuscript, toc);
    manuscriptWithTOC = addBackToTOCLinks(manuscriptWithTOC);

    console.log(`Rendering manuscript MD to ${mdFile}`);
    await writeFile(mdFile, manuscriptWithTOC, "utf8");

    return mdFile;
}