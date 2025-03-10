const dummyNewsData = [
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

const dummyNoticeData = [
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

const dummyAnnouncementData = [
  {
    title: "課程公告",
    contents: [
      `<span style="font-size:16px"><a href="https://reg-acad.ncku.edu.tw/p/412-1041-17043.php?Lang=zh-tw" target="_blank">選課公告</a>(<strong>必讀</strong>,<span style="color:#c0392b">2024/12/9&nbsp;公告，2025/1/16更新</span>)、<a href="https://reg-acad.ncku.edu.tw/var/file/41/1041/img/2680/113_2simplifiedinstructions.pdf">簡易版</a></span>`,
      `<span style="font-size:16px"><a href="https://reg-acad.ncku.edu.tw/var/file/41/1041/img/2680/choose_re.htm" target="_blank">選課資訊</a>(法規與申請表單)</span>`,
    ],
  },
  {
    title: "簡報説明",
    contents: [
      `<span style="font-size:16px">(1)<a href="https://reg-acad.ncku.edu.tw/var/file/41/1041/img/2680/113_1Computerselectionforcourses.pdf">113-1第3階段選課改變與抽簽說明</a>(113/4/26)</span>`,
      `<span style="font-size:16px">(2)<a href="https://reg-acad.ncku.edu.tw/var/file/41/1041/img/2680/CourseAdditionRequestSystem_stu0103.pdf">113-2學生線上加簽說明會</a>(含操作說明)(114/1/16更新)</span>`,
    ],
  },
  {
    title: "課程相關資訊",
    contents: [
      `<p><span style="font-size:16px"><a href="https://cid-acad.ncku.edu.tw/var/file/42/1042/img/761/618876367.pdf"> 服務學習推薦專區</a></span></p>`,
      `<p><span style="font-size:16px"><a href="index.php?c=qry13235">各系所超修公告</a></span></p>`,
      `<p><span style="font-size:16px"><a href="https://cge.ncku.edu.tw/p/412-1007-22874.php?Lang=zh-tw">通識學分規定</a></span></p>`,
      `<p><span style="font-size:16px"><a href="index.php?c=related_link">課程相關資訊</a></span></p>`,
      `<p><span style="font-size:16px"><a href="index.php?c=qry_all"><span style="color:#c0392b">快速課程全覽</span></a></span></p>`,
      `<p><span style="font-size:16px"><span style="font-size:16px"><a href="index.php?c=qry11215&amp;m=en_query">快速進階查詢</a></span></p>`,
      `<p><span style="font-size:16px"><span style="font-size:16px"><a href="https://course-query.acad.ncku.edu.tw/index.php?c=qry11215&amp;lang=cht">歷年課程查詢</a></span></p>`,
    ],
  },
  {
    title: "操作說明",
    contents: [
      `<p class=""><span style="font-size:16px"><a href="https://cid-acad.ncku.edu.tw/var/file/42/1042/img/761/838619676.pdf" target="_blank"><span style="color:#2980b9">課程查詢操作說明</span></a></span></p>`,
      `<p><span style="font-size:16px"><a href="https://reg-acad.ncku.edu.tw/var/file/41/1041/img/2680/1131user_guide_CUS_1130611_chn.pdf" target="_blank">網路選課操作說明</a></span></p>`,
      `<p><span style="font-size:16px"><a href="https://reg-acad.ncku.edu.tw/var/file/41/1041/img/2680/1082withdraw_chinese.pdf" target="_blank">線上退選操作說明</a></span></p>`,
      `<p><span style="font-size:16px"><a href="https://reg-acad.ncku.edu.tw/var/file/41/1041/img/2680/flexibleintensivecourses_d&amp;w.pdf" target="_blank">彈性密集課程棄退選操作說明</a></span></p>`,
    ],
  },
];

export { dummyNewsData, dummyNoticeData, dummyAnnouncementData };
