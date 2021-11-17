
import { TreeDataProvider, TreeItem, EventEmitter } from 'vscode';

import { $projectsProvider, $filterTasksByProjectId, fetchAllEntities } from './model';
import { ProjectItem } from './providers/ProjectItem';
import { TaskItem } from './providers/TaskItem';

export class TodoistTreeView implements TreeDataProvider<TodoistProviderItem> {

    private _onDidChangeTreeData = new EventEmitter<TodoistProviderItem | undefined>();

    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    refresh(element?: TodoistProviderItem): void {
        this._onDidChangeTreeData.fire(element);
    }

    getTreeItem(element: TodoistProviderItem): TreeItem {
        return element;
    }

    async getChildren(element?: TodoistProviderItem): Promise<TodoistProviderItem[]> {
        if (!element) {
            await fetchAllEntities();

            return $projectsProvider.getState();
        } else if (element instanceof ProjectItem) {

            return $filterTasksByProjectId(element._raw.id).getState();
        } else if (element instanceof TaskItem) {

            return element.children ?? [];
        } else {
            return [];
        }
    }
}

type TodoistProviderItem = ProjectItem | TaskItem;
