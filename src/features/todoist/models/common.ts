import { createEffect } from "effector";
import { todoistApi } from "../api";

export const sync = createEffect(async () => {
    await todoistApi.sync();

    return {
        tasks: todoistApi.items.get(),
        projects: todoistApi.projects.get(),
        sections: todoistApi.sections.get(),
    }
});
