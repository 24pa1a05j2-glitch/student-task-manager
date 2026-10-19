/* StudyFlow Student Task Manager
   Concepts demonstrated: arrays, objects, functions, events, DOM manipulation,
   form validation, filtering, and localStorage persistence. */
"use strict";

const STORAGE_KEY = "studyflow.tasks.v1";
const sampleTasks = [
  { id: "sample-1", title: "Review data structures notes", description: "Revise stacks, queues, and linked lists before the quiz.", dueDate: addDays(1), priority: "high", status: "inprogress", createdAt: Date.now() - 4000 },
  { id: "sample-2", title: "Complete responsive design lab", description: "Finish the media queries and test on a phone-sized screen.", dueDate: addDays(2), priority: "medium", status: "todo", createdAt: Date.now() - 3000 },
  { id: "sample-3", title: "Read chapter 4", description: "Summarize the key concepts in your notebook.", dueDate: addDays(-1), priority: "low", status: "completed", createdAt: Date.now() - 2000 }
];

const elements = {
  taskList: document.querySelector("#taskList"),
  totalCount: document.querySelector("#totalCount"),
  progressCount: document.querySelector("#progressCount"),
  completedCount: document.querySelector("#completedCount"),
  overdueCount: document.querySelector("#overdueCount"),
  resultsCount: document.querySelector("#resultsCount"),
  searchInput: document.querySelector("#searchInput"),
  statusFilter: document.querySelector("#statusFilter"),
  priorityFilter: document.querySelector("#priorityFilter"),
  dialog: document.querySelector("#taskDialog"),
  form: document.querySelector("#taskForm"),
  dialogTitle: document.querySelector("#dialogTitle"),
  taskId: document.querySelector("#taskId"),
  taskTitle: document.querySelector("#taskTitle"),
  taskDescription: document.querySelector("#taskDescription"),
  taskDueDate: document.querySelector("#taskDueDate"),
  taskPriority: document.querySelector("#taskPriority"),
  taskStatus: document.querySelector("#taskStatus"),
  titleError: document.querySelector("#titleError"),
  dateError: document.querySelector("#dateError"),
  toast: document.querySelector("#toast"),
  progressPercent: document.querySelector("#progressPercent"),
  progressBar: document.querySelector("#progressBar"),
  progressFill: document.querySelector("#progressFill"),
  progressMessage: document.querySelector("#progressMessage"),
  topNav: document.querySelector(".top-nav"),
  menuToggle: document.querySelector("#menuToggle")
};

let tasks = loadTasks();
let toastTimeout;

function addDays(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return toDateInputValue(date);
}

