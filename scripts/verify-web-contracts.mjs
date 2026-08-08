// scripts/verify-web-contracts.mjs

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const sourceRoot = join(root, 'src');
const requiredFiles = [
    '.env.development.example',
    '.env.staging.example',
    '.env.production.example',
    'vercel.json',
    'src/types/announcement.ts',
];
const forbiddenFiles = [
    'src/types/annoucement.ts',
    'src/services/socket.ts',
    'src/utils/choirKey.ts',
    'src/components/themes-old',
    'README.chat.md',
    'ROADMAP.chat.md',
];
const forbiddenPatterns = [
    { label: 'legacy choirKey selector', pattern: /\bchoirKey\b/u },
    { label: 'legacy withChoirKey helper', pattern: /\bwithChoirKey\b/u },
    { label: 'legacy default choir constant', pattern: /DEFAULT_CHOIR(?:_KEY|_CODE)?/u },
    { label: 'legacy replyToId payload', pattern: /\breplyToId\b/u },
    { label: 'global localStorage clear', pattern: /localStorage\.clear\s*\(/u },
    { label: 'global sessionStorage clear', pattern: /sessionStorage\.clear\s*\(/u },
    { label: 'legacy announcement type filename', pattern: /annoucement/u },
    { label: 'legacy Ero Cras branding', pattern: /Ero\s*Cras|EroCras|erocrasLogo/u },
];

const walk = (directory) => readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    return statSync(fullPath).isDirectory() ? walk(fullPath) : [fullPath];
});

const failures = [];

const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

if (packageJson.name !== 'choir-webapp') {
    failures.push('package.json: package name must be choir-webapp');
}

for (const requiredFile of requiredFiles) {
    try {
        statSync(join(root, requiredFile));
    } catch {
        failures.push(`Missing required file: ${requiredFile}`);
    }
}

for (const forbiddenFile of forbiddenFiles) {
    try {
        statSync(join(root, forbiddenFile));
        failures.push(`Legacy file must be removed: ${forbiddenFile}`);
    } catch {
        // Expected: the legacy file does not exist.
    }
}

for (const filePath of walk(sourceRoot)) {
    if (!/\.(?:ts|tsx)$/u.test(filePath)) {
        continue;
    }

    const contents = readFileSync(filePath, 'utf8');
    const displayPath = relative(root, filePath);

    for (const rule of forbiddenPatterns) {
        if (rule.pattern.test(contents)) {
            failures.push(`${displayPath}: ${rule.label}`);
        }
    }
}

const environmentExamples = [
    '.env.development.example',
    '.env.staging.example',
    '.env.production.example',
];

for (const environmentFile of environmentExamples) {
    const contents = readFileSync(join(root, environmentFile), 'utf8');

    if (!contents.includes('VITE_API_URL=')) {
        failures.push(`${environmentFile}: missing VITE_API_URL`);
    }

    if (!contents.includes('VITE_SOCKET_URL=')) {
        failures.push(`${environmentFile}: missing VITE_SOCKET_URL`);
    }
}

if (failures.length > 0) {
    failures.forEach((failure) => console.error(`FAIL ${failure}`));
    process.exitCode = 1;
} else {
    console.log('PASS Web multi-choir contract verification');
}
