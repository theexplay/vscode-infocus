import { CodeLensProvider, CodeLens, Event, workspace, TextDocument, CancellationToken, Position, EventEmitter, env, Range, Command, CodeActionProvider, CodeAction, CodeActionContext, Selection, CodeActionKind, CompletionItemProvider, CompletionContext, CompletionItemKind, DiagnosticSeverity } from "vscode";
import { SettingsHelper } from "../../../lib/settingsHelper";

/**
 * CodelensProvider
 */
export class TodoistCodeActionProvider implements CodeActionProvider {
    private _onDidChangeCodeLenses: EventEmitter<void> = new EventEmitter<void>();
    public readonly onDidChangeCodeLenses: Event<void> = this._onDidChangeCodeLenses.event;

    public static readonly providedCodeActionKinds = [
        CodeActionKind.QuickFix
    ];

    constructor() {
        workspace.onDidChangeConfiguration(() => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    provideCodeActions(document: TextDocument, range: Range | Selection, context: CodeActionContext, token: CancellationToken): CodeAction[] {
        // for each diagnostic entry that has the matching `code`, create a code action command
        console.log('context.diagnostics: ', context);

        return [

            {
                command: {
                    title: 'infocus.todoist.addTask',
                    command: 'infocus.todoist.addTask',
                },
                title: 'Add to todoist asdasdasdsa  ????',
                kind: CodeActionKind.QuickFix,
                isPreferred: true,
                diagnostics: [
                    {
                        range: range,
                        message: 'waaaaaaat',
                        severity: DiagnosticSeverity.Hint,
                    }
                ]
            }
        ];
        // return context.diagnostics
        // 	.filter(diagnostic => diagnostic.code === EMOJI_MENTION)
        // 	.map(diagnostic => this.createCommandCodeAction(diagnostic));
    }

    // private createCommandCodeAction(diagnostic: Diagnostic): CodeAction {
    // const action = new CodeAction('Learn more...', CodeActionKind.QuickFix);
    // action.command = { command: COMMAND, title: 'Learn more about emojis', tooltip: 'This will open the unicode emoji page.' };
    // action.diagnostics = [diagnostic];
    // action.isPreferred = true;
    // return action;
    // }
}

