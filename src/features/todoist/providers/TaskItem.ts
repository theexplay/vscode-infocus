import { TreeItem, TreeItemCollapsibleState, ThemeIcon, Uri } from "vscode";
import type { Task } from "../entities";
import type { Id } from "../../../lib/listToTree";
import type { WithChildren } from "../../../lib/types";

export enum TaskIcon {
    Completed = 'pass-filled',
    Uncompleted = 'circle-large-outline',
    UncompletableTask = 'root-folder',
}

export const getTaskIcon = (completed: boolean, isUncompletable: boolean) => {
    if (isUncompletable) {
        return new ThemeIcon(TaskIcon.UncompletableTask);
    }

    return new ThemeIcon(completed ? TaskIcon.Completed : TaskIcon.Uncompleted);
};

const URI_REGEX = /\[([^\[]+)\]\((.*)\)/gm;

export class TaskItem extends TreeItem {
    _raw: Task;
    contextValue = 'taskItem';
    id: string;
    parentId?: Id;
    projectId: Id;
    sectionId: Id;
    completed: boolean;
    children: WithChildren<TaskItem>[] = [];
    link?: string;
    treeDepthLevel: number;

    isUncompletable: boolean;

    constructor(
        task: WithChildren<Task>,
        level: number = 0
    ) {
        super(task.content, task.children.length ? TreeItemCollapsibleState.Collapsed : TreeItemCollapsibleState.None);

        this._raw = task;
        this.isUncompletable = /^\*\s.+/.test(task.content);
        this.iconPath = getTaskIcon(task.checked, this.isUncompletable);
        this.id = `${String(task.id)}_${Math.floor(Math.random() * 1000)}`;
        this.parentId = task.parent_id;
        this.projectId = task.project_id;
        this.sectionId = task.section_id;
        this.completed = task.checked;
        this.children = task.children.map((task) => new TaskItem(task, level + 1));
        this.treeDepthLevel = level;

        const match = (new RegExp(/(vscode:\/\/\S*\d)\)?$/gm)).exec(task.content) ?? [];

        if (match?.length) {
            const [, url] = match;

            if (url) {
                this.command = {
                    title: 'open file',
                    command: 'infocus.todoist.openTextDocument',
                    arguments: [url]
                };
            }
        }

        const MAX_DEPTH_LEVEL_SUBTASKS = 4;
        if (this.treeDepthLevel < MAX_DEPTH_LEVEL_SUBTASKS) {
            this.contextValue += ',taskItem-addSubTask';
        }

        // Create new instance of regex, cause of lastIndex position
        const [fullmatch, text, link] = (new RegExp(URI_REGEX)).exec(task.content) ?? [];

        if (link) {
            this.link = link;
            this.contextValue += ',taskItem-hasLink';
            this.tooltip = task.content;

            if (fullmatch) {
                const label = task.content.replace(fullmatch, text);
                const index = label.indexOf(text);
                this.label = {
                    label,
                    highlights: [[index, index + text.length]]
                };
            }
        }

        if (this.isUncompletable) {
            this.contextValue = 'taskUncompletable';
        }
    }

    pushTaskToChildrens(task: TaskItem) {
        this.children.push(task);
    }
}
