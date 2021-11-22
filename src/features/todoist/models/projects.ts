import { createStore } from "effector";
import { Project } from "../entities";
import { ProjectItem } from "../providers/ProjectItem";
import { fetchAllEntitiesFx } from "./common";

/** Stores */
export const $projects = createStore<Project[]>([]);

/** Computed stores */
export const $projectsProvider = $projects.map((projects) => projects.map((project) => new ProjectItem(project)));

$projects
    .on(fetchAllEntitiesFx.doneData, (state, { projects }) => [...state, ...projects]);
