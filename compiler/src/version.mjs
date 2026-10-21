import { execFileSync } from 'node:child_process';

export const buildTimestamp =
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


export const buildCommit =
  process.env.GITHUB_SHA?.slice(0, 7) ??
  execFileSync("git", ["rev-parse", "--short=7", "HEAD"], {
    encoding: "utf8",
  }).trim();
