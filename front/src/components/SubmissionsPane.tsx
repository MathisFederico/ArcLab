import { useState } from "react";
import type { Grid } from "../types";
import Grid from "./Grid";

export interface Submission {
	id: string;
	input: Grid;
	output: Grid;
	predictedOutput: Grid;
	isCorrect: boolean;
}

interface SubmissionsPaneProps {
	submissions: Submission[];
	colorScheme: Record<number, string>;
}

function SubmissionsPane({ submissions, colorScheme }: SubmissionsPaneProps) {
	const [hoveredSubmission, setHoveredSubmission] = useState<string | null>(
		null,
	);

	return (
		<div className="h-full p-4 overflow-y-auto bg-[#181A1F]">
			<div className="mb-4">
				<h2 className="text-xl font-semibold mb-4">Submissions</h2>
				{submissions.length > 0 && (
					<p className="text-xs text-gray-400 mb-4">
						Hover over the output grid to see predicted output. Incorrect
						submissions are highlighted with a red border.
					</p>
				)}
				{submissions.map((submission, index) => (
					<div key={submission.id} className="flex space-x-4 mb-4">
						<div className="flex-1">
							<Grid
								grid={submission.input}
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
							onMouseEnter={() => setHoveredSubmission(submission.id)}
							onMouseLeave={() => setHoveredSubmission(null)}
						>
							<Grid
								grid={
									hoveredSubmission === submission.id
										? submission.predictedOutput
										: submission.output
								}
								colorScheme={colorScheme}
								title={
									hoveredSubmission === submission.id
										? `Ex.${index + 1} Predicted Output`
										: `Ex.${index + 1} Wanted Output`
								}
								showDimensions={true}
								className={
									!submission.isCorrect ? "border-2 border-red-500 rounded" : ""
								}
							/>
							{!submission.isCorrect && hoveredSubmission === submission.id && (
								<div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
									Incorrect
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
