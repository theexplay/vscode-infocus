import { ProgressLocation } from "vscode";
import { SettingsHelper } from "../../lib/settingsHelper";
import { withAsyncProgress } from "../../lib/withAsyncProgress";
import { syncFx } from "./models";

export let syncInterval: NodeJS.Timeout;

export function todoistInitialize() {
    const syncIntervalValue = SettingsHelper.getSyncInterval();

    if (syncIntervalValue) {
        const intervalInMs = syncIntervalValue * 60 * 1000;

        syncInterval = setInterval(async () => {
            await withAsyncProgress(
                {
                    location: ProgressLocation.Notification,
                    title: "Syncing with Todoist",
                    cancellable: false
                },
                syncFx()
            );
        }, intervalInMs);
    }
};

export function todoistDeactivate() {
    clearInterval(syncInterval);
}



