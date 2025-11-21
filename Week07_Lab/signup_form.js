const form = document.getElementById('signup-form');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');
const interests = document.getElementById('interests');
const terms = document.getElementById('terms');

// 儲存所有欄位內容到 localStorage
function saveFormData() {
  const data = {};
  const inputs = form.querySelectorAll('input');
  inputs.forEach((input) => {
    if (input.type === 'checkbox') {
      data[input.id] = input.checked;
    } else {
      data[input.id] = input.value;
    }
  });
  localStorage.setItem('signupData', JSON.stringify(data));
}

// 從 localStorage 恢復資料
function restoreFormData() {
  const saved = localStorage.getItem('signupData');
  if (!saved) return;
  const data = JSON.parse(saved);
  Object.keys(data).forEach((key) => {
    const el = document.getElementById(key);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = data[key];
    else el.value = data[key];
  });
}

// 清除暫存資料
function clearFormData() {
  localStorage.removeItem('signupData');
}

// 基本驗證邏輯
function validateInput(input) {
  let message = '';
  if (input.validity.valueMissing) message = '此欄位必填';
  else if (input.type === 'email' && input.validity.typeMismatch)
    message = 'Email 格式不正確';
  else if (input.id === 'phone' && !/^\d{10}$/.test(input.value))
    message = '手機需為 10 位數字';
  else if (input.id === 'confirm' && input.value !== document.getElementById('password').value)
    message = '兩次密碼不一致';

  input.setCustomValidity(message);
  document.getElementById(`${input.id}-error`).textContent = message;
  return !message;
}

// 興趣勾選至少一項
interests.addEventListener('change', () => {
  const checked = interests.querySelectorAll('input[type="checkbox"]:checked');
  document.getElementById('interests-error').textContent =
    checked.length ? '' : '請至少勾選一項';
  saveFormData(); // 即時儲存
});

// 密碼強度條
const password = document.getElementById('password');
password.addEventListener('input', () => {
  const value = password.value;
  const strengthText = document.getElementById('strength-text');
  const strengthBar = document.getElementById('strength-level');
  let strength = 0;

  if (/[a-z]/.test(value)) strength++;
  if (/[A-Z]/.test(value)) strength++;
  if (/\d/.test(value)) strength++;
  if (/[!@#$%^&*]/.test(value)) strength++;

  const labels = ['弱', '中', '強'];
  const colors = ['bg-danger', 'bg-warning', 'bg-success'];

  strengthBar.className = `progress-bar ${colors[Math.min(strength - 1, 2)]}`;
  strengthBar.style.width = `${strength * 25}%`;
  strengthText.textContent = value
    ? `密碼強度：${labels[Math.min(strength - 1, 2)]}`
    : '';
  saveFormData(); // 即時儲存
});

// blur 驗證
form.addEventListener(
  'blur',
  (e) => {
    if (e.target.tagName === 'INPUT') {
      validateInput(e.target);
      saveFormData(); // blur 後儲存
    }
  },
  true
);

// input 即時更新
form.addEventListener('input', (e) => {
  if (e.target.tagName === 'INPUT') {
    validateInput(e.target);
    saveFormData(); // 輸入時儲存
  }
});

// 勾選「我已閱讀並同意隱私權條款」時彈出視窗
terms.addEventListener('click', (event) => {
  if (event.target.checked) {
    const confirmed = confirm('這是隱私權條款');
    if (!confirmed) {
      event.preventDefault();
      event.target.checked = false;
    }
  }
  saveFormData();
});

// 送出攔截與防重送
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // ------- 前端驗證（保持原樣） -------
  const inputs = form.querySelectorAll('input[required]');
  let firstInvalid = null;

  inputs.forEach((input) => {
    const valid = validateInput(input);
    if (!valid && !firstInvalid) firstInvalid = input;
  });

  const checked = interests.querySelectorAll('input:checked');
  if (!checked.length) {
    document.getElementById('interests-error').textContent = '請至少勾選一項';
    if (!firstInvalid) firstInvalid = interests.querySelector('input');
  }

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  // ------- 防重送 -------
  submitBtn.disabled = true;
  submitBtn.textContent = '註冊中...';

  // ------- 整理資料送 API -------
  const payload = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    password: document.getElementById("password").value,
    confirm: document.getElementById("confirm").value,
    interests: Array.from(
      interests.querySelectorAll("input:checked")
    ).map((i) => i.value),
    terms: document.getElementById("terms").checked
  };

  try {
    const res = await fetch("http://localhost:3000/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("註冊失敗：\n" + data.errors.join("\n"));
    } else {
      alert("註冊成功！");
      form.reset();
      clearFormData();
    }
  } catch (err) {
    alert("伺服器錯誤，請稍後再試");
  }

  submitBtn.disabled = false;
  submitBtn.textContent = "註冊";
});
