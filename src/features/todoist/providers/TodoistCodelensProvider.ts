import { CodeLensProvider, CodeLens, Event, workspace, TextDocument, CancellationToken, Position, EventEmitter, env, Range, Command } from "vscode";

/**
 * CodelensProvider
 */
export class TodoistCodelensProvider implements CodeLensProvider {
    private codeLenses: CodeLens[] = [];
    private regex: RegExp;
    private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>();
    public readonly onDidChangeCodeLenses: Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        this.regex = /((todo|fixme)(.+))/gi;

        workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public provideCodeLenses(document: TextDocument, token: CancellationToken): CodeLens[] | Thenable<CodeLens[]> {
        this.codeLenses = [];
        const regex = new RegExp(this.regex);
        const text = document.getText();

        let matches;
        while ((matches = regex.exec(text)) !== null) {
            const line = document.lineAt(document.positionAt(matches.index).line);
            const indexOf = line.text.indexOf(matches[0]);
            const position = new Position(line.lineNumber, indexOf);
            const range = document.getWordRangeAtPosition(position, new RegExp(this.regex));

            if (range) {
                this.codeLenses.push(new CodeLens(range, {
                    title: "Add to InFocus todos?",
                    command: "infocus.todoist.addTask",
                    arguments: [undefined, `${line.text.replace(this.regex, '$3')} ${env.uriScheme}://file${document.uri.path}:${line.lineNumber}`]
                }));
            }
        }

        return this.codeLenses;
    }
}

