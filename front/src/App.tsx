import { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import CodePane from "./components/CodePane";
import Navbar from "./components/Navbar";
import SubmissionsPane from "./components/SubmissionsPane";
import { usePuzzle, usePuzzles, usePython } from "./hooks";
import type { Matrix, Puzzle } from "./types";

function App() {
	// Code editor state
	const [code, setCode] = useState(
		"# Write your Python code here\nprint('Hello, World!')",
	);

	// Python execution hook
	const { output, pyodideLoading, runPython } = usePython();

	// Puzzle state
	const [currentPuzzleId, setCurrentPuzzleId] = useState("");
	const [previousPuzzleId, setPreviousPuzzleId] = useState<string | null>(null);
	const [previousPuzzleData, setPreviousPuzzleData] = useState<Puzzle | null>(
		null,
	);

	// Color scheme for the grid cells
	const colorScheme = {
		0: "transparent",
		1: "#ff5555", // Red
		2: "#88ccff", // Light blue
	};

	// React Query hooks for puzzles (without destructuring)
	const puzzlesQuery = usePuzzles();
	const puzzles = puzzlesQuery.data || [];
	const isPuzzlesLoading = puzzlesQuery.isLoading;
	const puzzlesError = puzzlesQuery.error;

	// React Query hook for puzzle detail (without destructuring)
	const puzzleQuery = usePuzzle(currentPuzzleId || null);
	const puzzleData = puzzleQuery.data;
	const isPuzzleLoading = puzzleQuery.isLoading;
	const puzzleError = puzzleQuery.error;

	// Update previous puzzle data when new data is loaded
	useEffect(() => {
		if (puzzleData && !isPuzzleLoading) {
			setPreviousPuzzleData(puzzleData);
			setPreviousPuzzleId(currentPuzzleId);
		}
	}, [puzzleData, isPuzzleLoading, currentPuzzleId]);

	// When changing puzzles, keep the previous data until new data is loaded
	const displayPuzzleData =
		isPuzzleLoading && previousPuzzleId !== currentPuzzleId
			? previousPuzzleData
			: puzzleData;

	// Create submissions directly from current puzzle data
	const submissions = puzzleData
		? puzzleData.examples.map((example) => ({
				id: puzzleData.id,
				input: example.input,
				expectedOutput: example.expectedOutput,
				predictedOutput: [] as Matrix,
				isCorrect: false,
			}))
		: [];

	// Handle puzzle selection with smoother UI
	const handlePuzzleChange = (puzzleId: string) => {
		if (puzzleId !== currentPuzzleId) {
			setCurrentPuzzleId(puzzleId);
		}
	};

	// Handle displaying errors as strings
	const getErrorMessage = (error: unknown): string => {
		return error instanceof Error ? error.message : "An unknown error occurred";
	};

	const runCode = async () => {
		await runPython(code);
	};

	return (
		<div className="flex flex-col h-screen bg-[#181A1F] text-white">
			{/* Navbar */}
			<Navbar
				currentPuzzleId={currentPuzzleId}
				handlePuzzleChange={handlePuzzleChange}
				puzzles={puzzles}
				isPuzzlesLoading={isPuzzlesLoading}
				puzzlesError={puzzlesError}
				isPuzzleLoading={isPuzzleLoading}
				puzzleError={puzzleError}
				getErrorMessage={getErrorMessage}
			/>

			{/* Main content */}
			<div className="flex flex-1 overflow-hidden">
				<PanelGroup direction="horizontal">
					{/* Left panel - Code editor */}
					<Panel defaultSize={66} minSize={30}>
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
					<Panel defaultSize={34} minSize={30}>
						<div className="relative h-full overflow-auto">
							<SubmissionsPane
								submissions={submissions}
								colorScheme={colorScheme}
							/>
							{isPuzzleLoading &&
								currentPuzzleId &&
								previousPuzzleId !== currentPuzzleId && (
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
