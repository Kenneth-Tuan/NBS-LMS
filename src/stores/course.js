import { defineStore } from "pinia";
import { computed, reactive, ref, h } from "vue";

import { dummyCourseData } from "@/data/dummy";

export const useCourseStore = defineStore(
  "course",
  () => {
    const courses = ref(dummyCourseData);

    const courseTableColumns = computed(() => [
      {
        title: "封面",
        dataIndex: "image",
        key: "image",

      },
    //   {
    //     title: "ID",
    //     dataIndex: "id",
    //     display: false,
    //     key: "id",
    //     sorter: (a, b) => a.id - b.id,
    //   },
      {
        title: "課程名稱",
        dataIndex: "title",
        key: "title",
        // ellipsis: true,
        // resizable: true
      },
      {
        title: "狀態",
        dataIndex: "status",
        key: "status",
        filters: [
          { text: "招生中", value: "招生中" },
          { text: "即將額滿", value: "即將額滿" },
        ],
        onFilter: (value, record) => record.status === value,
      },
      {
        title: "類型",
        dataIndex: "type",
        key: "type",
      },
      {
        title: "時數",
        dataIndex: "duration",
        key: "duration",
      },
      {
        title: "講師",
        dataIndex: "instructor",
        key: "instructor",
      },
      {
        title: "開課日期",
        dataIndex: "startDate",
        key: "startDate",
        sorter: (a, b) => new Date(a.startDate) - new Date(b.startDate),
      },
      {
        title: "上課方式",
        dataIndex: "classType",
        key: "classType",
      },
    ]);

    const searchCourseCriteria = reactive({
      title: "",
    });

    const courseTablePagination = reactive({
      pageSize: 10,
      current: 1,
      pageSizeOptions: ["10", "20", "50"],
      total: dummyCourseData.length,
    });

    return {
      courses,
      searchCourseCriteria,
      courseTableColumns,
      courseTablePagination,
    };
  },
  {
    persist: false,
  }
);
