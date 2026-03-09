import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { afterEach, describe, expect, it } from 'vitest';

import { createPersistenceStore } from './persistence';

const tempDirs: string[] = [];

afterEach(() => {
	for (const directory of tempDirs.splice(0)) {
		rmSync(directory, { recursive: true, force: true });
	}
});

describe('sqlite persistence', () => {
	it('stores and reloads module snapshots', () => {
		const store = createStore();
		const payload = { notes: 'saved', trace: { steps: [{ value: 'MI', via: null }], currentIndex: 0 } };

		const saved = store.saveModuleSnapshot('module-1', payload);
		const loaded = store.getModuleSnapshot('module-1');

		expect(saved.updatedAt).toBeTruthy();
		expect(loaded?.payload).toEqual(payload);
		store.close();
	});

	it('stores artifacts in reverse chronological order', () => {
		const store = createStore();

		store.createArtifact('module-1', 'note', 'First', { notes: 'one' });
		store.createArtifact('module-1', 'trace', 'Second', { value: 'MIU' });

		const artifacts = store.listArtifacts('module-1');

		expect(artifacts).toHaveLength(2);
		expect(artifacts[0]?.title).toBe('Second');
		expect(artifacts[1]?.title).toBe('First');
		store.close();
	});
});

function createStore() {
	const directory = mkdtempSync(join(tmpdir(), 'strange-loops-db-'));
	tempDirs.push(directory);

	return createPersistenceStore(join(directory, 'test.db'));
}
