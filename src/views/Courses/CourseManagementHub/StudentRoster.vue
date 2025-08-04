<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

import courseApi from "@/apis/course";

const route = useRoute();

const course_id = ref(route.params.id);

const students = ref([]);

onMounted(async () => {
  try {
    const {data} = await courseApi.getStudentList(course_id.value);
    students.value = [...data.data.students];
  } catch (error) {
    console.error("getStudentList error", error);
  }
});

// Columns
const studentRosterColumns = [
  { title: "學生姓名", dataIndex: "name", key: "name" },
  { title: "Email", dataIndex: "email", key: "email" },
];
</script>

<template>
  <a-table
    :columns="studentRosterColumns"
    :data-source="students"
    row-key="name"
    size="small"
    :pagination="false"  
  >
  </a-table>
</template>
