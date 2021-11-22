import { commands, ExtensionContext, ProgressLocation, ProgressOptions, Uri, window } from "vscode";
import { Integration } from "../../lib/constants";
import { providerStore } from "../../stores";
import { TaskItem } from "./providers/TaskItem";
import { Task } from './entities'
import { fetchAllEntitiesFx, toggleTaskFx } from "./models";

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

async function toggleTask(task: TaskItem, disableAction: boolean = false): Promise<void> {
  await window.withProgress(progressOptions, async (progress) => {
    progress.report({ increment: 30 });

    await toggleTaskFx(task._raw);

    progress.report({ increment: 70, });
  });

  // @ts-ignore
  providerStore.get(Integration.todoist).refresh(task);

  if (!disableAction) {
    setTimeout(async () => {
      const action = await window.showInformationMessage(`1 task ${!task._raw.completed ? 'completed' : 'uncompleted'}`, 'Undo', 'Close');

      if (action === 'Undo') {
        // task._raw.completed = true;
        toggleTask(task, true);
      }
    }, 400);
  }
}

async function editTask(task: TaskItem): Promise<void> {

}

async function deleteTask(task: TaskItem): Promise<void> {

}

async function addTask(task: TaskItem): Promise<void> {

}

async function openInBrowser(task: TaskItem): Promise<void> {
  commands.executeCommand('vscode.open', Uri.parse(`https://todoist.com/app/task/${task.id}`))
}

async function refresh(): Promise<void> {
  await window.withProgress(progressOptions, async (progress) => {
    progress.report({ increment: 30 });

    await fetchAllEntitiesFx(true);

    progress.report({ increment: 70, });
  });

  // @ts-ignore
  providerStore.get(Integration.todoist).refresh();
}
