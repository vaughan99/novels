import { mkdir } from "node:fs/promises";
import path from "node:path";

import { copyAssets, copyPandocConfig } from "./copy.mjs";
import { readManuscript } from "./read-manuscript.mjs";
import { renderMarkdown } from "./render-markdown.mjs";
import { renderHtml, renderEpub } from "./render-pandoc.mjs";

async function build() {

    const novel = process.argv[2];

    if (!novel) {
        throw new Error("Usage: npm run build -- [novelname]");
    }

    const manuscriptDir = path.join(novel, "manuscript");
    const buildDir = `./build/${novel}`;

    await mkdir(buildDir, { recursive: true });

    await copyAssets(novel, buildDir);
    await copyPandocConfig(novel, buildDir);

    const manuscript = await readManuscript(manuscriptDir);

    const mdFile = await renderMarkdown(manuscript, buildDir);

    await renderHtml(buildDir, mdFile);
    await renderEpub(buildDir, mdFile);

    console.log("Done.");
}

build().catch(error => {
    console.error(error);
    process.exit(1);
});
