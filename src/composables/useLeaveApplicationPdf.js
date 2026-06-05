import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import dayjs from "dayjs";
import {
  LeaveApplicationPdfConfig,
  DEPT_CHECKBOX_X_MAP,
  SECTION_OFFSET_PX,
  toPdfCoords,
} from "@/config/leaveApplicationPdfConfig";

let fontBytes = null;
let pdfTemplateBytes = null;

export const useLeaveApplicationPdf = () => {
  const cfg = LeaveApplicationPdfConfig;

  const loadAssets = async () => {
    if (!fontBytes) {
      const fontRes = await fetch(cfg.styles.fontUrl);
      if (!fontRes.ok) throw new Error("Failed to load font");
      fontBytes = await fontRes.arrayBuffer();
    }
    if (!pdfTemplateBytes) {
      const pdfRes = await fetch(cfg.pdfUrl);
      if (!pdfRes.ok) throw new Error("Failed to load leave application PDF template");
      pdfTemplateBytes = await pdfRes.arrayBuffer();
    }
  };

  /**
   * Fill the leave application PDF with the given data.
   *
   * @param {Object} data
   * @param {string} data.studentId        - 學號
   * @param {string} data.studentName      - 姓名
   * @param {string} data.department       - 科系 key, e.g. "master_of_divinity"
   * @param {string} data.leaveReason      - 請假原因（max 20 chars）
   * @param {string} data.courseName       - 請假課程名稱
   * @param {string} data.leaveType        - "事假" | "病假" | "公假" | "其他"
   * @param {string} data.leaveDate        - "YYYY-MM-DD"
   * @param {number} data.leavePeriods     - 請假節數（integer ≥ 1）
   * @param {string} [data.teacherName]    - 任課老師姓名（Approved 狀態才印）
   * @param {string} [data.reviewDate]     - reserved for future
   * @param {string} [data.reviewNote]     - reserved for future
   */
  const fillPdf = async (data) => {
    await loadAssets();

    const pdfDoc = await PDFDocument.load(pdfTemplateBytes);
    pdfDoc.registerFontkit(fontkit);

    const customFont = await pdfDoc.embedFont(fontBytes);
    const page = pdfDoc.getPages()[0];

    const drawText = (text, x, y, options = {}) => {
      if (text === null || text === undefined || text === "") return;
      const isCheckbox = String(text) === cfg.styles.checkboxMark;
      page.drawText(String(text), {
        x,
        y,
        size: options.size ?? cfg.styles.defaultFontSize,
        font: customFont,
        color: rgb(0, 0, 0),
        ...(isCheckbox ? {} : {
          strokeColor: rgb(0, 0, 0),
          strokeWidth: options.strokeWidth ?? cfg.styles.strokeWidth,
        }),
        ...options,
      });
    };

    /**
     * Draw text in both upper and lower sections.
     * Lower section Y = upper section Y - SECTION_OFFSET_PX
     */
    const drawBoth = (text, coord, options = {}) => {
      drawText(text, coord.x, coord.y, options);
      drawText(text, coord.x, coord.y - SECTION_OFFSET_PX, options);
    };

    const u = cfg.upper;
    const checkMark = cfg.styles.checkboxMark;
    const checkSize = cfg.styles.checkboxFontSize;

    // ── 基本資訊 ──────────────────────────────────────────
    drawBoth(data.studentId, u.studentId);
    drawBoth(data.studentName, u.studentName);
    drawText(data.courseName, u.courseName.x, u.courseName.y);
    drawText(data.courseName, u.courseNameLower.x, u.courseNameLower.y - SECTION_OFFSET_PX);

    // 請假原因（截斷至 20 字）
    const reason = String(data.leaveReason || "").slice(0, 20);
    drawBoth(reason, u.leaveReason);

    // ── 科系 checkbox ──────────────────────────────────────
    if (data.department && DEPT_CHECKBOX_X_MAP[data.department]) {
      const deptX = DEPT_CHECKBOX_X_MAP[data.department];
      const deptCoord = toPdfCoords(deptX, u.deptCheckboxY_pdf2json);
      drawText(checkMark, deptCoord.x, deptCoord.y, { size: checkSize });
      drawText(checkMark, deptCoord.x, deptCoord.y - SECTION_OFFSET_PX, { size: checkSize });
    }

    // ── 假別 checkbox ──────────────────────────────────────
    const leaveType = data.leaveType || "";
    let leaveCheckboxCoord = null;
    let leaveOtherLabel = null;

    if (leaveType === "事假") {
      leaveCheckboxCoord = u.leaveTypeEvent;
    } else if (leaveType === "病假") {
      leaveCheckboxCoord = u.leaveTypeSick;
    } else if (leaveType === "公假") {
      // PDF 上勾選「其他」，右方填寫「公假」
      leaveCheckboxCoord = u.leaveTypeOther;
      leaveOtherLabel = "公假";
    } else {
      // 其他
      leaveCheckboxCoord = u.leaveTypeOther;
      leaveOtherLabel = "";
    }

    if (leaveCheckboxCoord) {
      drawText(checkMark, leaveCheckboxCoord.x, leaveCheckboxCoord.y, { size: checkSize });
      drawText(checkMark, leaveCheckboxCoord.x, leaveCheckboxCoord.y - SECTION_OFFSET_PX, { size: checkSize });
    }
    if (leaveOtherLabel) {
      drawBoth(leaveOtherLabel, u.leaveTypeOtherText);
    }

    // ── 請假日期（民國年） ──────────────────────────────────
    if (data.leaveDate) {
      const d = dayjs(data.leaveDate);
      const rocYear = d.year() - 1911;
      drawBoth(String(rocYear), u.leaveYear);
      drawBoth(String(d.month() + 1), u.leaveMonth);
      drawBoth(String(d.date()), u.leaveDay);
    }

    // ── 請假總節數 ─────────────────────────────────────────
    const periods = Number(data.leavePeriods) || 1;
    if (periods === 1) {
      drawBoth(checkMark, u.periods1, { size: checkSize });
    } else if (periods === 2) {
      drawBoth(checkMark, u.periods2, { size: checkSize });
    } else if (periods === 3) {
      drawBoth(checkMark, u.periods3, { size: checkSize });
    } else {
      drawBoth(checkMark, u.periodsOther, { size: checkSize });
      drawBoth(String(periods), u.periodsOtherText);
    }

    // ── 任課老師簽名（上半聯，僅 Approved 時） ─────────────
    if (data.teacherName) {
      drawText(data.teacherName, u.teacherName.x, u.teacherName.y);
    }
    // Reserved for future:
    // if (data.reviewDate) { drawText(data.reviewDate, u.reviewDate.x, u.reviewDate.y); }
    // if (data.reviewNote) { drawText(data.reviewNote, u.reviewNote.x, u.reviewNote.y); }

    return pdfDoc;
  };

  /**
   * Open a preview of the filled PDF in a new tab.
   */
  const previewPdf = async (data) => {
    const pdfDoc = await fillPdf(data);
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    return url;
  };

  /**
   * Download the filled PDF as a file.
   * @param {Object} data
   * @param {string} [filename]
   */
  const downloadPdf = async (data, filename = "請假單.pdf") => {
    const pdfDoc = await fillPdf(data);
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return { fillPdf, previewPdf, downloadPdf };
};
