# 通知系統規範文檔

## 概述

本文檔定義了 NBS-LMS 系統中統一的訊息通知格式和實作規範，涵蓋申請管理、課程公告等各種業務場景的通知需求。

## 基礎通知格式

所有通知均使用以下統一的數據結構：

```javascript
{
  notification_id: string,      // 通知唯一 ID
  recipient_id: string,         // 接受者 ID
  sender_id: string,           // 申請者/審核者/發送者 ID
  related_resource_id: string, // 相關資源 ID (申請 ID、課程 ID、公告 ID 等)
  type: string,                // 訊息類型
  message: string,             // 訊息內容
  created_at: date,            // 訊息建立時間
  is_read: boolean,            // 是否已讀
  read_at: date,               // 已讀時間
  action_url: string,          // 操作連結
  data: string                 // JSON 字串，包含詳細資訊
}
```

## 通知類型定義

### 申請管理相關通知

```javascript
const APPLICATION_NOTIFICATION_TYPES = {
  // 學生提交申請時的通知
  LEAVE_APPLICATION_SUBMITTED: "leave_application_submitted",
  INTERNSHIP_APPLICATION_SUBMITTED: "internship_application_submitted",
  SUBSIDY_APPLICATION_SUBMITTED: "subsidy_application_submitted",

  // 審核結果通知
  LEAVE_APPLICATION_REVIEWED: "leave_application_reviewed",
  INTERNSHIP_APPLICATION_REVIEWED: "internship_application_reviewed",
  SUBSIDY_APPLICATION_REVIEWED: "subsidy_application_reviewed",
};
```

### 課程管理相關通知

```javascript
const COURSE_NOTIFICATION_TYPES = {
  // 課程公告相關
  COURSE_ANNOUNCEMENT_PUBLISHED: "course_announcement_published",
  COURSE_ANNOUNCEMENT_UPDATED: "course_announcement_updated",
  COURSE_ANNOUNCEMENT_DELETED: "course_announcement_deleted",
};
```

## 詳細通知格式設計

### 1. 申請提交通知

#### 請假申請提交通知 (發送給對應課程老師)

```javascript
{
  notification_id: "NOTIF-2023-001",
  recipient_id: "teacher_user_id",
  sender_id: "student_user_id",
  related_resource_id: "LEA-2023-001",
  type: "leave_application_submitted",
  message: "學生 林小明 提交了請假申請，請您審核",
  created_at: "2023-06-05T10:30:00Z",
  is_read: false,
  read_at: null,
  action_url: "/applications/LEA-2023-001/review",
  data: JSON.stringify({
    applicationType: "leave",
    applicationId: "LEA-2023-001",
    applicantName: "林小明",
    applicantId: "S10923001",
    leaveStartDate: "2023/06/12",
    leaveEndDate: "2023/06/16",
    affectedCourses: ["神學概論", "聖經研究"],
    reason: "身體不適需要休養",
    submittedAt: "2023-06-05T10:30:00Z",
    priority: "normal"
  })
}
```

#### 實習申請提交通知 (發送給所有 Admin/Manager)

```javascript
{
  notification_id: "NOTIF-2023-002",
  recipient_id: "admin_or_manager_user_id",
  sender_id: "student_user_id",
  related_resource_id: "INT-2023-004",
  type: "internship_application_submitted",
  message: "學生 王大衛 提交了實習申請，請您審核",
  created_at: "2023-05-28T14:20:00Z",
  is_read: false,
  read_at: null,
  action_url: "/applications/INT-2023-004/review",
  data: JSON.stringify({
    applicationType: "internship",
    applicationId: "INT-2023-004",
    applicantName: "王大衛",
    applicantId: "S10923032",
    internshipProvider: "平安福音堂",
    startDate: "2023/07/15",
    endDate: "2023/10/15",
    totalHours: 450,
    submittedAt: "2023-05-28T14:20:00Z",
    priority: "high"
  })
}
```

#### 補助申請提交通知 (發送給所有 Admin/Manager)

```javascript
{
  notification_id: "NOTIF-2023-003",
  recipient_id: "admin_or_manager_user_id",
  sender_id: "student_user_id",
  related_resource_id: "SUB-2023-004",
  type: "subsidy_application_submitted",
  message: "學生 林志明 提交了補助申請，請您審核",
  created_at: "2023-05-20T09:15:00Z",
  is_read: false,
  read_at: null,
  action_url: "/applications/SUB-2023-004/review",
  data: JSON.stringify({
    applicationType: "subsidy",
    applicationId: "SUB-2023-004",
    applicantName: "林志明",
    applicantId: "S10823042",
    subsidyType: "其他補助",
    subsidyAmount: 6000,
    submittedAt: "2023-05-20T09:15:00Z",
    priority: "normal"
  })
}
```

