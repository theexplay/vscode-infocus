import { CodeLensProvider, CodeLens, Event, workspace, TextDocument, CancellationToken, Position, EventEmitter, env, Range, Command } from "vscode";
import { SettingsHelper } from "../../../lib/settingsHelper";

/**
 * CodelensProvider
 */
export class TodoistCodelensProvider implements CodeLensProvider {
    private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>();
    public readonly onDidChangeCodeLenses: Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        workspace.onDidChangeConfiguration(() => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public provideCodeLenses(document: TextDocument, token: CancellationToken): CodeLens[] | Thenable<CodeLens[]> {
        if (!SettingsHelper.isCodeLensEnabled()) {
            return [];
        }

        const stringRegExp = SettingsHelper.getRegExpString();
        const flags = stringRegExp.replace(/.*\/([gimy]*)$/, '$1');
        const pattern = stringRegExp.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
        const regex = new RegExp(pattern, flags);
        const text = document.getText();
        const codeLenses: CodeLens[] = [];

        let matches;
        while ((matches = regex.exec(text)) !== null) {
            const line = document.lineAt(document.positionAt(matches.index).line);
            const indexOf = line.text.indexOf(matches[0]);
            const position = new Position(line.lineNumber, indexOf);
            const range = document.getWordRangeAtPosition(position, new RegExp(regex));

            if (range) {
                codeLenses.push(new CodeLens(range, {
                    title: "Add to todoist?",
                    command: "infocus.todoist.addTask",
                    arguments: [undefined, `${matches[matches.length - 1].trim()} - [Link](${env.uriScheme}://file${document.uri.path}:${line.lineNumber})`]
                }));
            }
        }

        return codeLenses;
    }
}

