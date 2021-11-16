import { combine, createEvent, createStore } from "effector";
import { Project, Task, Note } from "../../entities/todoist";
import { Id, listToTree } from "../../lib/listToTree";
import { ProjectItem } from "./providers/ProjectItem";
import { TaskItem } from "./providers/TaskItem";

/**
 * Tasks
 */

export const addTasks = createEvent<Task[]>();
export const $tasks = createStore<Task[]>([])
    .on(addTasks, (state, todos) => [...state, ...todos]);

export const $providerTasksAsTree = $tasks.map((tasks) => {
    return listToTree(tasks).map((todo) => new TaskItem(todo));
})
export const $filterTasksByProjectId = (projectId: Id) => $providerTasksAsTree.map((tasks) => tasks.filter((task) => task.projectId === projectId));

/**
 * Projects
 */
export const addProjects = createEvent<Project[]>();
export const $projects = createStore<Project[]>([])
    .on(addProjects, (state, projects) => [...state, ...projects]);

export const $projectsProvider = $projects.map((projects) => projects.map((project) => new ProjectItem(project)));

/**
 * Projects
 */
export const addNotes = createEvent<Note[]>();
export const $notes = createStore<Note[]>([])
    .on(addNotes, (state, notes) => [...state, ...notes]);

