import fs from 'fs';
import path from 'path';

export interface ParsedFile {
  fileName: string;
  mimeType: string;
  textContent: string;
  parseSuccess: boolean;
}

export async function parseFile(filePath: string, mimeType: string): Promise<ParsedFile> {
  const fileName = path.basename(filePath);

  try {
    let textContent: string;

    switch (mimeType) {
      case 'text/plain':
        textContent = fs.readFileSync(filePath, 'utf-8');
        break;

      case 'application/pdf':
        textContent = await parsePdf(filePath);
        break;

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        textContent = await parseDocx(filePath);
        break;

      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      case 'application/vnd.ms-powerpoint':
        textContent = await parsePptx(filePath);
        break;

      case 'image/png':
      case 'image/jpeg':
        textContent = `[Image file: ${fileName}]`;
        break;

      default:
        textContent = `[Unsupported file type: ${mimeType}]`;
        break;
    }

    return { fileName, mimeType, textContent, parseSuccess: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown parse error';
    return { fileName, mimeType, textContent: `[Parse error: ${msg}]`, parseSuccess: false };
  }
}

async function parsePdf(filePath: string): Promise<string> {
  const mod = await import('pdf-parse');
  const pdfParse = (mod as any).default || mod;
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

async function parseDocx(filePath: string): Promise<string> {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

async function parsePptx(filePath: string): Promise<string> {
  // PPTX is a zip containing XML slides. We use a lightweight approach.
  const JSZip = (await import('jszip')).default;
  const buffer = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(buffer);

  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort();

  const slideTexts: string[] = [];
  for (const slideFile of slideFiles) {
    const xml = await zip.files[slideFile].async('text');
    // Extract text from <a:t> tags
    const texts: string[] = [];
    const regex = /<a:t>([^<]*)<\/a:t>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
      if (match[1].trim()) texts.push(match[1]);
    }
    if (texts.length > 0) {
      const slideNum = slideFile.match(/slide(\d+)/)?.[1];
      slideTexts.push(`--- Slide ${slideNum} ---\n${texts.join('\n')}`);
    }
  }

  return slideTexts.join('\n\n');
}

export async function parseFiles(attachments: { storagePath: string; mimeType: string }[]): Promise<ParsedFile[]> {
  const results: ParsedFile[] = [];
  for (const att of attachments) {
    results.push(await parseFile(att.storagePath, att.mimeType));
  }
  return results;
}
