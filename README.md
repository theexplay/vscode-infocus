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
    - inline edit tasks, sections, projects name
    - notifications on due date of task (passed or came) 
    - show code lens for todos

    - In progress:
        - offline work
        - pin project
        - pass custom regex for codelens
        - toggle codelens mode

### Create tasks from toolbar, project or section
<img src="media/features/create-tasks.gif" />

### Edit tasks content, (un)complete tasks
<img src="media/features/editing.gif" />

### Add tasks from code. Deep links from sidebar and web application
<img src="media/features/codelens.gif" />

### Open links from task content using action icon
<img src="media/features/open-links-from-content.gif" />

## Configuration
> File > Preferences > Settings > InFocus

Setting id: `infocus.todoist.token` - token to access todoist

Setting id: `infocus.todoist.syncInternval` - value in minutes at which interval Todoist data is synced. If set to 0, interval will not be used. You can steel sync by action from sidebar.
