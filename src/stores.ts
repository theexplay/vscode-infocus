import { TreeDataProvider, TreeView } from "vscode";

export abstract class Store<T> {
  abstract store: Map<string, T>;
  abstract get(name: string): T | undefined;
  abstract add(name: string, value: T): void;
}

class ProviderStore implements Store<TreeDataProvider<any>> {
  store = new Map<string, TreeDataProvider<any>>();

  get<P>(name: string): P {
    return this.store.get(name) as unknown as P;
  }

  add<P>(name: string, provider: TreeDataProvider<P>): void {
    this.store.set(name, provider);
  }
}

class TreeViewStore implements Store<TreeView<any>> {
  store = new Map<string, TreeView<any>>();

  get<P>(name: string): TreeView<P> {
    return this.store.get(name)!;
  }

  add<P>(name: string, provider: TreeView<P>): void {
    this.store.set(name, provider);
  }
}

export const providerStore = new ProviderStore();
export const treeViewStore = new TreeViewStore();
