import { createEffect } from "effector";
import { apiClient } from "../api";

export const fetchAllEntitiesFx = createEffect(async (forceUpdate: boolean = false) => {
    const { items: tasks, projects, sections } = await apiClient.getAllResources(forceUpdate);

    return {
        tasks,
        projects,
        sections,
    }
});
