import { workspace } from "vscode";
import { ExtensionName } from "./constants";

export class SettingsHelper {
    static getSyncInterval(): number {
        return workspace.getConfiguration(ExtensionName).get<number>("todoist.syncInternval") ?? 0;
    }

    static getApiToken(): string {
        return workspace.getConfiguration(ExtensionName).get('todoist.token') || '';
    }
}

