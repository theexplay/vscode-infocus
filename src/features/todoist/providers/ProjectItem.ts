import path = require("path");
import { TreeItem, TreeItemCollapsibleState } from "vscode";
import { Project } from "../entities";

export class ProjectItem extends TreeItem {
    _raw: Project;
    contextValue = 'project';

    constructor(project: Project) {
        super(project.name, TreeItemCollapsibleState.Collapsed);

        this.id = String(project.id);
        this._raw = project;
        this.iconPath = path.join(__filename, '..', '..', 'media', 'colours', project.color + '.svg');
    }
};
