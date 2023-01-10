import { createEffect, createEvent, createStore, merge } from "effector";
import { SectionAdd, SectionDelete, SectionUpdate } from "todoist/dist/v9-types";
import { Id } from "../../../lib/listToTree";
import { todoistApi } from "../api";
import { Section } from "../entities";
import { SectionItem } from "../providers/SectionItem";
import { syncFx } from "./common";

export const updateSectionFx = createEffect(async (section: SectionUpdate) => todoistApi.sections.update(section));

export const removeSectionFx = createEffect(async (section: SectionDelete) => todoistApi.sections.delete(section));

export const addSectionFx = createEffect(async (section: SectionAdd) => todoistApi.sections.add(section));

/** Events */
export const updateSections = createEvent<Section[]>();

/** Stores */
export const $sections = createStore<Section[]>([]);

/** Computed stores */
export const $sectionsProvider = $sections.map((sections) => sections.map((section) => new SectionItem(section)));

export const $filterSectionsByProjectId = (projectId: Id) => $sectionsProvider.map(
    (sections) => sections.filter((section) => section.projectId === projectId)
);

$sections
    .on(syncFx.doneData, (_, { sections }) => [...sections])
    .on(updateSections, (_, sections) => [...sections]);

merge([
    updateSectionFx.done,
    addSectionFx.done,
    removeSectionFx.done,
]).watch(async () => {
    await syncFx();
});
