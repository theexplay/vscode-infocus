import { createEffect } from "effector";
import { todoistApi } from "../api";
import { Project } from "../entities";

// Fake projects
export const UPCOMING_PROJECT = {
    id: 999999998,
    name: 'Upcoming',
    color: null,
    parent_id: null,
    child_order: 1,
    collapsed: 0,
    shared: false,
    is_deleted: 0,
    is_archived: 0,
    is_favorite: 0,
    sync_id: null,
} as unknown as Project;

export const MISSING_PROJECT = {
    id: 999999997,
    name: 'Missed',
    color: null,
    parent_id: null,
    child_order: 1,
    collapsed: 0,
    shared: false,
    is_deleted: 0,
    is_archived: 0,
    is_favorite: 0,
    sync_id: null,
} as unknown as Project;

export const TODAY_PROJECT = {
    id: 999999999,
    name: 'Today',
    color: null,
    parent_id: null,
    child_order: 1,
    collapsed: 0,
    shared: false,
    is_deleted: 0,
    is_archived: 0,
    is_favorite: 0,
    sync_id: null,
} as unknown as Project;


export const syncFx = createEffect(async (resourceTypes?: string[]) => {
    await todoistApi.sync(resourceTypes);

    const projects = [
        TODAY_PROJECT,
        UPCOMING_PROJECT,
        MISSING_PROJECT,
        ...todoistApi.projects.get()
    ];

    return {
        tasks: todoistApi.items.get(),
        projects: projects,
        sections: todoistApi.sections.get(),
    };
});
