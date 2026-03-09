export type DialogueAgentName = 'examiner' | 'proof_coach';

export interface DialogueAgentTurn {
	agent: DialogueAgentName;
	content: string;
}

export interface DialogueResult {
	messages: DialogueAgentTurn[];
	finalResponse: string;
	sessionId: string | null;
	costUsd: number | null;
}
