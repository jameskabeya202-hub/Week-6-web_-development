"use strict";

const STORAGE_KEY = "spendwise-data";
const expenses = loadExpenses();
let monthlyBudget = loadBudget();

const budgetForm = document.getElementById("budget-form");
const expenseForm = document.getElementById("expense-form");
const money = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 2
});

function loadExpenses() {
  try {
    const savedExpenses = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedExpenses) ? savedExpenses : [];
  } catch {
    return [];
  }
}

function loadBudget() {
  try {
    const savedBudget = JSON.parse(localStorage.getItem(`${STORAGE_KEY}-budget`));
    return Number.isFinite(savedBudget) && savedBudget >= 0
      ? savedBudget
      : null;
  } catch {
    return null;
  }
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    localStorage.setItem(`${STORAGE_KEY}-budget`, JSON.stringify(monthlyBudget));
  } catch {
    document.getElementById("expense-error").textContent =
      "Your browser could not save the data. Check its storage settings.";
  }
}

function formatDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return replacements[character];
  });
}

function renderDashboard() {
  let totalSpent = 0;
  const categoryTotals = {};

  // Process each expense record and total spending by category.
  for (const expense of expenses) {
    totalSpent += expense.amount;

    if (categoryTotals[expense.category] === undefined) {
      categoryTotals[expense.category] = 0;
    }

    categoryTotals[expense.category] += expense.amount;
  }

  const balance = monthlyBudget === null
    ? null
    : monthlyBudget - totalSpent;

  document.getElementById("budget-total").textContent =
    monthlyBudget === null ? money.format(0) : money.format(monthlyBudget);

  document.getElementById("spent-total").textContent = money.format(totalSpent);

  const budgetPercent = monthlyBudget && monthlyBudget > 0
    ? Math.round((totalSpent / monthlyBudget) * 100)
    : 0;

  document.getElementById("budget-percent").textContent = `${budgetPercent}%`;

  const resultPanel = document.querySelector(".result-panel");
  const resultStatus = document.getElementById("result-status");
  const balanceValue = document.getElementById("balance-value");
  const resultMessage = document.getElementById("result-message");

  // Use conditionals to give feedback based on the budget.
  if (monthlyBudget === null || monthlyBudget === 0) {
    resultStatus.textContent = "SET YOUR MONTHLY BUDGET";
    balanceValue.textContent = money.format(0);
    resultMessage.textContent =
      "Enter your monthly budget to see how much you have available.";
    resultPanel.classList.remove("over-budget");
  } else if (balance < 0) {
    resultStatus.textContent = "OVER BUDGET";
    balanceValue.textContent = `−${money.format(Math.abs(balance))}`;
    resultMessage.textContent =
      `You have spent ${money.format(Math.abs(balance))} more than your budget.`;
    resultPanel.classList.add("over-budget");
  } else if (balance === 0) {
    resultStatus.textContent = "BUDGET REACHED";
    balanceValue.textContent = money.format(0);
    resultMessage.textContent =
      "You have used your full monthly budget.";
    resultPanel.classList.remove("over-budget");
  } else if (budgetPercent >= 80) {
    resultStatus.textContent = "GETTING CLOSE";
    balanceValue.textContent = money.format(balance);
    resultMessage.textContent =
      `You have ${money.format(balance)} left. You have used ${budgetPercent}% of your budget.`;
    resultPanel.classList.remove("over-budget");
  } else {
    resultStatus.textContent = "ON TRACK";
    balanceValue.textContent = money.format(balance);
    resultMessage.textContent =
      `You have ${money.format(balance)} left in your monthly budget.`;
    resultPanel.classList.remove("over-budget");
  }

  renderExpenseRows();
  renderCategoryTotals(categoryTotals);
}

