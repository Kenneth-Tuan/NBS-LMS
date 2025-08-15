/**
 * Formats a date string or Date object into a localized string.
 * @param {string | Date} dateString - The date string or Date object to format.
 * @returns {string} The formatted date string (e.g., '2023/10/26 下午3:30:00') or '-' if input is invalid.
 */

export function formatLocaleDateTime(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "-"; // Return '-' if the date is invalid
  }
  return date.toLocaleString("zh-TW");
}
