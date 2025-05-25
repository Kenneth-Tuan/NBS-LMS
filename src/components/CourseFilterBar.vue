<script setup>
import { defineProps, defineEmits, computed } from "vue";
import {
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  Select as ASelect,
  SelectOption as ASelectOption,
  Button as AButton,
} from "ant-design-vue";

const props = defineProps({
  modelValueKeyword: {
    type: String,
    default: "",
  },
  modelValueTeacher: {
    type: String,
    default: "",
  },
  teacherOptions: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  "update:modelValueKeyword",
  "update:modelValueTeacher",
]);

const internalKeyword = computed({
  get: () => props.modelValueKeyword,
  set: (value) => emit("update:modelValueKeyword", value),
});

const internalTeacher = computed({
  get: () => props.modelValueTeacher,
  set: (value) => emit("update:modelValueTeacher", value),
});

const handleReset = () => {
  internalKeyword.value = "";
  internalTeacher.value = "";
};
</script>

<template>
  <div class="u-mb-4 u-p-4 u-bg-gray-50 u-rounded-lg">
    <AForm layout="inline" class="u-flex u-flex-wrap u-gap-4">
      <AFormItem label="課程名稱">
        <AInput
          v-model:value="internalKeyword"
          placeholder="輸入課程名稱關鍵字"
          style="width: 200px"
          allow-clear
        />
      </AFormItem>

      <AFormItem label="授課老師">
        <ASelect
          v-model:value="internalTeacher"
          style="width: 180px"
          placeholder="選擇授課老師"
          allow-clear
          show-search
          :filter-option="
            (inputValue, option) =>
              option.children &&
              option.children.length > 0 &&
              option.children[0].children &&
              typeof option.children[0].children === 'string' &&
              option.children[0].children
                .toLowerCase()
                .includes(inputValue.toLowerCase())
          "
        >
          <ASelectOption
            v-for="teacherName in teacherOptions"
            :key="teacherName"
            :value="teacherName"
          >
            {{ teacherName }}
          </ASelectOption>
        </ASelect>
      </AFormItem>

      <AFormItem>
        <AButton @click="handleReset">重置篩選</AButton>
      </AFormItem>
    </AForm>
  </div>
</template>

<style scoped>
/* Styles for the filter bar if any specific ones are needed */
</style>
