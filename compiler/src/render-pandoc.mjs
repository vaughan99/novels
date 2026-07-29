import { mkdir } from "node:fs/promises";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execP = promisify(exec);

export async function renderHtml(buildDir, mdFile) {
    const command = `pandoc --defaults pandoc/html5-defaults.yaml --output=novel.html novel.md`;
    console.log(`Rendering HTML using command:\n${command}`);

    await execP(
        command,
        { cwd: buildDir }    
    );
}

export async function renderEpub(buildDir, mdFile) {
    const command = `pandoc --defaults pandoc/epub-defaults.yaml --output=novel.epub novel.md`;
    console.log(`Rendering EPUB using command:\n${command}`);

    await execP(
        command,
        { cwd: buildDir }    
    );
}
