import { createEffect, createEvent, createStore } from "effector";
import { Project, Task, Note } from "../../entities/todoist";
import { Id, listToTree } from "../../lib/listToTree";
import { apiClient } from "./api";
import { ProjectItem } from "./providers/ProjectItem";
import { TaskItem } from "./providers/TaskItem";

export const fetchAllEntities = createEffect(async () => {
    const { items: tasks, projects } = await apiClient.getAllResources();

    return {
        tasks,
        projects
    }
});

export const toggleTask = createEffect(async (task: Task) => {
    await apiClient.toggleTask(task.id, task.completed);

    return task.id;
});

/**
 * Tasks
 */
export const addTasks = createEvent<Task[]>();
export const updateTask = createEvent<Task>();
export const $tasks = createStore<Task[]>([])
    .on(addTasks, (state, todos) => [...state, ...todos])
    .on(updateTask, (state, todo) => {
        const index = state.findIndex((task) => task.id === todo.id);
        const updatedTask = state.splice(index, 1)

        return [...state, ...updatedTask]
    })
    .on(toggleTask.doneData, (state, id) => {
        const index = state.findIndex((task) => task.id === id);
        const updatedTask = state.splice(index, 1).map((item) => ({ ...item, completed: true }))

        return [...state, ...updatedTask]
    })
    .on(fetchAllEntities.doneData, (state, { tasks }) => [...state, ...tasks]);

export const $providerTasksAsTree = $tasks.map((tasks) => {
    return listToTree(tasks).map((todo) => new TaskItem(todo));
})
export const $filterTasksByProjectId = (projectId: Id) => $providerTasksAsTree.map((tasks) => tasks.filter((task) => task.projectId === projectId));

/**
 * Projects
 */
export const addProjects = createEvent<Project[]>();
export const $projects = createStore<Project[]>([])
    .on(addProjects, (state, projects) => [...state, ...projects])
    .on(fetchAllEntities.doneData, (state, { projects }) => [...state, ...projects]);

export const $projectsProvider = $projects.map((projects) => projects.map((project) => new ProjectItem(project)));

/**
 * Projects
 */
export const addNotes = createEvent<Note[]>();
export const $notes = createStore<Note[]>([])
    .on(addNotes, (state, notes) => [...state, ...notes]);
