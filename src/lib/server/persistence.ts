import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import Database from 'better-sqlite3';

export interface StoredSnapshot {
	moduleSlug: string;
	payload: unknown;
	updatedAt: string;
}

export interface StoredArtifact {
	id: number;
	moduleSlug: string;
	artifactType: string;
	title: string;
	payload: unknown;
	createdAt: string;
}

export interface PersistenceStore {
	getModuleSnapshot(moduleSlug: string): StoredSnapshot | null;
	saveModuleSnapshot(moduleSlug: string, payload: unknown): StoredSnapshot;
	listArtifacts(moduleSlug: string): StoredArtifact[];
	createArtifact(moduleSlug: string, artifactType: string, title: string, payload: unknown): StoredArtifact;
	close(): void;
}

interface SnapshotRow {
	module_slug: string;
	payload_json: string;
	updated_at: string;
}

interface ArtifactRow {
	id: number;
	module_slug: string;
	artifact_type: string;
	title: string;
	payload_json: string;
	created_at: string;
}

let defaultStore: PersistenceStore | null = null;

export function getPersistenceStore(): PersistenceStore {
	defaultStore ??= createPersistenceStore(process.env.STRANGE_LOOPS_DB_PATH ?? 'data/strange-loops.db');

	return defaultStore;
}

export function createPersistenceStore(filename: string): PersistenceStore {
	const dbPath = resolve(filename);
	mkdirSync(dirname(dbPath), { recursive: true });

	const db = new Database(dbPath);
	db.pragma('journal_mode = WAL');
	db.pragma('foreign_keys = ON');

	db.exec(`
		create table if not exists module_snapshots (
			module_slug text primary key,
			payload_json text not null,
			updated_at text not null
		);

		create table if not exists artifacts (
			id integer primary key autoincrement,
			module_slug text not null,
			artifact_type text not null,
			title text not null,
			payload_json text not null,
			created_at text not null
		);

		create index if not exists artifacts_module_slug_created_at_idx
		on artifacts (module_slug, created_at desc);
	`);

	const getSnapshotStatement = db.prepare(
		`select module_slug, payload_json, updated_at from module_snapshots where module_slug = ?`
	);
	const saveSnapshotStatement = db.prepare(`
		insert into module_snapshots (module_slug, payload_json, updated_at)
		values (@module_slug, @payload_json, @updated_at)
		on conflict(module_slug) do update set
			payload_json = excluded.payload_json,
			updated_at = excluded.updated_at
	`);
	const listArtifactsStatement = db.prepare(
		`select id, module_slug, artifact_type, title, payload_json, created_at
		 from artifacts
		 where module_slug = ?
		 order by created_at desc, id desc`
	);
	const insertArtifactStatement = db.prepare(`
		insert into artifacts (module_slug, artifact_type, title, payload_json, created_at)
		values (@module_slug, @artifact_type, @title, @payload_json, @created_at)
	`);

	return {
		getModuleSnapshot(moduleSlug) {
			const row = getSnapshotStatement.get(moduleSlug) as SnapshotRow | undefined;
			return row ? deserializeSnapshot(row) : null;
		},
		saveModuleSnapshot(moduleSlug, payload) {
			const updatedAt = new Date().toISOString();
			saveSnapshotStatement.run({
				module_slug: moduleSlug,
				payload_json: JSON.stringify(payload),
				updated_at: updatedAt
			});
			return {
				moduleSlug,
				payload,
				updatedAt
			};
		},
		listArtifacts(moduleSlug) {
			const rows = listArtifactsStatement.all(moduleSlug) as ArtifactRow[];
			return rows.map(deserializeArtifact);
		},
		createArtifact(moduleSlug, artifactType, title, payload) {
			const createdAt = new Date().toISOString();
			const result = insertArtifactStatement.run({
				module_slug: moduleSlug,
				artifact_type: artifactType,
				title,
				payload_json: JSON.stringify(payload),
				created_at: createdAt
			});

			return {
				id: Number(result.lastInsertRowid),
				moduleSlug,
				artifactType,
				title,
				payload,
				createdAt
			};
		},
		close() {
			db.close();
		}
	};
}

function deserializeSnapshot(row: SnapshotRow): StoredSnapshot {
	return {
		moduleSlug: row.module_slug,
		payload: JSON.parse(row.payload_json),
		updatedAt: row.updated_at
	};
}

function deserializeArtifact(row: ArtifactRow): StoredArtifact {
	return {
		id: row.id,
		moduleSlug: row.module_slug,
		artifactType: row.artifact_type,
		title: row.title,
		payload: JSON.parse(row.payload_json),
		createdAt: row.created_at
	};
}
