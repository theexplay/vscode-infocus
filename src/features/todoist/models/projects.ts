import { createStore } from "effector";
import { Id } from "../../../lib/listToTree";
import { Project } from "../entities";
import { ProjectItem } from "../providers/ProjectItem";
import { sync } from "./common";

/** Stores */
export const $projects = createStore<Project[]>([]);

/** Computed stores */
export const $projectsProvider = $projects.map((projects) => projects.map((project) => new ProjectItem(project)));

export const $projectsMap = $projects.map((projects) => projects.reduce<Record<Id, Project>>((acc, project) => ({
    ...acc,
    [project.id]: project
}), {}));

$projects
    .on(sync.doneData, (state, { projects }) => [...state, ...projects]);
