import { mkdir } from "node:fs/promises";
import path from "node:path";

import { readManuscript } from "./read-manuscript.mjs";
import { renderMarkdown } from "./render-markdown.mjs";
import { renderHtml } from "./render-html.mjs";

async function build() {

    const novel = process.argv[2];

    if (!novel) {
        throw new Error("Usage: npm run build -- ../the-cynn");
    }

    const manuscriptDir = path.join(novel, "manuscript");
    const buildDir = "./build";

    await mkdir(buildDir, { recursive: true });

    const manuscript = await readManuscript(manuscriptDir);

    const markdownFile = await renderMarkdown(manuscript, buildDir, novel);

    await renderHtml(markdownFile, buildDir, novel);

    console.log("Done.");
}

build().catch(error => {
    console.error(error);
    process.exit(1);
});
