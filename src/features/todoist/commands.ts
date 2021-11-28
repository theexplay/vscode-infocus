import { commands, ExtensionContext, ProgressLocation, ProgressOptions, QuickPickItem, Uri, window } from "vscode";
import { Integration } from "../../lib/constants";
import { providerStore } from "../../stores";
import { TaskItem } from "./providers/TaskItem";
import { $projects, $projectsMap, addTaskFx, sync, completeTaskFx, updateTaskFx, uncompleteTaskFx } from "./models";
import { ProjectItem } from "./providers/ProjectItem";
import { Id } from "../../lib/listToTree";
import { withAsyncProgress } from "../../lib/withAsyncProgress";

export function registerTodoistCommands(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('infocus.todoist.openTreeView', () => {
      commands.executeCommand('workbench.view.extension.infocus-sidebar-container');
    }),
    commands.registerCommand(`infocus.todoist.toggleTask`, toggleTask),
    commands.registerCommand('infocus.todoist.editTask', editTask),
    commands.registerCommand('infocus.todoist.deleteTask', deleteTask),
    commands.registerCommand('infocus.todoist.addTask', addTask),
    commands.registerCommand('infocus.todoist.openTaskInBrowser', openInBrowser),
    commands.registerCommand('infocus.todoist.refresh', refresh),
  );
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
  )

  // @ts-ignore
  providerStore.get(Integration.todoist).refresh(task);

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
  const projects = $projectsMap.getState()
  const selectedProject = projects[project_id]

  const newContent = await window.showInputBox({
    title: `Edit task in project: ${selectedProject.name}`,
    value: content
  });

  if (newContent) {
    await window.withProgress(progressOptions, async (progress) => {
      progress.report({ increment: 30 });

      await updateTaskFx({
        id,
        content: newContent,
      });

      progress.report({ increment: 70, });
    });
  }
}

async function deleteTask(task: TaskItem): Promise<void> {

}

async function addTask(project?: ProjectItem): Promise<void> {
  const formattedProjects: ({ id: Id } & QuickPickItem)[] = $projects.getState().map((project) => ({
    label: project.name,
    description: 'some description',
    id: project.id
  }));

  const selectedProject = project ?? await window.showQuickPick(formattedProjects, {
    title: 'Select a project where to create a task',
  });

  if (selectedProject) {
    const task = await window.showInputBox({
      title: `Creating task in project: ${selectedProject.label}`,
      placeHolder: 'Task name',
    });

    if (task?.trim()) {
      await window.withProgress(progressOptions, async (progress) => {
        progress.report({ increment: 30 });

        await addTaskFx({
          content: task,
          project_id: selectedProject.id
        })

        progress.report({ increment: 70, });
      });
    }
  }
}

async function openInBrowser(task: TaskItem): Promise<void> {
  commands.executeCommand('vscode.open', Uri.parse(`https://todoist.com/app/task/${task.id}`))
}

async function refresh(): Promise<void> {
  await window.withProgress(progressOptions, async (progress) => {
    progress.report({ increment: 30 });

    await sync(true);

    progress.report({ increment: 70, });
  });

  // @ts-ignore
  providerStore.get(Integration.todoist).refresh();
}
