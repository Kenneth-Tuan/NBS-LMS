<template>
  <div class="p-4 border rounded shadow bg-white">
    <h3 class="font-bold text-lg mb-4">PDF Generation Test</h3>
    <div class="space-y-4">
      <div v-for="(value, key) in formData" :key="key" class="flex flex-col">
        <label :for="key" class="text-sm font-medium">{{ key }}</label>
        <input
          :id="key"
          v-model="formData[key]"
          class="border p-1 rounded"
          :placeholder="key"
        />
      </div>
      <button
        @click="handlePreview"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Preview PDF
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useTranscriptPdf } from "@/composables/useTranscriptPdf";

const { previewPdf } = useTranscriptPdf();

const formData = ref({
  title: "114學年度第一學期成績單",
  studentName: "陳志賢 Test",
  studentId: "NMR2501",
  major: "基督教研究碩士班",
  enrollmentDate: "2025.09",
  grade: "研碩一年級",
  releaseDate: "2026.02.05",
  transferCredits: "0",
  totalCredits: "9",
  semesterLabel: "114學年度第一學期",
  practiceNote: "免實習",
  remarks: "這是備註測試",
  leaveHours: "0",
  absentHours: "0",
});

const handlePreview = async () => {
  // Add some sample courses
  const data = {
    ...formData.value,
    courses: [
      { name: "牧者生命", credits: "3", score: "B+", note: "---" },
      { name: "馬太福音", credits: "2", score: "A", note: "---" },
      {
        name: "測試課程 Long Course Name Here",
        credits: "2",
        score: "A-",
        note: "---",
      },
    ],
  };
  await previewPdf(data);
};
</script>
