import { isFuture, isPast, isToday } from 'date-fns';
import { merge } from 'effector';
import { TreeDataProvider, TreeItem, EventEmitter, ExtensionContext } from 'vscode';
import { Project, Section, Task } from './entities';

import {
    $tasksTreeLeaf,
    $projectsProvider,
    $filterTasksByProjectIdWithoutSectionId,
    $filterSectionsByProjectId,
    $filterTasksBySectionId,
    syncFx,
    $tasks,
    $projects,
    $sections,
    updateTasks,
    updateSections,
    updateProjects,
    $sectionsProvider,
    $filterTasksByTodayDue,
    $dateSections,
    $filterTasksByDate,
    UPCOMING_PROJECT,
    TODAY_PROJECT,
    MISSING_PROJECT,
} from './models';
import { DateSectionItem } from './providers/DateSectionItem';

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
            console.info('smth went wrong', err);
        }

        merge([
            $tasksTreeLeaf,
            $projectsProvider,
            $sectionsProvider,
        ]).watch(() => {
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
            // eslint-disable-next-line effector/no-getState
            return $projectsProvider.getState();
        } else if (element instanceof ProjectItem) {
            if ([String(UPCOMING_PROJECT.id), String(MISSING_PROJECT.id)].includes(element.id)) {
                const isMissed = element.id === String(MISSING_PROJECT.id);
                // eslint-disable-next-line effector/no-getState
                return Object.values($dateSections.getState())
                    .filter((dateSection) => {
                        const date = new Date(dateSection.date);

                        return isMissed ? !isFuture(date) && !isToday(date) : !isPast(date) && !isToday(date);
                    })
                    .sort((a, b) => {
                        const aDate = (new Date(a.date)).getTime();
                        const bDate = (new Date(b.date)).getTime();
                        return aDate - bDate;
                    })
                    .map((section) => new DateSectionItem(section));
            }

            if (element.id === String(TODAY_PROJECT.id)) {
                return $filterTasksByTodayDue().getState();
            }

            const sections = $filterSectionsByProjectId(element._raw.id).getState().sort((a, b) => a._raw.section_order - b._raw.section_order);
            const tasks = $filterTasksByProjectIdWithoutSectionId(element._raw.id).getState().sort((a, b) => a._raw.child_order - b._raw.child_order);

            return [...sections, ...tasks];
        } else if (element instanceof SectionItem) {
            const tasksInSection = $filterTasksBySectionId(element._raw.id).getState();
            const tasksInProject = $filterTasksByProjectIdWithoutSectionId(element._raw.id).getState();

            return [...tasksInSection, ...tasksInProject];
        } else if (element instanceof DateSectionItem) {
            return $filterTasksByDate(element.id!).getState();
        } else if (element instanceof TaskItem) {
            return element.children ?? [];
        } else {
            return [];
        }
    }
}

type TodoistProviderItem = ProjectItem | TaskItem | SectionItem | DateSectionItem;
