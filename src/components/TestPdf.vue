<template>
  <div class="u-p-6 u-bg-white u-rounded-16px u-shadow-lg u-max-w-3xl">
    <div class="u-flex u-items-center u-justify-between u-mb-4">
      <div>
        <h3 class="u-font-bold u-text-lg">成績單 PDF 座標測試（臨時）</h3>
        <p class="u-text-sm u-text-gray-500 u-mt-1">
          改
          <code>transcriptPdfConfig.js</code>
          後直接按下方按鈕重開預覽
        </p>
      </div>
      <button
        class="u-bg-blue-600 u-text-white u-px-4 u-py-2 u-rounded hover:u-bg-blue-700 disabled:u-opacity-50"
        :disabled="loading"
        @click="handlePreview"
      >
        {{ loading ? "產生中…" : "一鍵預覽填滿 PDF" }}
      </button>
    </div>

    <details class="u-mb-4">
      <summary class="u-cursor-pointer u-text-sm u-font-medium u-text-gray-700">
        編輯假資料（可選）
      </summary>
      <div class="u-mt-3 u-grid u-grid-cols-2 u-gap-3">
        <div
          v-for="(value, key) in formData"
          :key="key"
          class="u-flex u-flex-col"
        >
          <label :for="key" class="u-text-xs u-font-medium u-text-gray-600">{{
            key
          }}</label>
          <input
            :id="key"
            v-model="formData[key]"
            class="u-border u-p-1 u-rounded"
            :placeholder="key"
          />
        </div>
      </div>
      <div class="u-mt-3">
        <label class="u-text-xs u-font-medium u-text-gray-600"
          >課程列數（填滿用）</label
        >
        <input
          v-model.number="courseCount"
          type="number"
          min="1"
          max="20"
          class="u-border u-p-1 u-rounded u-w-24 u-ml-2"
        />
      </div>
    </details>

    <p class="u-text-xs u-text-gray-400">
      路由：<code>/dev/transcript-pdf</code> · 測完記得刪掉 route + 本元件
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { message } from "ant-design-vue";
import { useTranscriptPdf } from "@/composables/useTranscriptPdf";

const { previewPdf } = useTranscriptPdf();
const loading = ref(false);
const courseCount = ref(10);

const SAMPLE_COURSES = [
  { name: "牧者生命", credits: "3", score: "B+", note: "---" },
  { name: "馬太福音", credits: "2", score: "A", note: "---" },
  { name: "舊約導論", credits: "3", score: "A-", note: "---" },
  { name: "新約希臘文", credits: "2", score: "B", note: "重修" },
  { name: "系統神學（一）", credits: "3", score: "A", note: "---" },
  { name: "教會歷史", credits: "2", score: "B+", note: "---" },
  { name: "講道法", credits: "2", score: "A-", note: "---" },
  { name: "靈命塑造", credits: "1", score: "Pass", note: "---" },
  { name: "基督教教育", credits: "2", score: "B", note: "---" },
  { name: "實踐神學導論", credits: "3", score: "A", note: "---" },
  { name: "希伯來文初階", credits: "2", score: "C+", note: "---" },
  { name: "約翰福音研經", credits: "2", score: "A-", note: "---" },
];

const formData = ref({
  title: "2026學年度第一學期成績單",
  studentName: "陳志賢 Test",
  studentId: "NMR2501",
  major: "基督教研究碩士班",
  enrollmentDate: "2025.09",
  grade: "研碩一年級",
  releaseDate: "2026.02.05",
  transferCredits: "0",
  totalCredits: "25",
  semesterLabel: "114學年度第一學期 First Semester",
  practiceNote: "免實習",
  remarks: "這是備註測試文字對齊用",
  leaveHours: "2",
  absentHours: "0",
});

const buildCourses = () => {
  const n = Math.max(1, Math.min(20, Number(courseCount.value) || 10));
  return Array.from({ length: n }, (_, i) => {
    const base = SAMPLE_COURSES[i % SAMPLE_COURSES.length];
    return {
      ...base,
      name: i < SAMPLE_COURSES.length ? base.name : `${base.name}（${i + 1}）`,
    };
  });
};

const handlePreview = async () => {
  loading.value = true;
  try {
    await previewPdf({
      ...formData.value,
      courses: buildCourses(),
    });
  } catch (err) {
    console.error(err);
    message.error("產生 PDF 失敗");
  } finally {
    loading.value = false;
  }
};
</script>
