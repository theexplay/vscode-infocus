import { createEffect } from "effector";
import { todoistApi } from "../api";

export const syncFx = createEffect(async (resourceTypes?: string[]) => {
    await todoistApi.sync(resourceTypes);

    return {
        tasks: todoistApi.items.get(),
        projects: todoistApi.projects.get(),
        sections: todoistApi.sections.get(),
    };
});
