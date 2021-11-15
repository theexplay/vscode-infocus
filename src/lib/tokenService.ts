import { window, workspace, commands } from 'vscode';
import { ExtensionName, ExtensionSettingId, Integration } from './constants';

export const getApiToken = function (type: Integration) {
    const settingId: ExtensionSettingId = `${ExtensionName}.${type}.token`;
    const apiToken: string | undefined = workspace.getConfiguration().get(settingId);

    if (!apiToken) {
        window.showWarningMessage(`Set your ${type} API token`, 'Open Settings')
            .then((openSetting) => {
                if (openSetting) {
                    commands.executeCommand('workbench.action.openSettings', settingId);
                }
            });
    }

    return apiToken;
};
