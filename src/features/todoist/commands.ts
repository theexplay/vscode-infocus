import * as schedule from 'node-schedule';
import { format, isPast, isToday } from 'date-fns';
import { commands, env, ExtensionContext, ProgressLocation, ProgressOptions, QuickPickItem, Uri, window } from "vscode";
import { TaskItem } from "./providers/TaskItem";
import { $projects, $projectsMap, addTaskFx, syncFx, completeTaskFx, updateTaskFx, uncompleteTaskFx, updateSectionFx, $projectsProviderMap, $tasks, updateProjectFx, addSectionFx, UPCOMING_PROJECT, TODAY_PROJECT, MISSING_PROJECT, removeSectionFx } from "./models";
import { ProjectItem } from "./providers/ProjectItem";
import { Id } from "../../lib/listToTree";
import { withAsyncProgress } from "../../lib/withAsyncProgress";
import { SectionItem } from "./providers/SectionItem";
import { Task } from './entities';
import { DueDate } from 'todoist/dist/v8-types';

export function registerTodoistCommands(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('infocus.todoist.openTreeView', () => {
      commands.executeCommand('workbench.view.extension.infocus-sidebar-container');
    }),
    commands.registerCommand('infocus.todoist.toggleTask', toggleTask),
    commands.registerCommand('infocus.todoist.openLinkFromTask', openLinkFromTask),
    commands.registerCommand('infocus.todoist.editTask', editTask),
    commands.registerCommand('infocus.todoist.copyTask', copyTask),
    commands.registerCommand('infocus.todoist.addTask', addTask),
    commands.registerCommand('infocus.todoist.openTaskInBrowser', openInBrowser),
    commands.registerCommand('infocus.todoist.refresh', refresh),
    commands.registerCommand('infocus.todoist.sectionRename', sectionRename),
    commands.registerCommand('infocus.todoist.removeSection', removeSection),
    commands.registerCommand('infocus.todoist.sectionAddTask', sectionAddTask),
    commands.registerCommand('infocus.todoist.openTextDocument', openTextDocument),
    commands.registerCommand('infocus.todoist.projectRename', projectRename),
    commands.registerCommand('infocus.todoist.addSection', addSectionToProject),
  );

  tasksDateObserver();
}

const progressOptions: ProgressOptions = {
  location: ProgressLocation.Notification,
  title: "Syncing with Todoist",
  cancellable: false
};

async function toggleTask(task: TaskItem): Promise<void> {
  const completed = !!task._raw.checked;

  await withAsyncProgress(
    progressOptions,
    completed ? uncompleteTaskFx(task._raw) : completeTaskFx(task._raw)
  );

  setTimeout(async () => {
    const action = await window.showInformationMessage(`1 task completed`, 'Undo', 'Close');

    if (action === 'Undo') {
      await withAsyncProgress(
        progressOptions,
        completed ? completeTaskFx(task._raw) : uncompleteTaskFx(task._raw)
      );
    }
  }, 400);
}

async function editTask(task: TaskItem): Promise<void> {
  const { project_id, content, id } = task._raw;
  // eslint-disable-next-line effector/no-getState
  const selectedProject = $projectsMap.getState()[project_id];

  const newContent = await window.showInputBox({
    title: `Edit task in project: ${selectedProject.name}`,
    value: content,
    valueSelection: [-1, -1],
  });

  if (newContent) {
    await withAsyncProgress(
      progressOptions,
      updateTaskFx({
        id,
        content: newContent,
      })
    );
  }
}

async function copyTask(task: TaskItem): Promise<void> {
  env.clipboard.writeText(task._raw.content);
  window.showInformationMessage('Copied to clipboard!');
}

function openLinkFromTask(task: TaskItem) {
  const { link } = task;

  if (link) {
    commands.executeCommand('vscode.open', Uri.parse(link));
  }
}

async function addTask(project?: ProjectItem, taskContent?: string, section?: SectionItem): Promise<void> {
  // eslint-disable-next-line effector/no-getState
  const formattedProjects: ({ id: Id } & QuickPickItem)[] = $projects.getState().map((project) => ({
    label: project.name,
    description: 'some description',
    id: project.id
  }));

  const selectedProject = project ?? await window.showQuickPick(formattedProjects, {
    title: 'Select a project where to create a task',
  });

  let due: DueDate | undefined;

  if ([
    String(UPCOMING_PROJECT.id),
    String(MISSING_PROJECT.id),
    String(TODAY_PROJECT.id)
  ].includes(String(selectedProject?.id))) {
    try {
      const selectedDate = await window.showInputBox({
        title: `Enter due date`,
        placeHolder: format(new Date(), 'yyyy-MM-dd'),
        value: format(new Date(), 'yyyy-MM-dd'),
        valueSelection: [-2, -2],
        prompt: 'Valid example: 2022-10-21 (YEAR-MONTH-DAY)',
        validateInput: (value: string) => {
          if (/^\d{4}\-\d{1,2}\-\d{1,2}$/g.test(value)) {
            return '';
          }
          return 'Invalid time value.';
        }
      });

      due = {
        date: selectedDate!,
        is_recurring: false,
        lang: "en",
        string: format(new Date(selectedDate!), 'd MMM'),
        // @ts-ignore
        timezone: null
      };
    } catch (e) {
      return;
    }
  }

  if (selectedProject) {
    const msg = !due ?
      `To create task in project: ${selectedProject.label}. ${section ? `In section: ${section.label}` : ''}` :
      `Creating task with due date: "${due.date}" .`;
    const task = await window.showInputBox({
      title: msg,
      placeHolder: 'Task name',
      value: taskContent,
      valueSelection: [-1, -1],
    });

    if (task?.trim()) {
      await withAsyncProgress(
        progressOptions,
        addTaskFx({
          content: task,
          project_id: selectedProject.id,
          section_id: section?._raw.id ?? undefined,
          due
        })
      );
    }
  }
}

