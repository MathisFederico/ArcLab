export type Matrix = number[][];

export interface TaskExample {
	id: string;
	input: Matrix;
	output: Matrix;
}

export interface Task {
	id: string;
	examples: TaskExample[];
}
