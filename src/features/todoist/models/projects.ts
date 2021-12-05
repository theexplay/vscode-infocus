import { createEvent, createStore } from "effector";
import { Id } from "../../../lib/listToTree";
import { Project } from "../entities";
import { ProjectItem } from "../providers/ProjectItem";
import { syncFx } from "./common";
import { $tasks } from "./tasks";

/** Events */
export const updateProjects = createEvent<Project[]>();

/** Stores */
export const $projects = createStore<Project[]>([]);

/** Computed stores */
export const $projectsProvider = $projects.map((projects) => projects.map((project) => new ProjectItem(project)));
export const $projectsProviderMap = $projectsProvider.map((projects) => projects.reduce<Record<Id, ProjectItem>>((acc, project) => ({
    ...acc,
    [project.id]: project
}), {}));

export const $projectsMap = $projects.map((projects) => projects.reduce<Record<Id, Project>>((acc, project) => ({
    ...acc,
    [project.id]: project
}), {}));

export const hasProjectItems = (projectId: number) => $tasks.map((tasks) =>
    tasks.some(({ project_id }) => project_id === projectId)
);

$projects
    .on(syncFx.doneData, (_, { projects }) => {
        return [...projects];
    })
    .on(updateProjects, (_, projects) => [...projects]);
