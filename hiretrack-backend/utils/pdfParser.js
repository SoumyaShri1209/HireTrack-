


const PDFParser = require('pdf2json');

/**
 * Extract text from a PDF file using pdf2json
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPDF(filePath) {
  return new Promise((resolve, reject) => {
    console.log(`📂 Reading PDF from: ${filePath}`);

    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', errData => {
      console.error('❌ PDF parsing error:', errData.parserError);
      reject(new Error(`Failed to parse PDF: ${errData.parserError}`));
    });

    pdfParser.on('pdfParser_dataReady', pdfData => {
      try {
        // Extract text from all pages with safe URI decoding
        let fullText = '';
        pdfData.Pages.forEach(page => {
          page.Texts.forEach(textItem => {
            // Each text item contains an array of text runs
            textItem.R.forEach(run => {
              const rawText = run.T;
              let decodedText;
              try {
                decodedText = decodeURIComponent(rawText);
              } catch (uriError) {
                // If decoding fails, use the raw string after cleaning % signs
                decodedText = rawText.replace(/%/g, '');
              }
              fullText += decodedText + ' ';
            });
          });
          fullText += '\n';
        });

        const trimmedText = fullText.trim();

        if (!trimmedText) {
          reject(new Error('No text found in PDF. The PDF may be scanned or image-based.'));
          return;
        }

        console.log(`✅ PDF parsed. Pages: ${pdfData.Pages.length}, Text length: ${trimmedText.length} characters`);
        resolve(trimmedText);
      } catch (error) {
        reject(new Error(`Failed to process PDF data: ${error.message}`));
      }
    });

    pdfParser.loadPDF(filePath);
  });
}

module.exports = { extractTextFromPDF };