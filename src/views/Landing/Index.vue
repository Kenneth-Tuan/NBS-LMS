<script setup>
import { Divider } from "ant-design-vue";

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

const data = [
  {
    key: "1",
    date: "2025-02-24",
    content:
      "AI聯盟（113-2）其 ZA-001(機率與統計) 及 ZA-002(深度學習) 自114年2月20日上午10時開放加簽至限選人數額滿為止。",
    publisher: "教務處課務組",
  },
  {
    key: "2",
    date: "2025-02-24",
    content: `<p><span style="font-size:12pt"><span style="font-family:Calibri,sans-serif"><span style="font-size:13.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="color:black">AI</span></span></span><span style="font-size:13.5pt"><span style="font-family:&quot;新細明體&quot;,serif"><span style="color:black">聯盟（</span></span></span><span style="font-size:13.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="color:black">113-2</span></span></span><span style="font-size:13.5pt"><span style="font-family:&quot;新細明體&quot;,serif"><span style="color:black">）課程遠距上課位置資訊：官網「學生專區</span></span></span><span style="font-size:13.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif"><span style="color:black">/113</span></span></span><span style="font-size:13.5pt"><span style="font-family:&quot;新細明體&quot;,serif"><span style="color:black">學年度下學期」：</span></span></span><a href="https://taicatw.net/spring-113/" style="font-variant-ligatures:normal; font-variant-caps:normal; orphans:2; text-align:start; widows:2; -webkit-text-stroke-width:0px; word-spacing:0px; color:blue; text-decoration:underline" target="_blank"><span style="font-size:13.5pt"><span style="font-family:&quot;Times New Roman&quot;,serif">https://taicatw.net/spring-113/</span></span></a></span></span></p><p><span style="font-size:12pt"><span style="background-color:white"><span style="font-family:Calibri,sans-serif"><span style="font-size:9.0pt"><span style="font-family:&quot;微軟正黑體&quot;,sans-serif"><span style="color:black">113</span></span></span><span style="font-size:9.0pt"><span style="font-family:&quot;微軟正黑體&quot;,sans-serif"><span style="color:black">學年第2學期修課注意事項</span></span></span></span></span></span></p><ul><li><span style="font-size:12pt"><span style="background-color:white"><span style="color:black"><span style="font-family:Calibri,sans-serif"><strong><span style="font-size:9.0pt"><span style="font-family:&quot;微軟正黑體&quot;,sans-serif"><span style="color:#c0392b">114</span></span></span></strong><strong><span style="font-size:9.0pt"><span style="font-family:&quot;微軟正黑體&quot;,sans-serif"><span style="color:#c0392b">年4月24日為最後退選日</span></span></span></strong><strong><span style="font-size:9.0pt"><span style="font-family:&quot;微軟正黑體&quot;,sans-serif">。</span></span></strong></span></span></span></span></li><li><span style="font-size:9.0pt"><span style="font-family:&quot;微軟正黑體&quot;,sans-serif"><span style="color:black">選課成功後，學生學校</span></span></span><strong><span style="font-size:9.0pt"><span style="font-family:&quot;微軟正黑體&quot;,sans-serif"><span style="color:red">(</span></span></span><span style="font-size:9.0pt"><span style="font-family:&quot;微軟正黑體&quot;,sans-serif"><span style="color:red">證號)之email信箱</span></span></span></strong><span style="font-size:9.0pt"><span style="font-family:&quot;微軟正黑體&quot;,sans-serif"><span style="color:black">（非平常用的私人信箱）會收到來自 NTUCOOL 平台邀請信，提供申請 NTUCOOL 平台帳號步驟。</span></span></span></li></ul>`,
    publisher: "教務處課務組",
  },
  {
    key: "3",
    date: "2025-02-24",
    content:
      "AI聯盟（113-2）其 ZA-001(機率與統計) 及 ZA-002(深度學習) 自114年2月20日上午10時開放加簽至限選人數額滿為止。",
    publisher: "教務處課務組",
  },
];

const notice = [
  {
    title: "課程查詢",
    contents: ["課程節次時間起訖等請點閱左方”課程相關資訊”。"],
  },
  {
    title: "選課系統",
    contents: [
      `<span style="font-size:16px">為保障同學選課權益，請同學在<span style="color:#ff0000">第一階段選課開始前確認密碼</span>是否可正確登入選課系統，若<span style="color:#ff0000">密碼有問題請於上班時間電洽 61010、61045</span>。</span>`,
      `<span style="font-size:16px"><strong>選課開放期間</strong>，考量公平性及網路塞車問題，<strong>請勿開多重視窗</strong>，以免影響選課權益。</span>`,
      `<span style="color:#ff0000">避免影響系統正常運作，學生勿使用外掛程式或爬網影響選課系統，一經監控發現，使用者IP 將被鎖定，造成權益損失學生須自行負責。建請學生避免觸犯干擾電腦或損害公眾、他人權益之刑法相關規定。</span>`,
      `<span style="font-size:16px">學生若需繳納學分費者，第3 階段選課期間前<span style="color:#2980b9">課程以［棄選］處理者免繳學分費</span>，<span style="color:#2980b9">課程以［退選］處理者，需繳納、將不退學分費。棄選課程成績單不留紀錄</span><strong><span style="color:#000000">。(選課前請務必詳看選課公告)</span></strong></span>`,
      `<span style="font-size:16px">請遵守智慧財產權觀念，使用正版教科書（含二手書），勿非法影印書籍、教材，以免侵害他人著作權。</span>`,
    ],
  },
];
</script>

<template>
  <div
    class="u-grid u-h100% u-gap-36px u-p36px u-items-start"
    data-masonry='{
      "columnWidth": 100,
      "itemSelector": ".u-grid-item",
      "gutter": 10,
      "fitWidth": true
    }'
  >
    <div
      class="u-p16px u-col-span-1 u-bg-white u-w100% u-h100% u-shadow u-rounded-16px"
    >
      <p class="u-pl16px! u-text-24px u-font-bold u-text-left u-c-blue">
        {{ "課程公告" }}
      </p>
      <Divider class="u-my8px" />
    </div>
    <div
      class="u-p16px u-col-span-1 u-bg-white u-w100% u-h100% u-shadow u-rounded-16px"
    >
      <p class="u-pl16px! u-text-24px u-font-bold u-c-blue">
        {{ "最新消息" }}
      </p>
      <Divider class="u-my8px" />
      <a-table :columns="columns" :data-source="data" :pagination="false">
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
      class="u-p16px u-col-span-1 u-bg-white u-w100% u-h100% u-shadow u-rounded-16px"
    >
      <p class="u-pl16px! u-text-24px u-font-bold u-text-left u-c-blue">
        {{ "注意事項" }}
      </p>
      <Divider class="u-my8px" />
      <a-list item-layout="vertical" :data-source="notice">
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
