// （保留 Week07 的全部功能）
const form = document.getElementById('signup-form');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');
const interests = document.getElementById('interests');
const terms = document.getElementById('terms');

function saveFormData() {
  const data = {};
  const inputs = form.querySelectorAll('input');
  inputs.forEach((input) => {
    if (input.type === 'checkbox') data[input.id] = input.checked;
    else data[input.id] = input.value;
  });
  localStorage.setItem('signupData', JSON.stringify(data));
}

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

function clearFormData() {
  localStorage.removeItem('signupData');
}

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

// 興趣選擇限至少 1 項
interests.addEventListener('change', () => {
  const checked = interests.querySelectorAll('input:checked');
  document.getElementById('interests-error').textContent =
    checked.length ? '' : '請至少勾選一項';
  saveFormData();
});

// 密碼強度條
const password = document.getElementById('password');
password.addEventListener('input', () => {
  const value = password.value;
  const level = document.getElementById('strength-level');
  const text = document.getElementById('strength-text');
  let s = 0;

  if (/[a-z]/.test(value)) s++;
  if (/[A-Z]/.test(value)) s++;
  if (/\d/.test(value)) s++;
  if (/[!@#$%^&*]/.test(value)) s++;

  const labels = ['弱', '中', '強'];
  const colors = ['bg-danger', 'bg-warning', 'bg-success'];

  level.className = `progress-bar ${colors[Math.min(s - 1, 2)]}`;
  level.style.width = `${s * 25}%`;

  text.textContent = value ? `密碼強度：${labels[Math.min(s - 1, 2)]}` : '';

  saveFormData();
});

// blur 驗證
form.addEventListener(
  'blur',
  (e) => {
    if (e.target.tagName === 'INPUT') validateInput(e.target);
    saveFormData();
  },
  true
);

// input 即時更新
form.addEventListener('input', (e) => {
  if (e.target.tagName === 'INPUT') validateInput(e.target);
  saveFormData();
});

// 服務條款彈窗
terms.addEventListener('click', (ev) => {
  if (ev.target.checked) {
    const ok = confirm('這是隱私權條款');
    if (!ok) {
      ev.preventDefault();
      ev.target.checked = false;
    }
  }
  saveFormData();
});

// 🚀 Week09：送出表單 → 改成送 API
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const requiredInputs = form.querySelectorAll('input[required]');
  let firstInvalid = null;

  requiredInputs.forEach((input) => {
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

  submitBtn.disabled = true;
  submitBtn.textContent = '註冊中...';

  const payload = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    password: document.getElementById('password').value,
    confirm: document.getElementById('confirm').value,
    interests: Array.from(interests.querySelectorAll('input:checked')).map((i) => i.value),
    terms: document.getElementById('terms').checked,
  };

  try {
    const res = await fetch('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      alert('註冊失敗：\n' + data.errors.join('\n'));
    } else {
      alert('註冊成功！');
      form.reset();
      clearFormData();
      document.getElementById('strength-level').style.width = '0';
      document.getElementById('strength-text').textContent = '';
    }
  } catch (err) {
    alert('伺服器連線錯誤');
  }

  submitBtn.disabled = false;
  submitBtn.textContent = '註冊';
});

// 🔎 查看報名清單
document.getElementById('list-btn').addEventListener('click', async () => {
  const res = await fetch('http://localhost:3000/api/signup');
  const data = await res.json();
  document.getElementById('result-box').textContent = JSON.stringify(data, null, 2);
});

// 啟動時恢復資料
restoreFormData();
