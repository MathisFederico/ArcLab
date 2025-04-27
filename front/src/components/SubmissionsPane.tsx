import { useState } from "react";
import type { Matrix, TaskExample } from "../types";
import Grid from "./Grid";

export interface Submission {
	exampleId: string;
	predictedOutput: Matrix;
	isCorrect: boolean;
}

interface SubmissionsPaneProps {
	examples: TaskExample[];
	submissions: Submission[];
	colorScheme: Record<number, string>;
}

function SubmissionsPane({
	examples,
	submissions,
	colorScheme,
}: SubmissionsPaneProps) {
	const [hoveredExampleId, setHoveredExampleId] = useState<string | null>(null);
	const hasSubmissions = submissions.length > 0;

	const submissionsByExampleId = submissions.reduce(
		(acc, submission) => {
			acc[submission.exampleId] = submission;
			return acc;
		},
		{} as Record<string, Submission>,
	);
	const examplesWithSubmissions = examples.map((example) => ({
		...example,
		...(submissionsByExampleId[example.id] ?? {}),
	}));

	return (
		<div className="h-full p-4 overflow-y-auto bg-[#181A1F]">
			<div className="mb-4">
				<h2 className="text-xl font-semibold mb-4">Submissions</h2>
				{examplesWithSubmissions.map((example, index) => (
					<div key={example.id} className="flex space-x-4 mb-4">
						<div className="flex-1">
							<Grid
								matrix={example.input}
								colorScheme={colorScheme}
								title={`Ex.${index + 1} Input`}
								showDimensions={true}
							/>
						</div>
						<div className="flex items-center justify-center">
							<span className="text-2xl">→</span>
						</div>
						<div
							className="flex-1 relative"
							onMouseEnter={() => setHoveredExampleId(example.id)}
							onMouseLeave={() => setHoveredExampleId(null)}
						>
							<Grid
								matrix={
									!hasSubmissions ||
									(hoveredExampleId === example.id && example.predictedOutput)
										? example.output
										: example.predictedOutput
								}
								colorScheme={colorScheme}
								title={
									!hasSubmissions || hoveredExampleId === example.id
										? `Ex.${index + 1} Expected Output`
										: `Ex.${index + 1} Predicted Output`
								}
								showDimensions={true}
								className={
									example.isCorrect === false
										? "border-2 border-red-500 rounded"
										: ""
								}
							/>
							{example.isCorrect === false && (
								<div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
									Incorrect
								</div>
							)}
							{example.isCorrect === true && (
								<div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
									Correct
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default SubmissionsPane;
