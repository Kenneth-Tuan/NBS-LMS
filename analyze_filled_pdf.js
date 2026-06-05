import fs from "fs";
import PDFParser from "pdf2json";

const pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataError", (errData) =>
  console.error(errData.parserError),
);
pdfParser.on("pdfParser_dataReady", (pdfData) => {
  const page = pdfData.Pages[0];
  let output = `PDF2JSON Page Size: Width=${page.Width}, Height=${page.Height}\n`;

  // Iterate over all text elements
  page.Texts.forEach((text) => {
    const str = decodeURIComponent(text.R[0].T);
    output += `Found: "${str}" at x=${text.x}, y=${text.y}\n`;
  });

  fs.writeFileSync("./pdf_layout.txt", output);
  console.log("PDF layout analysis completed. Output written to pdf_layout.txt");
});

pdfParser.loadPDF("./public/學生請假單-空白.pdf");
