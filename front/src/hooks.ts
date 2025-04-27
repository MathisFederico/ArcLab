import { useQuery } from "react-query";
import { getTaskForId, getTasks } from "./api";

export function useTasks() {
	return useQuery("tasks", getTasks);
}

export function useTask(taskId: string | null) {
	return useQuery(
		["task", taskId],
		() => (taskId ? getTaskForId(taskId) : null),
		{
			enabled: !!taskId,
		},
	);
}
