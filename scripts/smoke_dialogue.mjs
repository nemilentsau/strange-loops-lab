const baseUrl = (process.argv[2] ?? process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:4173').replace(
	/\/$/,
	''
);
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS ?? 130000);

const payload = {
	userInput:
		'I think MU is unreachable because the number of I symbols never becomes divisible by 3, but I am not fully sure why doubling does not break that.',
	draft: {
		activeSurface: 'dialogue',
		dialogueMode: 'Explain-Back Examiner',
		dialogueInput:
			'I think MU is unreachable because the number of I symbols never becomes divisible by 3, but I am not fully sure why doubling does not break that.',
		lastDialogue: null,
		workingQuestion: 'Can MI become MU, and what would count as evidence either way?',
		invariantCandidate: 'count(I) mod 3 != 0',
		notes: 'Smoke test payload',
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
		graphDepth: 3,
		graphNodeLimit: 16,
		selectedGraphNode: null,
		visitedSurfaces: ['sandbox', 'trace', 'graph', 'invariants', 'dialogue', 'artifacts'],
		lastEditedAt: '2026-03-09T14:39:00.000Z'
	}
};

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), timeoutMs);
const startedAt = Date.now();

try {
	const response = await fetch(`${baseUrl}/api/modules/module-1/dialogue`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(payload),
		signal: controller.signal
	});

	const raw = await response.text();
	let json;

	try {
		json = JSON.parse(raw);
	} catch {
		throw new Error(`Route did not return JSON. Status ${response.status}. Body: ${raw.slice(0, 500)}`);
	}

	if (!response.ok) {
		throw new Error(
			`Dialogue smoke failed with status ${response.status}: ${json.error ?? raw.slice(0, 500)}`
		);
	}

	if (!json.dialogue || !Array.isArray(json.dialogue.messages) || json.dialogue.messages.length !== 2) {
		throw new Error('Dialogue smoke failed: expected exactly two agent messages.');
	}

	if (typeof json.dialogue.finalResponse !== 'string' || !json.dialogue.finalResponse.trim()) {
		throw new Error('Dialogue smoke failed: finalResponse was missing.');
	}

	if (!json.artifact || typeof json.artifact.id !== 'number') {
		throw new Error('Dialogue smoke failed: persisted artifact metadata was missing.');
	}

	const durationSeconds = ((Date.now() - startedAt) / 1000).toFixed(2);
	console.log(`Dialogue smoke passed in ${durationSeconds}s against ${baseUrl}`);
	console.log(`artifact_id=${json.artifact.id}`);
	console.log(`session_id=${json.dialogue.sessionId ?? 'none'}`);
	console.log(`agents=${json.dialogue.messages.map((message) => message.agent).join(',')}`);
	console.log(`title=${json.artifact.title}`);
} catch (error) {
	const message = error instanceof Error ? error.message : 'Dialogue smoke failed.';
	console.error(message);
	process.exitCode = 1;
} finally {
	clearTimeout(timeout);
}
