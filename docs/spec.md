## 登入

### Login

user profile ?

> 施工中...

### Logout

> 施工中...

## 帳號

### role data structure

- ID
  - 系統自動產生
  - Type: String
  - mandatory
- name
  - mandatory
  - Type: String
  - maxLength: 10 chars
- email
  - optional
  - Type: Email
  - Email format checking by front end (X@X.X)
  - maxLength: 70
- telephone
  - optional
  - Type: Number
  - format checking (NNNN-NNN-NNN)
  - maxLength: 10
- role
  - mandatory
  - Type: Array\<String>
  - options: [admin, manager, teacher, student]
- status
  - mandatory
  - Boolean
- password
  - mandatory
  - default: 12345678?
  - Type: String
  - minmaxLength: [8,16]

### 角色列表

#### getRoles API

- 權限限制（僅 admin/creator 有權限）

### 新增角色

- createRole API
- 權限限制（僅 admin/creator 有權限）

### 修改角色

#### updateRole API

#### 修改方式

1.  role
2.  telephone
3.  password（待後續開發，信箱驗證）

### 刪除角色 x => only 停用/啓用

#### deleteRole API

- 權限限制（僅 admin/creator 有權限）

## 首頁

### Declaration data structure

- ID
  - 系統自動產生
  - Type: String
  - mandatory
- 日期
  - mandatory
  - default: createdDate
  - Type: Date
  - YYYY-MM-DD
- 內容
  - mandatory
  - Type: rich text format
  - maxLength: 200 chars
- 發布單位
  - optional
  - maxLength: 15 chars
  - Type: String
  - user manual input

### 消息列表

#### getDeclaration API

### 新增消息

#### createDeclaration API

- 權限限制（僅 admin/creator 有權限）

### 修改消息

#### updateDeclaration API

- 權限限制（僅 admin/creator 有權限）

### 刪除消息

#### deleteDeclaration API

- 權限限制（僅 admin/creator 有權限）

## 限時選課

- 僅學生可使用

### 限時選課實施方式

#### getEnrollmentConfig API

1. 學生登入系統
2. 系統檢查是否有限時的選課期間（檢查緩存或 API）
3. 如有限時選課，顯示選課選項
4. 學生進入選課頁面，顯示公告與可選課程
5. 學生選擇課程並提交
6. 系統記錄選課資訊

### 緩存檢查邏輯

1. 學生登入後，檢查 localStorage 中是否有選課期間緩存
2. 若有緩存，檢查緩存是否過期（超過設定的有效期，eg：2weeks）
   1. 未過期 → 檢查選課結束時間是否已過
      1. 已過 → 清除緩存，不顯示選課選項
      2. 未過 → 使用緩存數據，顯示選課選項
   2. 已過期 → 發起 API 請求獲取最新選課期間
3. 若沒有緩存，發起 API 請求獲取選課期間
4. 獲取到選課期間數據後，更新緩存

### 送出選課

#### submitCourses API

- courses
  - mandatory
  - Type: Array\<courseId>

### 限時選課設定

#### updateEnrollmentConfig API

- 可選課程
  - mandatory
  - Type: Array\<courseId>
  - options (get from api)
  - 透過前端用開課時間進行篩選
- 選課開始時間
  - mandatory
  - Type: Date
  - YYYY-MM-DD HH:mm:ss
- 選課截止時間
  - mandatory
  - Type: Date
  - YYYY-MM-DD HH:mm:ss
- 選課學分上限
  - mandatory
  - Type: Number
  - max: 99

#### getCourses API

### 先修課程限制

> 如果學生未滿足課程的先修條件則無法點選該課程進行選課

- 如何實作？

## 課程管理

### Course Data Structure

- ID
- name(課程名稱)
- classMode(上課方式)
- credit(學分)
- instructor(授課老師)
- startDate(開課時間)
- endDate(結業時間)
- enrollmentLimit(選課人數上限)
- weekday(上課日；可能會是一周一天以上)
- classTime(上課時段)
- description(課程簡介)
- prerequisites(先修課程)
- outlineFile(課程大綱；多個；格式任意)
- status(啓用/停用)
- 成績評定項目（多項）
- 作業

### 課程總覽

學生：修課記錄
老師：開課記錄

#### getCourses API

> 顯示課程

- Creator/Admin/Manager/Teacher：顯示全部課程
- Student：顯示已修課程
- pagination

#### getCourse API

> 在課程總覽中，Creator/Admin/Manager/Teacher 可以查看課程詳情，
> 回傳該課程中學生們的相關資料
> 而 Student 只能獲得他自己的資訊

- 學生名稱
- 各項成績
- 總成績
- 出席情況
- 繳交作業/報告（Array）

#### deleteCourse API

- 權限限制（僅 Creator/Admin 有權限）

### 新增/修改課程

- 權限限制（僅 Creator/Admin/Teacher 有權限）

#### createCourse API

#### updateCourse API

### 課程與作業

> 老師透過 upadteCourse API 設定成績評定項目
> 作業只能單個（請學生壓成 zip；單一 pdf；32MB max size；not mvp scope；畫面上顯示 10MB）

#### submitAssignment API

> 學生透過這隻 API 繳交作業

## 申請管理

### 實習/補助/請假申請

#### Application Data Structure

- ID
- 申請人
- Email
- 電話
- 實習機構名稱
- 實習機構地址
- 實習機構聯絡人
- 實習機構聯絡人電話
- 實習開始日期
- 實習結束日期
- 實習概述
- 請假課堂
- 請假日期（根據課堂可指定多個日期）
- 請假原因
- 補助類型（學費/住宿/交通/其他）
- 相關附件（multiple）
- 審核狀態（待審核/已通過/駁回）
- 審核人員
- 審核原因

#### submitApplication API

- 僅學生有該功能
- 請假申請發出後會通知對應課堂的老師進行審核
- 實習/補助申請會通知 Admin/Manager 進行審核

### 申請紀錄

#### getApplications API

- Creator/Admin/Manager 可以看到全部申請
- Teacher 只能看到請假申請
- Student 只能看到自己提出的申請

#### review API

- 審核完成之後會通知申請人

## 通知中心

> 施工中...
