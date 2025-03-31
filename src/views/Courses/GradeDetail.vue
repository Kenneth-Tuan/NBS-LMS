<template>
  <div class="u-p-4 u-w-full">
    <div class="u-bg-white u-rounded-lg u-p-6 u-shadow-md">
      <div class="u-flex u-justify-between u-items-center u-mb-6">
        <h1 class="u-text-2xl u-font-bold u-c-blue">成績詳情</h1>
        <a-button @click="goBack">
          <template #icon><i class="fas fa-arrow-left"></i></template>
          返回修課紀錄
        </a-button>
      </div>

      <a-spin :spinning="loading">
        <a-empty v-if="!courseRecord" description="找不到課程紀錄" />

        <template v-else>
          <!-- 課程基本信息 -->
          <div class="u-mb-6 u-bg-gray-50 u-p-6 u-rounded-lg">
            <div class="u-flex u-justify-between u-items-center u-mb-4">
              <div>
                <h2 class="u-text-xl u-font-bold u-mb-2">
                  {{ courseRecord.courseName }}
                </h2>
                <p class="u-text-gray-600">
                  {{ courseRecord.semester }} | {{ courseRecord.teacher }}
                </p>
              </div>
              <div class="u-flex u-items-center">
                <span class="u-mr-2 u-text-lg">總成績：</span>
                <a-tag
                  :color="getGradeColor(courseRecord.grade)"
                  class="u-text-lg u-px-4 u-py-1"
                >
                  {{ courseRecord.grade }}
                </a-tag>
              </div>
            </div>
            <a-progress
              :percent="calculateGradePercent(courseRecord.gradeDetails?.total)"
              :stroke-color="getGradeColorHex(courseRecord.grade)"
              :show-info="false"
              class="u-mb-1"
            />
            <div class="u-flex u-justify-between u-text-sm u-text-gray-500">
              <span>0</span>
              <span>及格 (60)</span>
              <span>100</span>
            </div>
          </div>

          <!-- 成績詳細信息 -->
          <div class="u-mb-6">
            <h3 class="u-text-lg u-font-bold u-mb-4">成績明細</h3>
            <a-row :gutter="16">
              <a-col :xs="24" :md="12" class="u-mb-4">
                <a-card title="出席情況" class="u-h-full">
                  <div class="u-flex u-justify-between u-mb-2">
                    <span>出席率</span>
                    <span class="u-font-bold"
                      >{{ calculateAttendanceRate() }}%</span
                    >
                  </div>
                  <div class="u-flex u-justify-between u-mb-4">
                    <span>出席次數 / 總課堂數</span>
                    <span
                      >{{
                        courseRecord.gradeDetails.attendance.attendedLessons
                      }}
                      /
                      {{
                        courseRecord.gradeDetails.attendance.totalLessons
                      }}</span
                    >
                  </div>
                  <a-progress
                    :percent="calculateAttendanceRate()"
                    :stroke-color="
                      getAttendanceColor(calculateAttendanceRate())
                    "
                  />
                </a-card>
              </a-col>
              <a-col :xs="24" :md="12" class="u-mb-4">
                <a-card title="課堂參與度" class="u-h-full">
                  <div class="u-flex u-justify-between u-mb-4">
                    <span>分數 (滿分 20)</span>
                    <span class="u-font-bold">{{
                      courseRecord.gradeDetails.participation.score
                    }}</span>
                  </div>
                  <a-progress
                    :percent="
                      (courseRecord.gradeDetails.participation.score / 20) * 100
                    "
                    :stroke-color="
                      getComponentScoreColor(
                        courseRecord.gradeDetails.participation.score,
                        20
                      )
                    "
                  />
                </a-card>
              </a-col>
              <a-col :xs="24" :md="12" class="u-mb-4">
                <a-card title="期中報告" class="u-h-full">
                  <div class="u-flex u-justify-between u-mb-4">
                    <span>分數 (滿分 40)</span>
                    <span class="u-font-bold">{{
                      courseRecord.gradeDetails.midterm.score
                    }}</span>
                  </div>
                  <a-progress
                    :percent="
                      (courseRecord.gradeDetails.midterm.score / 40) * 100
                    "
                    :stroke-color="
                      getComponentScoreColor(
                        courseRecord.gradeDetails.midterm.score,
                        40
                      )
                    "
                  />
                </a-card>
              </a-col>
              <a-col :xs="24" :md="12" class="u-mb-4">
                <a-card title="期末報告" class="u-h-full">
                  <div class="u-flex u-justify-between u-mb-4">
                    <span>分數 (滿分 40)</span>
                    <span class="u-font-bold">{{
                      courseRecord.gradeDetails.final.score
                    }}</span>
                  </div>
                  <a-progress
                    :percent="
                      (courseRecord.gradeDetails.final.score / 40) * 100
                    "
                    :stroke-color="
                      getComponentScoreColor(
                        courseRecord.gradeDetails.final.score,
                        40
                      )
                    "
                  />
                </a-card>
              </a-col>
            </a-row>
          </div>

          <!-- 隨堂考試 -->
          <div v-if="courseRecord.gradeDetails.quizzes.scores.length > 0">
            <h3 class="u-text-lg u-font-bold u-mb-4">隨堂考試</h3>
            <a-card>
              <a-table
                :dataSource="quizDataSource"
                :columns="quizColumns"
                :pagination="false"
                size="small"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'score'">
                    <div class="u-flex u-items-center">
                      <span class="u-mr-2">{{ record.score }}</span>
                      <a-progress
                        :percent="(record.score / 40) * 100"
                        :stroke-color="getComponentScoreColor(record.score, 40)"
                        :show-info="false"
                        style="width: 100px"
                      />
                    </div>
                  </template>
                </template>
              </a-table>
              <div class="u-mt-4 u-flex u-justify-between u-items-center">
                <span>平均分數：</span>
                <span class="u-font-bold">{{
                  courseRecord.gradeDetails.quizzes.average
                }}</span>
              </div>
            </a-card>
          </div>

          <!-- 總成績計算 -->
          <div class="u-mt-6">
            <h3 class="u-text-lg u-font-bold u-mb-4">總成績計算</h3>
            <a-card>
              <a-table
                :dataSource="totalScoreDataSource"
                :columns="totalScoreColumns"
                :pagination="false"
                size="small"
                :bordered="true"
              />
            </a-card>
          </div>
        </template>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { RouterName } from "@/enums/appEnums";
