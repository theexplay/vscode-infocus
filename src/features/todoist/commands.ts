import { commands, ExtensionContext, ProgressLocation, ProgressOptions, window } from "vscode";
import { Integration } from "../../lib/constants";
import { providerStore } from "../../stores";
import { getTaskIcon, TaskItem } from "./providers/TaskItem";
import { toggleTask as toggleTaskApi } from "./model";

export function registerTodoistCommands(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('infocus.todoist.openTreeView', () => {
      commands.executeCommand('workbench.view.extension.infocus-sidebar-container');
    }),
    commands.registerCommand(`infocus.todoist.toggleTask`, toggleTask),
    commands.registerCommand('infocus.todoist.editTask', editTask),
    commands.registerCommand('infocus.todoist.deleteTask', deleteTask),
  );
}

async function toggleTask(task: TaskItem): Promise<void> {
  task.iconPath = getTaskIcon(!task._raw.completed);

  // @ts-ignore
  providerStore.get(Integration.todoist).refresh(task);

  const progressOptions: ProgressOptions = {
    location: ProgressLocation.Notification,
    title: "Syncing with Todoist",
    cancellable: false
  };

  await window.withProgress(progressOptions, async (progress) => {
    progress.report({ increment: 30 });

    await toggleTaskApi(task._raw);

    progress.report({ increment: 70, });
  });

  setTimeout(async () => {
    const action = await window.showInformationMessage(`1 task ${!task._raw.completed ? 'completed' : 'uncompleted'}`, 'Undo', 'Close');

    if (action === 'Undo') {
      task._raw.completed = true;
      toggleTask(task);
    }
  }, 400)
}

async function editTask(task: TaskItem): Promise<void> {

}

async function deleteTask(task: TaskItem): Promise<void> {

}
