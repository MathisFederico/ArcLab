import { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import CodePane from "./components/CodePane";
import Navbar from "./components/Navbar";
import SubmissionsPane, { type Submission } from "./components/SubmissionsPane";
import { useTask, useTasks, usePython } from "./hooks";
import type { Task } from "./types";


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
}

function App() {
	const [code, setCode] = useState(DEFAULT_CODE);
	const { pyodideLoading, runPython, output } = usePython();
	const [submissions, setSubmissions] = useState<Submission[]>([]);

	// Task state
	const [currentTaskId, setCurrentTaskId] = useState("");
	const [previousTaskId, setPreviousTaskId] = useState<string | null>(null);
	const [previousTaskData, setPreviousTaskData] = useState<Task | null>(null);

	// React Query hooks for tasks (without destructuring)
	const tasksQuery = useTasks();
	const tasks = tasksQuery.data || [];
	const isTasksLoading = tasksQuery.isLoading;
	const tasksError = tasksQuery.error;

	// React Query hook for task detail (without destructuring)
	const taskQuery = useTask(currentTaskId || null);
	const taskData = taskQuery.data;
	const isTaskLoading = taskQuery.isLoading;
	const taskError = taskQuery.error;

	// Update previous task data when new data is loaded
	useEffect(() => {
		if (taskData && !isTaskLoading) {
			setPreviousTaskData(taskData);
			setPreviousTaskId(currentTaskId);
		}
	}, [taskData, isTaskLoading, currentTaskId]);

	// Handle task selection with smoother UI
	const handleTaskChange = (taskId: string) => {
		if (taskId !== currentTaskId) {
			setCurrentTaskId(taskId);
		}
	};

	// Handle displaying errors as strings
	const getErrorMessage = (error: unknown): string => {
		return error instanceof Error ? error.message : "An unknown error occurred";
	};

	const runCode = async () => {
		const inputs = taskData?.examples.map((example) => example.input) ?? [];
		const codeToRun = `
import json

${code}

inputs = ${JSON.stringify(inputs)}
predictions = [solve(input) for input in inputs]
print(f"<predictions>{json.dumps(predictions)}</predictions>")
`;
		const output = await runPython(codeToRun);
		const answers = JSON.parse(
			output.match(/<predictions>(.*?)<\/predictions>/)?.[1] ?? "[]",
		);
		// TODO: check with deep check instead
		setSubmissions(
			inputs.map((input, index) => ({
				id: taskData?.id ?? "",
				input,
				output: taskData?.examples[index].output ?? [],
				predictedOutput: answers[index],
				isCorrect:
					answers[index] === taskData?.examples[index].output,
			})),
		);
	};

	return (
		<div className="flex flex-col h-screen bg-[#181A1F] text-white">
			{/* Navbar */}
			<Navbar
				currentTaskId={currentTaskId}
				handleTaskChange={handleTaskChange}
				tasks={tasks}
				isTasksLoading={isTasksLoading}
				tasksError={tasksError}
				isTaskLoading={isTaskLoading}
				taskError={taskError}
				getErrorMessage={getErrorMessage}
			/>

			{/* Main content */}
			<div className="flex flex-1 overflow-hidden">
				<PanelGroup direction="horizontal">
					{/* Left panel - Code editor */}
					<Panel defaultSize={50} minSize={30}>
						<CodePane
							code={code}
							setCode={setCode}
							output={output}
							runCode={runCode}
							isLoading={pyodideLoading}
						/>
					</Panel>

					<PanelResizeHandle className="w-1 hover:w-2 bg-gray-700 hover:bg-blue-500 transition-all cursor-col-resize" />

					{/* Right panel - Grid examples */}
					<Panel defaultSize={50} minSize={30}>
						<div className="relative h-full overflow-auto">
							<SubmissionsPane
								submissions={submissions}
								colorScheme={GRID_COLORS}
							/>
							{isTaskLoading &&
								currentTaskId &&
								previousTaskId !== currentTaskId && (
									<div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
										<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
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
