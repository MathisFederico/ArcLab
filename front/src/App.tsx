import { useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import CodePane from "./components/CodePane";
import Navbar from "./components/Navbar";
import SubmissionsPane, { type Submission } from "./components/SubmissionsPane";
import { useTask, useTasks } from "./hooks";
import { useRunPython } from "./interpreter";
import type { Matrix } from "./types";

const DEFAULT_CODE = `from typing import TypeAlias
from dataclasses import dataclass
from enum import IntEnum

import numpy as np


class CellColor(IntEnum):
  TRANSPARENT = -1
  BLACK = 0
  BLUE = 1
  RED = 2
  GREEN = 3
  YELLOW = 4
  GRAY = 5
  PINK = 6
  ORANGE = 7
  CYAN = 8
  DARK_RED = 9

Grid: TypeAlias = list[list[int]]
Pos: TypeAlias = tuple[int, int]

def grid_shape(grid: Grid) -> tuple[int, int]:
  """Helper to get the shape of a grid."""
  return (len(grid), len(grid[0]))

def grid_colors(grid: Grid) -> dict[CellColor, int]:
  """Count the occurences of each colors in a grid."""
  color_count = {color: 0 for color in CellColor}
  for row in grid:
    for cell in row:
      color_count[CellColor(cell)] += 1
  return color_count

def main_color(grid: Grid, background_color: CellColor) -> CellColor:
  """Get the main color of the grid."""
  colors_histogram = grid_colors(grid)
  colors_histogram.pop(background_color)
  return max(colors_histogram, key=lambda x: colors_histogram[x])

def recolor(grid: Grid, old_color: CellColor, new_color: CellColor):
  """Recolor cells of the grid of the old_color to the new_color."""
  grid_arr = np.array(grid)
  grid_arr[grid_arr == old_color.value] = new_color.value
  return grid_arr.tolist()

def invert_colors(grid: Grid, color_1: CellColor, color_2: CellColor):
  """Recolor cells of the grid of the old_color to the new_color."""
  grid_arr = np.array(grid)
  grid_arr_1 = CellColor.TRANSPARENT.value * np.ones_like(grid)
  grid_arr_1[grid_arr == color_1.value] = color_2.value
  grid_arr_2 = CellColor.TRANSPARENT.value * np.ones_like(grid)
  grid_arr_2[grid_arr == color_2.value] = color_1.value
  grid_arr = np.maximum(grid_arr_1, grid_arr_2)
  return grid_arr.tolist()


@dataclass
class Object:
  pos: Pos
  content: Grid

def object_from_color(grid: Grid, color: CellColor) -> Object:
  """Create an object from a given color."""
  grid_arr = np.array(grid)
  value_poses = np.array(np.where(grid_arr == color.value))
  if value_poses.size == 0:
    raise ValueError("Attempt to make object from color %s not present in grid %s", color, grid)

  obj_pos = np.array(np.min(value_poses, axis=1))
  obj_limit = np.array(np.max(value_poses, axis=1)) + 1

  obj_arr = grid_arr.copy()
  obj_arr = obj_arr[obj_pos[0] : obj_limit[0], obj_pos[1] : obj_limit[1]]
  obj_arr[obj_arr != color.value] = CellColor.TRANSPARENT.value
  return Object(pos=(obj_pos[0], obj_pos[1]), content=obj_arr.tolist())

def object_from_background(grid: Grid, background_color: CellColor) -> Object:
  """Create an object by removing the background of the given color."""
  grid_arr = np.array(grid)
  value_poses = np.array(np.where(grid_arr != background_color.value))
  if value_poses.size == 0:
    raise ValueError("Attempt to make object from uniform background %s", color)

  obj_pos = np.array(np.min(value_poses, axis=1))
  obj_limit = np.array(np.max(value_poses, axis=1)) + 1

  obj_arr = grid_arr.copy()
  obj_arr = obj_arr[obj_pos[0] : obj_limit[0], obj_pos[1] : obj_limit[1]]
  obj_arr[obj_arr == background_color.value] = CellColor.TRANSPARENT.value
  return Object(pos=(obj_pos[0], obj_pos[1]), content=obj_arr.tolist())


### TASK SOLUTION


def solve(input_grid: Grid) -> Grid:
  background = CellColor.BLACK
  obj_color = main_color(input_grid, background_color=background)
  object_shape = np.array(grid_shape(input_grid))
  output_array = np.zeros(object_shape ** 2)
  reversed_grid = invert_colors(input_grid, background, obj_color)
  for i, row in enumerate(input_grid):
    for j, cell in enumerate(row):
      if cell == background.value:
        continue
      pos = (i * object_shape[0], j * object_shape[1])
      output_array[pos[0]:pos[0]+object_shape[0], pos[1]:pos[1]+object_shape[1]] = reversed_grid
  return output_array.tolist()

`;

const GRID_COLORS = {
	0: "#000000",
	1: "#1e93ff",
	2: "#f93c31",
	3: "#4fcc30",
	4: "#ffdc00",
	5: "#999999",
	6: "#e53aa3",
	7: "#ff851b",
	8: "#87d8f1",
	9: "#921231",
};

function App() {
	const [code, setCode] = useState(DEFAULT_CODE);
	const [codeOutput, setCodeOutput] = useState("");
	const [submissions, setSubmissions] = useState<Submission[]>([]);

	const listTasksQuery = useTasks();
	const [taskId, setTaskId] = useState<string | null>(null);
	const selectedTaskId = taskId ?? listTasksQuery.data?.[0]?.id ?? "";

	const taskQuery = useTask(selectedTaskId);
	const canRunCode = taskQuery.data && taskQuery.data.examples.length > 0;
	const runPythonMutation = useRunPython();

	function handleTaskChange(taskId: string) {
		setSubmissions([]);
		setCodeOutput("");
		setTaskId(taskId);
	}

	async function runCode() {
		if (!canRunCode) {
			return;
		}

		const inputs = taskQuery.data?.examples.map((example) => example.input);
		const expected_outputs = taskQuery.data?.examples.map(
			(example) => example.output,
		);
		const codeToRun = `
import json
import traceback

${code}

inputs = ${JSON.stringify(inputs)}
expected_outputs = ${JSON.stringify(expected_outputs)}
predictions = []

for i, input in enumerate(inputs):
  print("-" * 10 + f" Running Example {i+1} " + "-" * 10)
  pred = None
  try:
    pred = solve(input)
    predictions.append(pred)
  except Exception as e:
    predictions.append(None)
    print(traceback.format_exc())

  is_valid = expected_outputs[i] == pred
  if is_valid:
    print("✅ Correct!")
  else:
    print("❌ Incorrect!")
  print()

print(f"<predictions>{json.dumps(predictions)}</predictions>")
`;
		const output = await runPythonMutation.mutateAsync(codeToRun);
		setCodeOutput(output);
		const answers: Array<Matrix | null> = JSON.parse(
			output.match(/<predictions>(.*?)<\/predictions>\s*$/)?.[1] ?? "",
		);
		setCodeOutput(output.replace(/<predictions>.*?<\/predictions>\s*$/, ""));
		setSubmissions(
			answers.map((answer, index) => ({
				exampleId: taskQuery.data?.examples[index].id ?? "",
				predictedOutput: answer ?? [[-1]],
				isCorrect:
					JSON.stringify(answer) ===
					JSON.stringify(taskQuery.data?.examples[index].output),
			})),
		);
	}

	return (
		<div className="flex flex-col h-screen bg-[#181A1F] text-white">
			<Navbar
				handleTaskChange={handleTaskChange}
				selectedTaskId={selectedTaskId}
				isLoading={listTasksQuery.isLoading || taskQuery.isLoading}
				taskIds={listTasksQuery.data?.map((task) => task.id) ?? []}
				error={listTasksQuery.error as Error | null}
			/>

			<div className="flex flex-1 overflow-hidden">
				<PanelGroup direction="horizontal">
					<Panel defaultSize={50} minSize={30}>
						<CodePane
							code={code}
							setCode={setCode}
							output={codeOutput}
							runCode={runCode}
							isRunning={runPythonMutation.isLoading}
							isDisabled={!canRunCode}
						/>
					</Panel>

					<PanelResizeHandle className="w-1 hover:w-2 bg-gray-700 hover:bg-blue-500 transition-all cursor-col-resize" />

					<Panel defaultSize={50} minSize={30}>
						<div className="relative h-full overflow-auto">
							<SubmissionsPane
								examples={taskQuery.data?.examples ?? []}
								submissions={submissions}
								colorScheme={GRID_COLORS}
							/>
							{(listTasksQuery.isLoading || taskQuery.isLoading) && (
								<div className="absolute inset-0 flex items-center justify-center">
									<p className="text-lg font-medium">Loading...</p>
								</div>
							)}
						</div>
					</Panel>
				</PanelGroup>
			</div>
		</div>
	);
}

export default App;
