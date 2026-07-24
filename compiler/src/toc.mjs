import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import GithubSlugger from 'github-slugger';

const TOC_START = '<!-- TOC START -->';
const TOC_END = '<!-- TOC END -->';

function escapeMarkdownLabel(value) {
  return value
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Replace Markdown links with labels
    .replace(/[*_~`]/g, '')             // Remove basic formatting
    .replace(/<[^>]+>/g, '')            // Remove HTML tags
    .trim();
}

export function generateTOC(markdown, { minLevel = 2, maxLevel = 4 } = {}) {
  const slugger = new GithubSlugger();
  const headings = [];

  let insideCodeBlock = false;

  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      insideCodeBlock = !insideCodeBlock;
      continue;
    }

    if (insideCodeBlock) {
      continue;
    }

    const match = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);

    if (!match) {
      continue;
    }

    const level = match[1].length;
    const label = escapeMarkdownLabel(match[2]);

    if (!label) {
      continue;
    }

    // Generate slugs for every heading so duplicate handling remains correct,
    // even when a heading is outside the displayed TOC range.
    const slug = slugger.slug(label);

    if (level >= minLevel && level <= maxLevel) {
      headings.push({
        level,
        label,
        slug,
      });
    }
  }

  if (headings.length === 0) {
    return '_No sections found._';
  }

  const baseLevel = Math.min(...headings.map(heading => heading.level));

  return headings
    .map(({ level, label, slug }) => {
      const indentation = '  '.repeat(level - baseLevel);
      return `${indentation}- [${label}](#${slug})`;
    })
    .join('\n');
}

export function insertTOC(markdown, toc) {
  const tocBlock = `${TOC_START}

## Table of Contents

${toc}

${TOC_END}`;

  const startIndex = markdown.indexOf(TOC_START);
  const endIndex = markdown.indexOf(TOC_END);

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    const before = markdown.slice(0, startIndex).trimEnd();
    const after = markdown
      .slice(endIndex + TOC_END.length)
      .trimStart();

    return `${before}

${tocBlock}

${after}`;
  }

  // Insert after the first H1, if one exists.
  const lines = markdown.split(/\r?\n/);
  const firstHeadingIndex = lines.findIndex(line => /^#\s+/.test(line));

  if (firstHeadingIndex !== -1) {
    lines.splice(firstHeadingIndex + 1, 0, '', tocBlock, '');
    return lines.join('\n');
  }

  return `${tocBlock}

${markdown}`;
}


const BACK_TO_TOC = '[↑ Back to Table of Contents](#table-of-contents)';

export function addBackToTOCLinks(markdown, { headingLevel = 2 } = {}) {
  const lines = markdown.split(/\r?\n/);
  const output = [];

  let insideCodeBlock = false;

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      insideCodeBlock = !insideCodeBlock;
      output.push(line);
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);

    const isTargetHeading =
      !insideCodeBlock &&
      headingMatch &&
      headingMatch[1].length === headingLevel;

    const isTocHeading =
      isTargetHeading &&
      headingMatch[2].trim().toLowerCase() === 'table of contents';

    if (isTargetHeading && !isTocHeading) {
      const previousMeaningfulLine = [...output]
        .reverse()
        .find(existingLine => existingLine.trim() !== '');

      if (previousMeaningfulLine !== BACK_TO_TOC) {
        if (output.length && output.at(-1).trim() !== '') {
          output.push('');
        }

        output.push(BACK_TO_TOC, '');
      }
    }

    output.push(line);
  }

  return output.join('\n');
}