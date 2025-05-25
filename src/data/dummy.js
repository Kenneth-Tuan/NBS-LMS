import dayjs from "dayjs"; // Import dayjs for date calculations
import { v4 as uuidv4 } from "uuid"; // Import uuid for generating unique IDs

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
    contents: ['課程節次時間起訖等請點閱左方 "課程相關資訊"。'],
  },
  {
    title: "選課系統",
    contents: [
      `<span style="font-size:16px">為保障同學選課權益，請同學在<span style="color:#ff0000">第一階段選課開始前確認密碼</span>是否可正確登入選課系統，若<span style="color:#ff0000">密碼有問題請於上班時間電洽 61010、61045</span>。</span>`,
      `<span style="font-size:16px"><strong>選課開放期間</strong>，考量公平性及網路塞車問題，<strong>請勿開多重視窗</strong>，以免影響選課權益。</span>`,
      `<span style="color:#ff0000">避免影響系統正常運作，學生勿使用外掛程式或爬網影響選課系統，一經監控發現，使用者IP 將被鎖定，造成權益損失學生須自行負責。建請學生避免觸犯干擾電腦或損害公眾、他人權益之刑法相關規定。</span>`,
      `<span style="font-size:16px">學生若需繳納學分費者，第3 階段選課期間前<span style="color:#2980b9">課程以［棄選］處理者免繳學分費</span>，<span style="color:#2980b9">課程以［退選］處理者，需繳納、將不退學分費。棄選課程成績單不留紀錄</span><strong><span style="color:#000000">。(選課前請務必詳看選課公告)</span></strong></span>`,
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

const dummyCourseData = [
  {
    id: 5128,
    cover_image:
      "https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "基礎系統神學導論",
    duration: 600,
    instructor_name: "王力生",
    teacher_id: "teacher_wang_001",
    teacher: "王力生", // Added for CourseManagementHub
    start_date: "2025-03-29",
    end_date: "2025-07-29",
    class_mode: "六日兩日下午專題班",
    description:
      "本課程旨在建立學員對系統神學的基礎認識，探討上帝論、基督論、救恩論等核心教義。學員將學習如何系統性地理解聖經真理，並能在現代處境中應用神學思維。課程結束後，學員將能夠掌握基本神學概念，並在教會服事中更有效地傳遞信仰。",
    credit: 3,
    enrollment_limit: 60,
    enrollment_actual: 45,
    weekly_schedule: [
      { week_day: "週六", start_time: "14:00", end_time: "17:00" },
      { week_day: "週日", start_time: "14:00", end_time: "17:00" },
    ],
    prerequisite_course_ids: [],
    outline_files: [],
    outline: `
      <h3>課程單元</h3>
      <ol>
        <li><strong>系統神學導論</strong>
          <ul>
            <li>什麼是系統神學</li>
            <li>系統神學的重要性與方法論</li>
            <li>系統神學與其他神學科目的關係</li>
          </ul>
        </li>
        <li><strong>上帝論</strong>
          <ul>
            <li>上帝的屬性與本質</li>
            <li>三位一體的教義</li>
            <li>上帝的主權與人的責任</li>
          </ul>
        </li>
        <li><strong>基督論</strong>
          <ul>
            <li>基督的神性與人性</li>
            <li>基督的救贖工作</li>
            <li>基督的三重職分</li>
          </ul>
        </li>
        <li><strong>救恩論</strong>
          <ul>
            <li>救恩的次序</li>
            <li>因信稱義的教義</li>
            <li>成聖的過程與實踐</li>
          </ul>
        </li>
      </ol>
      <p><em>每單元包含課堂討論與實際應用練習</em></p>
    `,
    teacherInfo: `
      <h3>講師簡介：王力生</h3>
      <p><strong>學歷</strong></p>
      <ul>
        <li>美國富勒神學院系統神學博士</li>
        <li>台灣神學院道學碩士</li>
      </ul>
      <p><strong>經歷</strong></p>
      <ul>
        <li>現任台灣神學院系統神學教授</li>
        <li>曾任多間神學院客座教授</li>
        <li>著有《系統神學與現代處境》等多本神學著作</li>
      </ul>
      <p><strong>專長領域</strong></p>
      <ul>
        <li>系統神學</li>
        <li>當代神學思潮</li>
        <li>基督教護教學</li>
      </ul>
    `,
    announcements_hub: [
      {
        id: uuidv4(),
        title: "歡迎來到《基礎系統神學導論》",
        content: "請同學們先下載課程大綱，並預習第一章的內容。",
        date: dayjs().subtract(2, "day").format("YYYY-MM-DD HH:mm"),
      },
      {
        id: uuidv4(),
        title: "第一次作業發布通知",
        content: "第一次作業已發布，請於兩週內完成提交。",
        date: dayjs().subtract(1, "day").format("YYYY-MM-DD HH:mm"),
      },
    ],
    assignments_hub: [
      {
        id: uuidv4(),
        title: "上帝論主題研討",
        description: "請針對上帝的屬性提交一份1000字的研究報告。",
        dueDate: dayjs().add(12, "day").format("YYYY-MM-DD"),
        status: "OPEN",
      },
      {
        id: uuidv4(),
        title: "基督論經文詮釋",
        description: "選擇三段描述基督神人二性的經文進行詮釋。",
        dueDate: dayjs().add(20, "day").format("YYYY-MM-DD"),
        status: "OPEN",
      },
    ],
    materials_hub: [
      {
        id: uuidv4(),
        name: "課程大綱_系統神學.pdf",
        type: "file",
        fileType: "pdf",
        url: "#",
        uploadDate: dayjs().subtract(3, "day").format("YYYY-MM-DD"),
      },
      {
        id: uuidv4(),
        name: "第一講義_上帝論.pptx",
        type: "file",
        fileType: "ppt",
        url: "#",
        uploadDate: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
      },
    ],
    students_hub: [
      {
        id: "s001",
        name: "張小明",
        studentId: "ST2024001",
        email: "ming@example.com",
      },
      {
        id: "s002",
        name: "李大華",
        studentId: "ST2024002",
        email: "hua@example.com",
      },
      {
        id: "s003",
        name: "陳美麗",
        studentId: "ST2024003",
        email: "mei@example.com",
      },
    ],
    grades_hub: {
      s001: {},
      s002: {},
      s003: {},
    },
  },
  {
    id: 5201,
    cover_image:
      "https://plus.unsplash.com/premium_photo-1725075087617-302d48805d2b?q=80&w=3987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "新約聖經希臘文研究與詮釋",
    duration: 600,
    instructor_name: "陳恩典",
    teacher_id: "teacher_chen_001",
    teacher: "陳恩典",
    start_date: "2024-04-12",
    end_date: "2024-08-12",
    class_mode: "六日兩日全天專題班",
    description:
      "本課程專注於新約聖經原文的研究與解釋，幫助學員掌握基礎希臘文語法結構和詞彙。透過原文學習，學員將能更深入理解新約經文的原意，提升解經能力。課程包含實際經文分析練習，使學員能獨立運用工具書進行原文查考。",
    credit: 4,
    enrollment_limit: 50,
    enrollment_actual: 38,
    weekly_schedule: [
      { week_day: "週六", start_time: "09:00", end_time: "17:00" },
      { week_day: "週日", start_time: "09:00", end_time: "17:00" },
    ],
    prerequisite_course_ids: [],
    outline_files: [],
    outline: `
      <h3>課程單元</h3>
      <ol>
        <li><strong>希臘文基礎語法</strong>
          <ul>
            <li>字母與發音系統</li>
            <li>基本詞形變化</li>
            <li>動詞時態概述</li>
          </ul>
        </li>
        <li><strong>名詞與形容詞系統</strong>
          <ul>
            <li>性數格的概念與運用</li>
            <li>冠詞的用法</li>
            <li>形容詞的位置與意義</li>
          </ul>
        </li>
        <li><strong>動詞系統研究</strong>
          <ul>
            <li>現在時態與不完成過去時態</li>
            <li>過去時態與完成時態</li>
            <li>語氣的運用</li>
          </ul>
        </li>
        <li><strong>經文解析實務</strong>
          <ul>
            <li>句法分析方法</li>
            <li>文法工具書使用</li>
            <li>實際經文翻譯練習</li>
          </ul>
        </li>
      </ol>
      <p><em>課程包含大量實作練習與討論</em></p>
    `,
    teacherInfo: `
      <h3>講師簡介：陳恩典</h3>
      <p><strong>學歷</strong></p>
      <ul>
        <li>英國劍橋大學新約研究博士</li>
        <li>美國道奇神學院聖經語言碩士</li>
      </ul>
      <p><strong>經歷</strong></p>
      <ul>
        <li>現任新約希臘文研究中心主任</li>
        <li>曾任多間神學院新約教授</li>
        <li>翻譯出版多本希臘文教材</li>
      </ul>
      <p><strong>專長領域</strong></p>
      <ul>
        <li>新約希臘文</li>
        <li>新約解經</li>
        <li>聖經語言教學</li>
      </ul>
    `,
    announcements_hub: [
      {
        id: uuidv4(),
        title: "歡迎希臘文課程!",
        content: "請預習字母發音。",
        date: dayjs().format("YYYY-MM-DD HH:mm"),
      },
    ],
    assignments_hub: [
      {
        id: uuidv4(),
        title: "希臘文動詞變化練習",
        description: "完成講義P.10-P.15的動詞變化練習。",
        dueDate: dayjs().add(7, "day").format("YYYY-MM-DD"),
        status: "OPEN",
      },
    ],
    materials_hub: [
      {
        id: uuidv4(),
        name: "希臘文字母表.pdf",
        type: "file",
        fileType: "pdf",
        url: "#",
        uploadDate: dayjs().format("YYYY-MM-DD"),
      },
    ],
    students_hub: [
      {
        id: "s001",
        name: "張小明",
        studentId: "ST2024001",
        email: "ming@example.com",
      },
    ],
    grades_hub: { s001: {} },
  },
  {
    id: 5122,
    cover_image:
      "https://plus.unsplash.com/premium_photo-1661963139522-22525f644234?q=80&w=3444&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    name: "教會歷史：從初代教會到現代",
    duration: 600,
    instructor_name: "林信實",
    teacher_id: "teacher_lin_001",
    teacher: "林信實",
    start_date: "2023-09-15",
    end_date: "2024-01-15",
    class_mode: "六日兩日全天專題班",
    description:
      "本課程帶領學員縱覽教會兩千年的發展歷程，從使徒時代到現代教會的演變。學員將認識重要的歷史事件、人物和神學思潮，理解它們對現代教會的影響。課程強調從歷史中汲取智慧，以應對當代教會的挑戰。",
    credit: 3,
    enrollment_limit: 55,
    enrollment_actual: 50,
    weekly_schedule: [
      { week_day: "週六", start_time: "09:00", end_time: "17:00" },
      { week_day: "週日", start_time: "09:00", end_time: "17:00" },
    ],
    prerequisite_course_ids: [],
    outline_files: [],
    outline: `
      <h3>課程單元</h3>
      <ol>
        <li><strong>初代教會時期（1-3世紀）</strong>
          <ul>
            <li>使徒時代的教會發展</li>
            <li>教父時期的神學發展</li>
            <li>早期教會面對的挑戰與回應</li>
          </ul>
        </li>
        <li><strong>中世紀教會（4-15世紀）</strong>
          <ul>
            <li>教會制度的發展</li>
            <li>修道運動的興起</li>
            <li>經院哲學與神學的發展</li>
          </ul>
        </li>
        <li><strong>宗教改革時期（16世紀）</strong>
          <ul>
            <li>改教運動的起源與發展</li>
            <li>主要改教家的神學思想</li>
            <li>天主教會的回應與改革</li>
          </ul>
        </li>
        <li><strong>現代教會（17世紀至今）</strong>
          <ul>
            <li>啟蒙運動對教會的影響</li>
            <li>宣教運動的擴展</li>
            <li>當代教會的挑戰與發展</li>
          </ul>
        </li>
      </ol>
      <p><em>課程將結合歷史文獻閱讀與專題研討</em></p>
    `,
    teacherInfo: `
      <h3>講師簡介：林信實</h3>
      <p><strong>學歷</strong></p>
      <ul>
        <li>德國海德堡大學教會歷史學博士</li>
        <li>台灣大學歷史學碩士</li>
      </ul>
      <p><strong>經歷</strong></p>
      <ul>
        <li>現任神學院教會歷史教授</li>
        <li>曾參與多項教會歷史研究計畫</li>
        <li>發表多篇關於早期教會與宗教改革的學術論文</li>
      </ul>
      <p><strong>專長領域</strong></p>
      <ul>
        <li>早期教會史</li>
        <li>宗教改革史</li>
        <li>台灣教會史</li>
      </ul>
    `,
    announcements_hub: [],
    assignments_hub: [],
    materials_hub: [],
    students_hub: [],
    grades_hub: {},
  },
  {
    id: 5300,
    cover_image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
    name: "舊約智慧文學",
    duration: 450,
    instructor_name: "李智慧",
    teacher_id: "teacher_li_smart_001",
    teacher: "李智慧",
    start_date: "2023-02-10",
    end_date: "2023-06-10",
    class_mode: "二五夜間班",
    description:
      "深入探討約伯記、詩篇、箴言、傳道書、雅歌的文學特色與神學信息。",
    outline: `<h3>課程單元</h3>...`,
    teacherInfo: `<h3>講師簡介：李智慧</h3>...`,
    credit: 3,
    enrollment_limit: 60,
    enrollment_actual: 45,
    weekly_schedule: [
      { week_day: "週五", start_time: "19:00", end_time: "21:30" },
    ],
    prerequisite_course_ids: [],
    outline_files: [],
    announcements_hub: [],
    assignments_hub: [],
    materials_hub: [],
    students_hub: [],
    grades_hub: {},
  },
  {
    id: 5301,
    cover_image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159",
    name: "網頁開發與教會應用",
    duration: 1200,
    instructor_name: "吳科技",
    teacher_id: "teacher_wu_tech_001",
    teacher: "吳科技",
    start_date: dayjs().subtract(1, "month").format("YYYY-MM-DD"),
    end_date: dayjs().add(3, "month").format("YYYY-MM-DD"),
    class_mode: "週末密集班",
    description:
      "學習基礎網頁技術(HTML/CSS/JS)，並探討如何應用於教會網站、線上報名系統等。",
    outline: `<h3>課程單元</h3>...`,
    teacherInfo: `<h3>講師簡介：吳科技</h3>...`,
    credit: 4,
    enrollment_limit: 50,
    enrollment_actual: 38,
    weekly_schedule: [
      { week_day: "週六", start_time: "09:00", end_time: "17:00" },
      { week_day: "週日", start_time: "09:00", end_time: "17:00" },
    ],
    prerequisite_course_ids: [],
    outline_files: [],
    announcements_hub: [
      {
        id: uuidv4(),
        title: "HTML基礎作業",
        content: "完成第一個HTML頁面，包含個人簡介。",
        date: dayjs().format("YYYY-MM-DD HH:mm"),
      },
    ],
    assignments_hub: [
      {
        id: uuidv4(),
        title: "CSS美化練習",
        description: "使用CSS美化你的個人簡介頁面。",
        dueDate: dayjs().add(5, "day").format("YYYY-MM-DD"),
        status: "OPEN",
      },
    ],
    materials_hub: [
      {
        id: uuidv4(),
        name: "HTML入門.pdf",
        type: "file",
        fileType: "pdf",
        url: "#",
        uploadDate: dayjs().format("YYYY-MM-DD"),
      },
    ],
    students_hub: [
      {
        id: "s004",
        name: "王小剛",
        studentId: "ST2024004",
        email: "gang@example.com",
      },
    ],
    grades_hub: { s004: {} },
  },
];

export {
  dummyNewsData,
  dummyNoticeData,
  dummyAnnouncementData,
  dummyCourseData,
};