function renderExpenseRows() {
  const expenseList = document.getElementById("expense-list");
  const emptyState = document.getElementById("empty-state");

  if (expenses.length === 0) {
    expenseList.innerHTML = "";
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;

    expenseList.innerHTML = expenses.map(expense => `
      <tr>
        <td>${escapeHtml(expense.description)}</td>
        <td>${escapeHtml(expense.category)}</td>
        <td>${formatDate(expense.date)}</td>
        <td>${money.format(expense.amount)}</td>
        <td>
          <button
            class="delete-button"
            type="button"
            data-expense-id="${escapeHtml(expense.id)}"
            aria-label="Delete ${escapeHtml(expense.description)}"
          >×</button>
        </td>
      </tr>
    `).join("");
  }

  const recordCount = expenses.length;
  document.getElementById("record-count").textContent =
    `${recordCount} ${recordCount === 1 ? "record" : "records"}`;
}

function renderCategoryTotals(categoryTotals) {
  const categoryList = document.getElementById("category-list");
  const categoryEmpty = document.getElementById("category-empty");
  const categories = Object.entries(categoryTotals);

  if (categories.length === 0) {
    categoryList.innerHTML = "";
    categoryEmpty.hidden = false;
    return;
  }

  categoryEmpty.hidden = true;

  categoryList.innerHTML = categories
    .sort((first, second) => second[1] - first[1])
    .map(([category, amount]) => `
      <li>
        <span>${escapeHtml(category)}</span>
        <strong>${money.format(amount)}</strong>
      </li>
    `)
    .join("");
}

budgetForm.addEventListener("submit", event => {
  event.preventDefault();

  const budgetInput = document.getElementById("budget");
  const errorMessage = document.getElementById("budget-error");
  const newBudget = Number(budgetInput.value);

  if (budgetInput.value.trim() === "" || !Number.isFinite(newBudget) || newBudget <= 0) {
    errorMessage.textContent = "Enter a monthly budget greater than zero.";
    return;
  }

  monthlyBudget = newBudget;
  errorMessage.textContent = "";

  saveData();
  renderDashboard();
});

expenseForm.addEventListener("submit", event => {
  event.preventDefault();

  const formData = new FormData(expenseForm);
  const description = String(formData.get("description")).trim();
  const amount = Number(formData.get("amount"));
  const category = String(formData.get("category"));
  const date = String(formData.get("date"));
  const errorMessage = document.getElementById("expense-error");

  if (!description || !Number.isFinite(amount) || amount <= 0 || !category || !date) {
    errorMessage.textContent =
      "Enter a description, a positive amount, a category, and a date.";
    return;
  }

  const newExpense = {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`,
    description,
    amount: Math.round(amount * 100) / 100,
    category,
    date
  };

  expenses.unshift(newExpense);
  errorMessage.textContent = "";

  saveData();
  renderDashboard();
  expenseForm.reset();
  document.getElementById("date").value = getToday();
});

document.getElementById("expense-list").addEventListener("click", event => {
  const deleteButton = event.target.closest("[data-expense-id]");

  if (!deleteButton) {
    return;
  }

  const expenseIndex = expenses.findIndex(
    expense => expense.id === deleteButton.dataset.expenseId
  );

  if (expenseIndex !== -1) {
    expenses.splice(expenseIndex, 1);
    saveData();
    renderDashboard();
  }
});

document.getElementById("prompt-entry").addEventListener("click", () => {
  if (monthlyBudget === null) {
    document.getElementById("budget").value = 50000;
  }

  document.getElementById("description").value = "Groceries";
  document.getElementById("amount").value = 2500;
  document.getElementById("category").value = "Food & dining";
  document.getElementById("date").value = getToday();
  document.getElementById("description").focus();
});

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

document.getElementById("month-label").textContent =
  new Intl.DateTimeFormat("en-KE", {
    month: "long",
    year: "numeric"
  }).format(new Date()).toUpperCase();

if (monthlyBudget !== null) {
  document.getElementById("budget").value = monthlyBudget;
}

document.getElementById("date").value = getToday();
renderDashboard();