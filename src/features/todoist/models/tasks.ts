import { TodoistV8Types } from "todoist";
import { createEffect, createEvent, createStore, merge } from "effector";
import { Task } from "../entities";
import { listToTree, Id } from "../../../lib/listToTree";
import { todoistApi } from "../api";
import { TaskItem } from "../providers/TaskItem";
import { syncFx } from "./common";

/** Effects */
export const completeTaskFx = createEffect(async ({ id }: Task) => todoistApi.items.complete({ id }));

export const uncompleteTaskFx = createEffect(async ({ id }: Task) => todoistApi.items.uncomplete({ id }));

export const addTaskFx = createEffect(async (task: TodoistV8Types.ItemAdd) => todoistApi.items.add(task));

export const updateTaskFx = createEffect(async (task: TodoistV8Types.ItemUpdate) => todoistApi.items.update(task));

/** Events */
export const updateTasks = createEvent<Task[]>();

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
    .on(syncFx.doneData, (_, { tasks }) => [...tasks])
    .on(updateTasks, (_, tasks) => [...tasks])

merge([
    uncompleteTaskFx.done,
    completeTaskFx.done,
    addTaskFx.done,
    updateTaskFx.done,
]).watch(async () => {
    await syncFx();
})