### 2. 審核結果通知

#### 審核完成通知 (發送給原申請學生)

```javascript
{
  notification_id: "NOTIF-2023-004",
  recipient_id: "student_user_id",
  sender_id: "teacher_user_id",
  related_resource_id: "LEA-2023-001",
  type: "leave_application_reviewed",
  message: "您的請假申請已審核完成 - 已通過",
  created_at: "2023-06-07T16:45:00Z",
  is_read: false,
  read_at: null,
  action_url: "/applications/LEA-2023-001",
  data: JSON.stringify({
    applicationType: "leave",
    applicationId: "LEA-2023-001",
    reviewResult: "APPROVED", // APPROVED, REJECTED
    reviewerName: "陳主任",
    reviewerRole: "teacher",
    reviewedAt: "2023-06-07T16:45:00Z",
    reviewComment: "同意請假，注意後續補課安排",
    nextSteps: ["請聯絡課程助教安排補課事宜"]
  })
}
```

### 3. 課程公告通知

#### 課程公告發布通知 (發送給該課程所有學生)

```javascript
{
  notification_id: "NOTIF-2023-005",
  recipient_id: "student_user_id",
  sender_id: "teacher_user_id",
  related_resource_id: "ANN-2023-001",
  type: "course_announcement_published",
  message: "張老師 在 神學概論 發布了新公告：期中考試安排",
  created_at: "2023-06-05T14:30:00Z",
  is_read: false,
  read_at: null,
  action_url: "/courses/COURSE-001/announcements/ANN-2023-001",
  data: JSON.stringify({
    notificationType: "course_announcement",
    announcementId: "ANN-2023-001",
    courseId: "COURSE-001",
    courseName: "神學概論",
    announcementTitle: "期中考試安排",
    announcementPreview: "各位同學，期中考試時間為下週三...",
    teacherName: "張老師",
    teacherId: "teacher_001",
    publishedAt: "2023-06-05T14:30:00Z",
    priority: "normal",
    courseInfo: {
      semester: "2023春季",
      classTime: "週三 14:00-16:00"
    }
  })
}
```

#### 課程公告更新通知

```javascript
{
  notification_id: "NOTIF-2023-006",
  recipient_id: "student_user_id",
  sender_id: "teacher_user_id",
  related_resource_id: "ANN-2023-001",
  type: "course_announcement_updated",
  message: "張老師 更新了 神學概論 的公告：期中考試安排",
  created_at: "2023-06-06T09:15:00Z",
  is_read: false,
  read_at: null,
  action_url: "/courses/COURSE-001/announcements/ANN-2023-001",
  data: JSON.stringify({
    notificationType: "course_announcement_update",
    announcementId: "ANN-2023-001",
    courseId: "COURSE-001",
    courseName: "神學概論",
    announcementTitle: "期中考試安排",
    updateSummary: "考試時間調整",
    teacherName: "張老師",
    updatedAt: "2023-06-06T09:15:00Z",
    priority: "high"
  })
}
```

## 通知發送規則

### 申請管理通知規則

| 申請類型 | 提交時通知對象     | 審核時通知對象 |
| -------- | ------------------ | -------------- |
| 請假申請 | 對應課程的所有老師 | 原申請學生     |
| 實習申請 | 所有 Admin/Manager | 原申請學生     |
| 補助申請 | 所有 Admin/Manager | 原申請學生     |

### 課程公告通知規則

| 操作類型 | 通知對象       | 優先級 |
| -------- | -------------- | ------ |
| 發布公告 | 該課程所有學生 | Normal |
| 更新公告 | 該課程所有學生 | High   |
| 刪除公告 | 該課程所有學生 | Normal |

## 實作建議

### 1. 通知服務架構

