import { createStore } from "effector";
import { Id } from "../../../lib/listToTree";
import { Section } from "../entities";
import { SectionItem } from "../providers/SectionItem";
import { sync } from "./common";

/** Stores */
export const $sections = createStore<Section[]>([]);

/** Computed stores */
export const $sectionsProvider = $sections.map((sections) => sections.map((section) => new SectionItem(section)));

$sections
    .on(sync.doneData, (state, { sections }) => [...state, ...sections]);


export const $filterSectionsByProjectId = (projectId: Id) => $sectionsProvider.map(
    (sections) => sections.filter((section) => section.projectId === projectId)
);
