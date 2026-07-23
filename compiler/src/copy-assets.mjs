import { mkdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const exec = promisify(execFile);

export async function copyAssets(novel, buildDir) {

    const assetDir = path.join(
        novel,
        'assets'
    );
    console.log(`Copying assets to ${buildDir}`);

    await exec("cp", [
        "-r",
        assetDir,
        buildDir
    ]);
}