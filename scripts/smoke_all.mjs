import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const baseUrl = process.argv[2] ?? process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:4173';

const scripts = ['smoke_persistence.mjs', 'smoke_dialogue.mjs'];

for (const script of scripts) {
	await runScript(script, baseUrl);
}

console.log(`All smoke checks passed against ${baseUrl}`);

function runScript(script, targetBaseUrl) {
	return new Promise((resolvePromise, rejectPromise) => {
		const child = spawn(process.execPath, [resolve('scripts', script), targetBaseUrl], {
			stdio: 'inherit',
			env: process.env
		});

		child.on('error', rejectPromise);
		child.on('exit', (code) => {
			if (code === 0) {
				resolvePromise();
				return;
			}

			rejectPromise(new Error(`${script} failed with exit code ${code ?? 'unknown'}.`));
		});
	});
}
