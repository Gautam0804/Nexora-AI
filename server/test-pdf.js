const fs = require("fs");
const { PDFParse } = require("pdf-parse");

async function test() {
  const buffer = fs.readFileSync(
    "C:\\Users\\ASUS\\Downloads\\DSA_Cheat_Sheet.pdf"
  );

  const parser = new PDFParse({
    data: buffer,
  });

  try {
    const result = await parser.getText();

    console.log("TYPE:", result.constructor.name);
    console.log("KEYS:", Object.keys(result));

    console.log("HAS PAGES:", Array.isArray(result.pages));
    console.log("TOTAL:", result.total);

    if (Array.isArray(result.pages)) {
      console.log("PAGE COUNT:", result.pages.length);

      console.log("FIRST PAGE:");
      console.log(result.pages[0]);
    }

    console.log("TEXT LENGTH:", result.text?.length);
  } finally {
    await parser.destroy();
  }
}

test().catch(console.error);