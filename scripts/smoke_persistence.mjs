const baseUrl = (process.argv[2] ?? process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:4173').replace(
	/\/$/,
	''
);
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? 30000);
const marker = `smoke-${Date.now()}`;

const draft = {
	activeSurface: 'artifacts',
	dialogueMode: 'Explain-Back Examiner',
	dialogueInput: '',
	lastDialogue: null,
	workingQuestion: `Persistence smoke ${marker}`,
	invariantCandidate: 'count(I) mod 3 != 0',
	notes: `Persistence smoke note ${marker}`,
	trace: {
		steps: [
			{ value: 'MI', via: null },
			{
				value: 'MII',
				via: {
					key: 'double-tail:1:2:MII',
					ruleId: 'double-tail',
					ruleLabel: 'Rule 2',
					source: 'MI',
					result: 'MII',
					start: 1,
					end: 2,
					detail: 'If the string has the form Mx, produce Mxx.'
				}
			}
		],
		currentIndex: 1
	},
	graphDepth: 2,
	graphNodeLimit: 12,
	selectedGraphNode: null,
	visitedSurfaces: ['sandbox', 'trace', 'artifacts'],
	lastEditedAt: new Date().toISOString()
};

const artifactRequest = {
	artifactType: 'note',
	title: `Persistence smoke artifact ${marker}`,
	payload: {
		marker,
		surface: 'artifacts',
		note: 'persistence smoke'
	}
};

async function requestJson(path, init) {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(`${baseUrl}${path}`, {
			...init,
			signal: controller.signal,
			headers: {
				'content-type': 'application/json',
				...(init?.headers ?? {})
			}
		});
		const raw = await response.text();
		let json;

		try {
			json = JSON.parse(raw);
		} catch {
			throw new Error(`Route ${path} did not return JSON. Status ${response.status}. Body: ${raw.slice(0, 500)}`);
		}

		if (!response.ok) {
			throw new Error(`Route ${path} failed with status ${response.status}: ${json.error ?? raw.slice(0, 500)}`);
		}

		return json;
	} finally {
		clearTimeout(timeout);
	}
}

try {
	const startedAt = Date.now();
	const savedSnapshot = await requestJson('/api/modules/module-1/snapshot', {
		method: 'PUT',
		body: JSON.stringify({ draft })
	});

	if (!savedSnapshot.snapshot || savedSnapshot.snapshot.moduleSlug !== 'module-1') {
		throw new Error('Snapshot smoke failed: PUT response did not include module-1 snapshot metadata.');
	}

	const loadedSnapshot = await requestJson('/api/modules/module-1/snapshot', { method: 'GET' });
	const loadedDraft = loadedSnapshot.snapshot?.payload;

	if (!loadedDraft || loadedDraft.workingQuestion !== draft.workingQuestion || loadedDraft.notes !== draft.notes) {
		throw new Error('Snapshot smoke failed: GET response did not round-trip the saved draft.');
	}

	const createdArtifact = await requestJson('/api/modules/module-1/artifacts', {
		method: 'POST',
		body: JSON.stringify(artifactRequest)
	});

	if (
		!createdArtifact.artifact ||
		createdArtifact.artifact.artifactType !== artifactRequest.artifactType ||
		createdArtifact.artifact.title !== artifactRequest.title
	) {
		throw new Error('Artifact smoke failed: POST response did not include the created artifact.');
	}

	const listedArtifacts = await requestJson('/api/modules/module-1/artifacts', { method: 'GET' });
	const match = Array.isArray(listedArtifacts.artifacts)
		? listedArtifacts.artifacts.find((artifact) => artifact.title === artifactRequest.title)
		: null;

	if (!match || match.payload?.marker !== marker) {
		throw new Error('Artifact smoke failed: GET response did not include the newly created artifact.');
	}

	const durationSeconds = ((Date.now() - startedAt) / 1000).toFixed(2);
	console.log(`Persistence smoke passed in ${durationSeconds}s against ${baseUrl}`);
	console.log(`snapshot_updated_at=${savedSnapshot.snapshot.updatedAt}`);
	console.log(`artifact_id=${createdArtifact.artifact.id}`);
	console.log(`artifact_title=${createdArtifact.artifact.title}`);
} catch (error) {
	const message = error instanceof Error ? error.message : 'Persistence smoke failed.';
	console.error(message);
	process.exitCode = 1;
}
