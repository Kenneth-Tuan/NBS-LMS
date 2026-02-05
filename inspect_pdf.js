import { PDFDocument } from "pdf-lib";
import fs from "fs";

async function run() {
  try {
    const pdfBytes = fs.readFileSync("./public/blankedPersonalTranscript.pdf");
    const pdfDoc = await PDFDocument.load(pdfBytes);

    try {
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      console.log(`Found ${fields.length} form fields:`);
      fields.forEach((f) => {
        console.log(`- ${f.getName()} (${f.constructor.name})`);
      });
    } catch (e) {
      console.log("No form fields found (or error accessing form):", e.message);
    }

    const pages = pdfDoc.getPages();
    console.log(`Total pages: ${pages.length}`);
    const { width, height } = pages[0].getSize();
    console.log(`Page 1 size: ${width} x ${height}`);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
