import { merge } from 'effector';
import { TreeDataProvider, TreeItem, EventEmitter, ExtensionContext } from 'vscode';
import { Project, Section, Task } from './entities';
import { $tasksTreeLeaf, $projectsProvider, $filterTasksByProjectIdWithoutSectionId, $filterSectionsByProjectId, $filterTasksBySectionId, syncFx, $tasks, $projects, $sections, updateSections, updateProjects } from './models';
import { updateTasks } from './models/tasks';

import { ProjectItem } from './providers/ProjectItem';
import { SectionItem } from './providers/SectionItem';
import { TaskItem } from './providers/TaskItem';

export class TodoistTreeView implements TreeDataProvider<TodoistProviderItem> {

    private _onDidChangeTreeData = new EventEmitter<TodoistProviderItem | undefined>();

    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    syncInitialPromise: Promise<any>;

    constructor(context: ExtensionContext) {
        this.syncInitialPromise = syncFx(['projects', 'sections', 'items']);
        try {
            const persistedTasks: Task[] = JSON.parse(context.globalState.get('$tasks') ?? '[]');
            const persistedSections: Section[] = JSON.parse(context.globalState.get('$sections') ?? '[]');
            const persistedProjects: Project[] = JSON.parse(context.globalState.get('$projects') ?? '[]');

            updateTasks(persistedTasks);
            updateSections(persistedSections);
            updateProjects(persistedProjects);
        } catch (err) {
            console.info('smth went  wrong', err);
        }

        $tasksTreeLeaf.watch(() => {
            this.refresh();
        });

        $tasks.watch((payload) => {
            if (payload.length) {
                
                context.globalState.update('$tasks', JSON.stringify(payload));
            }
        });

        $projects.watch((payload) => {
            if (payload.length) {
                context.globalState.update('$projects', JSON.stringify(payload));
            }
        });

        $sections.watch((payload) => {
            if (payload.length) {
                context.globalState.update('$sections', JSON.stringify(payload));
            }
    
        });

    }

    refresh(element?: TodoistProviderItem): void {
        this._onDidChangeTreeData.fire(element);
    }

    getTreeItem(element: TodoistProviderItem): TreeItem {
        return element;
    }

    async getChildren(element?: TodoistProviderItem): Promise<TodoistProviderItem[]> {
        if (!element) {
            // // Чтобы показать лоадер в TreeView
            // await this.syncInitialPromise;

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
