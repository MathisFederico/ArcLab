import type { FC } from "react";

interface NavbarProps {
	currentTaskId: string;
	handleTaskChange: (taskId: string) => void;
	tasks: { id: string }[];
	isTasksLoading: boolean;
	tasksError: unknown;
	isTaskLoading: boolean;
	taskError: unknown;
	getErrorMessage: (error: unknown) => string;
}

const Navbar: FC<NavbarProps> = ({
	currentTaskId,
	handleTaskChange,
	tasks,
	isTasksLoading,
	tasksError,
	isTaskLoading,
	taskError,
	getErrorMessage,
}) => {
	return (
		<div className="bg-[#181A1F] border-b border-gray-700 px-4 py-3 flex justify-between items-center">
			<div className="flex items-center space-x-4">
				<span className="text-gray-300">Task</span>
				<div className="relative">
					<select
						value={currentTaskId}
						onChange={(e) => handleTaskChange(e.target.value)}
						className="bg-gray-700 border border-gray-600 rounded px-2 py-1 w-40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						disabled={isTasksLoading}
					>
						<option value="">Select a task</option>
						{tasks.map((task) => (
							<option key={task.id} value={task.id}>
								{task.id}
							</option>
						))}
					</select>
					{isTasksLoading && (
						<div className="absolute right-2 top-1/2 transform -translate-y-1/2">
							<div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-blue-500 rounded-full" />
						</div>
					)}
				</div>
				{isTasksLoading && (
					<span className="text-xs text-gray-400">Loading tasks...</span>
				)}
				{tasksError ? (
					<span className="text-xs text-red-400">
						Error loading tasks: {getErrorMessage(tasksError)}
					</span>
				) : null}
			</div>
			<div className="flex items-center">
				{isTaskLoading && currentTaskId && (
					<span className="text-xs text-blue-400 animate-pulse mr-4">
						Loading task...
					</span>
				)}
				{taskError ? (
					<span className="text-xs text-red-400 mr-4">
						Error: {getErrorMessage(taskError)}
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
