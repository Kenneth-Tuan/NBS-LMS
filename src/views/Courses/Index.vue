<script setup>
const columns = [
  {
    title: "Name",
    dataIndex: "name",
  },
  {
    title: "Age",
    dataIndex: "age",
  },
  {
    title: "Address",
    dataIndex: "address",
  },
];
const data = [...Array(100)].map((_, i) => ({
  key: i,
  name: `Edward King ${i}`,
  age: 32,
  address: `London, Park Lane no. ${i}`,
}));
</script>

<template>
  <div class="u-p36px u-h100% u-w100% u-flex u-flex-col u-gap-36px">
    <div class="u-p24px u-rounded-16px u-shadow u-bg-white u-h100%">
      <h1 class="u-text-24px u-font-bold u-c-blue u-mb1.5rem">最新課程</h1>

      <a-input-search
        v-model:value="value"
        placeholder="輸入課程關鍵字"
        enter-button
        @search="onSearch"
      />
    </div>

    <a-table
      :columns="columns"
      :data-source="data"
      :pagination="{ pageSize: 50 }"
      class="u-rounded-16px u-shadow u-bg-white u-h100%"
    />
  </div>
</template>
