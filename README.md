# SpendWise

SpendWise is a monthly budget calculator. Enter a budget and total expenses to see the remaining balance, get a quick spending summary, and review clearly labeled calculation results in the browser console.

## Files

- `index.html` — page structure and form controls.
- `style.css` — responsive visual design.
- `script.js` — input handling, validation, calculation, and output.

## JavaScript concepts used

- **Variables:** `const` stores page elements and values that are not reassigned. Calculation results are also stored as constants because each result is created once per calculation.
- **Data types:** User-entered values start as strings. `Number()` converts them into numeric values before arithmetic. The app also uses strings for messages and booleans for the over-budget state.
- **User input:** The form collects numbers from the page. The “Use quick prompts” button also collects a budget and expenses with `window.prompt()`.
- **Calculations:** `calculateBalance(budget, expenses)` subtracts expenses from the budget. The summary also calculates the percentage of the budget spent.
- **Functions:** `readBudgetValues()` validates and converts input, `calculateBalance()` handles the balance calculation, `formatCurrency()` formats amounts, and `showBudgetSummary()` updates the page and logs results.
- **Events and conditionals:** Form submission and button clicks trigger calculations. Conditional checks handle missing or negative inputs and highlight an over-budget result.

## Run it

Open `index.html` in a modern browser. Enter both amounts and select **Calculate balance**. To use JavaScript prompts instead, select **Use quick prompts**. Open the browser developer tools and choose the Console tab to see the labeled budget, expense, and remaining-balance values.

The app does not save or send entered amounts; calculations run in the current browser session.