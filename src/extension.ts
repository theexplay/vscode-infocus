import { ExtensionContext, Hover, languages, ProviderResult, TreeDataProvider, window, workspace } from "vscode";
import { TodoistTreeView, registerTodoistCommands } from "./features/todoist";
import { todoistDeactivate, todoistInitialize } from "./features/todoist/init";
import { TodoistCodeActionProvider } from "./features/todoist/providers/CodeActionProvider";
import { subscribeToDocumentChanges } from "./features/todoist/providers/diagnostics";

import { TodoistCodelensProvider } from "./features/todoist/providers/TodoistCodelensProvider";
import { ExtensionName, Integration, View, ViewId } from "./lib/constants";
import { treeViewStore, providerStore } from "./stores";

export async function activate(context: ExtensionContext) {
    await initialize();

    workspace.onDidChangeConfiguration(() => {
        // restart
        todoistDeactivate();
        todoistInitialize();
    });

    registerTreeProvider({
        name: `${ExtensionName}.${Integration.todoist}.${View.TreeView}`,
        provider: new TodoistTreeView(context)
    });

    const todoistMentionDiagnostics = languages.createDiagnosticCollection("todoist-todo-mention");

    subscribeToDocumentChanges(context, todoistMentionDiagnostics);

    context.subscriptions.push(
        languages.registerCodeLensProvider("*", new TodoistCodelensProvider()),
        todoistMentionDiagnostics,
        // languages.registerCodeActionsProvider("*", new TodoistCodeActionProvider()),
    );

    registerTodoistCommands(context);
}

/** */
interface registerProviderOptions<T> {
    name: string;
    provider: TreeDataProvider<T>;
}

function registerTreeProvider<T>({ name, provider }: registerProviderOptions<T>) {
    const treeView = window.createTreeView(name, {
        treeDataProvider: provider
    });

    treeViewStore.add(name, treeView);
    providerStore.add(name, provider);
}

async function initialize() {
    // todo persist state
    todoistInitialize();
}

export function deactivate() {
    todoistDeactivate();
}
