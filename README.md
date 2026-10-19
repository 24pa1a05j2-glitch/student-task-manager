# StudyFlow — Student Task Manager

StudyFlow is a responsive, browser-based task manager designed to help students plan assignments, set due dates, prioritize work, and track progress.

## Features
- Create, edit, complete, and delete tasks
- Search tasks by title or description
- Filter by status and priority
- Due-date and overdue indicators
- Summary cards and completion progress
- Browser persistence using `localStorage`
- Form validation, confirmation dialogs, and toast feedback
- Responsive desktop, tablet, and mobile layouts
- Accessible labels, keyboard-friendly controls, and reduced-motion support

## Project structure
```text
student-task-manager/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── assets/
│   └── (optional images/screenshots)
├── README.md
└── docs/
    └── project-report.md
```

## Run locally
1. Download or clone the repository.
2. Open `index.html` in a modern browser, or use the VS Code Live Server extension.
3. Add a task to test the create, edit, delete, filter, and completion features.

No backend or build step is required. Tasks are saved only in the current browser's local storage; they are not synchronized across devices.

## Git workflow example
```bash
git init
git status
git add index.html css/style.css js/app.js README.md
git commit -m "Build responsive StudyFlow task manager"
git add .
git commit -m "Add task filters and local storage persistence"
git log --oneline
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/student-task-manager.git
git push -u origin main
```
If `origin` already exists, use `git remote -v` and update it with `git remote set-url origin YOUR-REPOSITORY-URL`. Replace the example username and URL with your actual repository.

## Deploy with GitHub Pages
1. Push the project to a **public** GitHub repository.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select branch `main` and folder `/ (root)`, then click **Save**.
5. Wait for the Pages deployment to finish. Open the URL shown in the Pages settings, usually `https://YOUR-USERNAME.github.io/student-task-manager/`.
6. Check the live website on desktop and mobile. Ensure `index.html` is in the selected published folder and asset paths are relative (`css/style.css`, `js/app.js`).

## Testing checklist
- [ ] Create a task with valid fields
- [ ] Confirm title/date validation messages
- [ ] Edit a task and verify changes
- [ ] Mark a task complete and undo completion
- [ ] Delete a task and clear completed tasks
- [ ] Search and filter by status and priority
- [ ] Refresh the page and confirm tasks persist
- [ ] Test mobile navigation and responsive layout
- [ ] Check the deployed URL, links, and browser console

## Documentation
See [`docs/project-report.md`](docs/project-report.md) for the final project report template. Add your name, screenshots, repository URL, and deployed website URL before submission.
