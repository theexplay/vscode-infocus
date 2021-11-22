import { TreeDataProvider, TreeItem, EventEmitter } from 'vscode';
import { $tasksTreeLeaf, $projectsProvider, $filterTasksByProjectIdWithoutSectionId, $filterSectionsByProjectId, $filterTasksBySectionId } from './models';

import { ProjectItem } from './providers/ProjectItem';
import { SectionItem } from './providers/SectionItem';
import { TaskItem } from './providers/TaskItem';

export class TodoistTreeView implements TreeDataProvider<TodoistProviderItem> {

    private _onDidChangeTreeData = new EventEmitter<TodoistProviderItem | undefined>();

    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor() {
        $tasksTreeLeaf.watch(() => {
            this.refresh();
        })
    }

    refresh(element?: TodoistProviderItem): void {
        this._onDidChangeTreeData.fire(element);
    }

    getTreeItem(element: TodoistProviderItem): TreeItem {
        return element;
    }

    async getChildren(element?: TodoistProviderItem): Promise<TodoistProviderItem[]> {
        if (!element) {
            return $projectsProvider.getState();
        } else if (element instanceof ProjectItem) {
            const sections = $filterSectionsByProjectId(element._raw.id).getState().sort((a, b) => a._raw.section_order - b._raw.section_order);
            const tasks = $filterTasksByProjectIdWithoutSectionId(element._raw.id).getState().sort((a, b) => a._raw.child_order - b._raw.child_order);

            return [...sections, ...tasks];
        } else if (element instanceof SectionItem) {
            const tasksInSection = $filterTasksBySectionId(element._raw.id).getState();
            const tasksInProject = $filterTasksByProjectIdWithoutSectionId(element._raw.id).getState()

            return [...tasksInSection, ...tasksInProject];
        } else if (element instanceof TaskItem) {

            return element.children ?? [];
        } else {
            return [];
        }
    }
}

type TodoistProviderItem = ProjectItem | TaskItem | SectionItem;