import { message } from "ant-design-vue";
import { useCourseRecordStore } from "@/stores/courseRecord";

const route = useRoute();
const router = useRouter();
const courseRecordStore = useCourseRecordStore();
const loading = ref(true);
const courseId = route.params.id;

// 課程詳情
const courseRecord = computed(() => courseRecordStore.selectedCourseRecord);

// 返回上一頁
const goBack = () => {
  router.push({ name: RouterName.CourseRecord });
};

// 隨堂考試表格欄位
const quizColumns = [
  {
    title: "考試編號",
    dataIndex: "id",
    key: "id",
    width: "20%",
  },
  {
    title: "分數 (滿分 40)",
    dataIndex: "score",
    key: "score",
    width: "80%",
  },
];

// 隨堂考試資料
const quizDataSource = computed(() => {
  if (!courseRecord.value || !courseRecord.value.gradeDetails) return [];

  return courseRecord.value.gradeDetails.quizzes.scores.map((score, index) => ({
    key: index,
    id: `Quiz ${index + 1}`,
    score,
  }));
});

// 總成績計算表格欄位
const totalScoreColumns = [
  {
    title: "評分項目",
    dataIndex: "item",
    key: "item",
    width: "30%",
  },
  {
    title: "權重",
    dataIndex: "weight",
    key: "weight",
    width: "20%",
  },
  {
    title: "得分",
    dataIndex: "score",
    key: "score",
    width: "20%",
  },
  {
    title: "加權得分",
    dataIndex: "weightedScore",
    key: "weightedScore",
    width: "30%",
  },
];

