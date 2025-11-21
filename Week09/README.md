## 如何啟動後端（npm install、npm run dev）
```cd server``` 進入 server 資料夾

```npm install```  安裝npm

```npm run dev``` 啟動後端

如果後端起動成功 ```Server running at http://localhost:3000```

## 如何啟動前端（Live Server / Vite）
### 方法 1：VS Code Live Server

開啟Visual Studio Code

找到Week09/client/signup_form.html

右鍵 → Open with Live Server

### 方法 2：使用 Vite

```npm create vite@latest client```

```npm install```

```npm run dev```

## API 端點文件（routes/signup.js）

後端程式碼位於：
server/routes/signup.js

POST /api/signup

新增一筆報名資料。

- Request Body（JSON）
```
{
  "name": "測試同學",
  "email": "test@example.com",
  "phone": "0912345678",
  "password": "abc12345",
  "confirm": "abc12345",
  "interests": ["前端"],
  "terms": true
}
```
- Response（成功）
```
{
  "success": true,
  "data": {
    "id": 1,
    "name": "測試同學",
    "email": "test@example.com",
    "phone": "0912345678",
    "interests": ["前端"],
    "createdAt": "2025-11-22T..."
  }
}
```
- Response（失敗）

status: 400
```
{
  "success": false,
  "errors": [
    "兩次密碼不一致"
  ]
}
```
GET /api/signup

取得目前全部報名資料。

- Response：
```
{
  "count": 2,
  "list": [
    {
      "id": 1,
      "name": "Alice",
      "email": "a@a.com",
      "phone": "0911222333",
      "interests": ["前端"]
    },
    {
      "id": 2,
      "name": "Bob",
      "email": "b@b.com",
      "phone": "0988777666",
      "interests": ["後端"]
    }
  ]
}
```

## 測試方式（Postman / VS Code REST / curl）

方法 1：Postman（推薦）

匯入檔案：

tests/signup_collection.json


內含：

POST /api/signup

GET /api/signup

方法 2：VS Code REST Client

開啟：

tests/api.http


內容示例：
```
POST 註冊
POST http://localhost:3000/api/signup
Content-Type: application/json

{
  "name": "測試同學",
  "email": "test@example.com",
  "phone": "0912345678",
  "password": "abc12345",
  "confirm": "abc12345",
  "interests": ["前端"],
  "terms": true
}

GET 清單
GET http://localhost:3000/api/signup
```
方法 3：curl（終端機測試）
```
curl -X POST http://localhost:3000/api/signup \
-H "Content-Type: application/json" \
-d '{"name":"測試","email":"a@a.com","phone":"0911222333","password":"abc12345","confirm":"abc12345","interests":["前端"],"terms":true}'
```