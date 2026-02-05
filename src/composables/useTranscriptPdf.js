import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import {
  TranscriptConfig,
  convertToPdfCoords,
  convertHexToRgb,
  COLORS,
} from "@/config/transcriptPdfConfig";

let fontBytes = null;
let pdfTemplateBytes = null;

export const useTranscriptPdf = () => {
  const loadAssets = async () => {
    if (!fontBytes) {
      const fontRes = await fetch(TranscriptConfig.styles.fontUrl);
      if (!fontRes.ok) throw new Error("Failed to load font");
      fontBytes = await fontRes.arrayBuffer();
    }

    if (!pdfTemplateBytes) {
      const pdfRes = await fetch("/blankedPersonalTranscript.pdf"); // Ensure this file is in public/
      if (!pdfRes.ok) throw new Error("Failed to load PDF template");
      pdfTemplateBytes = await pdfRes.arrayBuffer();
    }
  };

  /**
   * @param {Object} data
   * @param {string} data.studentName
   * @param {string} data.studentId
   * @param {string} data.major
   * @param {string} data.enrollmentDate
   * @param {string} data.grade
   * @param {string} data.releaseDate
   * @param {string} data.transferCredits
   * @param {string} data.semesterTitle
   * @param {string} data.totalCredits
   * @param {string} data.note
   * @param {Array} data.courses - Array of { name, credits, score, note }
   */
  const fillPdf = async (data) => {
    await loadAssets();

    const pdfDoc = await PDFDocument.load(pdfTemplateBytes);
    pdfDoc.registerFontkit(fontkit);

    const customFont = await pdfDoc.embedFont(fontBytes);
    const page = pdfDoc.getPages()[0];

    const drawText = (text, x, y, options = {}) => {
      if (!text) return;

      let color = rgb(0, 0, 0); // Default black
      if (options.color) {
        if (
          typeof options.color === "string" &&
          options.color.startsWith("#")
        ) {
          const c = convertHexToRgb(options.color);
          color = rgb(c.r, c.g, c.b);
        } else if (options.color.r !== undefined) {
          // Already rgb object or simple object
          color = rgb(options.color.r, options.color.g, options.color.b);
        }
      }

      page.drawText(String(text), {
        ...options,
        x,
        y,
        size: options.size || TranscriptConfig.styles.fontSize,
        font: customFont,
        color: color,
      });
    };

    // Draw Single Fields
    Object.entries(TranscriptConfig.fields).forEach(([key, config]) => {
      if (data[key]) {
        // If config has specific coords, use them.
        // For centered text we might need simple logic, but pdf-lib is basic.
        // We'll stick to left alignment for now unless we calculate width.
        drawText(data[key], config.x, config.y, {
          size: config.size,
          color: config.color,
          isBold: config.isBold, // passing isBold too
          ...config, // Just strictly passing specific ones is safer or spread all? Spread all might have extra stuff like x,y but safe.
        });
      }
    });

    // Draw Courses
    if (data.courses && data.courses.length) {
      let currentY_pdf2json = TranscriptConfig.courseTable.startY_pdf2json;

      data.courses.forEach((course) => {
        const yCoords = convertToPdfCoords(0, currentY_pdf2json).y;

        // Name
        const nameX = convertToPdfCoords(
          TranscriptConfig.courseTable.columns.name.x_pdf2json,
          0,
        ).x;
        drawText(course.name, nameX, yCoords);

        // Credits
        const creditsX = convertToPdfCoords(
          TranscriptConfig.courseTable.columns.credits.x_pdf2json,
          0,
        ).x;
        drawText(course.credits, creditsX, yCoords);

        // Score
        const scoreX = convertToPdfCoords(
          TranscriptConfig.courseTable.columns.score.x_pdf2json,
          0,
        ).x;
        drawText(course.score, scoreX, yCoords, { color: COLORS.BLUE });

        // Note
        const noteX = convertToPdfCoords(
          TranscriptConfig.courseTable.columns.note.x_pdf2json,
          0,
        ).x;
        drawText(course.note || "---", noteX, yCoords);

        currentY_pdf2json += TranscriptConfig.courseTable.rowHeight_pdf2json;
      });
    }

    return pdfDoc;
  };

  const previewPdf = async (data) => {
    const pdfDoc = await fillPdf(data);
    if (data.title) {
      const displayTitle = data.studentName
        ? `${data.title} - ${data.studentName}`
        : data.title;
      pdfDoc.setTitle(displayTitle);
    }
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    return url;
  };

  const downloadPdf = async (data, filename = "transcript.pdf") => {
    const pdfDoc = await fillPdf(data);
    pdfDoc.setTitle(data.title || "Transcript");
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    // Trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    fillPdf,
    previewPdf,
    downloadPdf,
  };
};
