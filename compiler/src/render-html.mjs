import { mkdir } from "node:fs/promises";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execP = promisify(exec);

export async function renderHtml(buildDir, mdFile) {
    const command = `pandoc --resource-path=. --standalone --from=gfm --to=html5 --output=novel.html --embed-resources --standalone --verbose novel.md`;
    console.log(`Rendering HTML using command:\n${command}`);

    await execP(
        command,
        { cwd: buildDir }    
    );
}