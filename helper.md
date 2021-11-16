# Dev Roadmap
* todoist get projects, todos, notes to show
* adding todos
* removing todos
* toggling todos
* todoist create web view for notes??? 
* todoist create scheduler
* 

### вызов команды и создание через js api
```
context.subscriptions.push(commands.registerCommand('infocus-open-settings', () => {
 	commands.executeCommand("workbench.action.openSettings2", "infocus.todoist.token");
}));
```

### вызов команды через markdown в package.json
аргумент фукнции должен передаваться через элвис оператор (?). По какой-то причине пример не работает <_< (скорее всего тк нет ещё id в маркете???)
```
"contents": "[Open Settings](command:workbench.action.openSettings2?infocus.todoist.token)"
```

### настройка через @ext
не получилось заставить работать
```
vscode.commands.executeCommand('workbench.action.openSettings', '@ext:eliostruyf.vscode-front-matter');
```
