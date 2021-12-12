# vscode-infocus 

## Motivation
Make extension with customizable dashboard.
Todos, notes, snippets, etc. integrated into development flow.

## Available features

- Todoist integration in sidebar (tree view)
    - get projects, sections, tasks
    - complete, uncomplete tasks
    - open tasks in browser
    - create tasks in project or section
    - inline edit tasks and sections
    - support due dates of tasks
    - show code lens for todos

    - In progress:
        - offline work
        - pin project

## Configuration
> File > Preferences > Settings > InFocus

Setting id: `infocus.todoist.token` - token to access todoist

Setting id: `infocus.todoist.syncInternval` - value in minutes at which interval Todoist data is synced. If set to 0, interval will not be used. You can steel sync by action from sidebar.
