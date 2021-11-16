import { commands, ExtensionContext, window } from "vscode";
import { Integration } from "../../lib/constants";
import { providerStore } from "../../stores";
import { getTaskIcon, TaskItem } from "./providers/TaskItem";

export function registerTodoistCommands(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand(`infocus.todoist.toggleTask`, toggleTask),
    commands.registerCommand('infocus.todoist.editTask', editTask),
    commands.registerCommand('infocus.todoist.deleteTask', deleteTask),
  );
}

async function toggleTask(task: TaskItem): Promise<void> {
  task.completed = !task.completed;
  task.iconPath = getTaskIcon(task.completed);

  // @ts-ignore
  providerStore.get(Integration.todoist).refresh(task);

  // TODO: дернуть запрос к апишке
  
  window.showInformationMessage(`Task was marked as ${task.completed ? 'completed' : 'uncompleted'}`);
}

async function editTask(task: TaskItem): Promise<void> {
    
}

async function deleteTask(task: TaskItem): Promise<void> {
    
}
