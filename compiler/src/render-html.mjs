import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const exec = promisify(execFile);

export async function renderHtml(markdownFile, buildDirectory, novel) {

    const htmlFile = path.join(
        buildDirectory,
        novel + '.html'
    );
    console.log(`Rendering HTML to ${htmlFile}`);

    await exec("pandoc", [
        markdownFile,
        "--standalone",
        "--from=gfm",
        "--to=html5",
        "--output",
        htmlFile
    ]);
}