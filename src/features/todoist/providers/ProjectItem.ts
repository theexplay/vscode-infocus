import path = require("path");
import { ThemeColor, ThemeIcon, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";
import { Project } from "../entities";
import { MISSING_PROJECT, projectHasAnyItems, TODAY_PROJECT, UPCOMING_PROJECT } from "../models";

const CONTEXT_VALUES = {
    projectItem: 'projectItem',
    dateProjectItem: 'dateProjectItem',
};

export class ProjectItem extends TreeItem {
    _raw: Project;
    contextValue = CONTEXT_VALUES.projectItem;
    id: string;

    constructor(project: Project) {
        super(project.name, TreeItemCollapsibleState.Collapsed);

        this.id = String(project.id);
        this._raw = project;
        this.iconPath = path.join(__filename, '..', '..', 'media', 'colours', project.color + '.svg');

        if (project.inbox_project) {
            this.iconPath = new ThemeIcon('inbox', new ThemeColor('textLink.foreground'));
        }

        const hasItems = Boolean(projectHasAnyItems(project.id).getState());

        if (!hasItems) {
            this.collapsibleState = TreeItemCollapsibleState.None;
        }

        // TODO: Refactor, create another Provider for this views
        // Fake projects
        if ([UPCOMING_PROJECT.id, TODAY_PROJECT.id, MISSING_PROJECT.id].includes(project.id)) {
            this.contextValue = CONTEXT_VALUES.dateProjectItem;
            this.collapsibleState = TreeItemCollapsibleState.Collapsed;

            switch (project.id) {
                case UPCOMING_PROJECT.id:
                    this.iconPath = new ThemeIcon('calendar', new ThemeColor('textLink.activeForeground'));
                    break;
                case MISSING_PROJECT.id:
                    this.iconPath = new ThemeIcon('clock', new ThemeColor('textLink.activeForeground'));
                    break;
                case TODAY_PROJECT.id:
                    this.iconPath = new ThemeIcon('diff-modified', new ThemeColor('editor.inlineValuesForeground'));
                    break;
            }
        }
    }
};