// 總成績計算資料
const totalScoreDataSource = computed(() => {
  if (!courseRecord.value || !courseRecord.value.gradeDetails) return [];

  const details = courseRecord.value.gradeDetails;
  const attendanceScore = details.attendance.score;
  const participationScore = details.participation.score;
  const midtermScore = details.midterm.score;
  const finalScore = details.final.score;
  const quizAverage = details.quizzes.average || 0;

  const attendanceWeightedScore = attendanceScore * 0.2;
  const participationWeightedScore = participationScore * 0.1;
  const midtermWeightedScore = midtermScore * 0.3;
  const finalWeightedScore = finalScore * 0.3;
  const quizWeightedScore = quizAverage * 0.1;

  const totalScore = details.total;

  return [
    {
      key: "attendance",
      item: "出席",
      weight: "20%",
      score: attendanceScore,
      weightedScore: attendanceWeightedScore.toFixed(1),
    },
    {
      key: "participation",
      item: "課堂參與度",
      weight: "10%",
      score: participationScore,
      weightedScore: participationWeightedScore.toFixed(1),
    },
    {
      key: "midterm",
      item: "期中報告",
      weight: "30%",
      score: midtermScore,
      weightedScore: midtermWeightedScore.toFixed(1),
    },
    {
      key: "final",
      item: "期末報告",
      weight: "30%",
      score: finalScore,
      weightedScore: finalWeightedScore.toFixed(1),
    },
    {
      key: "quiz",
      item: "隨堂考試",
      weight: "10%",
      score: quizAverage,
      weightedScore: quizWeightedScore.toFixed(1),
    },
    {
      key: "total",
      item: "總分",
      weight: "100%",
      score: "-",
      weightedScore: totalScore,
    },
  ];
});

// 計算出席率
const calculateAttendanceRate = () => {
  if (!courseRecord.value || !courseRecord.value.gradeDetails) return 0;

  const { attendedLessons, totalLessons } =
    courseRecord.value.gradeDetails.attendance;
  return Math.round((attendedLessons / totalLessons) * 100);
};

// 計算成績百分比
const calculateGradePercent = (totalScore) => {
  if (!totalScore) return 0;
  return totalScore;
};

// 依成績獲取顏色
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

// 依成績獲取色碼
const getGradeColorHex = (grade) => {
  switch (grade) {
    case "A+":
    case "A":
      return "#52c41a";
    case "A-":
    case "B+":
      return "#13c2c2";
    case "B":
    case "B-":
      return "#1890ff";
    case "C+":
    case "C":
      return "#fa8c16";
    case "C-":
      return "#faad14";
    case "F":
      return "#f5222d";
    default:
      return "#d9d9d9";
  }
};

// 依出席率獲取顏色
const getAttendanceColor = (rate) => {
  if (rate >= 90) return "#52c41a";
  if (rate >= 80) return "#13c2c2";
  if (rate >= 70) return "#1890ff";
  if (rate >= 60) return "#fa8c16";
  return "#f5222d";
};

// 依各項成績獲取顏色
const getComponentScoreColor = (score, maxScore) => {
  const percent = (score / maxScore) * 100;
  if (percent >= 90) return "#52c41a";
  if (percent >= 80) return "#13c2c2";
  if (percent >= 70) return "#1890ff";
  if (percent >= 60) return "#fa8c16";
  return "#f5222d";
};

// 獲取課程成績詳情
onMounted(async () => {
  try {
    loading.value = true;
    const result = courseRecordStore.getCourseGradeById(courseId);

    if (!result) {
      message.error("找不到課程紀錄");
    }
  } catch (err) {
    message.error("獲取成績詳情失敗：" + (err.message || "未知錯誤"));
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.u-p-4 {
  padding: 1rem;
}
.u-p-6 {
  padding: 1.5rem;
}
.u-px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}
.u-py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}
.u-w-full {
  width: 100%;
}
.u-h-full {
  height: 100%;
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
.u-shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.u-text-2xl {
  font-size: 1.5rem;
}
.u-text-xl {
  font-size: 1.25rem;
}
.u-text-lg {
  font-size: 1.125rem;
}
.u-text-sm {
  font-size: 0.875rem;
}
.u-font-bold {
  font-weight: bold;
}
.u-mb-1 {
  margin-bottom: 0.25rem;
}
.u-mb-2 {
  margin-bottom: 0.5rem;
}
.u-mb-4 {
  margin-bottom: 1rem;
}
.u-mb-6 {
  margin-bottom: 1.5rem;
}
.u-mt-4 {
  margin-top: 1rem;
}
.u-mt-6 {
  margin-top: 1.5rem;
}
.u-mr-2 {
  margin-right: 0.5rem;
}
.u-c-blue {
  color: #1890ff;
}
.u-text-gray-500 {
  color: #6b7280;
}
.u-text-gray-600 {
  color: #4b5563;
}
.u-flex {
  display: flex;
}
.u-items-center {
  align-items: center;
}
.u-justify-between {
  justify-content: space-between;
}
.u-justify-center {
  justify-content: center;
}
</style>
