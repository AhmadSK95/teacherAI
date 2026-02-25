import type { DeliveryService } from './interfaces.js';
import type { ArtifactRepository } from '../repository/interfaces.js';

export interface ExportResult {
  content: string | Buffer;
  contentType: string;
  fileName: string;
}

export class DefaultDeliveryService implements DeliveryService {
  constructor(private artifactRepo: ArtifactRepository) {}

  async exportArtifact(artifactId: string, medium: string, _destination: string): Promise<boolean> {
    const artifact = this.artifactRepo.findById(artifactId);
    if (!artifact) return false;
    return true;
  }

  async getExportContent(artifactId: string, medium: string): Promise<ExportResult | null> {
    const artifact = this.artifactRepo.findById(artifactId);
    if (!artifact) return null;

    const slug = `artifact-${artifactId.slice(0, 8)}`;

    switch (medium) {
      case 'markdown':
        return {
          content: artifact.content,
          contentType: 'text/markdown',
          fileName: `${slug}.md`,
        };

      case 'pdf':
        return this.generatePdf(artifact.content, slug);

      case 'pptx':
        return this.generatePptx(artifact.content, slug);

      case 'google_doc':
        return {
          content: markdownToHtml(artifact.content),
          contentType: 'text/html',
          fileName: `${slug}.html`,
        };

      default:
        return {
          content: artifact.content,
          contentType: 'text/plain',
          fileName: `${slug}.txt`,
        };
    }
  }

  private async generatePdf(markdownContent: string, slug: string): Promise<ExportResult> {
    const PDFDocument = (await import('pdfkit')).default;

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 50,
        size: 'LETTER',
        info: { Title: 'TeachAssist Export', Creator: 'TeachAssist AI' },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        resolve({
          content: Buffer.concat(chunks),
          contentType: 'application/pdf',
          fileName: `${slug}.pdf`,
        });
      });
      doc.on('error', reject);

      const lines = markdownContent.split('\n');
      for (const line of lines) {
        const trimmed = line.trimEnd();

        if (trimmed.startsWith('# ')) {
          doc.fontSize(20).font('Helvetica-Bold').text(trimmed.slice(2), { paragraphGap: 8 });
        } else if (trimmed.startsWith('## ')) {
          doc.moveDown(0.5);
          doc.fontSize(16).font('Helvetica-Bold').text(trimmed.slice(3), { paragraphGap: 6 });
        } else if (trimmed.startsWith('### ')) {
          doc.moveDown(0.3);
          doc.fontSize(13).font('Helvetica-Bold').text(trimmed.slice(4), { paragraphGap: 4 });
        } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          doc.fontSize(11).font('Helvetica').text(`  \u2022  ${trimmed.slice(2)}`, { paragraphGap: 2 });
        } else if (trimmed.startsWith('| ')) {
          doc.fontSize(10).font('Courier').text(trimmed, { paragraphGap: 1 });
        } else if (trimmed === '') {
          doc.moveDown(0.3);
        } else {
          const clean = trimmed.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
          doc.fontSize(11).font('Helvetica').text(clean, { paragraphGap: 2 });
        }
      }

      doc.end();
    });
  }

  private async generatePptx(markdownContent: string, slug: string): Promise<ExportResult> {
    const mod = await import('pptxgenjs');
    const PptxGenJS = (mod as any).default?.default || (mod as any).default || mod;
    const pptx = new PptxGenJS();
    pptx.author = 'TeachAssist AI';
    pptx.subject = 'Teaching Material';

    const slides = parseMarkdownToSlides(markdownContent);

    for (const slideData of slides) {
      const slide = pptx.addSlide();

      if (slideData.title) {
        slide.addText(slideData.title, {
          x: 0.5, y: 0.3, w: 9, h: 0.8,
          fontSize: 24, bold: true, color: '333333',
        });
      }

      if (slideData.bullets.length > 0) {
        const textItems = slideData.bullets.map((bullet) => ({
          text: bullet,
          options: { fontSize: 14, bullet: true as const, color: '555555', breakLine: true as const },
        }));
        slide.addText(textItems, {
          x: 0.5, y: 1.3, w: 9, h: 4.5, valign: 'top' as const,
        });
      }

      if (slideData.paragraphs.length > 0) {
        const startY = slideData.bullets.length > 0 ? 4.0 : 1.3;
        slide.addText(slideData.paragraphs.join('\n\n'), {
          x: 0.5, y: startY, w: 9, h: 3,
          fontSize: 12, color: '666666', valign: 'top' as const,
        });
      }
    }

    if (slides.length === 0) {
      const slide = pptx.addSlide();
      slide.addText('TeachAssist Export', {
        x: 0.5, y: 0.3, w: 9, h: 0.8, fontSize: 24, bold: true, color: '333333',
      });
      slide.addText(markdownContent.slice(0, 2000), {
        x: 0.5, y: 1.3, w: 9, h: 5, fontSize: 11, color: '555555', valign: 'top' as const,
      });
    }

    const buffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer;

    return {
      content: buffer,
      contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      fileName: `${slug}.pptx`,
    };
  }
}

interface SlideData {
  title: string;
  bullets: string[];
  paragraphs: string[];
}

function parseMarkdownToSlides(markdown: string): SlideData[] {
  const slides: SlideData[] = [];
  let current: SlideData | null = null;

  const lines = markdown.split('\n');
  for (const line of lines) {
    const trimmed = line.trimEnd();

    if (trimmed.startsWith('## ')) {
      if (current) slides.push(current);
      current = { title: trimmed.slice(3).replace(/\*\*/g, ''), bullets: [], paragraphs: [] };
    } else if (trimmed.startsWith('# ')) {
      if (current) slides.push(current);
      current = { title: trimmed.slice(2).replace(/\*\*/g, ''), bullets: [], paragraphs: [] };
    } else if ((trimmed.startsWith('- ') || trimmed.startsWith('* ')) && current) {
      current.bullets.push(trimmed.slice(2).replace(/\*\*(.+?)\*\*/g, '$1'));
    } else if (trimmed.startsWith('|') && !trimmed.match(/^\|[\s-|]+\|$/) && current) {
      current.bullets.push(trimmed.replace(/\|/g, '  ').trim());
    } else if (trimmed.length > 0 && current && !trimmed.startsWith('```')) {
      current.paragraphs.push(trimmed.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1'));
    }
  }

  if (current) slides.push(current);
  return slides;
}

function markdownToHtml(markdown: string): string {
  let html = markdown;

  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^(?!<[h|l|u|o])((?!^\s*$).+)$/gm, '<p>$1</p>');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>TeachAssist Export</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
  h1, h2, h3 { color: #333; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
</style>
</head>
<body>${html}</body>
</html>`;
}