async function openInBrowser(task: TaskItem | Task): Promise<void> {
  commands.executeCommand('vscode.open', Uri.parse(`https://todoist.com/app/task/${task.id}`));
}

async function refresh(): Promise<void> {
  await withAsyncProgress(
    progressOptions,
    syncFx()
  );
}

async function removeSection(section: SectionItem): Promise<void> {
  const YES_NO = (await window.showWarningMessage(
    `Do you really want to remove section '${section._raw.name}' with all tasks?`,
    {
      modal: true
    },
    'Yes', 'No'
  )) as 'Yes' | 'No' | undefined;

  if (YES_NO === 'Yes') {
    await withAsyncProgress(
      progressOptions,
      removeSectionFx({
        id: section._raw.id,
      })
    );
  }
}

async function sectionRename(section: SectionItem) {
  const sectionName = await window.showInputBox({
    title: `Editing section:`,
    placeHolder: 'Section name',
    value: section._raw.name,
    valueSelection: [-1, -1],
  });

  if (sectionName) {
    await withAsyncProgress(
      progressOptions,
      updateSectionFx({
        // @ts-ignore
        id: section._raw.id,
        name: sectionName
      })
    );
  }
}

async function projectRename(project: ProjectItem) {
  const projectName = await window.showInputBox({
    title: `Editing project:`,
    placeHolder: 'Project name',
    value: project._raw.name,
    valueSelection: [-1, -1],
    prompt: 'Enter new project name'
  });

  if (projectName) {
    await withAsyncProgress(
      progressOptions,
      updateProjectFx({
        id: project._raw.id,
        name: projectName
      })
    );
  }
}

async function addSectionToProject(project: ProjectItem) {
  const sectionName = await window.showInputBox({
    title: `Creating section in project: ${project.label}`,
    placeHolder: 'Section name',
    valueSelection: [-1, -1],
    prompt: 'Enter new section name'
  });

  if (sectionName) {
    await withAsyncProgress(
      progressOptions,
      addSectionFx({
        project_id: project._raw.id,
        name: sectionName
      })
    );
  }
}

async function sectionAddTask(section: SectionItem) {
  const { project_id } = section._raw;
  // eslint-disable-next-line effector/no-getState
  const project = $projectsProviderMap.getState()[project_id];
  addTask(project, undefined, section);
}

async function openTextDocument(uri: Uri) {
  env.openExternal(uri);
}

function tasksDateObserver() {
  // Map of tasks id which was already shown to user
  const notifiedTasks: Record<number, boolean> = {};
  // Watch sync status, cause at first persist state from global storage,
  // it may be outdated or changed after new sync
  syncFx.done.watch(() => {
    // eslint-disable-next-line effector/no-getState
    const tasks = $tasks.getState();
    // @ts-ignore
    schedule.gracefulShutdown();

    if (tasks.length) {
      tasks.forEach(async (task) => {
        if (task?.due?.date && !task.checked) {
          const taskDate = new Date(task.due.date);

          if (!notifiedTasks[task.id]) {
            if (isToday(taskDate)) {
              schedule.scheduleJob(taskDate, async () => {
                showMessageWithSheduleAction(task, `Task due now: ${task.content}`);
              });
            } else if (isPast(taskDate)) {
              showMessageWithSheduleAction(task, `You missed due date. Task: ${task.content}`);
            }

            notifiedTasks[task.id] = true;
          }
        }
      });
    }
  });
}

enum SheduleAction {
  MarkAsCompleted = 'Mark as completed',
  OpenInBrowser = 'Open in browser',
}

async function showMessageWithSheduleAction(task: Task, message: string) {
  const action = await window.showInformationMessage(message, SheduleAction.MarkAsCompleted, SheduleAction.OpenInBrowser);

  switch (action) {
    case SheduleAction.MarkAsCompleted:
      // FIXME: models/tasks/$tasksTreeLeaf
      toggleTask(new TaskItem({ ...task, children: [] }));
      break;
    case SheduleAction.OpenInBrowser:
      openInBrowser(task);
      break;
  }
}
