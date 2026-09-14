import { mkdir } from "node:fs/promises";
import path from "node:path";

import { copyAssets, copyPandocConfig } from "./copy.mjs";
import { readMarkdownPieces } from "./read-markdown-pieces.mjs";
import { 
    renderManuscriptMarkdown,
    renderAfterwordMarkdown
} from "./render-markdown.mjs";
import {
    renderAfterwordHtml,
    renderManuscriptDocX,
    renderManuscriptEpub,
    renderManuscriptHtml,
    renderManuscriptPdf
} from "./render-pandoc.mjs";

async function build() {

    const novel = process.argv[2];

    if (!novel) {
        throw new Error("Usage: npm run build -- [novelname]");
    }

    const manuscriptDir = path.join(novel, "manuscript");
    const afterwordDir = path.join(novel, "afterword");
    const buildDir = `./build/${novel}`;

    await mkdir(buildDir, { recursive: true });

    await copyAssets(novel, buildDir);
    await copyPandocConfig(novel, buildDir);

    const manuscript = await readMarkdownPieces(manuscriptDir);
    const manuscriptMarkdownFile = await renderManuscriptMarkdown(manuscript, buildDir);
    const afterword = await readMarkdownPieces(afterwordDir);
    const afterwordMarkdownFile = await renderAfterwordMarkdown(afterword, buildDir);

    renderManuscriptHtml(buildDir, manuscriptMarkdownFile);
    renderManuscriptEpub(buildDir, manuscriptMarkdownFile);
    renderManuscriptDocX(buildDir, manuscriptMarkdownFile);
    // renderManuscriptPdf(buildDir, manuscriptMarkdownFile);
    renderAfterwordHtml(buildDir, afterwordMarkdownFile)

    console.log("Done.");
}

build().catch(error => {
    console.error(error);
    process.exit(1);
});
