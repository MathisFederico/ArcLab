import type { FC } from "react";

interface NavbarProps {
	currentPuzzleId: string;
	handlePuzzleChange: (puzzleId: string) => void;
	puzzles: { id: string }[];
	isPuzzlesLoading: boolean;
	puzzlesError: unknown;
	isPuzzleLoading: boolean;
	puzzleError: unknown;
	getErrorMessage: (error: unknown) => string;
}

const Navbar: FC<NavbarProps> = ({
	currentPuzzleId,
	handlePuzzleChange,
	puzzles,
	isPuzzlesLoading,
	puzzlesError,
	isPuzzleLoading,
	puzzleError,
	getErrorMessage,
}) => {
	return (
		<div className="bg-[#181A1F] border-b border-gray-700 px-4 py-3 flex justify-between items-center">
			<div className="flex items-center space-x-4">
				<span className="text-gray-300">Puzzle</span>
				<div className="relative">
					<select
						value={currentPuzzleId}
						onChange={(e) => handlePuzzleChange(e.target.value)}
						className="bg-gray-700 border border-gray-600 rounded px-2 py-1 w-40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						disabled={isPuzzlesLoading}
					>
						<option value="">Select a puzzle</option>
						{puzzles.map((puzzle) => (
							<option key={puzzle.id} value={puzzle.id}>
								{puzzle.id}
							</option>
						))}
					</select>
					{isPuzzlesLoading && (
						<div className="absolute right-2 top-1/2 transform -translate-y-1/2">
							<div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-blue-500 rounded-full" />
						</div>
					)}
				</div>
				{isPuzzlesLoading && (
					<span className="text-xs text-gray-400">Loading puzzles...</span>
				)}
				{puzzlesError ? (
					<span className="text-xs text-red-400">
						Error loading puzzles: {getErrorMessage(puzzlesError)}
					</span>
				) : null}
			</div>
			<div className="flex items-center">
				{isPuzzleLoading && currentPuzzleId && (
					<span className="text-xs text-blue-400 animate-pulse mr-4">
						Loading puzzle...
					</span>
				)}
				{puzzleError ? (
					<span className="text-xs text-red-400 mr-4">
						Error: {getErrorMessage(puzzleError)}
					</span>
				) : null}
				<span className="text-gray-300 mr-4">
					Score: <span className="text-blue-400">0</span>
				</span>
				<span className="text-gray-300">
					Rank: <span className="text-green-400">-</span>
				</span>
			</div>
		</div>
	);
};

export default Navbar;
