<template>
  <div class="u-p-4 u-w-full">
    <div class="u-bg-white u-rounded-lg u-p-6 u-shadow-md">
      <h1 class="u-text-2xl u-font-bold u-mb-6 u-c-blue">修課紀錄與查詢</h1>

      <!-- 搜尋區塊 -->
      <div class="u-mb-6 u-bg-gray-50 u-p-4 u-rounded-lg">
        <a-form layout="inline" class="u-flex u-flex-wrap u-gap-4">
          <a-form-item label="學期">
            <a-select
              v-model:value="courseRecordStore.searchSemester"
              style="width: 180px"
              placeholder="選擇學期"
              allow-clear
            >
              <a-select-option
                v-for="semester in courseRecordStore.semesterList"
                :key="semester"
                :value="semester"
              >
                {{ semester }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="課程名稱">
            <a-input
              v-model:value="courseRecordStore.searchCourseName"
              placeholder="輸入課程名稱"
              style="width: 200px"
              allow-clear
            />
          </a-form-item>

          <a-form-item label="教師">
            <a-select
              v-model:value="courseRecordStore.searchTeacher"
              style="width: 180px"
              placeholder="選擇教師"
              allow-clear
            >
              <a-select-option
                v-for="teacher in courseRecordStore.teacherList"
                :key="teacher"
                :value="teacher"
              >
                {{ teacher }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item>
            <a-button type="primary" @click="handleSearch">查詢</a-button>
            <a-button class="u-ml-2" @click="handleReset">重置</a-button>
          </a-form-item>
        </a-form>
      </div>

      <!-- 課程紀錄表格 -->
      <a-spin :spinning="courseRecordStore.loading">
        <a-empty
          v-if="courseRecordStore.filteredCourseRecords.length === 0"
          description="暫無修課紀錄"
        />

        <a-table
          v-else
          :dataSource="courseRecordStore.filteredCourseRecords"
          :columns="columns"
          rowKey="id"
          :pagination="{ pageSize: 10 }"
          :customRow="customRow"
        >
          <!-- 成績欄位自訂顯示 -->
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'grade'">
              <a-tag :color="getGradeColor(record.grade)">
                {{ record.grade }}
              </a-tag>
            </template>
            <template v-if="column.dataIndex === 'action'">
              <a-button type="link" @click="viewGradeDetail(record.id)">
                查看成績
              </a-button>
            </template>
          </template>
        </a-table>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { message } from "ant-design-vue";
import { useRouter } from "vue-router";
import { RouterName } from "@/enums/appEnums";
import { useCourseRecordStore } from "@/stores/courseRecord";

// 初始化 store
const courseRecordStore = useCourseRecordStore();
const router = useRouter();

// 表格欄位定義
const columns = [
  {
    title: "學期",
    dataIndex: "semester",
    key: "semester",
    width: "15%",
    sorter: (a, b) => a.semester.localeCompare(b.semester),
  },
  {
    title: "課程名稱",
    dataIndex: "courseName",
    key: "courseName",
    width: "35%",
  },
  {
    title: "教師",
    dataIndex: "teacher",
    key: "teacher",
    width: "20%",
  },
  {
    title: "成績",
    dataIndex: "grade",
    key: "grade",
    width: "15%",
    sorter: (a, b) => {
      const gradeValues = {
        "A+": 12,
        A: 11,
        "A-": 10,
        "B+": 9,
        B: 8,
        "B-": 7,
        "C+": 6,
        C: 5,
        "C-": 4,
        F: 0,
      };
      return gradeValues[a.grade] - gradeValues[b.grade];
    },
  },
  {
    title: "操作",
    dataIndex: "action",
    key: "action",
    width: "15%",
  },
];

// 自定義行樣式和事件
const customRow = (record) => {
  return {
    style: { cursor: "pointer" },
    onClick: () => {
      viewGradeDetail(record.id);
    },
  };
};

// 查看成績詳情
const viewGradeDetail = (id) => {
  router.push({
    name: RouterName.GradeDetail,
    params: { id },
  });
};

// 根據成績等級設定顏色
const getGradeColor = (grade) => {
  switch (grade) {
    case "A+":
    case "A":
      return "green";
    case "A-":
    case "B+":
      return "cyan";
    case "B":
    case "B-":
      return "blue";
    case "C+":
    case "C":
      return "orange";
    case "C-":
      return "gold";
    case "F":
      return "red";
    default:
      return "default";
  }
};

// 查詢
const handleSearch = async () => {
  try {
    await courseRecordStore.getCourseRecords();
  } catch (err) {
    message.error("查詢失敗：" + (err.message || "未知錯誤"));
  }
};

// 重置
const handleReset = () => {
  courseRecordStore.resetSearch();
};

// 組件掛載時加載資料
onMounted(async () => {
  try {
    await courseRecordStore.getCourseRecords();
  } catch (err) {
    message.error("獲取修課紀錄失敗：" + (err.message || "未知錯誤"));
  }
});
</script>

<style scoped>
.u-p-4 {
  padding: 1rem;
}
.u-w-full {
  width: 100%;
}
.u-bg-white {
  background-color: white;
}
.u-bg-gray-50 {
  background-color: #f9fafb;
}
.u-rounded-lg {
  border-radius: 0.5rem;
}
.u-p-6 {
  padding: 1.5rem;
}
.u-p-4 {
  padding: 1rem;
}
.u-shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.u-text-2xl {
  font-size: 1.5rem;
}
.u-font-bold {
  font-weight: bold;
}
.u-mb-6 {
  margin-bottom: 1.5rem;
}
.u-c-blue {
  color: #1890ff;
}
.u-flex {
  display: flex;
}
.u-flex-wrap {
  flex-wrap: wrap;
}
.u-gap-4 {
  gap: 1rem;
}
.u-ml-2 {
  margin-left: 0.5rem;
}
</style>
