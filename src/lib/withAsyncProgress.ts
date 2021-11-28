import { ProgressOptions, window } from "vscode";

export function withAsyncProgress(options: ProgressOptions, cb: Promise<any>) {
    return window.withProgress(options, async (progress) => {
        progress.report({ increment: 30 });

        await cb;

        progress.report({ increment: 70, });
    });
}
