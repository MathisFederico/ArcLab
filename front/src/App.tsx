import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import CodePane from "./components/CodePane";
import Navbar from "./components/Navbar";
import SubmissionsPane, { type Submission } from "./components/SubmissionsPane";
import { useTask, useTasks } from "./hooks";
import { useRunPython } from "./interpreter";
import type { Matrix } from "./types";

const DEFAULT_CODE = `from typing import TypeAlias

Grid: TypeAlias = list[list[int]]

def solve(input_grid: Grid) -> Grid:
  return input_grid
`;

const GRID_COLORS = {
	0: "#000000",
	1: "#1e93ff",
	2: "#f93c31",
	3: "#4fcc30",
	4: "#ffdc00",
	5: "#999999",
	6: "#e53aa3",
	7: "#ff851b",
	8: "#87d8f1",
	9: "#921231",
};

function App() {
	const [code, setCode] = useState(DEFAULT_CODE);
	const [codeOutput, setCodeOutput] = useState("");
	const [submissions, setSubmissions] = useState<Submission[]>([]);

	const listTasksQuery = useTasks();
	const [taskId, setTaskId] = useState<string | null>(null);
	const selectedTaskId = taskId ?? listTasksQuery.data?.[0]?.id ?? "";

	const taskQuery = useTask(selectedTaskId);
	const canRunCode = taskQuery.data && taskQuery.data.examples.length > 0;
	const runPythonMutation = useRunPython();

	function handleTaskChange(taskId: string) {
		setSubmissions([]);
		setCodeOutput("");
		setTaskId(taskId);
	}

	async function runCode() {
		if (!canRunCode) {
			return;
		}

		const inputs = taskQuery.data?.examples.map((example) => example.input);
		const expected_outputs = taskQuery.data?.examples.map(
			(example) => example.output,
		);
		console.log(JSON.stringify(expected_outputs?.[0]));
		const codeToRun = `
import json
import traceback

${code}

inputs = ${JSON.stringify(inputs)}
expected_outputs = ${JSON.stringify(expected_outputs)}
predictions = []

for i, input in enumerate(inputs):
  print("-" * 10 + f" Running Example {i+1} " + "-" * 10)
  pred = None
  try:
    pred = solve(input)
    predictions.append(pred)
  except Exception as e:
    predictions.append(None)
    print(traceback.format_exc())
  is_valid = expected_outputs[i] == pred
  if is_valid:
    print("✅ Correct!")
  else:
    print("❌ Incorrect!")
  print()

print(f"<predictions>{json.dumps(predictions)}</predictions>")
`;
		const output = await runPythonMutation.mutateAsync(codeToRun);
		setCodeOutput(output);
		const answers: Matrix[] = JSON.parse(
			output.match(/<predictions>(.*?)<\/predictions>\s*$/)?.[1] ?? "",
		);
		console.log(taskQuery.data?.examples[0].output);
		setCodeOutput(output.replace(/<predictions>.*?<\/predictions>\s*$/, ""));
		setSubmissions(
			answers.map((answer, index) => ({
				exampleId: taskQuery.data?.examples[index].id ?? "",
				predictedOutput: answer,
				isCorrect:
					JSON.stringify(answer) ===
					JSON.stringify(taskQuery.data?.examples[index].output),
			})),
		);
	}

	return (
		<div className="flex flex-col h-screen bg-[#181A1F] text-white">
			<Navbar
				handleTaskChange={handleTaskChange}
				selectedTaskId={selectedTaskId}
				isLoading={listTasksQuery.isLoading || taskQuery.isLoading}
				taskIds={listTasksQuery.data?.map((task) => task.id) ?? []}
				error={listTasksQuery.error as Error | null}
			/>

			<div className="flex flex-1 overflow-hidden">
				<PanelGroup direction="horizontal">
					<Panel defaultSize={50} minSize={30}>
						<CodePane
							code={code}
							setCode={setCode}
							output={codeOutput}
							runCode={runCode}
							isRunning={runPythonMutation.isLoading}
							isDisabled={!canRunCode}
						/>
					</Panel>

					<PanelResizeHandle className="w-1 hover:w-2 bg-gray-700 hover:bg-blue-500 transition-all cursor-col-resize" />

					<Panel defaultSize={50} minSize={30}>
						<div className="relative h-full overflow-auto">
							<SubmissionsPane
								examples={taskQuery.data?.examples ?? []}
								submissions={submissions}
								colorScheme={GRID_COLORS}
							/>
							{(listTasksQuery.isLoading || taskQuery.isLoading) && (
								<div className="absolute inset-0 flex items-center justify-center">
									<p className="text-lg font-medium">Loading...</p>
								</div>
							)}
						</div>
					</Panel>
				</PanelGroup>
			</div>
		</div>
	);
}

export default App;
