export type Grid = number[][];

export interface TaskExample {
	input: Grid;
	output: Grid;
}

export interface Task {
	id: string;
	examples: TaskExample[];
}
