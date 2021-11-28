import { ExtensionContext, TreeDataProvider, window } from "vscode";
import { TodoistTreeView, registerTodoistCommands } from "./features/todoist";
import { sync } from "./features/todoist/models";
import { ExtensionName, Integration, View, ViewId } from "./lib/constants";
import { treeViewStore, providerStore } from "./stores";

export async function activate(context: ExtensionContext) {
    await initialize();

    registerProvider({
        name: Integration.todoist,
        viewType: View.TreeView,
        provider: new TodoistTreeView()
    });

    registerTodoistCommands(context);
}

export function deactivate() { }

/** */
interface registerProviderOptions<T> {
    name: Integration;
    viewType: View;
    provider: TreeDataProvider<T>;
}

function registerProvider<T>({ name, viewType, provider }: registerProviderOptions<T>) {
    const viewId: ViewId = `${ExtensionName}.${name}.${viewType}`;

    const treeView = window.createTreeView(viewId, {
        treeDataProvider: provider
    });

    treeViewStore.add(name, treeView);
    providerStore.add(name, provider);
}

async function initialize() {
    await sync();
}
