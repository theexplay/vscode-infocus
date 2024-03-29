import { combine, createEffect, createEvent, createStore, merge } from "effector";
import { ProjectUpdate } from "todoist/dist/v9-types";
import { Id } from "../../../lib/listToTree";
import { todoistApi } from "../api";
import { Project } from "../entities";
import { ProjectItem } from "../providers/ProjectItem";
import { syncFx } from "./common";
import { $sections } from "./sections";
import { $tasks } from "./tasks";

export const updateProjectFx = createEffect(async (project: ProjectUpdate) => todoistApi.projects.update(project));

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

export const projectHasAnyItems = (projectId: string) => combine(
    $tasks,
    $sections,
    (tasks, sections) => [...tasks, ...sections].some(({ project_id }) => project_id === projectId)
);

$projects
    .on(syncFx.doneData, (_, { projects }) => {
        return [...projects];
    })
    .on(updateProjects, (_, projects) => [...projects]);

merge([
    updateProjectFx.done
]).watch(async () => {
    await syncFx();
});
