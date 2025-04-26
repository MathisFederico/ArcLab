import { python } from "@codemirror/lang-python";
import CodeMirror from "@uiw/react-codemirror";

// Custom interface for our Pyodide usage
interface CustomPyodide {
	runPythonAsync: (code: string) => Promise<unknown>;
	setStdout: (options: {
		batched?: (output: string) => void;
		raw?: (charCode: number) => void;
		write?: (buffer: Uint8Array) => number;
		isatty?: boolean;
	}) => void;
}

interface CodePaneProps {
	code: string;
	setCode: (code: string) => void;
	output: string;
	runCode: () => Promise<void>;
	isLoading: boolean;
}

function CodePane({
	code,
	setCode,
	output,
	runCode,
	isLoading,
}: CodePaneProps) {
	return (
		<div className="flex flex-col h-full border-r border-gray-700 bg-[#181A1F]">
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
					className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow transition-colors flex items-center justify-center"
					onClick={runCode}
					disabled={isLoading}
				>
					{isLoading ? (
						"Loading..."
					) : (
						<>
							Submit <span className="ml-1">→</span>
						</>
					)}
				</button>
			</div>
			<div className="h-1/3 border-t border-gray-700 p-4 bg-[#181A1F]">
				<div className="h-full overflow-auto bg-gray-900 rounded p-2">
					<pre className="font-mono text-gray-300 whitespace-pre-wrap">
						{output}
					</pre>
				</div>
			</div>
		</div>
	);
}

export default CodePane;
export type { CustomPyodide };
