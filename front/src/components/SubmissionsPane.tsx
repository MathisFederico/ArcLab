import type { Matrix } from "../types";
import Grid from "./Grid";

interface Submission {
	id: string;
	input: Matrix;
	expectedOutput: Matrix;
	predictedOutput: Matrix;
	isCorrect: boolean;
}

interface SubmissionsPaneProps {
	submissions: Submission[];
	colorScheme: Record<number, string>;
}

function SubmissionsPane({ submissions, colorScheme }: SubmissionsPaneProps) {
	return (
		<div className="h-full p-4 overflow-y-auto bg-[#181A1F]">
			<div className="mb-4">
				<h2 className="text-xl font-semibold mb-4">Submissions</h2>
				{submissions.map((submission, index) => (
					<div key={submission.id} className="flex space-x-4 mb-4">
						<div className="flex-1">
							<Grid
								matrix={submission.input}
								colorScheme={colorScheme}
								title={`Ex.${index + 1} Input`}
								showDimensions={true}
							/>
						</div>
						<div className="flex items-center justify-center">
							<span className="text-2xl">→</span>
						</div>
						<div className="flex-1">
							<Grid
								matrix={submission.expectedOutput}
								colorScheme={colorScheme}
								title={`Ex.${index + 1} Output`}
								showDimensions={true}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default SubmissionsPane;
