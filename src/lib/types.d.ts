export type WithChildren<T> = T & { children: WithChildren<T>[]; }
