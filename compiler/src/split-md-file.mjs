import { readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Split a Markdown file into approximately equal parts without splitting
 * across H2 (`##`) section boundaries.
 *
 * Output files retain the source filename root and extension and are written
 * to the source file's directory.
 *
 * Example:
 *   /books/novel.md
 *
 * becomes:
 *   /books/novel1.md
 *   /books/novel2.md
 *   /books/novel3.md
 *
 * @param {string} inputFile Path to the source Markdown file.
 * @param {number} numberOfParts Number of output files to create.
 * @returns {Promise<string[]>} Paths of the files created.
 */
export async function splitMarkdownFile(inputFile, numberOfParts) {
    if (typeof inputFile !== "string" || inputFile.trim() === "") {
        throw new TypeError("inputFile must be a nonempty string.");
    }

    if (!Number.isSafeInteger(numberOfParts) || numberOfParts < 1) {
        throw new TypeError("numberOfParts must be a positive integer.");
    }

    // npm executes scripts from the package root. INIT_CWD contains the
    // directory from which `npm run` was originally invoked.
    const invocationDirectory = process.env.INIT_CWD ?? process.cwd();
    const sourcePath = resolve(invocationDirectory, inputFile);

    const contents = await readFile(sourcePath, "utf8");

    if (contents.length === 0) {
        throw new RangeError("Cannot split an empty file.");
    }

    const newline = contents.includes("\r\n") ? "\r\n" : "\n";
    const hadFinalNewline = /\r?\n$/.test(contents);
    const lines = contents.replace(/\r?\n$/, "").split(/\r?\n/);

    /*
     * Build sections at H2 boundaries.
     *
     * Matches:
     *   ## Heading
     *   ##    Heading
     *
     * Does not match:
     *   # H1
     *   ### H3
     *   text ## inline
     */
    const sections = [];
    let currentSection = [];

    for (const line of lines) {
        const isH2Heading = /^##(?:\s+|$)/.test(line);

        if (isH2Heading && currentSection.length > 0) {
            sections.push(currentSection);
            currentSection = [];
        }

        currentSection.push(line);
    }

    if (currentSection.length > 0) {
        sections.push(currentSection);
    }

    if (sections.length < numberOfParts) {
        throw new RangeError(
            `Cannot create ${numberOfParts} nonempty files from ` +
            `${sections.length} H2-bounded sections.`
        );
    }

    const totalLines = sections.reduce(
        (sum, section) => sum + section.length,
        0
    );

    /*
     * Greedily assign consecutive sections to each output file.
     *
     * The target is recalculated after every file so that unusually large
     * sections do not badly distort all remaining files.
     */
    const parts = [];
    let sectionIndex = 0;
    let remainingLines = totalLines;

    for (let partIndex = 0; partIndex < numberOfParts; partIndex += 1) {
        const remainingParts = numberOfParts - partIndex;
        const remainingSections = sections.length - sectionIndex;
        const targetLines = remainingLines / remainingParts;

        const partSections = [];
        let partLineCount = 0;

        while (sectionIndex < sections.length) {
            const section = sections[sectionIndex];
            const sectionsAfterAdding =
                sections.length - (sectionIndex + 1);

            // Leave at least one whole section for every remaining part.
            if (sectionsAfterAdding < remainingParts - 1) {
                break;
            }

            if (partSections.length === 0) {
                partSections.push(section);
                partLineCount += section.length;
                sectionIndex += 1;
                continue;
            }

            const currentDifference = Math.abs(
                targetLines - partLineCount
            );

            const differenceAfterAdding = Math.abs(
                targetLines - (partLineCount + section.length)
            );

            if (differenceAfterAdding > currentDifference) {
                break;
            }

            partSections.push(section);
            partLineCount += section.length;
            sectionIndex += 1;
        }

        parts.push(partSections);
        remainingLines -= partLineCount;
    }

    const directory = dirname(sourcePath);
    const extension = extname(sourcePath);
    const filenameRoot = basename(sourcePath, extension);
    const outputFiles = [];

    for (let index = 0; index < parts.length; index += 1) {
        const outputPath = join(
            directory,
            `${filenameRoot}${index + 1}${extension}`
        );

        const outputLines = parts[index].flat();
        let outputContents = outputLines.join(newline);

        if (hadFinalNewline) {
            outputContents += newline;
        }

        await writeFile(outputPath, outputContents, "utf8");
        outputFiles.push(outputPath);
    }

    return outputFiles;
}

const [inputFile, partsArgument] = process.argv.slice(2);

if (!inputFile || !partsArgument) {
    console.error(
        "Usage: npm run split -- <filename> <number-of-parts>"
    );
    process.exit(1);
}

const numberOfParts = Number(partsArgument);

try {
    const outputFiles = await splitMarkdownFile(inputFile, numberOfParts);

    console.log(`Created ${outputFiles.length} files:`);

    for (const outputFile of outputFiles) {
        console.log(`- ${outputFile}`);
    }
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
}