function toDateInputValue(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.warn("Saved tasks could not be read:", error);
  }
  return sampleTasks;
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    showToast("Unable to save in this browser. Check storage settings.");
    console.error("Task storage failed:", error);
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function formatDate(dateString) {
  if (!dateString) return "No due date";
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function isOverdue(task) {
  return task.status !== "completed" && task.dueDate < toDateInputValue(new Date());
}

function getVisibleTasks() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const status = elements.statusFilter.value;
  const priority = elements.priorityFilter.value;
  return tasks
    .filter((task) => {
      const searchableText = `${task.title} ${task.description || ""}`.toLowerCase();
      return searchableText.includes(query)
        && (status === "all" || task.status === status)
        && (priority === "all" || task.priority === priority);
    })
    .sort((a, b) => {
      if (a.status === "completed" && b.status !== "completed") return 1;
      if (b.status === "completed" && a.status !== "completed") return -1;
      return a.dueDate.localeCompare(b.dueDate) || b.createdAt - a.createdAt;
    });
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();
  if (visibleTasks.length === 0) {
    const hasFilters = elements.searchInput.value || elements.statusFilter.value !== "all" || elements.priorityFilter.value !== "all";
    elements.taskList.innerHTML = `<div class="empty-state"><div class="empty-symbol">✦</div><h3>${hasFilters ? "No matching tasks" : "Your list is clear"}</h3><p>${hasFilters ? "Try another search or filter." : "Add a task to get your study plan started."}</p></div>`;
  } else {
    elements.taskList.innerHTML = visibleTasks.map((task) => {
      const completed = task.status === "completed";
      const dueClass = isOverdue(task) ? " overdue" : "";
      const dueLabel = isOverdue(task) ? `Overdue · ${formatDate(task.dueDate)}` : `Due ${formatDate(task.dueDate)}`;
      return `
        <article class="task-item ${completed ? "completed" : ""}" data-task-id="${escapeHTML(task.id)}">
          <input class="task-check" type="checkbox" data-action="toggle" aria-label="Mark ${escapeHTML(task.title)} complete" ${completed ? "checked" : ""}>
          <div class="task-main">
            <h3 class="task-title">${escapeHTML(task.title)}</h3>
            ${task.description ? `<p class="task-description">${escapeHTML(task.description)}</p>` : ""}
            <div class="task-meta">
              <span class="pill priority-${escapeHTML(task.priority)}">${escapeHTML(task.priority.toUpperCase())}</span>
              <span class="pill status-${escapeHTML(task.status)}">${escapeHTML(statusLabel(task.status))}</span>
              <span class="due-date${dueClass}">${escapeHTML(dueLabel)}</span>
            </div>
          </div>
          <div class="task-actions">
            <button class="icon-button" type="button" data-action="edit" aria-label="Edit ${escapeHTML(task.title)}" title="Edit task">✎</button>
            <button class="icon-button delete" type="button" data-action="delete" aria-label="Delete ${escapeHTML(task.title)}" title="Delete task">×</button>
          </div>
        </article>`;
    }).join("");
  }
  elements.resultsCount.textContent = `${visibleTasks.length} ${visibleTasks.length === 1 ? "task" : "tasks"}`;
  renderStats();
}

function statusLabel(status) {
  return ({ todo: "TO DO", inprogress: "IN PROGRESS", completed: "COMPLETED" })[status] || status;
}

function renderStats() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "completed").length;
  const overdue = tasks.filter(isOverdue).length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  elements.totalCount.textContent = total;
  elements.progressCount.textContent = total - completed;
  elements.completedCount.textContent = completed;
  elements.overdueCount.textContent = overdue;
  elements.progressPercent.textContent = `${progress}%`;
  elements.progressFill.style.width = `${progress}%`;
  elements.progressBar.setAttribute("aria-valuenow", String(progress));
  elements.progressMessage.textContent = total === 0
    ? "Add your first task and build momentum."
    : progress === 100
      ? "Amazing work — everything is complete!"
      : `${completed} of ${total} tasks completed. Keep going!`;
}

function openDialog(task = null) {
  elements.form.reset();
  elements.titleError.textContent = "";
  elements.dateError.textContent = "";
  elements.taskId.value = task ? task.id : "";
  elements.dialogTitle.textContent = task ? "Edit task" : "Add a new task";
  elements.taskTitle.value = task ? task.title : "";
  elements.taskDescription.value = task ? task.description || "" : "";
  elements.taskDueDate.value = task ? task.dueDate : addDays(1);
  elements.taskPriority.value = task ? task.priority : "medium";
  elements.taskStatus.value = task ? task.status : "todo";
  elements.dialog.showModal();
  elements.taskTitle.focus();
}

function closeDialog() {
  elements.dialog.close();
}

function validateForm() {
  const title = elements.taskTitle.value.trim();
  const dueDate = elements.taskDueDate.value;
  elements.titleError.textContent = title ? "" : "Please enter a task title.";
  elements.dateError.textContent = dueDate ? "" : "Please choose a due date.";
  if (title.length > 100) elements.titleError.textContent = "Use 100 characters or fewer.";
  return Boolean(title && title.length <= 100 && dueDate);
}

