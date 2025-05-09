import type { Matrix } from "../types";

interface GridProps {
	matrix: Matrix;
	colorScheme: Record<number, string>;
	title?: string;
	showDimensions?: boolean;
	className?: string;
}

function Grid({
	matrix,
	colorScheme,
	title,
	showDimensions = false,
}: GridProps) {
	const rows = matrix.length;
	const cols = matrix[0]?.length || 0;

	return (
		<div className="bg-gray-800 rounded-lg p-3">
			{title && (
				<h3 className="text-sm font-medium mb-2 text-gray-300">{title}</h3>
			)}
			{showDimensions && (
				<div className="text-xs text-gray-400 mb-2">
					{rows} × {cols}
				</div>
			)}
			<div
				className="grid gap-0.5"
				style={{
					gridTemplateColumns: `repeat(${cols}, 1fr)`,
				}}
			>
				{matrix.flatMap((row, rowIndex) =>
					row.map((cell, colIndex) => (
						<div
							key={`cell-${rowIndex}-${colIndex}-${cell}`}
							className="aspect-square"
							style={{ backgroundColor: colorScheme[cell] || "transparent" }}
						/>
					)),
				)}
			</div>
		</div>
	);
}

export default Grid;
