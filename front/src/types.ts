export type Matrix = number[][];

export interface Puzzle {
	id: string;
	examples: {
		input: Matrix;
		expectedOutput: Matrix;
	}[];
}
