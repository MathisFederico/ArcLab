import { python } from "@codemirror/lang-python";
import CodeMirror from "@uiw/react-codemirror";

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
	isRunning: boolean;
	isDisabled: boolean;
}

function CodePane({
	code,
	setCode,
	output,
	runCode,
	isRunning,
	isDisabled,
}: CodePaneProps) {
	return (
		<div className="flex flex-col h-full border-r border-gray-700 bg-[#181A1F]">
			<div className="relative flex-1 overflow-hidden">
				<div className="h-full overflow-hidden">
					<CodeMirror
						value={code}
						height="100%"
						extensions={[python()]}
						onChange={(value) => setCode(value)}
						theme="dark"
						className="h-full overflow-auto"
					/>
				</div>
				<button
					type="button"
					className="absolute bottom-4 right-4 bg-white hover:bg-gray-200 text-black py-2 px-4 rounded-md shadow transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
					onClick={runCode}
					disabled={isDisabled || isRunning}
				>
					{isRunning ? (
						"Running..."
					) : (
						<>
							Submit <span className="ml-1">→</span>
						</>
					)}
				</button>
			</div>
			<div className="h-1/3 border-t border-gray-700 p-4 bg-[#181A1F]">
				<h2 className="text-xl font-semibold mb-4">Submissions</h2>
				<div className="h-full overflow-auto">
					<pre className="font-mono text-gray-300 whitespace-pre-wrap">
						{output || "No submissions yet, submit the code to see results"}
					</pre>
				</div>
			</div>
		</div>
	);
}

export default CodePane;
export type { CustomPyodide };
