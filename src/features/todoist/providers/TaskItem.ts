import { TreeItem, TreeItemCollapsibleState, ThemeIcon, Uri } from "vscode";
import { Task } from "../entities";
import { Id } from "../../../lib/listToTree";
import { WithChildren } from "../../../lib/types";

export enum TaskIcon {
    Completed = 'pass-filled',
    Uncompleted = 'circle-large-outline',
}

export const getTaskIcon = (completed: number) => new ThemeIcon(!!completed ? TaskIcon.Completed : TaskIcon.Uncompleted);

const URI_REGEX = /\[([^\[]+)\]\((.*)\)/gm;

export class TaskItem extends TreeItem {
    _raw: Task;
    contextValue = 'taskItem';
    id: string;
    parentId?: Id;
    projectId: Id;
    sectionId: Id;
    completed: number;
    children: WithChildren<TaskItem>[] = [];
    link?: string;

    constructor(
        task: WithChildren<Task>
    ) {
        super(task.content, task.children.length ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None);

        this._raw = task;
        this.iconPath = getTaskIcon(task.checked);
        this.id = String(task.id);
        this.parentId = task.parent_id;
        this.projectId = task.project_id;
        this.sectionId = task.section_id;
        this.completed = task.checked;
        this.children = task.children.map((task) => new TaskItem(task));

        const match = task.content.match(/(vscode:\/\/\S*)/gmi);

        if (match) {
            const [url] = match;

            this.command = {
                title: 'open file',
                command: 'infocus.todoist.openTextDocument',
                arguments: [url]
            };
        }

        // Create new instance of regex, cause of lastIndex position
        const [fullmatch, text, link] = (new RegExp(URI_REGEX)).exec(task.content) ?? [];

        if (link) {
            this.link = link;
            this.contextValue += ',taskItem-hasLink';
            this.tooltip = task.content;

            const label = task.content.replace(fullmatch, text);
            const index = label.indexOf(text);
            this.label = {
                label,
                highlights: [[index, index + text.length]]
            };
        }
    }

    pushTaskToChildrens(task: TaskItem) {
        this.children.push(task);
    }
}
