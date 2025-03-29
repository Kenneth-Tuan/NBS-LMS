<script setup>
import { onMounted } from "vue";

import { Divider } from "ant-design-vue";
import {
  dummyNewsData,
  dummyNoticeData,
  dummyAnnouncementData,
} from "@/data/dummy";

import { user } from "@/stores/user";

const columns = [
  {
    title: "日期",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "内容",
    dataIndex: "content",
    key: "content",
  },
  {
    title: "發佈單位",
    dataIndex: "publisher",
    key: "publisher",
  },
];

onMounted(async () => {
  await user.init();
});
</script>

<template>
  <div class="u-grid u-grid-cols-2 u-h100% u-gap-4 u-p4 u-items-start">
    <div
      class="u-p24px u-col-span-2 u-bg-white u-w100% u-h100% u-shadow u-rounded-16px"
    >
      <h1 class="u-text-24px u-font-bold u-c-blue">
        {{ "最新消息" }}
      </h1>
      <Divider class="u-my8px" />
      <a-table
        :columns="columns"
        :data-source="dummyNewsData"
        :pagination="false"
      >
        <template #headerCell="{ column }">
          <template v-if="column.key === 'name'">
            <span>{{ column.name }} </span>
          </template>
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'content'">
            <div v-html="record.content"></div>
          </template>
        </template>
      </a-table>
    </div>

    <div
      class="u-p24px u-col-span-1 u-bg-white u-w100% u-shadow u-rounded-16px"
    >
      <h1 class="u-text-24px u-font-bold u-c-blue">
        {{ "課程公告" }}
      </h1>
      <Divider class="u-my8px" />
      <a-list item-layout="vertical" :data-source="dummyAnnouncementData">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>
                {{ item.title }}
              </template>
            </a-list-item-meta>
            <ul class="u-flex u-flex-col u-gap-16px">
              <li
                v-for="(content, index) in item.contents"
                :key="index"
                v-html="content"
              ></li>
            </ul>
          </a-list-item>
        </template>
      </a-list>
    </div>

    <div
      class="u-p24px u-col-span-1 u-bg-white u-w100% u-shadow u-rounded-16px"
    >
      <h1 class="u-text-24px u-font-bold u-c-blue">
        {{ "注意事項" }}
      </h1>
      <Divider class="u-my8px" />
      <a-list item-layout="vertical" :data-source="dummyNoticeData">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>
                {{ item.title }}
              </template>
            </a-list-item-meta>
            <ul class="u-flex u-flex-col u-gap-16px">
              <li
                v-for="(content, index) in item.contents"
                :key="index"
                v-html="content"
              ></li>
            </ul>
          </a-list-item>
        </template>
      </a-list>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
