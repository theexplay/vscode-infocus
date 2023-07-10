import { ProgressOptions, window } from "vscode";

export function withAsyncProgress(options: ProgressOptions, cb: Promise<any>) {
    return window.withProgress(options, async (progress) => {
        progress.report({ increment: 30 });

        try {
            await cb;
        } catch (e) {
            // ignore error
        }

        progress.report({ increment: 70 });
    });
}
