import path = require("path");
import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from "vscode";
import { Id } from "../../../lib/listToTree";
import { Section } from "../entities";

export class SectionItem extends TreeItem {
    _raw: Section;
    contextValue = 'sectionItem';
    projectId: Id;

    constructor(section: Section) {
        super(section.name, TreeItemCollapsibleState.Collapsed);

        this.id = String(section.id);
        this._raw = section;
        this.projectId = section.project_id;

        this.tooltip = section.name + ' (section)';
        this.iconPath = new ThemeIcon('folder-opened');
    }
};
