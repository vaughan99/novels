import { mkdir } from "node:fs/promises";
import { spawnSync, execFileSync } from "node:child_process";
import path from "node:path";

const buildTimestamp =
  process.env.BUILD_TIMESTAMP ?? 
  new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
    }
  );


const buildCommit =
  process.env.GITHUB_SHA?.slice(0, 7) ??
  execFileSync("git", ["rev-parse", "--short=7", "HEAD"], {
    encoding: "utf8",
  }).trim();

export function renderManuscriptHtml(buildDir, mdFile) {
    console.log('Rendering Manuscript HTML');

    const result = spawnSync(
        "pandoc",
        [
            "manuscript.md",
            "--defaults=./pandoc/html5-defaults.yaml",
            `--metadata=build-timestamp:${buildTimestamp}`,
            `--metadata=build-commit:${buildCommit}`,
            "--output=manuscript.html",
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

export function renderManuscriptEpub(buildDir, mdFile) {
    console.log('Rendering Manuscript EPUB');

     const result = spawnSync(
        "pandoc",
        [
            "manuscript.md",
            "--defaults=./pandoc/epub-defaults.yaml",
            `--metadata=build-timestamp:"${buildTimestamp}"`,
            `--metadata=build-commit:${buildCommit}`,
            "--output=manuscript.epub",
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

export function renderManuscriptDocX(buildDir, mdFile) {
    console.log('Rendering Manuscript DocX');

     const result = spawnSync(
        "pandoc",
        [
            "manuscript.md",
            // Override the date with commit info
            "--defaults=./pandoc/docx-defaults.yaml",
            `--metadata=date:${buildTimestamp} · commit ${buildCommit}`,
            "--output=manuscript.docx"
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

export function renderManuscriptPdf(buildDir, mdFile) {
    console.log('Rendering Manuscript PDF');
    try {
        const result = spawnSync(
            "pandoc",
            [
                "manuscript.md",
                "--defaults=./pandoc/pdf.yaml",
                `--metadata=build-timestamp:${buildTimestamp}`,
                `--metadata=build-commit:${buildCommit}`,
                "--output=manuscript.pdf",
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
    } catch (err) {
        console.error('Unable to generate PDF. Latex may not be installed.');
    }
}

export function renderAfterwordHtml(buildDir, mdFile) {
    console.log('Rendering Afterword HTML');

    const result = spawnSync(
        "pandoc",
        [
            "afterword.md",
            "--defaults=./pandoc/html5-defaults.yaml",
            `--metadata=build-timestamp:${buildTimestamp}`,
            `--metadata=build-commit:${buildCommit}`,
            "--output=afterword.html",
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
