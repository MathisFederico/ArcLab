interface NavbarProps {
	handleTaskChange: (taskId: string) => void;
	selectedTaskId: string;
	isLoading: boolean;
	taskIds: string[];
	error: Error | null;
}

const Navbar = ({
	handleTaskChange,
	selectedTaskId,
	isLoading,
	taskIds,
	error,
}: NavbarProps) => {
	return (
		<div className="bg-[#181A1F] border-b border-gray-700 px-4 py-3 flex justify-between items-center">
			<div className="flex items-center space-x-4">
				<span className="text-gray-300">Task</span>
				<div className="relative h-8">
					<select
						value={isLoading ? "" : selectedTaskId}
						onChange={(e) => handleTaskChange(e.target.value)}
						className="bg-gray-700 border border-gray-600 rounded px-2 py-1 w-40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						disabled={isLoading}
					>
						{isLoading ? (
							<option value="">Loading...</option>
						) : (
							<>
								<option value="">Select a task</option>
								{taskIds.map((taskId) => (
									<option key={taskId} value={taskId}>
										{taskId}
									</option>
								))}
							</>
						)}
					</select>
				</div>
				{error ? (
					<span className="text-xs text-red-400">
						Error loading tasks: {(error as Error).message}
					</span>
				) : null}
			</div>
		</div>
	);
};

export default Navbar;
