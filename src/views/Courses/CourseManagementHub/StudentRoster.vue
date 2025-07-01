<script setup>
// Props
defineProps({
  students: {
    type: Array,
    default: () => [],
  },
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
    row-key="id"
    size="small"
    :pagination="{ pageSize: 10 }"
  >
  </a-table>
</template>
