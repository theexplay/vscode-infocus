import { DueDate } from "todoist/dist/v8-types";
import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from "vscode";


export class DateSectionItem extends TreeItem {
    _raw: DueDate;
    contextValue = 'dateSectionItem';

    constructor(section: DueDate) {
        super(section.string, TreeItemCollapsibleState.Expanded);

        this.id = String(section.date);
        this._raw = section;

        this.tooltip = section.string;
        this.iconPath = new ThemeIcon('circle-filled');
    }
};
