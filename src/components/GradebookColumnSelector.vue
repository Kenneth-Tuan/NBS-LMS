<script setup>
import { computed, reactive, ref, watch } from "vue";
import { message } from "ant-design-vue";
import {
  PlusOutlined,
  DeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons-vue";
import {
  GradeItemType,
  GradeItemConfig,
  DefaultGradeItems,
} from "@/enums/gradeEnums";
import { isFeatureEnabled } from "@/config/featureFlags";

// Props
const props = defineProps({
  assignments: {
    type: Array,
    default: () => [],
  },
  modelValue: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(["update:modelValue"]);

// Local state
const selectedItems = ref([...props.modelValue]);
const showAddModal = ref(false);
const editingItem = ref(null);

// Form for adding new grade items
const addItemForm = reactive({
  type: "",
  title: "",
  weight: 10,
  assignmentId: null, // For assignment type
});

// Available assignment options
const assignmentOptions = computed(() =>
  props.assignments.map((assignment) => ({
    label: assignment.title,
    value: assignment.id,
  }))
);

// Available grade item types (excluding assignments that are already added)
const availableTypes = computed(() => {
  const usedAssignments = selectedItems.value
    .filter((item) => item.type === GradeItemType.ASSIGNMENT)
    .map((item) => item.assignmentId);

  const types = Object.keys(GradeItemConfig).map((type) => ({
    label: GradeItemConfig[type].label,
    value: type,
    icon: GradeItemConfig[type].icon,
    description: GradeItemConfig[type].description,
  }));

  return types;
});

// Watch for changes and emit
watch(
  selectedItems,
  (newValue) => {
    emit("update:modelValue", [...newValue]);
  },
  { deep: true }
);

// Initialize with default items if empty
if (selectedItems.value.length === 0) {
  selectedItems.value = [...DefaultGradeItems];
}

// Feature flag for weight configuration
const isWeightConfigEnabled = computed(() =>
  isFeatureEnabled("gradebook.enableWeightConfiguration")
);

// Methods
const openAddModal = () => {
  resetAddForm();
  showAddModal.value = true;
};

const resetAddForm = () => {
  addItemForm.type = "";
  addItemForm.title = "";
  if (isWeightConfigEnabled.value) {
    addItemForm.weight = 10;
  }
  addItemForm.assignmentId = null;
};

const handleAddItem = () => {
  if (!addItemForm.type) {
    message.error("請選擇評分項目類型");
    return;
  }

  if (!addItemForm.title.trim()) {
    message.error("請輸入項目名稱");
    return;
  }

  if (
    addItemForm.type === GradeItemType.ASSIGNMENT &&
    !addItemForm.assignmentId
  ) {
    message.error("請選擇作業");
    return;
  }

  // Check for duplicate assignments
  if (addItemForm.type === GradeItemType.ASSIGNMENT) {
    const existingAssignment = selectedItems.value.find(
      (item) =>
        item.type === GradeItemType.ASSIGNMENT &&
        item.assignmentId === addItemForm.assignmentId
    );
    if (existingAssignment) {
      message.error("該作業已添加");
      return;
    }
  }

  const newItem = {
    id: `${addItemForm.type}_${Date.now()}`,
    type: addItemForm.type,
    title: addItemForm.title,
    weight: isWeightConfigEnabled.value ? addItemForm.weight : 10, // 默認權重10%
    enabled: true,
    assignmentId: addItemForm.assignmentId,
  };

  selectedItems.value.push(newItem);
  showAddModal.value = false;
  message.success("評分項目已添加");
};

const removeItem = (index) => {
  selectedItems.value.splice(index, 1);
  message.success("評分項目已移除");
};

const toggleItemEnabled = (index) => {
  selectedItems.value[index].enabled = !selectedItems.value[index].enabled;
};

const updateWeight = (index, weight) => {
  if (weight < 0 || weight > 100) {
    message.error("權重必須在 0-100 之間");
    return;
  }
  selectedItems.value[index].weight = weight;
};

// Auto-generate title when type changes
watch(
  () => addItemForm.type,
  (newType) => {
    if (newType && newType !== GradeItemType.ASSIGNMENT) {
      addItemForm.title = GradeItemConfig[newType].label;
    } else {
      addItemForm.title = "";
    }
  }
);

// Auto-generate title when assignment changes
watch(
  () => addItemForm.assignmentId,
  (newAssignmentId) => {
    if (newAssignmentId && addItemForm.type === GradeItemType.ASSIGNMENT) {
      const assignment = props.assignments.find(
        (a) => a.id === newAssignmentId
      );
      if (assignment) {
        addItemForm.title = assignment.title;
      }
    }
  }
);

// Calculate total weight
const totalWeight = computed(() =>
  selectedItems.value
    .filter((item) => item.enabled)
    .reduce((sum, item) => sum + item.weight, 0)
);

const isWeightValid = computed(() => totalWeight.value === 100);
</script>

<template>
  <div class="gradebook-column-selector">
    <div class="u-flex u-items-center u-justify-between u-mb-4">
      <div>
        <h4 class="u-text-lg u-font-semibold u-mb-1">評分項目設定</h4>
        <p class="u-text-sm u-c-gray-600">選擇要在成績簿中顯示的評分項目</p>
      </div>
      <a-button type="primary" @click="openAddModal">
        <template #icon><PlusOutlined /></template>
        添加項目
      </a-button>
    </div>

    <!-- Weight Summary -->
    <div
      v-if="isWeightConfigEnabled"
      class="u-mb-4 u-p-3 u-bg-gray-50 u-rounded-lg"
    >
      <div class="u-flex u-items-center u-justify-between">
        <span class="u-text-sm u-font-medium">總權重:</span>
        <span
          :class="{
            'u-text-green-600': isWeightValid,
            'u-text-red-600': !isWeightValid,
            'u-font-semibold': true,
          }"
        >
          {{ totalWeight }}%
        </span>
      </div>
      <div v-if="!isWeightValid" class="u-text-xs u-c-red-600 u-mt-1">
        總權重應為 100%
      </div>
    </div>

    <!-- Selected Items List -->
    <div class="selected-items">
      <div
        v-for="(item, index) in selectedItems"
        :key="item.id"
        class="item-card u-border u-rounded-lg u-p-4 u-mb-3"
        :class="{
          'u-border-gray-200': item.enabled,
          'u-border-gray-100 u-bg-gray-50': !item.enabled,
        }"
      >
        <div class="u-flex u-items-center u-justify-between">
          <div class="u-flex u-items-center u-space-x-3">
            <a-switch
              :checked="item.enabled"
              @change="toggleItemEnabled(index)"
              size="small"
            />
            <div>
              <div class="u-flex u-items-center u-space-x-2">
                <span class="u-text-lg">{{
                  GradeItemConfig[item.type]?.icon
                }}</span>
                <span
                  class="u-font-medium"
                  :class="{ 'u-c-gray-400': !item.enabled }"
                >
                  {{ item.title }}
                </span>
                <a-tag
                  size="small"
                  :color="
                    item.type === GradeItemType.ASSIGNMENT ? 'blue' : 'green'
                  "
                >
                  {{ GradeItemConfig[item.type]?.label }}
                </a-tag>
              </div>
              <p class="u-text-xs u-c-gray-500 u-mt-1">
                {{ GradeItemConfig[item.type]?.description }}
              </p>
            </div>
          </div>

          <div class="u-flex u-items-center u-space-x-3">
            <div
              v-if="isWeightConfigEnabled"
              class="u-flex u-items-center u-space-x-2"
            >
              <span class="u-text-sm u-c-gray-600">權重:</span>
              <a-input-number
                :value="item.weight"
                @change="(value) => updateWeight(index, value)"
                :min="0"
                :max="100"
                :disabled="!item.enabled"
                size="small"
                style="width: 80px"
                :formatter="(value) => `${value}%`"
                :parser="(value) => value.replace('%', '')"
              />
            </div>
            <a-button
              type="text"
              danger
              size="small"
              @click="removeItem(index)"
            >
              <template #icon><DeleteOutlined /></template>
            </a-button>
          </div>
        </div>
      </div>

      <div
        v-if="selectedItems.length === 0"
        class="u-text-center u-py-8 u-c-gray-400"
      >
        <SettingOutlined class="u-text-2xl u-mb-2" />
        <p>尚未添加任何評分項目</p>
        <p class="u-text-sm">點擊「添加項目」開始設定</p>
      </div>
    </div>

    <!-- Add Item Modal -->
    <a-modal
      v-model:open="showAddModal"
      title="添加評分項目"
      @ok="handleAddItem"
      @cancel="resetAddForm"
    >
      <div class="u-space-y-4">
        <div>
          <label class="u-block u-text-sm u-font-medium u-mb-2">項目類型</label>
          <a-select
            v-model:value="addItemForm.type"
            placeholder="選擇評分項目類型"
            style="width: 100%"
          >
            <a-select-option
              v-for="type in availableTypes"
              :key="type.value"
              :value="type.value"
            >
              <div class="u-flex u-items-center u-space-x-2">
                <span>{{ type.icon }}</span>
                <span>{{ type.label }}</span>
              </div>
            </a-select-option>
          </a-select>
        </div>

        <div v-if="addItemForm.type === GradeItemType.ASSIGNMENT">
          <label class="u-block u-text-sm u-font-medium u-mb-2">選擇作業</label>
          <a-select
            v-model:value="addItemForm.assignmentId"
            placeholder="選擇要添加的作業"
            style="width: 100%"
          >
            <a-select-option
              v-for="assignment in assignmentOptions"
              :key="assignment.value"
              :value="assignment.value"
            >
              {{ assignment.label }}
            </a-select-option>
          </a-select>
        </div>

        <div>
          <label class="u-block u-text-sm u-font-medium u-mb-2">項目名稱</label>
          <a-input
            v-model:value="addItemForm.title"
            placeholder="輸入項目名稱"
            :disabled="
              addItemForm.type === GradeItemType.ASSIGNMENT &&
              addItemForm.assignmentId
            "
          />
        </div>

        <div v-if="isWeightConfigEnabled">
          <label class="u-block u-text-sm u-font-medium u-mb-2">權重 (%)</label>
          <a-input-number
            v-model:value="addItemForm.weight"
            :min="0"
            :max="100"
            style="width: 100%"
            :formatter="(value) => `${value}%`"
            :parser="(value) => value.replace('%', '')"
          />
        </div>

        <div v-if="addItemForm.type" class="u-p-3 u-bg-blue-50 u-rounded-lg">
          <p class="u-text-sm u-c-blue-600">
            {{ GradeItemConfig[addItemForm.type]?.description }}
          </p>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
.gradebook-column-selector {
  max-width: 800px;
}

.item-card {
  transition: all 0.2s ease;
}

.item-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
