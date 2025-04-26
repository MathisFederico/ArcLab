import { MOCK_DATABASE } from "./mocks";
import type { Puzzle } from "./types";

export const getPuzzleForId = async (id: string): Promise<Puzzle> => {
	await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay
	return MOCK_DATABASE[id];
};

export const getPuzzles = async (): Promise<{ id: string }[]> => {
	await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay
	return Object.values(MOCK_DATABASE).map((puzzle) => ({
		id: puzzle.id,
	}));
};