```javascript
// src/services/notificationManager.service.js
class NotificationManagerService {
  constructor() {
    this.notificationService = notificationService;
    this.userService = userService;
    this.courseService = courseService;
  }

  // 申請相關通知
  async createApplicationNotification(application, notificationType) {
    const recipients = await this.getApplicationRecipients(
      application,
      notificationType
    );
    return this.batchCreateNotifications(
      recipients,
      application,
      notificationType
    );
  }

  // 課程公告相關通知
  async createAnnouncementNotification(
    announcement,
    courseId,
    notificationType
  ) {
    const students = await this.getCourseStudents(courseId);
    return this.batchCreateNotifications(
      students,
      announcement,
      notificationType
    );
  }

  // 批量創建通知
  async batchCreateNotifications(recipients, resourceData, notificationType) {
    const notifications = recipients.map((recipient) =>
      this.buildNotification(recipient.id, resourceData, notificationType)
    );
    return Promise.all(
      notifications.map(this.notificationService.createNotification)
    );
  }
}
```

### 2. 前端通知組件

```vue
<!-- src/components/NotificationItem.vue -->
<template>
  <div class="notification-item" :class="{ unread: !notification.is_read }">
    <div class="notification-header">
      <a-tag :color="getNotificationColor()">
        {{ getNotificationLabel() }}
      </a-tag>
      <span class="notification-time">{{
        formatTime(notification.created_at)
      }}</span>
    </div>

    <div class="notification-content">
      <p>{{ notification.message }}</p>
      <div v-if="notificationData" class="notification-details">
        <!-- 根據 type 顯示不同的詳細內容 -->
      </div>
    </div>

    <div class="notification-actions">
      <a-button
        v-if="notification.action_url"
        type="primary"
        size="small"
        @click="handleAction"
      >
        {{ getActionButtonText() }}
      </a-button>
    </div>
  </div>
</template>
```

### 3. 國際化訊息模板

```javascript
// src/locales/zh-tw.json
{
  "notifications": {
    "application": {
      "submitted": {
        "leave": "學生 {applicantName} 提交了請假申請，請您審核",
        "internship": "學生 {applicantName} 提交了實習申請，請您審核",
        "subsidy": "學生 {applicantName} 提交了補助申請，請您審核"
      },
      "reviewed": {
        "approved": "您的{applicationType}申請已審核完成 - 已通過",
        "rejected": "您的{applicationType}申請已審核完成 - 已駁回"
      }
    },
    "course": {
      "announcement": {
        "published": "{teacherName} 在 {courseName} 發布了新公告：{title}",
        "updated": "{teacherName} 更新了 {courseName} 的公告：{title}"
      }
    }
  }
}
```

## 工作流程

### 申請提交流程

1. 學生提交申請表單
2. 系統保存申請資料
3. 根據申請類型確定通知對象
4. 創建並發送通知給相關審核者
5. 更新通知狀態

### 申請審核流程

1. 審核者完成審核操作
2. 系統更新申請狀態
3. 創建審核結果通知
4. 發送通知給原申請學生
5. 記錄通知歷史

### 課程公告流程

1. 老師發布/更新課程公告
2. 系統保存公告內容
3. 獲取該課程所有學生列表
4. 為每個學生創建公告通知
5. 批量發送通知

## API 規範

### 獲取通知列表

```
GET /api/notifications?user_id={user_id}&limit={limit}&offset={offset}
```

### 標記通知已讀

```
POST /api/notifications/read
Body: {
  user_id: string,
  notification_id: string
}
```

### 批量標記已讀

```
POST /api/notifications/mark-all-read
Body: {
  user_id: string
}
```

### 創建通知

```
POST /api/notifications
Body: {
  recipient_id: string,
  sender_id: string,
  type: string,
  message: string,
  related_resource_id: string,
  action_url: string,
  data: object
}
```

## 擴展性考慮

### 未來可能的通知類型

- 作業發布通知
- 成績發布通知
- 課程時間變更通知
- 系統維護通知
- 重要公告通知

### 通知優先級

- `high`: 重要通知，需要立即處理
- `normal`: 一般通知
- `low`: 低優先級通知

### 通知頻道

- 系統內通知
- 郵件通知（未來擴展）
- 手機推播（未來擴展）

## 注意事項

1. 所有通知的 `data` 欄位必須是有效的 JSON 字串
2. `action_url` 應該是相對路徑，便於前端路由處理
3. 通知訊息應該簡潔明瞭，詳細信息放在 `data` 欄位中
4. 優先級設定要合理，避免過多高優先級通知
5. 大量通知發送時應考慮效能優化，使用批量操作
6. 通知歷史應該有適當的清理機制，避免數據過度累積
