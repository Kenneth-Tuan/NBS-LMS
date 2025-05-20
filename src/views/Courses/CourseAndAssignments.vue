<script setup>
import { ref, computed, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import dayjs from "dayjs";
import { useRouter } from "vue-router";

import { RouterName, UserRole } from "@/enums/appEnums";
import {
  AssignmentStatus,
  handleFileSubmission,
  getSubmissionsByAssignment,
} from "@/stores/course";

// 路由
const router = useRouter();

// 用戶角色 (模擬用)
const userRole = ref(UserRole.Student);

// 學期列表
const semesterList = ["2022-秋季", "2023-春季", "2023-秋季", "2024-春季"];

// 搜尋條件
const searchSemester = ref("");
const searchCourseName = ref("");

// 加載狀態
const loading = ref(false);

// 用戶是否為教師
const isTeacher = computed(() => userRole.value === UserRole.Teacher);

// 模擬課程資料
const courses = ref([
  {
    id: "1",
    courseName: "新約概論",
    semester: "2024-春季",
    teacher: "王大明牧師",
    studentCount: 25,
    progress: 60,
    assignments: [
      {
        id: "1-1",
        title: "新約各書卷背景研究",
        description:
          "請選擇一卷新約書信，研究其歷史背景與寫作目的，並分析對今日教會的意義。",
        dueDate: "2024-05-15",
        status: AssignmentStatus.OPEN,
        fileName: "",
      },
      {
        id: "1-2",
        title: "四福音書比較",
        description:
          "比較四福音書記載相同事件的不同方式，解釋其神學意義與對象差異。",
        dueDate: "2024-04-10",
        status: AssignmentStatus.SUBMITTED,
        fileName: "四福音書比較研究.pdf",
      },
    ],
  },
  {
    id: "2",
    courseName: "舊約歷史書研究",
    semester: "2024-春季",
    teacher: "李文清博士",
    studentCount: 18,
    progress: 45,
    assignments: [
      {
        id: "2-1",
        title: "出埃及記與申命記的比較研究",
        description:
          "探討出埃及記與申命記中律法記載的異同，並分析其歷史與神學意義。",
        dueDate: "2024-05-20",
        status: AssignmentStatus.OPEN,
        fileName: "",
      },
    ],
  },
  {
    id: "3",
    courseName: "教會歷史導論",
    semester: "2023-秋季",
    teacher: "陳歷史教授",
    studentCount: 30,
    progress: 100,
    assignments: [
      {
        id: "3-1",
        title: "宗教改革關鍵人物研究",
        description:
          "選擇宗教改革時期的一位關鍵人物，分析其神學思想與歷史影響。",
        dueDate: "2023-12-05",
        status: AssignmentStatus.GRADED,
        fileName: "馬丁路德研究.docx",
      },
      {
        id: "3-2",
        title: "早期教會議會與信經發展",
        description: "研究尼西亞會議至迦克墩會議期間的神學爭議與信經發展。",
        dueDate: "2023-11-10",
        status: AssignmentStatus.CLOSED,
        fileName: "",
      },
    ],
  },
]);

// 篩選後的課程
const filteredCourses = computed(() => {
  return courses.value.filter((course) => {
    const matchesSemester =
      !searchSemester.value || course.semester === searchSemester.value;
    const matchesCourseName =
      !searchCourseName.value ||
      course.courseName
        .toLowerCase()
        .includes(searchCourseName.value.toLowerCase());
    return matchesSemester && matchesCourseName;
  });
});

// 新增作業對話框
const addAssignmentModal = reactive({
  visible: false,
  currentCourseId: null,
  form: {
    title: "",
    description: "",
    dueDate: null,
  },
});

// 查看作業繳交狀況對話框
const viewSubmissionsModal = reactive({
  visible: false,
  currentCourseId: null,
  currentAssignmentId: null,
  data: [],
});

// 學生繳交作業表格列
const studentSubmissionColumns = [
  {
    title: "學生姓名",
    dataIndex: "studentName",
    key: "studentName",
  },
  {
    title: "學號",
    dataIndex: "studentId",
    key: "studentId",
  },
  {
    title: "繳交狀態",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "繳交時間",
    dataIndex: "submitTime",
    key: "submitTime",
  },
  {
    title: "作業檔案",
    dataIndex: "file",
    key: "file",
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
  },
];

// 模擬學生提交資料
const studentSubmissions = [
  {
    id: "s1",
    assignmentId: "1-2",
    courseId: "1",
    studentName: "張小明",
    studentId: "ST20240001",
    status: AssignmentStatus.SUBMITTED,
    submitTime: "2024-04-08 14:30",
    file: {
      name: "四福音書比較研究.pdf",
      url: "#",
      type: "pdf",
    },
  },
  {
    id: "s2",
    assignmentId: "1-2",
    courseId: "1",
    studentName: "李小華",
    studentId: "ST20240002",
    status: AssignmentStatus.SUBMITTED,
    submitTime: "2024-04-09 09:15",
    file: {
      name: "四福音書比較分析.pdf",
      url: "#",
      type: "pdf",
    },
  },
  {
    id: "s3",
    assignmentId: "1-2",
    courseId: "1",
    studentName: "王大文",
    studentId: "ST20240003",
    status: AssignmentStatus.NOT_SUBMITTED,
    submitTime: "-",
    file: null,
  },
  {
    id: "s4",
    assignmentId: "3-1",
    courseId: "3",
    studentName: "張小明",
    studentId: "ST20240001",
    status: AssignmentStatus.GRADED,
    submitTime: "2023-12-01 16:45",
    file: {
      name: "馬丁路德研究.docx",
      url: "#",
      type: "docx",
    },
  },
];

// 查詢課程
const handleSearch = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

// 重置搜尋條件
const handleReset = () => {
  searchSemester.value = "";
  searchCourseName.value = "";
  handleSearch();
};

// 切換角色
const handleRoleChange = () => {
  message.info(
    `已切換為${userRole.value === UserRole.Teacher ? "教師" : "學生"}身份`
  );
};

// 查看課程詳情
const handleViewCourseDetail = (courseId) => {
  router.push({
    name: RouterName.CourseDetail,
    params: { id: courseId },
  });
};

// 獲取狀態顏色
const getStatusColor = (status) => {
  switch (status) {
    case AssignmentStatus.OPEN:
      return "blue";
    case AssignmentStatus.SUBMITTED:
      return "green";
    case AssignmentStatus.GRADED:
      return "purple";
    case AssignmentStatus.CLOSED:
      return "red";
    case AssignmentStatus.NOT_SUBMITTED:
      return "orange";
    default:
      return "default";
  }
};

// 獲取狀態文字
const getStatusText = (status) => {
  switch (status) {
    case AssignmentStatus.OPEN:
      return "進行中";
    case AssignmentStatus.SUBMITTED:
      return "已繳交";
    case AssignmentStatus.GRADED:
      return "已評分";
    case AssignmentStatus.CLOSED:
      return "已關閉";
    case AssignmentStatus.NOT_SUBMITTED:
      return "未繳交";
    default:
      return "未知狀態";
  }
};

// 教師：新增作業
const handleAddAssignment = (courseId) => {
  addAssignmentModal.currentCourseId = courseId;
  addAssignmentModal.form.title = "";
  addAssignmentModal.form.description = "";
  addAssignmentModal.form.dueDate = null;
  addAssignmentModal.visible = true;
};

// 確認新增作業
const confirmAddAssignment = () => {
  if (!addAssignmentModal.form.title || !addAssignmentModal.form.dueDate) {
    message.error("請填寫必填欄位");
    return;
  }

  const courseIndex = courses.value.findIndex(
    (c) => c.id === addAssignmentModal.currentCourseId
  );
  if (courseIndex !== -1) {
    const newAssignment = {
      id: `${addAssignmentModal.currentCourseId}-${
        courses.value[courseIndex].assignments.length + 1
      }`,
      title: addAssignmentModal.form.title,
      description: addAssignmentModal.form.description,
      dueDate: dayjs(addAssignmentModal.form.dueDate).format("YYYY-MM-DD"),
      status: AssignmentStatus.OPEN,
      fileName: "",
    };

    courses.value[courseIndex].assignments.push(newAssignment);
    message.success("新增作業成功");
    addAssignmentModal.visible = false;
  }
};

// 教師：查看提交狀況
const handleViewSubmissions = async (courseId, assignmentId) => {
  viewSubmissionsModal.currentCourseId = courseId;
  viewSubmissionsModal.currentAssignmentId = assignmentId;

  loading.value = true;

  try {
    // 使用 store 中的方法獲取提交數據
    const submissions = await getSubmissionsByAssignment(
      courseId,
      assignmentId
    );

    // 合併本地和服務器提交數據
    const localSubmissions = studentSubmissions.filter(
      (s) => s.courseId === courseId && s.assignmentId === assignmentId
    );

    // 使用 Set 去重合併數據
    const submissionMap = new Map();
    [...submissions, ...localSubmissions].forEach((sub) => {
      submissionMap.set(`${sub.studentId}-${sub.assignmentId}`, sub);
    });

    viewSubmissionsModal.data = Array.from(submissionMap.values());
  } catch (error) {
    console.error("獲取提交數據失敗:", error);
    message.error("獲取提交數據失敗，請稍後再試");
    viewSubmissionsModal.data = studentSubmissions.filter(
      (s) => s.courseId === courseId && s.assignmentId === assignmentId
    );
  } finally {
    loading.value = false;
    viewSubmissionsModal.visible = true;
  }
};

// 教師：評分作業
const handleGradeAssignment = (submissionId) => {
  message.success("已確認");

  // 更新提交狀態為已評分
  const submission = studentSubmissions.find((s) => s.id === submissionId);
  if (submission) {
    submission.status = AssignmentStatus.GRADED;
  }

  // 更新課程中的作業狀態
  const courseIndex = courses.value.findIndex(
    (c) => c.id === viewSubmissionsModal.currentCourseId
  );
  if (courseIndex !== -1) {
    const assignment = courses.value[courseIndex].assignments.find(
      (a) => a.id === viewSubmissionsModal.currentAssignmentId
    );
    if (assignment && assignment.status === AssignmentStatus.SUBMITTED) {
      assignment.status = AssignmentStatus.GRADED;
    }
  }
};

// 學生：上傳作業前驗證
const beforeUpload = async (file, courseId, assignmentId) => {
  const isValidType =
    file.type === "application/pdf" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.type === "application/msword";

  if (!isValidType) {
    message.error("只能上傳 PDF 或 Word 檔案");
    return false;
  }

  const isLessThan10M = file.size / 1024 / 1024 < 10;
  if (!isLessThan10M) {
    message.error("檔案大小不能超過 10MB");
    return false;
  }

  // 模擬上傳過程
  loading.value = true;

  // 使用 store 中的方法處理文件上傳
  const userId = "ST20240099"; // 這裡應該從用戶 store 中獲取
  const result = await handleFileSubmission(
    file,
    courseId,
    assignmentId,
    userId
  );

  if (result.success) {
    // 更新課程中的作業狀態
    const courseIndex = courses.value.findIndex((c) => c.id === courseId);
    if (courseIndex !== -1) {
      const assignmentIndex = courses.value[courseIndex].assignments.findIndex(
        (a) => a.id === assignmentId
      );
      if (assignmentIndex !== -1) {
        courses.value[courseIndex].assignments[assignmentIndex].status =
          AssignmentStatus.SUBMITTED;
        courses.value[courseIndex].assignments[assignmentIndex].fileName =
          file.name;
      }
    }

    // 新增一筆提交記錄
    const newSubmission = {
      id: `s${studentSubmissions.length + 1}`,
      assignmentId,
      courseId,
      studentName: "我的姓名",
      studentId: userId,
      status: AssignmentStatus.SUBMITTED,
      submitTime: dayjs().format("YYYY-MM-DD HH:mm"),
      file: {
        name: file.name,
        url: result.fileUrl,
        type: result.fileType,
      },
    };
    studentSubmissions.push(newSubmission);

    message.success("作業已成功繳交");
  }

  loading.value = false;
  return false; // 阻止默認上傳行為
};

// 學生：重新繳交作業
const handleResubmit = (courseId, assignmentId) => {
  message.info("請選擇新的檔案上傳");

  // 重置作業狀態為未繳交以便重新上傳
  const courseIndex = courses.value.findIndex((c) => c.id === courseId);
  if (courseIndex !== -1) {
    const assignmentIndex = courses.value[courseIndex].assignments.findIndex(
      (a) => a.id === assignmentId
    );
    if (assignmentIndex !== -1) {
      courses.value[courseIndex].assignments[assignmentIndex].status =
        AssignmentStatus.OPEN;
      courses.value[courseIndex].assignments[assignmentIndex].fileName = "";
    }
  }
};

// 處理檔案點擊
const handleFileClick = (file) => {
  // 模擬檔案開啟行為
  if (file.type === "pdf") {
    window.open(file.url, "_blank");
  } else {
    // 模擬下載 Word 檔案
    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

// 組件掛載時初始化資料
onMounted(() => {
  handleSearch();
});
</script>

<template>
  <div class="u-p-4 u-w-full">
    <div class="u-bg-white u-rounded-16px u-p24px u-shadow">
      <h1 class="u-text-24px u-font-bold u-mb16px u-c-blue">課程與作業管理</h1>

      <!-- 搜尋區塊 -->
      <div class="u-mb16px u-bg-gray-50 u-p24px u-rounded-16px">
        <a-form layout="inline" class="u-flex u-flex-wrap u-gap-4">
          <a-form-item label="學期">
            <a-select
              v-model:value="searchSemester"
              style="width: 180px"
              placeholder="選擇學期"
              allow-clear
            >
              <a-select-option
                v-for="semester in semesterList"
                :key="semester"
                :value="semester"
              >
                {{ semester }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="課程名稱">
            <a-input
              v-model:value="searchCourseName"
              placeholder="輸入課程名稱"
              style="width: 200px"
              allow-clear
            />
          </a-form-item>

          <a-form-item>
            <a-button type="primary" @click="handleSearch">查詢</a-button>
            <a-button class="u-ml-2" @click="handleReset">重置</a-button>
          </a-form-item>
        </a-form>
      </div>

      <!-- 加載中狀態 -->
      <a-spin :spinning="loading">
        <!-- 無資料顯示 -->
        <a-empty
          v-if="filteredCourses.length === 0"
          :description="isTeacher ? '暫無教授課程' : '暫無修習課程'"
        />

        <!-- 課程卡片 -->
        <div
          v-else
          class="u-grid u-grid-cols-1 md:u-grid-cols-2 lg:u-grid-cols-3 u-gap-4"
        >
          <div
            v-for="course in filteredCourses"
            :key="course.id"
            class="u-rounded-lg u-shadow-md u-border u-border-gray-200 u-overflow-hidden u-transition-all u-duration-300 hover:u-shadow-lg"
          >
            <div class="u-bg-blue-50 u-p-4">
              <h3 class="u-text-lg u-font-bold u-mb-2 u-c-#1890FF">
                {{ course.courseName }}
              </h3>
              <div class="u-flex u-justify-between u-text-sm u-text-gray-600">
                <span>{{ course.semester }}</span>
                <span>{{
                  isTeacher
                    ? "學生人數：" + course.studentCount
                    : "教師：" + course.teacher
                }}</span>
              </div>
            </div>

            <div class="u-p-4">
              <!-- 課程進度顯示 -->
              <div class="u-mb-4">
                <div class="u-flex u-justify-between u-mb-1">
                  <span class="u-text-sm u-font-medium">課程進度</span>
                  <span class="u-text-sm u-font-medium"
                    >{{ course.progress }}%</span
                  >
                </div>
                <a-progress
                  :percent="course.progress"
                  :stroke-color="{ from: '#108ee9', to: '#87d068' }"
                />
              </div>

              <!-- 作業列表 -->
              <div class="u-mb-4">
                <div class="u-flex u-justify-between u-mb-2">
                  <h4 class="u-font-medium">作業列表</h4>
                  <a-button
                    v-if="isTeacher"
                    type="link"
                    size="small"
                    @click="handleAddAssignment(course.id)"
                  >
                    新增作業
                  </a-button>
                </div>

                <a-list
                  size="small"
                  :data-source="course.assignments"
                  :pagination="false"
                >
                  <template #renderItem="{ item }">
                    <a-list-item>
                      <div class="u-w-full">
                        <div class="u-flex u-justify-between u-items-center">
                          <div class="u-font-medium">{{ item.title }}</div>
                          <a-tag :color="getStatusColor(item.status)">{{
                            getStatusText(item.status)
                          }}</a-tag>
                        </div>
                        <div class="u-text-xs u-text-gray-500">
                          截止日期：{{ item.dueDate }}
                        </div>

                        <!-- 學生視角：上傳作業 -->
                        <div v-if="!isTeacher" class="u-mt-2">
                          <div
                            v-if="
                              item.status === 'submitted' ||
                              item.status === 'graded'
                            "
                          >
                            <div
                              class="u-flex u-justify-between u-items-center"
                            >
                              <span class="u-text-xs"
                                >已繳交: {{ item.fileName }}</span
                              >
                              <a-button
                                type="link"
                                size="small"
                                @click="handleResubmit(course.id, item.id)"
                              >
                                重新繳交
                              </a-button>
                            </div>
                          </div>
                          <a-upload
                            v-else
                            :file-list="[]"
                            :before-upload="
                              (file) => beforeUpload(file, course.id, item.id)
                            "
                            :show-upload-list="false"
                          >
                            <a-button
                              size="small"
                              :disabled="
                                item.status === AssignmentStatus.CLOSED
                              "
                            >
                              繳交作業
                            </a-button>
                          </a-upload>
                        </div>

                        <!-- 老師視角：查看學生繳交作業 -->
                        <div v-else class="u-mt-2">
                          <a-button
                            type="primary"
                            size="small"
                            @click="handleViewSubmissions(course.id, item.id)"
                          >
                            查看繳交狀況
                          </a-button>
                        </div>
                      </div>
                    </a-list-item>
                  </template>
                </a-list>
              </div>

              <!-- 課程操作 -->
              <div class="u-flex u-justify-end u-gap-2">
                <a-button
                  size="small"
                  @click="handleViewCourseDetail(course.id)"
                >
                  查看課程詳情
                </a-button>
              </div>
            </div>
          </div>
        </div>
      </a-spin>
    </div>

    <!-- 新增作業對話框 (教師) -->
    <a-modal
      v-model:visible="addAssignmentModal.visible"
      title="新增作業"
      @ok="confirmAddAssignment"
      okText="確認"
      cancelText="取消"
    >
      <a-form :model="addAssignmentModal.form" layout="vertical">
        <a-form-item
          label="作業標題"
          name="title"
          :rules="[{ required: true, message: '請輸入作業標題' }]"
        >
          <a-input
            v-model:value="addAssignmentModal.form.title"
            placeholder="請輸入作業標題"
          />
        </a-form-item>
        <a-form-item label="作業描述" name="description">
          <a-textarea
            v-model:value="addAssignmentModal.form.description"
            placeholder="請輸入作業描述"
            :rows="4"
          />
        </a-form-item>
        <a-form-item
          label="截止日期"
          name="dueDate"
          :rules="[{ required: true, message: '請選擇截止日期' }]"
        >
          <a-date-picker
            v-model:value="addAssignmentModal.form.dueDate"
            style="width: 100%"
            format="YYYY-MM-DD"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 查看作業繳交狀況對話框 (教師) -->
    <a-modal
      v-model:visible="viewSubmissionsModal.visible"
      title="學生作業繳交狀況"
      width="800px"
      footer="{null}"
      @cancel="viewSubmissionsModal.visible = false"
    >
      <a-table
        :columns="studentSubmissionColumns"
        :data-source="viewSubmissionsModal.data"
        rowKey="id"
        :pagination="{ pageSize: 10 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'file'">
            <a
              v-if="record.file"
              :href="record.file.url"
              target="_blank"
              @click="handleFileClick(record.file)"
            >
              {{ record.file.name }}
            </a>
            <span v-else>尚未繳交</span>
          </template>
          <template v-if="column.dataIndex === 'status'">
            <a-tag :color="getStatusColor(record.status)">{{
              getStatusText(record.status)
            }}</a-tag>
          </template>
          <template v-if="column.dataIndex === 'action'">
            <a-space>
              <a-button
                v-if="record.file"
                type="link"
                size="small"
                @click="handleGradeAssignment(record.id)"
              >
                確認
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>
