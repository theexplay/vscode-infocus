import { TodoistV9Types } from "todoist";
import { createEffect, createEvent, createStore, merge } from "effector";
import { Task } from "../entities";
import { listToTree, Id } from "../../../lib/listToTree";
import { todoistApi } from "../api";
import { TaskItem } from "../providers/TaskItem";
import { syncFx } from "./common";
import { isEqual, isFuture, isToday } from "date-fns";

/** Effects */
export const completeTaskFx = createEffect(async ({ id }: Task) => todoistApi.items.complete({ id }));

export const uncompleteTaskFx = createEffect(async ({ id }: Task) => todoistApi.items.uncomplete({ id }));

export const addTaskFx = createEffect(async (task: TodoistV9Types.ItemAdd) => todoistApi.items.add(task));

export const updateTaskFx = createEffect(async (task: TodoistV9Types.ItemUpdate) => todoistApi.items.update(task));

/** Events */
export const updateTasks = createEvent<Task[]>();

/** Stores */
export const $tasks = createStore<Task[]>([]);

/** Computed stores */
// FIXME: TaskItem creates only on top level
export const $tasksTreeLeaf = $tasks.map((tasks) => {
    return listToTree(tasks).map((todo) => new TaskItem(todo));
});

// FIXME: Element with id is already registered, cause of error recreate items for Date View
export const $tasksTreeLeafDate = $tasks.map((tasks) => {
    return listToTree(tasks).map((todo) => new TaskItem(todo));
});

export const $tasksMap = $tasks.map<Record<number, Task>>((tasks) => {
    return tasks.reduce((acc, task) => ({ ...acc, [task.id]: task }), {});
});

export const $dateSections = $tasks.map<Record<string, Task['due']>>((tasks) => {
    return tasks.reduce((acc, task) => {
        if (task?.due?.date) {
            acc[task.due.date] = task.due;
        }
        return acc;
    }, {} as Record<string, Task['due']>);
});

export const $filterTasksByProjectIdWithoutSectionId = (projectId: Id) => $tasksTreeLeaf.map(
    (tasks) => tasks.filter((task) => task.projectId === projectId && !task.sectionId)
);

export const $filterTasksByTodayDue = () => $tasksTreeLeafDate.map(
    (tasks) => tasks
        .filter((task) => Boolean(task._raw.due))
        .filter((task) => isToday(new Date(task._raw.due.date)))
);

export const $filterTasksByInFutureDue = () => $tasksTreeLeaf.map(
    (tasks) => tasks
        .filter((task) => Boolean(task._raw.due))
        .filter((task) => isFuture(new Date(task._raw.due.date)))
);

export const $filterTasksByDate = (date: string) => $tasksTreeLeafDate.map(
    (tasks) => tasks
        .filter((task) => Boolean(task._raw.due && isEqual(new Date(task._raw.due.date), new Date(date))))
);

export const $filterTasksBySectionId = (sectionId: Id) => $tasksTreeLeaf.map(
    (tasks) => tasks.filter((task) => task.sectionId === sectionId)
);


/** Subscriptions */
$tasks
    .on(syncFx.doneData, (_, { tasks }) => [...tasks])
    .on(updateTasks, (_, tasks) => [...tasks]);

merge([
    uncompleteTaskFx.done,
    completeTaskFx.done,
    addTaskFx.done,
    updateTaskFx.done,
]).watch(async () => {
    await syncFx();
});
