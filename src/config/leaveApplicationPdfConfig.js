// Coordinate conversion constants (same as transcriptPdfConfig.js)
const PAGE_HEIGHT = 841.68;
const SCALE_FACTOR = 16;
// Offset to shift text right (visually correcting "too far left" issue)
const X_CORRECTION = 4;
// Offset to shift text down (visually correcting "too high" issue)
const Y_CORRECTION = 10;

// 調大 X_CORRECTION（往右移）
// 調小 X_CORRECTION（往左移）
// 調大 Y_CORRECTION（往下移）
// 調小 Y_CORRECTION（往上移）

/**
 * Converts pdf2json coordinates (Top-Left) to pdf-lib coordinates (Bottom-Left)
 * @param {number} x - pdf2json x coordinate
 * @param {number} y - pdf2json y coordinate
 */
const toPdfCoords = (x, y) => ({
  x: x * SCALE_FACTOR + X_CORRECTION,
  y: PAGE_HEIGHT - y * SCALE_FACTOR - Y_CORRECTION,
});

/**
 * Y gap between upper section and lower section (in pdf2json units).
 * Upper section header at y=1.679, lower section header at y=16.238.
 * Offset = 16.238 - 1.679 ≈ 14.56
 */
export const SECTION_Y_OFFSET_PX2JSON = 14.56;

/**
 * Y offset in pdf-lib pixels between upper and lower section.
 * Lower section Y = Upper section Y - SECTION_OFFSET_PX
 */
export const SECTION_OFFSET_PX = SECTION_Y_OFFSET_PX2JSON * SCALE_FACTOR; // 232.96

/**
 * Mapping from department value to checkbox x-coordinate in pdf2json units.
 * The y coordinate for all dept checkboxes is 4.294 (upper section).
 */
export const DEPT_CHECKBOX_X_MAP = {
  master_of_divinity: 18.045, // 道碩
  master_of_christian_studies: 20.598, // 研碩
  bachelor_of_theology: 23.15, // 學士
  lay_leadership_program: 25.703, // 信徒領袖科
  pastoral_program: 25.703, // 拿會按牧必修 (map to same as 信徒領袖科)
};

export const LeaveApplicationPdfConfig = {
  pdfUrl: "/學生請假單-空白.pdf",
  styles: {
    defaultFontSize: 13,
    checkboxFontSize: 9,
    fontUrl: "/fonts/DFKai-SB.ttf",
    checkboxMark: "■",
    strokeWidth: 0.4,
  },

  /**
   * All coordinates are for the UPPER section (教務處收執聯).
   * Lower section coords are derived by subtracting SECTION_OFFSET_PX from the y value.
   */
  upper: {
    // 學號 (after "學號：")
    studentId: toPdfCoords(5.8, 4.294),

    // 姓名 (after "姓名：")
    studentName: toPdfCoords(5.8, 5.5),

    // 請假原因 (after "請假原因：")
    leaveReason: toPdfCoords(20.3, 5.5),

    // 請假課程(活動)名稱 (after "…填寫：")
    courseName: toPdfCoords(18.1, 6.7), // 上半聯 (教務處收執聯)
    courseNameLower: toPdfCoords(11.6, 6.7), // 下半聯 (學生收執聯)，若 X 不同可單獨調整此處 X 值

    // 科系 checkbox group - y is fixed, x varies per dept (see DEPT_CHECKBOX_X_MAP)
    deptCheckboxY_pdf2json: 4.294,

    // 假別 checkboxes
    leaveTypeEvent: toPdfCoords(5.342, 7.848), // □事假
    leaveTypeSick: toPdfCoords(7.895, 7.848), // □病假
    leaveTypeOther: toPdfCoords(10.447, 7.848), // □其他
    leaveTypeOtherText: toPdfCoords(12.3, 7.848), // 其他說明文字

    // 請假日期 民國 year/month/day
    leaveYear: toPdfCoords(6.9, 9.1), // before "年"
    leaveMonth: toPdfCoords(9.3, 9.1), // before "月"
    leaveDay: toPdfCoords(11.4, 9.1), // before "日"

    // 請假總節數 checkboxes
    periods1: toPdfCoords(8.014, 10.216), // □1節
    periods2: toPdfCoords(10.162, 10.216), // □2節
    periods3: toPdfCoords(12.31, 10.216), // □3節
    periodsOther: toPdfCoords(14.459, 10.216), // □ (other)
    periodsOtherText: toPdfCoords(14.87, 10.216), // 節數數字

    // 任課老師簽名 (upper section only, when Approved)
    teacherName: toPdfCoords(7.5, 13.3),
    // Reserved for future:
    // reviewDate: toPdfCoords(..., ...),
    // reviewNote: toPdfCoords(..., ...),
  },
};

export { toPdfCoords };

export const PageDimensions = {
  width: 595.2,
  height: 841.68,
};
