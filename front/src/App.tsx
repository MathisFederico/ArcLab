import { python } from "@codemirror/lang-python";
import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useState } from "react";

// Custom interface for our usage
interface CustomPyodide {
	runPythonAsync: (code: string) => Promise<unknown>;
	setStdout: (options: {
		batched?: (output: string) => void;
		raw?: (charCode: number) => void;
		write?: (buffer: Uint8Array) => number;
		isatty?: boolean;
	}) => void;
}

function App() {
	const [code, setCode] = useState(
		"# Write your Python code here\nprint('Hello, World!')",
	);
	const [output, setOutput] = useState("");
	const [pyodide, setPyodide] = useState<CustomPyodide | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [currentPuzzleId, setCurrentPuzzleId] = useState("");
	const [score, setScore] = useState(13);
	const [rank, setRank] = useState("2/130");
	const [selectedButton, setSelectedButton] = useState<number | null>(1);

	// Initialize Pyodide
	useEffect(() => {
		async function loadPyodide() {
			setIsLoading(true);
			try {
				const { loadPyodide } = await import("pyodide");
				const pyodideInstance = await loadPyodide({
					indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/",
				});
				setPyodide(pyodideInstance as unknown as CustomPyodide);
			} catch (error) {
				console.error("Failed to load Pyodide:", error);
				setOutput("Failed to load Python interpreter.");
			} finally {
				setIsLoading(false);
			}
		}
		loadPyodide();
	}, []);

	const runCode = async () => {
		if (!pyodide) {
			setOutput("Python interpreter not loaded yet. Please wait.");
			return;
		}

		setOutput("Running...");
		try {
			// Redirect stdout to capture print statements
			pyodide.setStdout({
				batched: (text: string) => {
					setOutput((prev) => prev + text);
				},
			});

			// Clear previous output
			setOutput("");

			// Run the code
			await pyodide.runPythonAsync(code);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			setOutput(`Error: ${errorMessage}`);
		}
	};

	return (
		<div className="flex flex-col h-screen bg-gray-900 text-white">
			{/* Navbar */}
			<div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex justify-between items-center">
				<div className="flex items-center space-x-4">
					<span className="text-gray-300">Puzzle</span>
					<input
						type="text"
						value={currentPuzzleId}
						onChange={(e) => setCurrentPuzzleId(e.target.value)}
						placeholder="puzzle id"
						className="bg-gray-700 border border-gray-600 rounded px-2 py-1 w-24 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				<div className="flex items-center">
					<span className="text-gray-300 mr-4">
						Score: <span className="text-blue-400">{score}</span>
					</span>
					<span className="text-gray-300">
						Rank: <span className="text-green-400">{rank}</span>
					</span>
				</div>
			</div>

			{/* Main content */}
			<div className="flex flex-1 overflow-hidden">
				{/* Left panel - Code editor */}
				<div className="flex flex-col w-2/3 border-r border-gray-700">
					<div className="relative flex-1">
						<CodeMirror
							value={code}
							height="100%"
							extensions={[python()]}
							onChange={(value) => setCode(value)}
							theme="dark"
							className="h-full"
						/>
						<button
							type="button"
							className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow transition-colors"
							onClick={runCode}
							disabled={isLoading}
						>
							{isLoading ? "Loading..." : "Run"}
						</button>
					</div>
					<div className="h-1/3 border-t border-gray-700 p-4 bg-gray-800">
						<div className="h-full overflow-auto bg-gray-900 rounded p-2">
							<pre className="font-mono text-gray-300 whitespace-pre-wrap">
								{output}
							</pre>
						</div>
					</div>
				</div>

				{/* Right panel - Scrollable buttons */}
				<div className="w-1/3 p-4 overflow-y-auto">
					<div className="grid grid-cols-2 gap-4">
						{[1, 2, 3, 4, 5, 6].map((num) => (
							<button
								key={num}
								type="button"
								className={`aspect-square rounded-xl border-2 ${
									selectedButton === num
										? "border-blue-500 bg-gray-700"
										: "border-gray-600 bg-gray-800 hover:bg-gray-700"
								} transition-colors`}
								onClick={() => setSelectedButton(num)}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
