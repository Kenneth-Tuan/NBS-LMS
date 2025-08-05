<script setup>
import { computed, reactive, ref, onMounted } from "vue";
import { message } from "ant-design-vue";
import {
  SettingOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons-vue";
import { useRoute } from "vue-router";

import scoreApi from "@/apis/score";
import { UserRole } from "@/enums/appEnums";
import { useUserStore } from "@/stores/user";

const route = useRoute();

const course_id = ref(route.params.id);

const { userProfile } = useUserStore();

const isTeacherOrCreator = computed(() => {
  return (
    userProfile?.userRole === UserRole.Creator ||
    userProfile?.userRole === UserRole.Admin ||
    userProfile?.userRole === UserRole.Manager ||
    userProfile?.userRole === UserRole.Teacher
  );
});

const isStudent = computed(() => {
  return userProfile?.userRole === UserRole.Student;
});

// Local state for column configuration
const showColumnSelector = ref(false);

// Add item form state
const addItemForm = reactive({
  title: "",
});

const scoreItems = ref([]);
const scoreSheet = ref([]);
const myScores = ref([]);

const gradebookColumns = computed(() => {
  const baseColumns = [
    {
      title: "學生姓名",
      dataIndex: "student_name",
      key: "student_name",
      fixed: "left",
      width: 120,
    },
  ];

  // 根據 ordering 對 scoreItems 進行排序
  const sortedScoreItems = scoreItems.value
    ? [...scoreItems.value].sort((a, b) => a.ordering - b.ordering)
    : [];

  // Generate columns based on sorted grade items
  const gradeItemColumns = sortedScoreItems.map((item) => {
    return {
      title: item.item_name,
      dataIndex: item.item_id,
      key: item.item_id,
      width: 100,
      align: "center",
      sorter: true,
      render: (value) => value || "-",
    };
  });

  return isTeacherOrCreator.value ? [...baseColumns, ...gradeItemColumns] : [...gradeItemColumns];
});

const gradebookDataSource = computed(() => {
  if (
    (isTeacherOrCreator.value && (!scoreSheet.value || !scoreItems.value)) ||
    (isStudent.value && !myScores.value)
  ) {
    return [];
  }

  if (isTeacherOrCreator.value) {
  // 根據 ordering 對 scoreItems 進行排序
  const sortedScoreItems = [...scoreItems.value].sort(
    (a, b) => a.ordering - b.ordering
  );

  // 建立 scoreItemId 到 ordering 的映射
  const scoreItemOrderMap = {};
  sortedScoreItems.forEach((item) => {
    scoreItemOrderMap[item.item_id] = item.ordering;
  });

  return scoreSheet.value.map((studentRecord) => {
    // 建立新的學生記錄物件
    const formattedRecord = {
      student_id: studentRecord.student_id,
      student_name: studentRecord.student_name,
    };

    // 根據 ordering 排序的 scoreItems 來建立成績欄位
    sortedScoreItems.forEach((scoreItem) => {
      const itemId = scoreItem.item_id;

      // 在學生的 scores 陣列中找到對應的成績
      const scoreData = studentRecord.scores?.find(
        (score) => score.score_item_id === itemId
      );

      // 將成績值設定到對應的欄位
      formattedRecord[itemId] = scoreData?.score || null;
    });

      return formattedRecord;
    });
  }

  if (isStudent.value) {
    return myScores.value.map((score) => ({
      [score.score_item_id]: score.score,
    }));
  }
});

// Methods
const handleGradeChange = (studentId, scoreItemId, el) => {
  const score = el.target.value ?? null;
  const formatedScore = score ? parseInt(score, 10) : null;
  console.log("handleGradeChange", studentId, scoreItemId, score);

  if (score !== null && (isNaN(score) || score < 0 || score > 100)) {
    message.error("請輸入 0-100 之間的有效分數");
    return;
  }

  submitScore(studentId, scoreItemId, formatedScore);
};

async function addScoreItem(item_name) {
  try {
    const response = await scoreApi.addScoreItem(course_id.value, item_name);

    // 檢查 API 回應狀態
    if (response && response.status === 200) {
      message.success("評分項目添加成功");
      console.log("addScoreItem success:", response);
      // 重新獲取評分項目列表
      await getScoreItems();
      // 重置表單並隱藏添加表單
      resetAddItemForm();
    } else {
      message.error("評分項目添加失敗");
      console.error("addScoreItem failed:", response);
    }
  } catch (error) {
    console.error("addScoreItem error", error);
    message.error("評分項目添加失敗，請稍後重試");
  }
}

// 重置添加項目表單
const resetAddItemForm = () => {
  addItemForm.title = "";
};

// 處理添加項目
const handleAddItem = () => {
  if (!addItemForm.title.trim()) {
    message.error("請輸入項目名稱");
    return;
  }

  addScoreItem(addItemForm.title);
};

const handleCancelAddItem = () => {
  resetAddItemForm();
  showColumnSelector.value = false;
};

async function getScoreSheet() {
  try {
    const {
      data: {
        data: { data_rows, score_items },
      },
    } = await scoreApi.getScoreSheet(course_id.value);

    scoreSheet.value = data_rows;
  } catch (error) {
    console.error("getScoreSheet error", error);
  }
}

async function getScoreItems() {
  try {
    const {
      data: {
        data: { items },
      },
    } = await scoreApi.getScoreItem(course_id.value);

    scoreItems.value = items;
  } catch (error) {
    console.error("getScoreItem error", error);
  }
}

async function reorderScoreItem(item_id, ordering) {
  const params = {
    items: [
      {
        item_id: item_id,
        ordering: ordering,
      },
    ],
  };

  try {
    const response = await scoreApi.reorderScoreItem(params);

    // 檢查 API 回應狀態
    if (response && response.status === 200) {
      message.success("成績項目順序更新成功");
      console.log("reorderScoreItem success:", response);
      // 重新獲取評分項目列表
      await getScoreItems();
    } else {
      message.error("成績項目順序更新失敗");
      console.error("reorderScoreItem failed:", response);
    }
  } catch (error) {
    console.error("reorderScoreItem error", error);
    message.error("成績項目順序更新失敗，請稍後重試");
  }
}

async function deleteScoreItem(item_id) {
  try {
    const response = await scoreApi.deleteScoreItem(item_id);

    // 檢查 API 回應狀態
    if (response && response.status === 200) {
      message.success("成績項目刪除成功");
      console.log("deleteScoreItem success:", response);
      // 重新獲取評分項目列表
      await getScoreItems();
    } else {
      message.error("成績項目刪除失敗");
      console.error("deleteScoreItem failed:", response);
    }
  } catch (error) {
    console.error("deleteScoreItem error", error);
    message.error("成績項目刪除失敗，請稍後重試");
  }
}

async function submitScore(student_id, score_item_id, score) {
  const params = {
    student_id,
    score_item_id,
    score,
  };

  try {
    const response = await scoreApi.submitScore(params);

    // 檢查 API 回應狀態
    if (response && response.status === 200) {
      await getScoreSheet();
      message.success("成績更新成功");
      console.log("submitScore success:", response);
    } else {
      message.error("成績更新失敗");
      console.error("submitScore failed:", response);
    }
  } catch (error) {
    console.error("submitScore error", error);
    message.error("成績更新失敗，請稍後重試");
  }
}

async function onClickShowColumnSelector() {
  try {
    await getScoreItems();
    showColumnSelector.value = true;
  } catch (error) {
    console.error("onClickShowColumnSelector error", error);
  }
}

async function getMyScore() {
  try {
    const {
      data: {
        data: { scores },
      },
    } = await scoreApi.getMyScore(course_id.value);
    myScores.value = scores;
  } catch (error) {
    console.error("getMyScore error", error);
  }
}

onMounted(async () => {
  if (isTeacherOrCreator.value) await getScoreSheet();
  if (isStudent.value) await getMyScore();
  await getScoreItems();
});
</script>

<template>
  <!-- Teacher/Creator Grade Input View -->

  <div class="u-flex u-items-center u-justify-between u-mb-4">
    <div>
      <p class="u-text-sm u-c-gray-600">
        {{
          isTeacherOrCreator
            ? "在此輸入或編輯學生成績。分數範圍 0-100。"
            : "我的成績"
        }}
      </p>
    </div>
    <a-button
      v-if="isTeacherOrCreator"
      type="primary"
      @click="onClickShowColumnSelector"
      class="u-mb-2"
    >
      <template #icon><PlusOutlined /></template>
      添加評分項目
    </a-button>
  </div>

  <!-- Column Selector Modal -->
  <a-modal v-model:open="showColumnSelector" title="添加評分項目" width="900px">
    <div class="u-max-w-full">
      <div>
        <label class="u-block u-text-sm u-font-medium u-mb-2">項目名稱</label>
        <a-input
          v-model:value="addItemForm.title"
          placeholder="請輸入評分項目名稱"
          size="large"
        />
      </div>

      <div class="u-flex u-space-x-3"></div>
    </div>

    <template #footer>
      <a-button type="primary" @click="handleAddItem" :loading="false">
        確認添加
      </a-button>
      <a-button @click="handleCancelAddItem"> 取消 </a-button>
    </template>
  </a-modal>

  <a-table
    :columns="gradebookColumns"
    :data-source="gradebookDataSource"
    bordered
    size="small"
    :scroll="{ x: 'max-content' }"
    row-key="student_id"
  >
    <template #bodyCell="{ column, record, value }">
      <template v-if="isTeacherOrCreator && column.key !== 'student_name'">
        <div class="grade-input-wrapper">
          <a-input-number
            :value="value"
            :min="0"
            :max="100"
            :precision="0"
            placeholder="-"
            size="small"
            style="width: 80px"
            @blur="(el) => handleGradeChange(record.student_id, column.key, el)"
          />
        </div>
      </template>
    </template>
  </a-table>
</template>

<style scoped>
.grade-input-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
</style>
