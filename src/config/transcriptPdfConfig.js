// Coordinate conversion constants
const PAGE_HEIGHT = 841.68;
const SCALE_FACTOR = 16;
// Offset to shift text down (visually correcting "too high" issue)
// Increasing this value moves text DOWN.
const Y_CORRECTION = 8;

/**
 * Converts pdf2json coordinates (Top-Left) to pdf-lib coordinates (Bottom-Left)
 * @param {number} x - pdf2json x coordinate
 * @param {number} y - pdf2json y coordinate
 */
const toPdfCoords = (x, y) => {
  return {
    x: x * SCALE_FACTOR,
    y: PAGE_HEIGHT - y * SCALE_FACTOR - Y_CORRECTION,
  };
};

/**
 * Converts Hex string to RGB 0-1 values for pdf-lib
 * @param {string} hex - hex color string (e.g. #0050b3)
 */
const toRgb = (hex) => {
  if (!hex) return undefined;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { r, g, b };
};

// Colors
export const COLORS = {
  BLUE: "#1d4ed8",
};

export const TranscriptConfig = {
  // Single Value Fields
  fields: {
    title: {
      ...toPdfCoords(12.2, 10),
      size: 20,
      isBold: false,
      align: "center",
    },
    studentName: { ...toPdfCoords(18.8, 12.25), size: 14, color: COLORS.BLUE },
    studentId: { ...toPdfCoords(18.8, 13.55), size: 14 },
    major: { ...toPdfCoords(18.8, 14.85), size: 14, color: COLORS.BLUE },
    enrollmentDate: { ...toPdfCoords(18.8, 16.2), size: 14 },
    grade: { ...toPdfCoords(18.8, 17.55), size: 14 },
    releaseDate: { ...toPdfCoords(18.8, 18.8), size: 14 },
    transferCredits: { ...toPdfCoords(18.8, 20.15), size: 14 },

    semesterLabel: {
      ...toPdfCoords(4.0, 23.75),
      size: 14,
      color: COLORS.BLUE,
    },

    // Bottom section
    totalCredits: {
      ...toPdfCoords(29.816, 41.2),
      size: 14,
      color: COLORS.BLUE,
    },

    // This is the "Practice" note/field (e.g. 免實習)
    practiceNote: { ...toPdfCoords(18.65, 40.15), size: 14 },

    // New Fields
    remarks: { ...toPdfCoords(6.55, 42.4), size: 14 }, // Placed to the right of "備註:" (x=3.85)
    leaveHours: { ...toPdfCoords(10.641, 44.248 + 1.1), size: 14 }, // Aligning with the values "---" row
    absentHours: { ...toPdfCoords(25.429, 44.248 + 1.1), size: 14 },
  },
  // Course Table Configuration
  courseTable: {
    startY_pdf2json: 26.15,
    rowHeight_pdf2json: 1.35,
    columns: {
      name: { x_pdf2json: 4.05 },
      credits: { x_pdf2json: 19.719, align: "center" },
      score: { x_pdf2json: 23.777, align: "center", color: COLORS.BLUE },
      note: { x_pdf2json: 29.396, align: "center" },
    },
  },
  styles: {
    fontSize: 14,
    fontUrl: "/fonts/Kaiu.ttf",
  },
};

export const convertToPdfCoords = toPdfCoords;
export const convertHexToRgb = toRgb;
export const PageDimensions = {
  width: 595.2,
  height: 841.68,
};