function handleFormSubmit(event) {
  event.preventDefault();
  if (!validateForm()) return;
  const existingId = elements.taskId.value;
  const taskData = {
    id: existingId || (window.crypto && crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}`),
    title: elements.taskTitle.value.trim(),
    description: elements.taskDescription.value.trim(),
    dueDate: elements.taskDueDate.value,
    priority: elements.taskPriority.value,
    status: elements.taskStatus.value,
    createdAt: existingId ? (tasks.find((task) => task.id === existingId)?.createdAt || Date.now()) : Date.now()
  };
  if (existingId) {
    tasks = tasks.map((task) => task.id === existingId ? taskData : task);
    showToast("Task updated successfully.");
  } else {
    tasks.push(taskData);
    showToast("Task added to your list.");
  }
  saveTasks();
  renderTasks();
  closeDialog();
}

function handleTaskAction(event) {
  const target = event.target;
  const item = target.closest("[data-task-id]");
  if (!item) return;
  const task = tasks.find((entry) => entry.id === item.dataset.taskId);
  if (!task) return;
  const action = target.dataset.action;
  if (action === "toggle") {
    task.status = target.checked ? "completed" : "todo";
    saveTasks();
    renderTasks();
    showToast(target.checked ? "Nice work — task completed!" : "Task moved back to To do.");
  } else if (action === "edit") {
    openDialog(task);
  } else if (action === "delete") {
    if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
      tasks = tasks.filter((entry) => entry.id !== task.id);
      saveTasks();
      renderTasks();
      showToast("Task deleted.");
    }
  }
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => elements.toast.classList.remove("show"), 2600);
}

function clearCompleted() {
  const count = tasks.filter((task) => task.status === "completed").length;
  if (!count) {
    showToast("There are no completed tasks to clear.");
    return;
  }
  if (window.confirm(`Remove ${count} completed ${count === 1 ? "task" : "tasks"}?`)) {
    tasks = tasks.filter((task) => task.status !== "completed");
    saveTasks();
    renderTasks();
    showToast("Completed tasks cleared.");
  }
}

function focusNextTask() {
  const nextTask = tasks
    .filter((task) => task.status !== "completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  if (!nextTask) {
    showToast("You're all caught up! Add a task whenever you're ready.");
    return;
  }
  elements.searchInput.value = "";
  elements.statusFilter.value = "all";
  elements.priorityFilter.value = "all";
  renderTasks();
  const item = [...elements.taskList.querySelectorAll("[data-task-id]")]
    .find((node) => node.dataset.taskId === nextTask.id);
  if (item) {
    item.scrollIntoView({ behavior: "smooth", block: "center" });
    item.style.borderColor = "#8e85ed";
    window.setTimeout(() => { item.style.borderColor = ""; }, 1800);
  }
  showToast(`Your next task: ${nextTask.title}`);
}

function initialize() {
  document.querySelector("#todayDate").textContent = new Date().toLocaleDateString(undefined, {
    weekday: "short", month: "short", day: "numeric"
  });
  document.querySelector("#year").textContent = new Date().getFullYear();
  document.querySelector("#headerAddButton").addEventListener("click", () => openDialog());
  document.querySelector("#addTaskButton").addEventListener("click", () => openDialog());
  document.querySelector("#closeDialogButton").addEventListener("click", closeDialog);
  document.querySelector("#cancelButton").addEventListener("click", closeDialog);
  document.querySelector("#clearCompletedButton").addEventListener("click", clearCompleted);
  document.querySelector("#focusButton").addEventListener("click", focusNextTask);
  elements.form.addEventListener("submit", handleFormSubmit);
  elements.taskList.addEventListener("click", handleTaskAction);
  elements.taskList.addEventListener("change", (event) => {
    if (event.target.matches('[data-action="toggle"]')) handleTaskAction(event);
  });
  elements.searchInput.addEventListener("input", renderTasks);
  elements.statusFilter.addEventListener("change", renderTasks);
  elements.priorityFilter.addEventListener("change", renderTasks);
  elements.menuToggle.addEventListener("click", () => {
    const isOpen = elements.topNav.classList.toggle("open");
    elements.menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  elements.topNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    elements.topNav.classList.remove("open");
    elements.menuToggle.setAttribute("aria-expanded", "false");
  }));
  elements.dialog.addEventListener("click", (event) => {
    if (event.target === elements.dialog) closeDialog();
  });
  renderTasks();
}

document.addEventListener("DOMContentLoaded", initialize);
