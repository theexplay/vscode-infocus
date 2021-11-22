import path = require("path");
import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { Id } from "../../../lib/listToTree";
import { Section } from "../entities";

export class SectionItem extends TreeItem {
    _raw: Section;
    contextValue = 'Section';
    projectId: Id;

    constructor(section: Section) {
        super(section.name, TreeItemCollapsibleState.Expanded);

        this.id = String(section.id);
        this._raw = section;
        this.projectId = section.project_id;
    }
};
