import express from "express";
const router = express.Router();

let signupList = [];
let idCounter = 1;

// 驗證函式
function validate(body) {
  const errors = [];
  if (!body.name) errors.push("姓名為必填");
  if (!body.email || !/^\S+@\S+\.\S+$/.test(body.email))
    errors.push("Email 格式不正確");
  if (!body.phone || !/^\d{10}$/.test(body.phone))
    errors.push("手機需為 10 位數字");
  if (!body.password || body.password.length < 8)
    errors.push("密碼至少 8 碼");
  if (body.password !== body.confirm)
    errors.push("兩次密碼不一致");
  if (!body.interests || !Array.isArray(body.interests) || body.interests.length === 0)
    errors.push("至少選一項興趣");
  if (!body.terms)
    errors.push("必須同意服務條款");

  return errors;
}

// POST 新增報名
router.post("/", (req, res) => {
  const errors = validate(req.body);

  if (errors.length) {
    return res.status(400).json({ success: false, errors });
  }

  const newData = {
    id: idCounter++,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    interests: req.body.interests,
    createdAt: new Date().toISOString(),
  };

  signupList.push(newData);

  res.json({ success: true, data: newData });
});

// GET 報名清單
router.get("/", (req, res) => {
  res.json({
    count: signupList.length,
    list: signupList,
  });
});

export default router;
