// 宣告變數 (對應你自己的 HTML id)
const form = document.getElementById("signup-form");
const submitBtn = document.getElementById("submit-btn");
const resetBtn = document.getElementById("reset-btn");
const strengthText = document.getElementById("strength-text");
const strengthBar = document.getElementById("strength-level");
const interestArea = document.getElementById("interests");
const terms = document.getElementById("terms");
const inputs = form.querySelectorAll("input");

// =================== 網頁載入時從 localStorage 還原 ===================
window.addEventListener("DOMContentLoaded", () => {
  inputs.forEach((input) => {
    const saved = localStorage.getItem("signup_" + input.id);
    if (saved === null) return;

    if (input.type === "checkbox") input.checked = saved === "true";
    else input.value = saved;
  });

  const savedInterests = JSON.parse(
    localStorage.getItem("signup_interests") || "[]"
  );
  interestArea
    .querySelectorAll("input[type=checkbox]")
    .forEach((b) => {
      if (savedInterests.includes(b.value)) b.checked = true;
    });

  updateStrength(document.getElementById("password").value);
});

// =================== 即時驗證 + 儲存 ===================
inputs.forEach((input) => {
  input.addEventListener("input", () => {
    // 存 localStorage
    if (input.type === "checkbox") {
      localStorage.setItem("signup_" + input.id, input.checked);
    } else {
      localStorage.setItem("signup_" + input.id, input.value);
    }

    validateField(input);

    if (input.id === "password") {
      updateStrength(input.value);
    }
  });

  input.addEventListener("blur", () => validateField(input));
});

// =================== 興趣勾選 ===================
interestArea.addEventListener("change", () => {
  validateInterests();
  const checkedValues = Array.from(
    interestArea.querySelectorAll("input[type=checkbox]:checked")
  ).map((b) => b.value);
  localStorage.setItem("signup_interests", JSON.stringify(checkedValues));
});

// =================== 單一欄位驗證 ===================
function validateField(field) {
  let msg = "";
  field.setCustomValidity("");

  if (field.id === "name") {
    if (!field.value.trim()) msg = "請輸入姓名。";
  }

  if (field.id === "email") {
    if (!field.value) msg = "請輸入 Email。";
    else if (!/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(field.value))
      msg = "Email 格式不正確。";
  }

  if (field.id === "phone") {
    if (!field.value) msg = "請輸入手機號碼。";
    else if (!/^\d{10}$/.test(field.value)) msg = "手機需為 10 碼數字。";
    else if (!/^09\d{8}$/.test(field.value)) msg = "手機需以 09 開頭。";
  }

  if (field.id === "password") {
    if (field.value.length < 8) msg = "密碼需至少 8 碼。";
    else if (!/[A-Za-z]/.test(field.value) || !/\d/.test(field.value))
      msg = "密碼需包含英文字母與數字。";
  }

  if (field.id === "confirm") {
    if (field.value !== document.getElementById("password").value)
      msg = "兩次密碼不一致。";
  }

  if (field.id === "terms") {
    if (!field.checked) msg = "請同意服務條款。";
  }

  const errEl = document.getElementById(field.id + "-error");
  if (errEl) errEl.textContent = msg;

  field.setCustomValidity(msg);
  return msg === "";
}

// =================== 密碼強度 ===================
function updateStrength(password) {
  strengthText.textContent = "";
  strengthBar.style.width = "0";
  strengthBar.className = "progress-bar bg-danger";

  if (!password) return;

  const hasNumber = /\d/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let label = "弱";
  let width = 25;
  let barClass = "bg-danger";

  if (hasLower && hasUpper && hasNumber && hasSymbol) {
    label = "強";
    width = 100;
    barClass = "bg-success";
  } else if (hasLower && hasUpper && hasNumber) {
    label = "中";
    width = 75;
    barClass = "bg-warning";
  }

  strengthText.textContent = "密碼強度：" + label;
  strengthBar.style.width = width + "%";
  strengthBar.className = "progress-bar " + barClass;
}

// =================== 興趣驗證 ===================
function validateInterests() {
  const checked = interestArea.querySelectorAll(
    "input[type=checkbox]:checked"
  ).length;
  document.getElementById("interests-error").textContent = checked
    ? ""
    : "請至少選擇一個興趣。";
  return checked > 0;
}

// =================== submit：打 Week11 後端 ===================
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let valid = true;

  inputs.forEach((i) => {
    if (!validateField(i)) valid = false;
  });
  if (!validateInterests()) valid = false;

  if (!valid) {
    form.querySelector(":invalid")?.focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Loading...";

  const interestsValues = Array.from(
    document.querySelectorAll("#interests input[type=checkbox]:checked")
  ).map((b) => b.value);

  const payload = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    password: document.getElementById("password").value,
    confirm: document.getElementById("confirm").value,
    interests: interestsValues,
    terms: terms.checked,
  };

  try {
    const res = await fetch("http://localhost:3001/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || data.success === false) {
      const msg = Array.isArray(data.errors)
        ? data.errors.join("\n")
        : data.error || "送出失敗";
      alert("註冊失敗：\n" + msg);
    } else {
      alert("註冊成功！");
      form.reset();
      localStorage.clear();
      // 清錯誤＋強度
      inputs.forEach((i) => {
        const errEl = document.getElementById(i.id + "-error");
        if (errEl) errEl.textContent = "";
      });
      document.getElementById("interests-error").textContent = "";
      document.getElementById("terms-error").textContent = "";
      updateStrength("");
    }
  } catch (err) {
    console.error(err);
    alert("無法連線到伺服器");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "註冊";
  }
});

// =================== 重設按鈕 ===================
resetBtn.addEventListener("click", () => {
  form.reset();
  localStorage.clear();
  inputs.forEach((i) => {
    const errEl = document.getElementById(i.id + "-error");
    if (errEl) errEl.textContent = "";
  });
  document.getElementById("interests-error").textContent = "";
  document.getElementById("terms-error").textContent = "";
  updateStrength("");
});
