import fs from "fs";
import PDFParser from "pdf2json";

const pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataError", (errData) =>
  console.error(errData.parserError),
);
pdfParser.on("pdfParser_dataReady", (pdfData) => {
  const page = pdfData.Pages[0];
  console.log(`PDF2JSON Page Size: Width=${page.Width}, Height=${page.Height}`);

  // Iterate over all text elements
  page.Texts.forEach((text) => {
    const str = decodeURIComponent(text.R[0].T);
    console.log(`Found: "${str}" at x=${text.x}, y=${text.y}, clr=${text.clr}`);
  });
});

pdfParser.loadPDF("./public/114-1成績單(陳志賢).pdf");
