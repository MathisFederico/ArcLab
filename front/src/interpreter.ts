import { useEffect } from "react";
import { useMutation } from "react-query";
import type { CustomPyodide } from "./components/CodePane";

let pyodide: CustomPyodide | null = null;
let loadingPromise: Promise<CustomPyodide> | null = null;

async function getOrLoadPyodide() {
	if (pyodide) {
		return pyodide;
	}

	if (loadingPromise) {
		return await loadingPromise;
	}

	async function load() {
		const { loadPyodide } = await import("pyodide");
		const pyodideInstance = await loadPyodide({
			indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/",
		});
		return pyodideInstance as unknown as CustomPyodide;
	}

	loadingPromise = load();
	return loadingPromise;
}

export function useRunPython() {
	useEffect(() => {
		getOrLoadPyodide();
	}, []);

	const mutation = useMutation({
		mutationFn: async (code: string) => {
			let output = "";

			pyodide = await getOrLoadPyodide();

			try {
				// Redirect stdout to capture print statements
				pyodide.setStdout({
					batched: (text: string) => {
						output += `${text}\n`;
					},
				});

				await pyodide.runPythonAsync(code);
			} catch (error: unknown) {
				const errorMessage =
					error instanceof Error ? error.message : String(error);
				return `Error: ${errorMessage}`;
			}
			return output;
		},
	});

	return mutation;
}
