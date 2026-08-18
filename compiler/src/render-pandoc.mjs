import { mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const buildTimestamp =
  process.env.BUILD_TIMESTAMP ?? new Date().toISOString();

const buildCommit =
  process.env.GITHUB_SHA?.slice(0, 7) ?? "local";
  
export function renderHtml(buildDir, mdFile) {
    console.log('Rendering HTML');

    const result = spawnSync(
        "pandoc",
        [
            "novel.md",
            "--defaults=./pandoc/html5-defaults.yaml",
            `--metadata=build-timestamp:${buildTimestamp}`,
            `--metadata=build-commit:${buildCommit}`,
            "--output=novel.html",
        ],
        {
            stdio: "inherit",
            shell: false,
            cwd: buildDir
        },
    );

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
}

export function renderEpub(buildDir, mdFile) {
    console.log('Rendering EPUB');

     const result = spawnSync(
        "pandoc",
        [
            "novel.md",
            "--defaults=./pandoc/epub-defaults.yaml",
            `--metadata=build-timestamp:${buildTimestamp}`,
            `--metadata=build-commit:${buildCommit}`,
            "--output=novel.epub",
        ],
        {
            stdio: "inherit",
            shell: false,
            cwd: buildDir
        },
    );

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
}

export function renderDocX(buildDir, mdFile) {
    console.log('Rendering DocX');

     const result = spawnSync(
        "pandoc",
        [
            "novel.md",
            // Override the date with commit info
            "--defaults=./pandoc/docx-defaults.yaml",
            `--metadata=date:${buildTimestamp} · commit ${buildCommit}`,
            "-o",
            "novel.docx"
        ],
        {
            stdio: "inherit",
            shell: false,
            cwd: buildDir
        },
    );

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
}
