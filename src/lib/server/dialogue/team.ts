import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import type { DialogueResult } from '$lib/dialogue/types';
import { builtInInvariantAnalysis } from '$lib/miu/invariants';
import { normalizeModule1Draft, type Module1Draft } from '$lib/state/module1';

const execFileAsync = promisify(execFile);

const DIALOGUE_JSON_SCHEMA = JSON.stringify({
	type: 'object',
	properties: {
		messages: {
			type: 'array',
			items: {
				type: 'object',
				properties: {
					agent: { type: 'string', enum: ['examiner', 'proof_coach'] },
					content: { type: 'string' }
				},
				required: ['agent', 'content'],
				additionalProperties: false
			},
			minItems: 2,
			maxItems: 2
		},
		final_response: { type: 'string' }
	},
	required: ['messages', 'final_response'],
	additionalProperties: false
});

const CUSTOM_AGENTS = JSON.stringify({
	examiner: {
		description: 'Module-aware explain-back examiner',
		prompt:
			'You are the Explain-Back Examiner for Strange Loops Module 1. Push on vague explanations, ask for exact distinctions, and keep the focus on MIU, reachability, invariants, and the object-level versus meta-level split. Never claim formal verification. Keep your response under 180 words.'
	},
	proof_coach: {
		description: 'Reasoning-structure coach',
		prompt:
			'You are the Proof Coach for Strange Loops Module 1. Identify the single most important missing premise, unsupported leap, or object-level/meta-level confusion in the learner response. Be precise, not theatrical. Never certify correctness unless the provided verifier facts justify it. Keep your response under 180 words.'
	}
});

const LEAD_SYSTEM_PROMPT =
	'You coordinate a Strange Loops tutoring dialogue. Use the available subagents, stay within the provided module context, and never present coaching as proof. Return only structured output that satisfies the provided JSON schema.';

interface ClaudeJsonEnvelope {
	subtype?: string;
	is_error?: boolean;
	result?: string;
	session_id?: string;
	sessionId?: string;
	total_cost_usd?: number;
	structured_output?: {
		messages?: Array<{ agent?: string; content?: string }>;
		final_response?: string;
	};
}

type ExecRunner = (
	file: string,
	args: string[],
	options: { cwd: string; env: NodeJS.ProcessEnv; maxBuffer: number; timeout: number }
) => Promise<{ stdout: string; stderr: string }>;

export async function runModule1Dialogue(
	input: { userInput: string; draft: unknown },
	runner: ExecRunner = execFileAsync
): Promise<DialogueResult> {
	const draft = normalizeModule1Draft(input.draft);
	const userInput = input.userInput.trim();

	if (!userInput) {
		throw new Error('Dialogue input is required.');
	}

	const prompt = buildDialoguePrompt(draft, userInput);
	const args = [
		'-p',
		'--output-format',
		'json',
		'--permission-mode',
		'bypassPermissions',
		'--effort',
		process.env.CLAUDE_DIALOGUE_EFFORT ?? 'low',
		'--model',
		process.env.CLAUDE_DIALOGUE_MODEL ?? 'sonnet',
		'--append-system-prompt',
		LEAD_SYSTEM_PROMPT,
		'--agents',
		CUSTOM_AGENTS,
		'--json-schema',
		DIALOGUE_JSON_SCHEMA,
		prompt
	];

	const { stdout } = await runner(process.env.CLAUDE_CLI_PATH ?? 'claude', args, {
		cwd: process.cwd(),
		env: {
			...process.env,
			CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: '1'
		},
		maxBuffer: 1024 * 1024 * 4,
		timeout: Number(process.env.CLAUDE_DIALOGUE_TIMEOUT_MS ?? 120000)
	});

	return parseDialogueEnvelope(stdout);
}

export function buildDialoguePrompt(draft: Module1Draft, userInput: string): string {
	const currentStep = draft.trace.steps[draft.trace.currentIndex] ?? draft.trace.steps[0];
	const currentString = currentStep?.value ?? 'MI';
	const traceValues = draft.trace.steps.map((step) => step.value).join(' -> ');
	const invariant = builtInInvariantAnalysis(currentString);

	return `Run a Strange Loops Module 1 tutoring dialogue.

Consult exactly these two agents once each:
1. examiner
2. proof_coach

After consulting them, return a final response for the learner that:
- synthesizes the strongest points
- stays concise
- remains explicitly in coaching mode
- does not claim mechanical proof unless it is directly grounded in the provided verifier facts

Module context:
- Module: Formal Systems & Their Walls
- Dialogue mode selected by user: ${draft.dialogueMode}
- Active surface: ${draft.activeSurface}
- Current MIU string: ${currentString}
- Current derivation trace: ${traceValues}
- Reachability bounds: depth ${draft.graphDepth}, node limit ${draft.graphNodeLimit}
- Candidate invariant: ${draft.invariantCandidate}
- Built-in invariant status: ${invariant.preserved ? 'preserved' : 'not preserved'}
- Built-in invariant consequence: ${invariant.consequence ?? 'none'}
- User notes: ${draft.notes || '(none)'}

Learner message:
${userInput}

Response requirements:
- messages[0] must be the examiner turn
- messages[1] must be the proof_coach turn
- final_response should address the learner directly
- keep each agent turn and the final response concise and high signal`;
}

export function parseDialogueEnvelope(stdout: string): DialogueResult {
	let envelope: ClaudeJsonEnvelope;

	try {
		envelope = JSON.parse(stdout) as ClaudeJsonEnvelope;
	} catch {
		throw new Error('Claude dialogue output was not valid JSON.');
	}

	if (envelope.is_error) {
		throw new Error(envelope.result || 'Claude dialogue run failed.');
	}

	const structured = envelope.structured_output;

	if (!structured || !Array.isArray(structured.messages) || typeof structured.final_response !== 'string') {
		throw new Error('Claude dialogue output did not include the expected structured payload.');
	}

	const messages = structured.messages
		.filter((message): message is { agent: 'examiner' | 'proof_coach'; content: string } => {
			return (
				(message.agent === 'examiner' || message.agent === 'proof_coach') &&
				typeof message.content === 'string'
			);
		})
		.slice(0, 2);

	if (messages.length !== 2) {
		throw new Error('Claude dialogue output did not include both agent turns.');
	}

	return {
		messages,
		finalResponse: structured.final_response,
		sessionId: envelope.session_id ?? envelope.sessionId ?? null,
		costUsd: typeof envelope.total_cost_usd === 'number' ? envelope.total_cost_usd : null
	};
}
