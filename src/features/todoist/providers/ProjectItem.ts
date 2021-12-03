import path = require("path");
import { ThemeColor, ThemeIcon, TreeItem, TreeItemCollapsibleState } from "vscode";
import { Project } from "../entities";

export class ProjectItem extends TreeItem {
    _raw: Project;
    contextValue = 'projectItem';

    constructor(project: Project) {
        super(project.name, TreeItemCollapsibleState.Collapsed);

        this.id = String(project.id);
        this._raw = project;
        this.iconPath = path.join(__filename, '..', '..', 'media', 'colours', project.color + '.svg');

        if (project.inbox_project) {
            this.iconPath = new ThemeIcon('inbox', new ThemeColor('textLink.foreground'));
        }
    }
};
