export enum Integration {
    todoist = 'todoist',
    notion = 'notion',
}

export const ExtensionName = 'infocus';
 
export type ExtensionSettingId = `${typeof ExtensionName}.${Integration}.token`;

export enum View {
    TreeView = 'TreeView',
    WebviewView = 'WebviewView',
};
export type ViewId = `${typeof ExtensionName}.${Integration}.${View}`
