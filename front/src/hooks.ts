import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { getPuzzleForId, getPuzzles } from "./api";
import type { CustomPyodide } from "./components/CodePane";

export const usePuzzles = () => {
	return useQuery("puzzles", getPuzzles);
};

export const usePuzzle = (puzzleId: string | null) => {
	return useQuery(
		["puzzle", puzzleId],
		() => (puzzleId ? getPuzzleForId(puzzleId) : null),
		{
			enabled: Boolean(puzzleId),
			// Don't refetch automatically when window regains focus
			refetchOnWindowFocus: false,
		},
	);
};

export const usePython = () => {
	// Pyodide state
	const [pyodide, setPyodide] = useState<CustomPyodide | null>(null);
	const [pyodideLoading, setPyodideLoading] = useState(true);
	const [output, setOutput] = useState("");

	// Initialize Pyodide
	useEffect(() => {
		async function loadPyodide() {
			setPyodideLoading(true);
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
				setPyodideLoading(false);
			}
		}
		loadPyodide();
	}, []);

	const runPython = async (code: string) => {
		let output = "";

		if (!pyodide) {
			setOutput("Python interpreter not loaded yet. Please wait.");
			return output;
		}

		setOutput("Running...");
		try {
			// Redirect stdout to capture print statements
			pyodide.setStdout({
				batched: (text: string) => {
					output += text;
					setOutput(output);
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
		return output;
	};

	return {
		pyodideLoading,
		output,
		runPython,
	};
};
