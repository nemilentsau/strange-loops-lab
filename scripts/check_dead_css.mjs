// Fails when src/app.css defines a class selector no source file references.
// Mechanical enforcement of the repo-hygiene rule: dead styling left behind by
// a recomposition must be deleted in the same pass, not discovered later.
//
// A class counts as referenced when its full name appears anywhere in
// src/**/*.{svelte,ts} (excluding app.css itself), or — for modifier classes
// like `phase-canvas--object` — when its `base--` prefix appears, which covers
// template-built names such as `phase-canvas--{level}`.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const srcRoot = new URL('../src', import.meta.url).pathname;
const cssPath = join(srcRoot, 'app.css');

function sourceFiles(dir) {
	const files = [];
	for (const entry of readdirSync(dir)) {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) {
			files.push(...sourceFiles(path));
		} else if ((path.endsWith('.svelte') || path.endsWith('.ts')) && path !== cssPath) {
			files.push(path);
		}
	}
	return files;
}

const css = readFileSync(cssPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const classes = new Set();
for (const match of css.matchAll(/\.([a-z][a-z0-9_-]*)/g)) {
	classes.add(match[1]);
}

const source = sourceFiles(srcRoot)
	.map((path) => readFileSync(path, 'utf8'))
	.join('\n');

const dead = [...classes]
	.filter((name) => {
		if (source.includes(name)) {
			return false;
		}
		const modifier = name.indexOf('--');
		return modifier === -1 || !source.includes(name.slice(0, modifier + 2));
	})
	.sort();

if (dead.length > 0) {
	console.error(`Dead CSS: ${dead.length} class(es) defined in src/app.css but referenced nowhere in src/:`);
	for (const name of dead) {
		console.error(`  .${name}`);
	}
	console.error('Delete the rules (and any comment that mentions them) or wire the class up.');
	process.exit(1);
}

console.log(`Dead CSS check passed: all ${classes.size} classes in src/app.css are referenced.`);
