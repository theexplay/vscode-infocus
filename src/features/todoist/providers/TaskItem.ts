import { TreeItem, TreeItemCollapsibleState, ThemeIcon } from "vscode";
import { Task } from "../../../entities/todoist";
import { Id } from "../../../lib/listToTree";
import { WithChildren } from "../../../lib/types";

export enum TaskIcon {
    Completed = 'pass-filled',
    Uncompleted = 'circle-large-outline',
}

export const getTaskIcon = (completed: boolean) => new ThemeIcon(completed ? TaskIcon.Completed : TaskIcon.Uncompleted)

export class TaskItem extends TreeItem {
    contextValue = 'taskitem';

    children: WithChildren<TaskItem>[] = [];

    _raw: Task;

    id: string;

    parentId?: Id;

    projectId: Id;

    completed: boolean;

    constructor(
        task: WithChildren<Task>
    ) {
        super(task.content, task.children.length ? TreeItemCollapsibleState.Expanded : TreeItemCollapsibleState.None);

        this._raw = task;
        this.iconPath = getTaskIcon(task.completed);
        this.id = String(task.id);
        this.description = task.description;
        this.parentId = task.parent_id;
        this.projectId = task.project_id;
        this.completed = task.completed;
        this.children = task.children.map((task) => new TaskItem(task));

        // TODO: сделать открытие TreeView или Webview для отображения подробной информации
        // this.command = {
        //     command: "infocus.helloWorld",
        //     title: '',
        //     arguments: [task.id]
        // };
    }

    pushTaskToChildrens(task: TaskItem) {
        this.children.push(task);
    }
}
