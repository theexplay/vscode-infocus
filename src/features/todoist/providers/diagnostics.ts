import { TextDocument, DiagnosticCollection, Diagnostic, TextLine, Range, DiagnosticSeverity, ExtensionContext, window, workspace } from "vscode";
import { SettingsHelper } from "../../../lib/settingsHelper";

export const TODO_MENTION = 'todo_mention';

const EMOJI = 'emoji';

export function refreshDiagnostics(doc: TextDocument, diagnostics: DiagnosticCollection): void {
    const results: Diagnostic[] = [];

    // console.log('doc: ', doc);


    const stringRegExp = SettingsHelper.getRegExpString();
    const flags = stringRegExp.replace(/.*\/([gimy]*)$/, '$1');
    const pattern = stringRegExp.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
    const regex = new RegExp(pattern, flags);

    console.log('<------------fdsfs-------------------->');

    if (regex.test(doc.getText())) {
        for (let lineIndex = 0; lineIndex < doc.lineCount; lineIndex++) {
            const lineOfText = doc.lineAt(lineIndex);
            // console.log('lineOfText: ', lineOfText);

            if (regex.test(lineOfText.text)) {
                results.push(createDiagnostic(regex, lineOfText, lineIndex));
            }
        }

    }

    // console.log('results: ', results);


    diagnostics.set(doc.uri, results);
}

function createDiagnostic(regex: RegExp, lineOfText: TextLine, lineIndex: number): Diagnostic {
    // find where in the line of thet the 'emoji' is mentioned
    const match = lineOfText.text.match(regex);
    console.log('match: ', match);
    const index = lineOfText.text.indexOf(match);
    
    // create range that represents, where in the document the word is
    const range = new Range(lineIndex, index, lineIndex, index + EMOJI.length);

    const diagnostic = new Diagnostic(
        range,
        "When you say 'emoji', do you want to find out more?",
        DiagnosticSeverity.Information
    );
    diagnostic.code = TODO_MENTION;
    return diagnostic;
}

export function subscribeToDocumentChanges(context: ExtensionContext, diagnostics: DiagnosticCollection): void {
    // if (window.activeTextEditor) {
    //     refreshDiagnostics(window.activeTextEditor.document, diagnostics);
    // }

    // context.subscriptions.push(
    //     window.onDidChangeActiveTextEditor(editor => {
    //         if (editor) {
    //             refreshDiagnostics(editor.document, diagnostics);
    //         }
    //     })
    // );

    context.subscriptions.push(
        workspace.onDidChangeTextDocument(e => refreshDiagnostics(e.document, diagnostics))
    );

    context.subscriptions.push(
        workspace.onDidCloseTextDocument(doc => diagnostics.delete(doc.uri))
    );
}
