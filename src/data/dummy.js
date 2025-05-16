import dayjs from "dayjs"; // Import dayjs for date calculations
import { UserRole } from "../enums/appEnums";

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
    image:
      "https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "基礎系統神學導論",
    type: "新課程",
    duration: "600 分鐘",
    instructor: "王力生",
    startDate: "2025.03.29",
    endDate: "2025.07.29",
    classType: "六日兩日下午專題班",
    description:
      "本課程旨在建立學員對系統神學的基礎認識，探討上帝論、基督論、救恩論等核心教義。學員將學習如何系統性地理解聖經真理，並能在現代處境中應用神學思維。課程結束後，學員將能夠掌握基本神學概念，並在教會服事中更有效地傳遞信仰。",
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
  },
  {
    id: 5201,
    image:
      "https://plus.unsplash.com/premium_photo-1725075087617-302d48805d2b?q=80&w=3987&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "新約聖經希臘文研究與詮釋",
    type: "新課程",
    duration: "600 分鐘",
    instructor: "陳恩典",
    startDate: "2024.04.12",
    endDate: "2024.08.12",
    classType: "六日兩日全天專題班",
    description:
      "本課程專注於新約聖經原文的研究與解釋，幫助學員掌握基礎希臘文語法結構和詞彙。透過原文學習，學員將能更深入理解新約經文的原意，提升解經能力。課程包含實際經文分析練習，使學員能獨立運用工具書進行原文查考。",
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
  },
  {
    id: 5122,
    image:
      "https://plus.unsplash.com/premium_photo-1661963139522-22525f644234?q=80&w=3444&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "教會歷史：從初代教會到現代",
    type: "新課程",
    duration: "600 分鐘",
    instructor: "林信實",
    startDate: "2023.09.15",
    endDate: "2024.01.15",
    classType: "六日兩日全天專題班",
    description:
      "本課程帶領學員縱覽教會兩千年的發展歷程，從使徒時代到現代教會的演變。學員將認識重要的歷史事件、人物和神學思潮，理解它們對現代教會的影響。課程強調從歷史中汲取智慧，以應對當代教會的挑戰。",
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
            <li>主要改教家的思想</li>
            <li>改教運動的影響與意義</li>
          </ul>
        </li>
        <li><strong>現代教會發展（17-21世紀）</strong>
          <ul>
            <li>福音運動與宣教事工</li>
            <li>現代神學思潮</li>
            <li>教會合一運動</li>
            <li>當代教會的挑戰與機遇</li>
          </ul>
        </li>
      </ol>
      <p><em>課程包含歷史文獻研讀與討論</em></p>
    `,
    teacherInfo: `
      <h3>講師簡介：林信實</h3>
      <p><strong>學歷</strong></p>
      <ul>
        <li>普林斯頓神學院教會歷史博士</li>
        <li>台灣神學院道學碩士</li>
      </ul>
      <p><strong>經歷</strong></p>
      <ul>
        <li>現任教會歷史研究中心主任</li>
        <li>曾任多間神學院教會歷史教授</li>
        <li>著有《教會歷史縱覽》、《改教運動再思》等著作</li>
      </ul>
      <p><strong>專長領域</strong></p>
      <ul>
        <li>教會歷史研究</li>
        <li>改教運動史</li>
        <li>近代教會發展</li>
      </ul>
    `,
  },
  {
    id: 5300,
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
    title: "舊約智慧文學",
    type: "經典重開",
    duration: "450 分鐘",
    instructor: "李智慧",
    startDate: "2023.02.10",
    endDate: "2023.06.10",
    classType: "二五夜間班",
    description:
      "深入探討約伯記、詩篇、箴言、傳道書、雅歌的文學特色與神學信息。",
    outline: `<h3>課程單元</h3>...`,
    teacherInfo: `<h3>講師簡介：李智慧</h3>...`,
  },
  {
    id: 5301,
    image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159",
    title: "網頁開發與教會應用",
    type: "新技能",
    duration: "1200 分鐘",
    instructor: "吳科技",
    startDate: dayjs().subtract(1, "month").format("YYYY.MM.DD"),
    endDate: dayjs().add(3, "month").format("YYYY.MM.DD"),
    classType: "週末密集班",
    description:
      "學習基礎網頁技術(HTML/CSS/JS)，並探討如何應用於教會網站、線上報名系統等。",
    outline: `<h3>課程單元</h3>...`,
    teacherInfo: `<h3>講師簡介：吳科技</h3>...`,
  },
  {
    id: 5302,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    title: "宣教策略與新媒體",
    type: "趨勢研討",
    duration: "300 分鐘",
    instructor: "劉媒體",
    startDate: dayjs().add(2, "month").format("YYYY.MM.DD"),
    endDate: dayjs().add(4, "month").format("YYYY.MM.DD"),
    classType: "單日研討會",
    description:
      "探討如何運用社交媒體、直播、短視頻等新媒體工具進行有效的福音預工與宣教。",
    outline: `<h3>課程單元</h3>...`,
    teacherInfo: `<h3>講師簡介：劉媒體</h3>...`,
  },
  {
    id: 5199,
    image:
      "https://media.istockphoto.com/id/1410772920/photo/group-of-people-praying-worship-believe.jpg?s=2048x2048&w=is&k=20&c=meRPDNTMRwVUIuuEs7QNsQzIcSaHXQ0kkC3bkNABIiw=",
    title: "基督教輔導與關顧事工",
    type: "新課程",
    duration: "1800 分鐘",
    instructor: "張恩惠",
    startDate: "2025.04.14",
    endDate: "2025.08.14",
    classType: "一四夜間班",
    earlyBird: {
      deadline: "2025/04/06 23:59:59",
      discount: 1000,
    },
    description:
      "本課程整合基督教信仰與現代輔導理論，培養學員的助人技巧與靈性關顧能力。學員將學習如何運用聖經原則處理各種輔導議題，發展同理心並掌握基本輔導技巧。課程包含實際案例討論，幫助學員在教會場景中實踐關顧事工。",
    outline: `
      <h3>課程單元</h3>
      <ol>
        <li><strong>基督教輔導概論</strong>
          <ul>
            <li>聖經輔導的基礎</li>
            <li>現代輔導理論簡介</li>
            <li>整合信仰與心理學</li>
          </ul>
        </li>
        <li><strong>輔導技巧與實務</strong>
          <ul>
            <li>同理心的培養</li>
            <li>傾聽與回應技巧</li>
            <li>問題評估與處理</li>
          </ul>
        </li>
        <li><strong>特殊議題輔導</strong>
          <ul>
            <li>情緒與壓力管理</li>
            <li>人際關係衝突</li>
            <li>信仰生活困擾</li>
          </ul>
        </li>
        <li><strong>教會關顧事工</strong>
          <ul>
            <li>小組關顧模式</li>
            <li>危機處理與轉介</li>
            <li>關顧事工的規劃與推動</li>
          </ul>
        </li>
      </ol>
      <p><em>課程包含實際個案研討與角色扮演練習</em></p>
    `,
    teacherInfo: `
      <h3>講師簡介：張恩惠</h3>
      <p><strong>學歷</strong></p>
      <ul>
        <li>美國西方神學院教牧輔導博士</li>
        <li>台灣諮商心理學碩士</li>
      </ul>
      <p><strong>經歷</strong></p>
      <ul>
        <li>現任教會關顧中心主任</li>
        <li>具有20年以上輔導實務經驗</li>
        <li>著有《教會關顧事工手冊》等多本著作</li>
      </ul>
      <p><strong>專長領域</strong></p>
      <ul>
        <li>教牧輔導</li>
        <li>婚姻家庭輔導</li>
        <li>哀傷輔導</li>
      </ul>
    `,
  },
  {
    id: 5169,
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80",
    title: "教會音樂與崇拜學",
    type: "1227",
    duration: "1800 分鐘",
    instructor: "李榮耀",
    startDate: "2025.04.14",
    endDate: "2025.08.14",
    classType: "一四夜間班",
    earlyBird: {
      deadline: "2025/04/06 23:59:59",
      discount: 1000,
    },
    description:
      "本課程探討教會音樂的神學基礎與實踐應用，幫助學員建立合乎聖經的崇拜觀。學習內容包括崇拜禮儀設計、詩歌選擇原則、音樂事工規劃等實務主題。學員將能夠策劃並帶領更有意義的崇拜聚會，提升教會的敬拜生活品質。",
    outline: `
      <h3>課程單元</h3>
      <ol>
        <li><strong>崇拜神學基礎</strong>
          <ul>
            <li>聖經中的崇拜觀</li>
            <li>崇拜的本質與意義</li>
            <li>音樂在崇拜中的角色</li>
          </ul>
        </li>
        <li><strong>教會音樂歷史與發展</strong>
          <ul>
            <li>早期教會音樂</li>
            <li>改教運動與聖詩發展</li>
            <li>現代教會音樂趨勢</li>
          </ul>
        </li>
        <li><strong>崇拜禮儀設計</strong>
          <ul>
            <li>崇拜程序編排原則</li>
            <li>節期崇拜規劃</li>
            <li>特殊聚會音樂安排</li>
          </ul>
        </li>
        <li><strong>音樂事工實務</strong>
          <ul>
            <li>詩歌團隊建立與訓練</li>
            <li>音響器材使用與維護</li>
            <li>崇拜排練與帶領技巧</li>
          </ul>
        </li>
      </ol>
      <p><em>課程包含實際崇拜帶領演練</em></p>
    `,
    teacherInfo: `
      <h3>講師簡介：李榮耀</h3>
      <p><strong>學歷</strong></p>
      <ul>
        <li>美國西敏神學院教會音樂博士</li>
        <li>台灣神學院崇拜與音樂碩士</li>
      </ul>
      <p><strong>經歷</strong></p>
      <ul>
        <li>現任教會音樂事工中心主任</li>
        <li>曾任多間大型教會音樂總監</li>
        <li>出版多張教會詩歌專輯</li>
      </ul>
      <p><strong>專長領域</strong></p>
      <ul>
        <li>崇拜禮儀設計</li>
        <li>聖樂創作與編曲</li>
        <li>詩班指揮與訓練</li>
      </ul>
    `,
  },
  {
    id: 5170,
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "宣教學與跨文化溝通",
    type: "新課程",
    duration: "1800 分鐘",
    instructor: "黃盼望",
    startDate: "2025.04.14",
    endDate: "2025.08.14",
    classType: "一四夜間班",
    earlyBird: {
      deadline: "2025/04/06 23:59:59",
      discount: 1000,
    },
    description:
      "本課程裝備學員進行跨文化宣教事工，探討現代宣教策略與文化適應理論。學員將學習如何在不同文化處境中有效傳遞福音，發展文化敏感度。課程涵蓋實際案例分析，幫助學員預備並參與宣教事工。",
    outline: `
      <h3>課程單元</h3>
      <ol>
        <li><strong>宣教學基礎</strong>
          <ul>
            <li>聖經中的宣教使命</li>
            <li>宣教歷史概覽</li>
            <li>現代宣教趨勢</li>
          </ul>
        </li>
        <li><strong>跨文化溝通理論</strong>
          <ul>
            <li>文化人類學基礎</li>
            <li>文化衝突與適應</li>
            <li>跨文化溝通模式</li>
          </ul>
        </li>
        <li><strong>宣教策略與方法</strong>
          <ul>
            <li>處境化福音傳播</li>
            <li>創意宣教方式</li>
            <li>社群媒體與宣教</li>
          </ul>
        </li>
        <li><strong>宣教士裝備</strong>
          <ul>
            <li>文化適應訓練</li>
            <li>團隊合作與人際關係</li>
            <li>宣教士生活與靈命建造</li>
          </ul>
        </li>
      </ol>
      <p><em>課程包含跨文化體驗活動與實地探訪</em></p>
    `,
    teacherInfo: `
      <h3>講師簡介：黃盼望</h3>
      <p><strong>學歷</strong></p>
      <ul>
        <li>美國富勒神學院宣教學博士</li>
        <li>新加坡神學院跨文化研究碩士</li>
      </ul>
      <p><strong>經歷</strong></p>
      <ul>
        <li>現任國際宣教差會亞洲區主任</li>
        <li>具有15年海外宣教經驗</li>
        <li>著有《跨文化宣教手冊》等多本著作</li>
      </ul>
      <p><strong>專長領域</strong></p>
      <ul>
        <li>跨文化宣教策略</li>
        <li>宣教士訓練</li>
        <li>亞洲文化研究</li>
      </ul>
    `,
  },
  {
    id: 5171,
    image: "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?q=80",
    title: "基督教倫理學",
    type: "1227",
    duration: "1800 分鐘",
    instructor: "張正義",
    startDate: "2025.04.21",
    endDate: "2025.08.21",
    classType: "一四夜間班",
    earlyBird: {
      deadline: "2025/04/13 23:59:59",
      discount: 1000,
    },
    description:
      "本課程探討基督教倫理學的核心原則與現代應用。學員將學習如何從聖經角度分析當代倫理議題，培養批判性思考能力。課程強調理論與實踐的結合，幫助學員在生活中實踐基督教倫理價值。",
    outline: `
      <h3>課程單元</h3>
      <ol>
        <li><strong>基督教倫理學基礎</strong>
          <ul>
            <li>聖經中的倫理教導</li>
            <li>基督教倫理學歷史發展</li>
            <li>倫理決策模式</li>
          </ul>
        </li>
        <li><strong>個人倫理</strong>
          <ul>
            <li>品格與美德</li>
            <li>道德判斷與良心</li>
            <li>基督徒生活方式</li>
          </ul>
        </li>
        <li><strong>社會倫理</strong>
          <ul>
            <li>社會正義與公平</li>
            <li>環境保護與永續發展</li>
            <li>經濟倫理與工作倫理</li>
          </ul>
        </li>
        <li><strong>現代倫理議題</strong>
          <ul>
            <li>生命倫理與醫療倫理</li>
            <li>科技倫理與人工智能</li>
            <li>性別倫理與家庭倫理</li>
          </ul>
        </li>
      </ol>
      <p><em>課程包含案例討論與倫理決策演練</em></p>
    `,
    teacherInfo: `
      <h3>講師簡介：張正義</h3>
      <p><strong>學歷</strong></p>
      <ul>
        <li>英國劍橋大學基督教倫理學博士</li>
        <li>美國普林斯頓神學院神學碩士</li>
      </ul>
      <p><strong>經歷</strong></p>
      <ul>
        <li>現任神學院倫理學教授</li>
        <li>基督教倫理研究中心主任</li>
        <li>多本倫理學著作作者</li>
      </ul>
      <p><strong>專長領域</strong></p>
      <ul>
        <li>基督教社會倫理</li>
        <li>生命倫理學</li>
        <li>商業倫理與職場倫理</li>
      </ul>
    `,
  },
  {
    id: 5172,
    image:
      "https://images.unsplash.com/photo-1507627739453-d67de9c6362e?q=80&w=3000",
    title: "舊約聖經研究與詮釋",
    type: "新課程",
    duration: "1800 分鐘",
    instructor: "李約書亞",
    startDate: "2025.05.10",
    endDate: "2025.09.10",
    classType: "六日兩日全天專題班",
    earlyBird: {
      deadline: "2025/04/30 23:59:59",
      discount: 1000,
    },
    description:
      "本課程深入研究舊約聖經的歷史背景、文學特色與神學主題，幫助學員掌握解經方法與詮釋原則。學員將學習如何將舊約信息與現代處境對話，發展以基督為中心的釋經進路。課程強調實際經文研究，培養獨立研經能力。",
    outline: `<h3>課程單元</h3>
<ol>
  <li><strong>舊約導論與研究方法</strong>
    <ul>
      <li>舊約形成與正典化</li>
      <li>解經方法論</li>
      <li>古代近東背景研究</li>
    </ul>
  </li>
  <li><strong>舊約各體裁研究</strong>
    <ul>
      <li>敘事文學分析</li>
      <li>詩歌智慧書詮釋</li>
      <li>先知書研究方法</li>
    </ul>
  </li>
  <li><strong>舊約神學主題</strong>
    <ul>
      <li>創造與立約神學</li>
      <li>救贖歷史發展</li>
      <li>彌賽亞預言研究</li>
    </ul>
  </li>
  <li><strong>舊約與現代應用</strong>
    <ul>
      <li>舊約倫理教導</li>
      <li>處境化詮釋原則</li>
      <li>講道與教導應用</li>
    </ul>
  </li>
</ol>
<p><em>課程包含經文原文解析與釋經實習</em></p>`,
    teacherInfo: `<h3>講師簡介：李約書亞</h3>
<p><strong>學歷</strong></p>
<ul>
  <li>耶路撒冷希伯來大學舊約研究博士</li>
  <li>美國達拉斯神學院舊約研究碩士</li>
</ul>
<p><strong>經歷</strong></p>
<ul>
  <li>現任神學院舊約研究教授</li>
  <li>聖經考古學會會員</li>
  <li>多本舊約註釋書作者</li>
</ul>
<p><strong>專長領域</strong></p>
<ul>
  <li>舊約希伯來文研究</li>
  <li>古代近東文化研究</li>
  <li>舊約神學與詮釋學</li>
</ul>`,
  },
  {
    id: 5173,
    image:
      "https://images.unsplash.com/photo-1490187510156-99ca1a77c714?q=80&w=3000",
    title: "基督教倫理學導論",
    type: "新課程",
    duration: "1800 分鐘",
    instructor: "王真理",
    startDate: "2025.05.20",
    endDate: "2025.09.20",
    classType: "一四夜間班",
    earlyBird: {
      deadline: "2025/05/10 23:59:59",
      discount: 1000,
    },
    description:
      "本課程探討基督教倫理的聖經基礎與現代應用，幫助學員建立符合聖經的價值觀與決策能力。課程涵蓋個人倫理、社會倫理、生命倫理等議題，培養學員以基督信仰回應當代倫理挑戰的能力。",
    outline: `<h3>課程單元</h3>
<ol>
  <li><strong>基督教倫理學基礎</strong>
    <ul>
      <li>聖經中的倫理原則</li>
      <li>基督教倫理學發展史</li>
      <li>倫理決策的框架</li>
    </ul>
  </li>
  <li><strong>個人倫理與靈性成長</strong>
    <ul>
      <li>基督徒品格塑造</li>
      <li>道德抉擇與良心</li>
      <li>靈修生活與倫理實踐</li>
    </ul>
  </li>
  <li><strong>人際關係倫理</strong>
    <ul>
      <li>家庭與婚姻倫理</li>
      <li>職場與商業倫理</li>
      <li>教會群體倫理</li>
    </ul>
  </li>
  <li><strong>當代倫理議題探討</strong>
    <ul>
      <li>生命倫理與醫學倫理</li>
      <li>環境倫理與生態關懷</li>
      <li>科技倫理與數位時代挑戰</li>
    </ul>
  </li>
</ol>
<p><em>課程包含案例討論與倫理抉擇演練</em></p>`,
    teacherInfo: `<h3>講師簡介：王真理</h3>
<p><strong>學歷</strong></p>
<ul>
  <li>美國普林斯頓神學院倫理學博士</li>
  <li>英國牛津大學哲學碩士</li>
</ul>
<p><strong>經歷</strong></p>
<ul>
  <li>現任神學院倫理學副教授</li>
  <li>基督教倫理研究中心研究員</li>
  <li>多本倫理學教科書作者</li>
</ul>
<p><strong>專長領域</strong></p>
<ul>
  <li>基督教倫理學</li>
  <li>生命倫理學</li>
  <li>社會倫理學</li>
</ul>`,
  },
  {
    id: 5174,
    image:
      "https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=3000",
    title: "講道學與表達藝術",
    type: "新課程",
    duration: "1200 分鐘",
    instructor: "陳雅各",
    startDate: "2025.05.25",
    endDate: "2025.09.25",
    classType: "六日兩日全天專題班",
    description:
      "本課程著重培養學員的講道技巧與表達能力，從經文解析到講章撰寫的完整過程。學員將學習不同的講道方法、聲音運用技巧、講章結構設計等實用知識。課程包含實際演練與回饋，幫助學員提升講道效果。",
    outline: `<h3>課程單元</h3>
<ol>
  <li><strong>講道學基礎</strong>
    <ul>
      <li>講道的聖經基礎</li>
      <li>講道的類型與風格</li>
      <li>當代講道的挑戰與機會</li>
    </ul>
  </li>
  <li><strong>講章準備與設計</strong>
    <ul>
      <li>經文解析與主題發展</li>
      <li>講章結構與大綱設計</li>
      <li>例證與應用的選用</li>
    </ul>
  </li>
  <li><strong>表達技巧與演說藝術</strong>
    <ul>
      <li>聲音的運用與控制</li>
      <li>肢體語言與台風</li>
      <li>與會眾的互動技巧</li>
    </ul>
  </li>
  <li><strong>多媒體與創意講道</strong>
    <ul>
      <li>視覺輔助工具的使用</li>
      <li>故事性講道技巧</li>
      <li>新媒體與線上講道</li>
    </ul>
  </li>
</ol>
<p><em>課程包含實際講道演練與錄影回饋</em></p>`,
    teacherInfo: `<h3>講師簡介：陳雅各</h3>
<p><strong>學歷</strong></p>
<ul>
  <li>美國戈登康威爾神學院講道學博士</li>
  <li>台灣神學院道學碩士</li>
</ul>
<p><strong>經歷</strong></p>
<ul>
  <li>現任神學院講道學教授</li>
  <li>資深牧師，具20年講台事奉經驗</li>
  <li>多本講道學著作作者</li>
</ul>
<p><strong>專長領域</strong></p>
<ul>
  <li>釋經講道</li>
  <li>敘事講道</li>
  <li>講道表達藝術</li>
</ul>`,
  },
  {
    id: 5175,
    image:
      "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?q=80&w=3000",
    title: "靈修神學與實踐",
    type: "新課程",
    duration: "600 分鐘",
    instructor: "林恩惠",
    startDate: "2025.06.01",
    endDate: "2025.08.01",
    classType: "六日兩日下午專題班",
    description:
      "本課程探討基督教靈修傳統與實踐方法，幫助學員深化個人靈命成長。學習內容包括各種靈修方式、禱告操練、屬靈辨識等主題。學員將建立穩定的靈修生活，並學習如何帶領他人進行靈命培育。",
    outline: `<h3>課程單元</h3>
<ol>
  <li><strong>靈修神學基礎</strong>
    <ul>
      <li>靈修傳統的歷史發展</li>
      <li>聖經中的靈修模式</li>
      <li>當代靈修神學思潮</li>
    </ul>
  </li>
  <li><strong>靈修操練方法</strong>
    <ul>
      <li>默想與禱告實踐</li>
      <li>靈閱與聖經默想</li>
      <li>靜默與獨處操練</li>
    </ul>
  </li>
  <li><strong>屬靈辨識與引導</strong>
    <ul>
      <li>屬靈辨識原則</li>
      <li>個人靈命指導</li>
      <li>群體靈修帶領</li>
    </ul>
  </li>
  <li><strong>靈修生活整合</strong>
    <ul>
      <li>日常生活中的靈修</li>
      <li>工作與靈修的結合</li>
      <li>靈修與事奉的關係</li>
    </ul>
  </li>
</ol>
<p><em>課程包含實際靈修操練與分享</em></p>`,
    teacherInfo: `<h3>講師簡介：林恩惠</h3>
<p><strong>學歷</strong></p>
<ul>
  <li>美國波士頓大學靈修神學博士</li>
  <li>英國牛津大學基督教靈修學碩士</li>
</ul>
<p><strong>經歷</strong></p>
<ul>
  <li>現任靈修指導中心主任</li>
  <li>資深靈修導師，具有25年帶領經驗</li>
  <li>著有《深化靈命之旅》等多本著作</li>
</ul>
<p><strong>專長領域</strong></p>
<ul>
  <li>靈修神學與實踐</li>
  <li>屬靈指導</li>
  <li>默觀禱告</li>
</ul>`,
  },
  {
    id: 5176,
    image:
      "https://images.unsplash.com/photo-1616442751986-fe0df8d7e509?q=80&w=3000",
    title: "教會植堂策略與實務",
    type: "新課程",
    duration: "1800 分鐘",
    instructor: "黃信心",
    startDate: "2025.06.05",
    endDate: "2025.08.05",
    classType: "一四夜間班",
    earlyBird: {
      deadline: "2025/05/25 23:59:59",
      discount: 1000,
    },
    description:
      "本課程提供教會植堂的理論基礎與實務指引，探討不同的植堂模式與策略。學員將學習如何進行社區分析、建立核心團隊、發展事工策略等實務技能。課程結合案例研究，幫助學員規劃具體的植堂計畫。",
    outline: `<h3>課程單元</h3>
<ol>
  <li><strong>植堂事工基礎</strong>
    <ul>
      <li>植堂的聖經基礎</li>
      <li>植堂模式與類型</li>
      <li>當代植堂趨勢</li>
    </ul>
  </li>
  <li><strong>植堂前期規劃</strong>
    <ul>
      <li>異象建立與目標設定</li>
      <li>社區需求評估</li>
      <li>資源盤點與預算規劃</li>
    </ul>
  </li>
  <li><strong>核心團隊建立</strong>
    <ul>
      <li>同工招募與培訓</li>
      <li>團隊建造與凝聚</li>
      <li>領導力發展</li>
    </ul>
  </li>
  <li><strong>事工發展與管理</strong>
    <ul>
      <li>崇拜與小組事工</li>
      <li>社區外展策略</li>
      <li>行政與財務管理</li>
    </ul>
  </li>
</ol>
<p><em>課程包含實地參訪與案例研討</em></p>`,
    teacherInfo: `<h3>講師簡介：黃信心</h3>
<p><strong>學歷</strong></p>
<ul>
  <li>美國富勒神學院教會增長博士</li>
  <li>新加坡神學院教牧碩士</li>
</ul>
<p><strong>經歷</strong></p>
<ul>
  <li>現任教會更新研究中心主任</li>
  <li>成功帶領多間教會植堂</li>
  <li>著有《教會植堂實務手冊》等著作</li>
</ul>
<p><strong>專長領域</strong></p>
<ul>
  <li>教會植堂策略</li>
  <li>教會增長學</li>
  <li>領導力發展</li>
</ul>`,
  },
  {
    id: 5177,
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=3000",
    title: "基督教教育理論與實踐",
    type: "新課程",
    duration: "1200 分鐘",
    instructor: "劉智慧",
    startDate: "2025.06.10",
    endDate: "2025.08.10",
    classType: "六日兩日全天專題班",
    description:
      "本課程探討基督教教育的理論基礎與教學方法，培養學員設計和執行教育事工的能力。內容包括課程規劃、教學策略、評量方式等實務主題。學員將能根據不同年齡層的需求，發展適切的教育事工。",
    outline: `<h3>課程單元</h3>
<ol>
  <li><strong>基督教教育理論基礎</strong>
    <ul>
      <li>基督教教育的聖經基礎</li>
      <li>教育哲學與神學整合</li>
      <li>發展心理學應用</li>
    </ul>
  </li>
  <li><strong>課程設計與規劃</strong>
    <ul>
      <li>需求評估與目標設定</li>
      <li>課程內容組織</li>
      <li>教學活動設計</li>
    </ul>
  </li>
  <li><strong>教學方法與策略</strong>
    <ul>
      <li>多元教學法運用</li>
      <li>小組討論帶領</li>
      <li>多媒體教學應用</li>
    </ul>
  </li>
  <li><strong>評量與回饋</strong>
    <ul>
      <li>學習評量方式</li>
      <li>教學效果評估</li>
      <li>課程改進策略</li>
    </ul>
  </li>
</ol>
<p><em>課程包含教案設計與教學演示</em></p>`,
    teacherInfo: `<h3>講師簡介：劉智慧</h3>
<p><strong>學歷</strong></p>
<ul>
  <li>美國惠頓大學基督教教育博士</li>
  <li>台灣神學院教育碩士</li>
</ul>
<p><strong>經歷</strong></p>
<ul>
  <li>現任神學院教育學教授</li>
  <li>教會教育事工顧問</li>
  <li>著有《基督教教育新視野》等著作</li>
</ul>
<p><strong>專長領域</strong></p>
<ul>
  <li>基督教教育理論</li>
  <li>課程設計與評量</li>
  <li>教師培訓</li>
</ul>`,
  },
  {
    id: 5178,
    image:
      "https://images.unsplash.com/photo-1529634597503-139d3726fed5?q=80&w=3000",
    title: "婚姻與家庭輔導",
    type: "新課程",
    duration: "1800 分鐘",
    instructor: "周平安",
    startDate: "2025.06.15",
    endDate: "2025.08.15",
    classType: "一四夜間班",
    earlyBird: {
      deadline: "2025/06/05 23:59:59",
      discount: 1000,
    },
    description:
      "本課程整合聖經觀點與家庭輔導理論，培養學員處理婚姻家庭議題的能力。學習內容包括婚前輔導、夫妻關係、親子溝通、家庭危機處理等主題。課程提供實際個案討論，裝備學員進行婚姻家庭輔導事工。",
    outline: `<h3>課程單元</h3>
<ol>
  <li><strong>婚姻家庭輔導基礎</strong>
    <ul>
      <li>聖經中的婚姻觀</li>
      <li>家庭系統理論</li>
      <li>輔導倫理與界限</li>
    </ul>
  </li>
  <li><strong>婚姻關係輔導</strong>
    <ul>
      <li>婚前輔導實務</li>
      <li>夫妻溝通與衝突處理</li>
      <li>婚姻危機介入</li>
    </ul>
  </li>
  <li><strong>親子關係輔導</strong>
    <ul>
      <li>親子互動模式</li>
      <li>兒童青少年輔導</li>
      <li>親職教育與指導</li>
    </ul>
  </li>
  <li><strong>特殊家庭議題</strong>
    <ul>
      <li>單親家庭輔導</li>
      <li>重組家庭適應</li>
      <li>家庭暴力防治</li>
    </ul>
  </li>
</ol>
<p><em>課程包含個案研討與角色扮演練習</em></p>`,
    teacherInfo: `<h3>講師簡介：周平安</h3>
<p><strong>學歷</strong></p>
<ul>
  <li>美國南方浸信會神學院婚姻家庭治療博士</li>
  <li>台灣諮商心理學碩士</li>
</ul>
<p><strong>經歷</strong></p>
<ul>
  <li>現任婚姻家庭協談中心主任</li>
  <li>資深婚姻家庭諮商師</li>
  <li>著有《建立健康家庭》等多本著作</li>
</ul>
<p><strong>專長領域</strong></p>
<ul>
  <li>婚姻家庭治療</li>
  <li>親職教育</li>
  <li>危機處理</li>
</ul>`,
  },
  {
    id: 5179,
    image:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=3000",
    title: "青少年事工與牧養",
    type: "新課程",
    duration: "600 分鐘",
    instructor: "吳喜樂",
    startDate: "2025.06.20",
    endDate: "2025.08.20",
    classType: "六日兩日下午專題班",
    description:
      "本課程針對現代青少年事工的挑戰與機會，提供實用的牧養策略與方法。學員將了解青少年的發展特質、現代青少年文化，並學習如何設計適合青少年的活動與課程。課程強調實務應用，幫助學員建立有效的青少年事工。",
    outline: `<h3>課程單元</h3>
<ol>
  <li><strong>青少年發展與文化</strong>
    <ul>
      <li>青少年心理發展特質</li>
      <li>現代青少年文化分析</li>
      <li>社群媒體與科技影響</li>
    </ul>
  </li>
  <li><strong>青少年事工策略</strong>
    <ul>
      <li>青少年事工模式</li>
      <li>小組事工設計</li>
      <li>活動規劃與執行</li>
    </ul>
  </li>
  <li><strong>青少年牧養實務</strong>
    <ul>
      <li>信仰培育方法</li>
      <li>門徒訓練策略</li>
      <li>危機輔導處理</li>
    </ul>
  </li>
  <li><strong>家庭與教會合作</strong>
    <ul>
      <li>親子關係輔導</li>
      <li>家庭教會夥伴關係</li>
      <li>青少年領袖培育</li>
    </ul>
  </li>
</ol>
<p><em>課程包含實際案例討論與活動設計</em></p>`,
    teacherInfo: `<h3>講師簡介：吳喜樂</h3>
<p><strong>學歷</strong></p>
<ul>
  <li>美國阿斯伯里神學院青少年事工博士</li>
  <li>台灣神學院教育碩士</li>
</ul>
<p><strong>經歷</strong></p>
<ul>
  <li>現任青少年事工中心主任</li>
  <li>具有15年青少年事工經驗</li>
  <li>著有《新世代青少年牧養》等著作</li>
</ul>
<p><strong>專長領域</strong></p>
<ul>
  <li>青少年事工發展</li>
  <li>青少年輔導</li>
  <li>營會活動設計</li>
</ul>`,
  },
  {
    id: 5180,
    image:
      "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=3000",
    title: "聖經詮釋學方法論",
    type: "新課程",
    duration: "1800 分鐘",
    instructor: "謝真道",
    startDate: "2025.06.25",
    endDate: "2025.08.25",
    classType: "一四夜間班",
    earlyBird: {
      deadline: "2025/06/15 23:59:59",
      discount: 1000,
    },
    description:
      "本課程系統性介紹聖經詮釋的方法論與原則，培養學員的解經能力。學習內容包括歷史文法解經法、文學分析、神學詮釋等進路。學員將掌握不同的解經工具與方法，發展紮實的釋經基礎，能夠準確理解並詮釋聖經文本。",
    outline: `<h3>課程單元</h3>
<ol>
  <li><strong>詮釋學基礎理論</strong>
    <ul>
      <li>詮釋學歷史發展</li>
      <li>聖經詮釋原則</li>
      <li>詮釋的前設與方法</li>
    </ul>
  </li>
  <li><strong>文法歷史解經法</strong>
    <ul>
      <li>文法分析方法</li>
      <li>歷史背景研究</li>
      <li>文脈分析技巧</li>
    </ul>
  </li>
  <li><strong>文學與修辭分析</strong>
    <ul>
      <li>文體類型研究</li>
      <li>修辭手法分析</li>
      <li>結構分析方法</li>
    </ul>
  </li>
  <li><strong>神學詮釋與應用</strong>
    <ul>
      <li>神學主題發展</li>
      <li>處境化詮釋</li>
      <li>當代應用原則</li>
    </ul>
  </li>
</ol>
<p><em>課程包含經文分析實作與討論</em></p>`,
    teacherInfo: `<h3>講師簡介：謝真道</h3>
<p><strong>學歷</strong></p>
<ul>
  <li>英國杜倫大學聖經研究博士</li>
  <li>美國威斯敏斯特神學院釋經學碩士</li>
</ul>
<p><strong>經歷</strong></p>
<ul>
  <li>現任神學院釋經學教授</li>
  <li>聖經註釋系列主編</li>
  <li>著有《釋經原理與實踐》等著作</li>
</ul>
<p><strong>專長領域</strong></p>
<ul>
  <li>聖經詮釋學</li>
  <li>新約釋經</li>
  <li>詮釋學理論</li>
</ul>`,
  },
];

const dummyUserData = [
  {
    userEmail: "nightCat@mail.com",
    password: "12345678",
    userName: "夜喵",
    userRole: UserRole.Admin,
  },
  {
    userEmail: "admin@test.com",
    password: "12345678",
    userName: "院長",
    userRole: UserRole.Admin,
  },
  {
    userEmail: "manager@test.com",
    password: "12345678",
    userName: "管理員",
    userRole: UserRole.Manager,
  },
  {
    userEmail: "teacher@test.com",
    password: "12345678",
    userName: "老師",
    userRole: UserRole.Teacher,
  },
  {
    userEmail: "student@tests.com",
    password: "12345678",
    userName: "學生",
    userRole: UserRole.Student,
  },
];

export {
  dummyNewsData,
  dummyNoticeData,
  dummyAnnouncementData,
  dummyCourseData,
  dummyUserData,
};
