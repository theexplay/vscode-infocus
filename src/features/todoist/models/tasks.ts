import { TodoistV8Types } from "todoist";
import { createEffect, createStore } from "effector";
import { Task } from "../entities";
import { listToTree, Id } from "../../../lib/listToTree";
import { apiClient, todoistApi } from "../api";
import { TaskItem } from "../providers/TaskItem";
import { fetchAllEntitiesFx } from "./common";

/** Effects */
export const toggleTaskFx = createEffect(async (task: Task): Promise<Task> => {
    const tasks = $tasksMap.getState()

    await apiClient.toggleTask(task.id, tasks[task.id].checked);

    return { ...task, checked: !!tasks[task.id].checked ? 0 : 1 };
});

export const addTaskFx = createEffect(async (task: TodoistV8Types.ItemAdd): Promise<Task> => {
    const res: TodoistV8Types.NodeType | undefined = await todoistApi.items.add(task)

    return res as unknown as Task;
})

/** Stores */
export const $tasks = createStore<Task[]>([])

/** Computed stores */
export const $tasksTreeLeaf = $tasks.map((tasks) => {
    return listToTree(tasks).map((todo) => new TaskItem(todo));
})

export const $tasksMap = $tasks.map<Record<number, Task>>((tasks) => {
    return tasks.reduce((acc, task) => ({ ...acc, [task.id]: task }), {});
})

export const $filterTasksByProjectIdWithoutSectionId = (projectId: Id) => $tasksTreeLeaf.map(
    (tasks) => tasks.filter((task) => task.projectId === projectId && !task.sectionId)
);

export const $filterTasksBySectionId = (sectionId: Id) => $tasksTreeLeaf.map(
    (tasks) => tasks.filter((task) => task.sectionId === sectionId)
);


/** Subscriptions */
$tasks
    .on(fetchAllEntitiesFx.doneData, (state, { tasks }) => [...state, ...tasks])
    .on(addTaskFx.doneData, (state, newTask) => {
        return [...state, newTask]
    })
    .on(toggleTaskFx.doneData, (state, updatedTask) => {
        // find and remove old task
        const index = state.findIndex((task) => task.id === updatedTask.id);
        state.splice(index, 1)

        // update store with new task
        return [...state, updatedTask]
    });
