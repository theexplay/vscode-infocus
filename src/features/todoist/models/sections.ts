import { createEffect, createStore, merge } from "effector";
import { SectionUpdate } from "todoist/dist/v8-types";
import { Id } from "../../../lib/listToTree";
import { todoistApi } from "../api";
import { Section } from "../entities";
import { SectionItem } from "../providers/SectionItem";
import { syncFx } from "./common";

/** Stores */
export const $sections = createStore<Section[]>([]);

/** Computed stores */
export const $sectionsProvider = $sections.map((sections) => sections.map((section) => new SectionItem(section)));

export const updateSectionFx = createEffect(async (section: SectionUpdate) => todoistApi.sections.update(section));

export const $filterSectionsByProjectId = (projectId: Id) => $sectionsProvider.map(
    (sections) => sections.filter((section) => section.projectId === projectId)
);

$sections
    .on(syncFx.doneData, (_, { sections }) => [...sections]);

merge([
    updateSectionFx.done,
]).watch(async () => {
    await syncFx();
})
