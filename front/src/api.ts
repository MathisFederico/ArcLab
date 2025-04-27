import { createClient } from "@supabase/supabase-js";
import type { Task } from "./types";

const supabase = createClient("https://kdctjgptitvmrborgoll.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkY3RqZ3B0aXR2bXJib3Jnb2xsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODM0OTEsImV4cCI6MjA2MTI1OTQ5MX0.ddzMBgRJc_m5Q0oZubJRJ7TlDPmmJLyu4IT0UAQE0sc");


export const getTaskForId = async (id: string): Promise<Task> => {
	const { data } = await supabase.from('TaskExample')
		.select('input, output, task!inner(arc_task_id)').eq('task.arc_task_id', id)
	if (!data) throw Error;

	const examples = data.map((example_data) => {
		return {
			input: example_data.input,
			output: example_data.output,
		}
	});

	return {
		id: id,
		examples: examples
	};
};


export const getTasks = async (): Promise<{ id: string }[]> => {
	const { data } = await supabase.from('Task')
		.select('arc_task_id')
	if (!data) return [];
	return data?.map((task_data) => ({
		id: task_data.arc_task_id,
	}));
};
