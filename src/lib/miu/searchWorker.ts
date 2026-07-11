/// <reference lib="webworker" />
import { shortestTheoremDerivation, type ShortestDerivation } from './complexity';

/**
 * Off-thread host for the K_steps search. One request per worker: the page
 * spawns a worker per query and terminates it to cancel, so no request ids
 * are needed. Progress messages carry the derivation lengths ruled out so
 * far (the completedDepth an exhaustion at that moment would report).
 */

export interface SearchRequest {
	target: string;
	maxDepth: number;
	maxNodes: number;
}

export type SearchResponse =
	| { kind: 'progress'; completedDepth: number }
	| { kind: 'result'; result: ShortestDerivation }
	| { kind: 'error'; message: string };

self.onmessage = (event: MessageEvent<SearchRequest>) => {
	const { target, maxDepth, maxNodes } = event.data;

	try {
		const result = shortestTheoremDerivation(target, {
			maxDepth,
			maxNodes,
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
