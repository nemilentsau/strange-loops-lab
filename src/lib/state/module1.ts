export const MODULE1_STORAGE_KEY = 'strange-loops/module-1/v1';

export const SURFACE_SEQUENCE = [
	'sandbox',
	'trace',
	'graph',
	'invariants',
	'dialogue',
	'artifacts'
] as const;

export type SurfaceId = (typeof SURFACE_SEQUENCE)[number];
export type DialogueMode = 'Explain-Back Examiner' | 'Socratic Partner';

export interface Module1Draft {
	activeSurface: SurfaceId;
	dialogueMode: DialogueMode;
	workingQuestion: string;
	invariantCandidate: string;
	notes: string;
	visitedSurfaces: SurfaceId[];
	lastEditedAt: string | null;
}

const DIALOGUE_MODES: DialogueMode[] = ['Explain-Back Examiner', 'Socratic Partner'];

export function createModule1Draft(): Module1Draft {
	return {
		activeSurface: 'sandbox',
		dialogueMode: 'Explain-Back Examiner',
		workingQuestion: 'Can MI become MU, and what would count as evidence either way?',
		invariantCandidate: 'count(I) mod 3',
		notes: '',
		visitedSurfaces: ['sandbox'],
		lastEditedAt: null
	};
}

export function normalizeModule1Draft(input: unknown): Module1Draft {
	const fallback = createModule1Draft();

	if (!input || typeof input !== 'object') {
		return fallback;
	}

	const candidate = input as Partial<Module1Draft>;

	return {
		activeSurface: isSurfaceId(candidate.activeSurface) ? candidate.activeSurface : fallback.activeSurface,
		dialogueMode: isDialogueMode(candidate.dialogueMode)
			? candidate.dialogueMode
			: fallback.dialogueMode,
		workingQuestion:
			typeof candidate.workingQuestion === 'string'
				? candidate.workingQuestion
				: fallback.workingQuestion,
		invariantCandidate:
			typeof candidate.invariantCandidate === 'string'
				? candidate.invariantCandidate
				: fallback.invariantCandidate,
		notes: typeof candidate.notes === 'string' ? candidate.notes : fallback.notes,
		visitedSurfaces: normalizeVisitedSurfaces(candidate.visitedSurfaces),
		lastEditedAt: typeof candidate.lastEditedAt === 'string' ? candidate.lastEditedAt : null
	};
}

export function readModule1Draft(storage?: Pick<Storage, 'getItem'>): Module1Draft {
	if (!storage) {
		return createModule1Draft();
	}

	const raw = storage.getItem(MODULE1_STORAGE_KEY);

	if (!raw) {
		return createModule1Draft();
	}

	try {
		return normalizeModule1Draft(JSON.parse(raw));
	} catch {
		return createModule1Draft();
	}
}

export function writeModule1Draft(
	storage: Pick<Storage, 'setItem'> | undefined,
	draft: Module1Draft
): void {
	if (!storage) {
		return;
	}

	storage.setItem(MODULE1_STORAGE_KEY, JSON.stringify(draft));
}

function isSurfaceId(value: unknown): value is SurfaceId {
	return typeof value === 'string' && SURFACE_SEQUENCE.includes(value as SurfaceId);
}

function isDialogueMode(value: unknown): value is DialogueMode {
	return typeof value === 'string' && DIALOGUE_MODES.includes(value as DialogueMode);
}

function normalizeVisitedSurfaces(input: unknown): SurfaceId[] {
	if (!Array.isArray(input)) {
		return ['sandbox'];
	}

	const unique = input.filter(isSurfaceId).filter((value, index, values) => values.indexOf(value) === index);

	return unique.length > 0 ? unique : ['sandbox'];
}
