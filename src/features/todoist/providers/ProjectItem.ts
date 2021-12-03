import path = require("path");
import { ThemeColor, ThemeIcon, TreeItem, TreeItemCollapsibleState } from "vscode";
import { Project } from "../entities";
import { $filterTasksByProjectIdWithoutSectionId, hasProjectItems } from "../models";

export class ProjectItem extends TreeItem {
    _raw: Project;
    contextValue = 'projectItem';
    id: string;

    constructor(project: Project) {
        super(project.name, TreeItemCollapsibleState.Collapsed);

        this.id = String(project.id);
        this._raw = project;
        this.iconPath = path.join(__filename, '..', '..', 'media', 'colours', project.color + '.svg');

        if (project.inbox_project) {
            this.iconPath = new ThemeIcon('inbox', new ThemeColor('textLink.foreground'));
        }

        const hasItems = Boolean(hasProjectItems(project.id).getState());

        if (!hasItems) {
            this.collapsibleState = TreeItemCollapsibleState.None;
        }
    }
};
