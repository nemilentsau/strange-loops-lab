/// <reference lib="webworker" />
import { shortestBitProgram, type BitProgramResult } from './bitComplexity';
import { shortestTheoremDerivation, type ShortestDerivation } from './complexity';

/**
 * Off-thread host for the K_steps and K_bits searches. One request per worker: the page
 * spawns a worker per query and terminates it to cancel, so no request ids
 * are needed. Progress messages carry the derivation lengths ruled out so
 * far (the completedDepth an exhaustion at that moment would report).
 */

export type SearchRequest =
	| { kind: 'steps'; target: string; maxDepth: number; maxNodes: number }
	| { kind: 'bits'; target: string; maxNodes: number };

export type SearchResponse =
	| { kind: 'progress'; completedDepth: number }
	| { kind: 'result'; result: ShortestDerivation }
	| { kind: 'bits-result'; result: BitProgramResult }
	| { kind: 'error'; message: string };

self.onmessage = (event: MessageEvent<SearchRequest>) => {
	const request = event.data;

	try {
		if (request.kind === 'bits') {
			const result = shortestBitProgram(request.target, { maxNodes: request.maxNodes });
			self.postMessage({ kind: 'bits-result', result } satisfies SearchResponse);
			return;
		}

		const result = shortestTheoremDerivation(request.target, {
			maxDepth: request.maxDepth,
			maxNodes: request.maxNodes,
			onLayerComplete: (completedDepth) => {
				self.postMessage({ kind: 'progress', completedDepth } satisfies SearchResponse);
			}
		});
		self.postMessage({ kind: 'result', result } satisfies SearchResponse);
	} catch (error) {
		self.postMessage({
			kind: 'error',
			message: error instanceof Error ? error.message : String(error)
		} satisfies SearchResponse);
	}
};
