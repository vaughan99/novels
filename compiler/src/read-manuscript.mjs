import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export async function readManuscript(directory) {
    console.log(`Reading manuscript from ${directory}`);

    const entries = await readdir(directory);

    const files = entries
        .filter(file => file.endsWith(".md"))
        .sort();

    let manuscript = "";

    for (const file of files) {

        const filename = path.join(directory, file);

        const contents = await readFile(filename, "utf8");

        manuscript += contents;
        manuscript += "\n\n";
    }

    return manuscript;
}