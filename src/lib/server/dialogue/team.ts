import { execFile } from 'node:child_process';
import { resolve } from 'node:path';
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
	const { stdout, stderr } = await runner('python3', [resolve('scripts/run_claude_dialogue.py')], {
		cwd: process.cwd(),
		env: {
			...process.env,
			CLAUDE_CLI_PATH: process.env.CLAUDE_CLI_PATH ?? 'claude',
			CLAUDE_DIALOGUE_EFFORT: process.env.CLAUDE_DIALOGUE_EFFORT ?? 'low',
			CLAUDE_DIALOGUE_MODEL: process.env.CLAUDE_DIALOGUE_MODEL ?? 'sonnet',
			DIALOGUE_SYSTEM_PROMPT: LEAD_SYSTEM_PROMPT,
			DIALOGUE_AGENTS: CUSTOM_AGENTS,
			DIALOGUE_JSON_SCHEMA: DIALOGUE_JSON_SCHEMA,
			DIALOGUE_PROMPT: prompt
		},
		maxBuffer: 1024 * 1024 * 4,
		timeout: Number(process.env.CLAUDE_DIALOGUE_TIMEOUT_MS ?? 120000)
	});

	if (!stdout.trim() && stderr.trim()) {
		throw new Error(stderr);
	}

	return parseDialogueEnvelope(stdout);
}

export function buildDialoguePrompt(draft: Module1Draft, userInput: string): string {
	const currentStep = draft.trace.steps[draft.trace.currentIndex] ?? draft.trace.steps[0];
	const currentString = currentStep?.value ?? 'MI';
	const traceValues = draft.trace.steps.map((step) => step.value).join(' -> ');
	const invariant = builtInInvariantAnalysis(currentString);

	return `Use the custom agents exactly once each, in this order:
1. examiner
2. proof_coach

Ask examiner for one concise probing question or critique.
Ask proof_coach for one concise missing premise, missing distinction, or unsupported leap.

After both agent replies return, produce final_response for the learner.

Constraints:
- Stay in coaching mode only.
- Do not claim formal proof unless directly grounded in the provided verifier facts.
- Keep every message concise.
- messages[0] must be examiner.
- messages[1] must be proof_coach.

Context:
- module: Formal Systems & Their Walls
- mode: ${draft.dialogueMode}
- active_surface: ${draft.activeSurface}
- current_string: ${currentString}
- trace: ${traceValues}
- invariant_candidate: ${draft.invariantCandidate}
- built_in_invariant: ${invariant.consequence ?? 'none'}
- user_notes: ${draft.notes || '(none)'}

Learner input:
${userInput}`;
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
