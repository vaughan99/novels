import { mkdir } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import path from "node:path";


export async function renderManuscriptMarkdown(manuscript, buildDir) {
    const mdFile = path.join(
        buildDir,
        'manuscript.md'
    );

    console.log(`Rendering manuscript MD to ${mdFile}`);
    await writeFile(mdFile, manuscript, "utf8");

    return mdFile;
}

export async function renderAfterwordMarkdown(afterword, buildDir) {
    const mdFile = path.join(
        buildDir,
        'afterword.md'
    );

    console.log(`Rendering afterword MD to ${mdFile}`);
    await writeFile(mdFile, afterword, "utf8");

    return mdFile;
}
