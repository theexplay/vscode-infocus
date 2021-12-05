export enum Integration {
    todoist = 'todoist',
    // FIXME
    todoistLens = 'todoistLens',
    notion = 'notion',
}

export const ExtensionName = 'infocus';
 
export type ExtensionSettingId = `${typeof ExtensionName}.${Integration}.token`;

export enum View {
    TreeView = 'TreeView',
    WebviewView = 'WebviewView',
    CodeLens = 'CodeLens',
};

export type ViewId = `${typeof ExtensionName}.${Integration}.${View}`;
