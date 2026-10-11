const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const billInput = document.getElementById("bill");
const peopleInput = document.getElementById("people");
const customTipInput = document.getElementById("custom-tip");
const customTipWrap = document.getElementById("custom-tip-wrap");
const tipButtons = document.querySelectorAll(".tip-btn");
const themeToggle = document.getElementById("theme-toggle");
const themeLabel = document.getElementById("theme-label");
const resetButton = document.getElementById("reset");

const billError = document.getElementById("bill-error");
const tipError = document.getElementById("tip-error");
const peopleError = document.getElementById("people-error");
const statusEl = document.getElementById("status");
const perPersonLabel = document.getElementById("per-person-label");

const tipAmountEl = document.getElementById("tip-amount");
const totalAmountEl = document.getElementById("total-amount");
const perPersonEl = document.getElementById("per-person");

let selectedTip = 15;
let usingCustomTip = false;

function setTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("tip-calc-theme", theme);
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode"
  );
  themeLabel.textContent = isDark ? "Light" : "Dark";
  themeToggle.querySelector(".theme-icon").textContent = isDark ? "☀️" : "🌙";
}

function initTheme() {
  const saved = localStorage.getItem("tip-calc-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(saved || (prefersDark ? "dark" : "light"));
}

function setError(input, errorEl, message) {
  if (message) {
    input.classList.add("invalid");
    errorEl.textContent = message;
  } else {
    input.classList.remove("invalid");
    errorEl.textContent = "";
  }
}

function parseNumber(value) {
  if (value.trim() === "") {
    return null;
  }
  return Number(value);
}

function getTipPercent() {
  if (!usingCustomTip) {
    setError(customTipInput, tipError, "");
    return { value: selectedTip, valid: true };
  }

  const tip = parseNumber(customTipInput.value);

  if (tip === null) {
    setError(customTipInput, tipError, "Enter a custom tip percentage.");
    return { value: null, valid: false };
  }

  if (!Number.isFinite(tip) || tip < 0) {
    setError(
      customTipInput,
      tipError,
      "Tip cannot be negative. Use 0 or higher."
    );
    return { value: null, valid: false };
  }

  setError(customTipInput, tipError, "");
  return { value: tip, valid: true };
}

function validate() {
  const bill = parseNumber(billInput.value);
  const people = parseNumber(peopleInput.value);
  let valid = true;

  if (bill === null) {
    setError(billInput, billError, "");
    valid = false;
  } else if (!Number.isFinite(bill) || bill <= 0) {
    setError(billInput, billError, "Bill must be greater than 0.");
    valid = false;
  } else {
    setError(billInput, billError, "");
  }

  const tip = getTipPercent();
  if (!tip.valid) {
    valid = false;
  }

  if (people === null) {
    setError(peopleInput, peopleError, "Enter how many people are splitting.");
    valid = false;
  } else if (!Number.isFinite(people) || people <= 0) {
    setError(
      peopleInput,
      peopleError,
      "Number of people must be at least 1."
    );
    valid = false;
  } else if (!Number.isInteger(people)) {
    setError(peopleInput, peopleError, "Use a whole number of people.");
    valid = false;
  } else {
    setError(peopleInput, peopleError, "");
  }

  return {
    valid,
    bill,
    people,
    tipPercent: tip.value,
  };
}

function resetResults() {
  tipAmountEl.textContent = money.format(0);
  totalAmountEl.textContent = money.format(0);
  perPersonEl.textContent = money.format(0);
}

function calculate() {
  const { valid, bill, people, tipPercent } = validate();

  if (!valid) {
    resetResults();
    const billEmpty = parseNumber(billInput.value) === null;
    const hasVisibleError =
      billError.textContent || tipError.textContent || peopleError.textContent;
    statusEl.textContent = hasVisibleError
      ? "Fix the highlighted fields to see the split."
      : billEmpty
        ? "Enter a bill amount to get started."
        : "Fix the highlighted fields to see the split.";
    return;
  }

  const tipAmount = bill * (tipPercent / 100);
  const totalAmount = bill + tipAmount;
  const perPerson = totalAmount / people;

  tipAmountEl.textContent = money.format(tipAmount);
  totalAmountEl.textContent = money.format(totalAmount);
  perPersonEl.textContent = money.format(perPerson);
  perPersonLabel.textContent =
    people === 1 ? "Amount to pay" : "Amount per person";
  statusEl.textContent =
    people === 1
      ? "Ready. This is the amount for one person."
      : `Ready. Split evenly between ${people} people.`;
}

function selectTip(button) {
  tipButtons.forEach((btn) => btn.classList.remove("active"));
  button.classList.add("active");

  const value = button.dataset.tip;
  usingCustomTip = value === "custom";
  customTipWrap.classList.toggle("hidden", !usingCustomTip);

  if (usingCustomTip) {
    customTipInput.focus();
  } else {
    selectedTip = Number(value);
    customTipInput.value = "";
    setError(customTipInput, tipError, "");
  }

  calculate();
}

function resetForm() {
  billInput.value = "";
  peopleInput.value = "1";
  customTipInput.value = "";
  usingCustomTip = false;
  selectedTip = 15;
  customTipWrap.classList.add("hidden");
  tipButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tip === "15");
  });
  setError(billInput, billError, "");
  setError(customTipInput, tipError, "");
  setError(peopleInput, peopleError, "");
  calculate();
  billInput.focus();
}

tipButtons.forEach((button) => {
  button.addEventListener("click", () => selectTip(button));
});

[billInput, peopleInput, customTipInput].forEach((input) => {
  input.addEventListener("input", calculate);
});

themeToggle.addEventListener("click", () => {
  const next =
    document.documentElement.getAttribute("data-theme") === "dark"
      ? "light"
      : "dark";
  setTheme(next);
});

resetButton.addEventListener("click", resetForm);

initTheme();
calculate();
