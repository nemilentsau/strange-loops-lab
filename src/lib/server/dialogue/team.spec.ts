import { describe, expect, it, vi } from 'vitest';

import { buildDialoguePrompt, parseDialogueEnvelope, runModule1Dialogue } from './team';
import { createModule1Draft } from '$lib/state/module1';

describe('dialogue team runner', () => {
	it('builds a module-aware prompt', () => {
		const draft = createModule1Draft();
		const prompt = buildDialoguePrompt(draft, 'I think MU is unreachable because I cannot find it.');

		expect(prompt).toContain('mode: Explain-Back Examiner');
		expect(prompt).toContain('current_string: MI');
		expect(prompt).toContain('Learner input');
	});

	it('parses structured Claude output', () => {
		const parsed = parseDialogueEnvelope(
			JSON.stringify({
				is_error: false,
				session_id: 'abc',
				total_cost_usd: 0.12,
				structured_output: {
					messages: [
						{ agent: 'examiner', content: 'Be more precise about what is preserved.' },
						{ agent: 'proof_coach', content: 'You need the invariant-to-target bridge.' }
					],
					final_response: 'State the invariant, then connect it to MU having zero I symbols.'
				}
			})
		);

		expect(parsed.sessionId).toBe('abc');
		expect(parsed.messages).toHaveLength(2);
		expect(parsed.finalResponse).toContain('invariant');
	});

	it('rejects malformed structured output', () => {
		expect(() =>
			parseDialogueEnvelope(
				JSON.stringify({
					is_error: false,
					structured_output: { messages: [{ agent: 'examiner', content: 'Only one' }], final_response: 'x' }
				})
			)
		).toThrow(/both agent turns/);
	});

	it('invokes claude with structured output and custom agents', async () => {
		const runner = vi.fn().mockResolvedValue({
			stdout: JSON.stringify({
				is_error: false,
				structured_output: {
					messages: [
						{ agent: 'examiner', content: 'Examiner turn' },
						{ agent: 'proof_coach', content: 'Coach turn' }
					],
					final_response: 'Final response'
				}
			}),
			stderr: ''
		});

		const result = await runModule1Dialogue(
			{
				userInput: 'Help me explain why MU is unreachable.',
				draft: createModule1Draft()
			},
			runner
		);

		expect(runner).toHaveBeenCalledOnce();
		const [file, args, options] = runner.mock.calls[0]!;
		expect(file).toBe('python3');
		expect(args[0]).toContain('scripts/run_claude_dialogue.py');
		expect(options.env.DIALOGUE_AGENTS).toContain('examiner');
		expect(options.env.DIALOGUE_JSON_SCHEMA).toContain('final_response');
		expect(result.finalResponse).toBe('Final response');
	});
});
