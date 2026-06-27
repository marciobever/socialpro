import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { Slide } from '@/types';
import { SlideRenderer } from '@/components/dashboard/SlideRenderer';

interface ExportProgressCallback {
  (current: number, total: number, status: string): void;
}

/**
 * Utility to export slides to PDF or ZIP
 */
export class CarouselExporter {
  private static async renderSlideToCanvas(
    slide: Slide,
    index: number,
    total: number,
    brandHandle: string
  ): Promise<HTMLCanvasElement> {
    // Create temporary off-screen container styled for high-res 4:5 portrait (1080x1350)
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.zIndex = '-9999';
    container.style.pointerEvents = 'none';
    container.style.width = '1080px';
    container.style.height = '1350px';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.justifyContent = 'space-between';
    container.style.overflow = 'hidden';
    container.style.borderRadius = '0px';
    container.style.background = slide.background || 'linear-gradient(135deg,#0b0c10,#1f2937)';
    container.className = 'keep-dark'; // Force dark mode colors inside mockup render

    // Outer wrapper for React render
    const reactWrap = document.createElement('div');
    reactWrap.style.width = '100%';
    reactWrap.style.height = '100%';
    reactWrap.style.position = 'relative';
    reactWrap.style.zIndex = '10';
    container.appendChild(reactWrap);

    document.body.appendChild(container);

    const root = createRoot(reactWrap);
    
    // Render the SlideRenderer component
    root.render(
      React.createElement(SlideRenderer, {
        title: slide.title,
        subtitle: slide.subtitle,
        layoutTemplate: slide.layoutTemplate,
        index: index,
        total: total,
        brandHandle: brandHandle,
        isThumbnail: false,
      })
    );

    // Wait for React to render
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Capture using html2canvas with CORS support enabled
    const canvas = await html2canvas(container, {
      useCORS: true,
      scale: 1, // Capture at exact 1080x1350 size
      width: 1080,
      height: 1350,
      windowWidth: 1080,
      windowHeight: 1350,
      backgroundColor: null,
      logging: false,
    });

    // Cleanup DOM
    root.unmount();
    document.body.removeChild(container);

    return canvas;
  }

  /**
   * Generates a high-quality PDF containing all slides as vertical pages (4:5 format)
   */
  public static async exportToPDF(
    slides: Slide[],
    brandHandle: string,
    onProgress?: ExportProgressCallback
  ): Promise<Blob> {
    if (!slides.length) throw new Error('Nenhum slide para exportar.');

    // Page format 1080x1350 points (equal to vertical post px size)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: [1080, 1350],
    });

    for (let i = 0; i < slides.length; i++) {
      if (onProgress) {
        onProgress(i + 1, slides.length, `Renderizando slide ${i + 1} de ${slides.length}...`);
      }

      let imgData: string | null = null;

      if (slides[i].imageUrl) {
        try {
          const src = slides[i].imageUrl!.startsWith('http')
            ? `/api/proxy-image?url=${encodeURIComponent(slides[i].imageUrl!)}`
            : slides[i].imageUrl!;
          const res = await fetch(src);
          if (res.ok) {
            const blob = await res.blob();
            imgData = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }
        } catch (e) {
          console.error('Failed to fetch image directly for PDF, falling back to canvas', e);
        }
      }

      if (!imgData) {
        const canvas = await this.renderSlideToCanvas(slides[i], i, slides.length, brandHandle);
        imgData = canvas.toDataURL('image/png');
      }

      if (i > 0) {
        pdf.addPage([1080, 1350], 'portrait');
      }

      // Detect format from data URL (e.g. data:image/png;base64 -> PNG, data:image/jpeg;base64 -> JPEG)
      let format = 'PNG';
      if (imgData.startsWith('data:image/jpeg') || imgData.startsWith('data:image/jpg')) {
        format = 'JPEG';
      } else if (imgData.startsWith('data:image/webp')) {
        format = 'WEBP';
      }

      // Draw image filling the whole page
      pdf.addImage(imgData, format, 0, 0, 1080, 1350, undefined, 'FAST');
    }

    return pdf.output('blob');
  }

  /**
   * Generates a ZIP file containing PNG images of all slides
   */
  public static async exportToZIP(
    slides: Slide[],
    brandHandle: string,
    onProgress?: ExportProgressCallback
  ): Promise<Blob> {
    if (!slides.length) throw new Error('Nenhum slide para exportar.');

    const zip = new JSZip();

    for (let i = 0; i < slides.length; i++) {
      if (onProgress) {
        onProgress(i + 1, slides.length, `Renderizando imagem ${i + 1} de ${slides.length}...`);
      }

      let blob: Blob | null = null;

      if (slides[i].imageUrl) {
        try {
          const src = slides[i].imageUrl!.startsWith('http')
            ? `/api/proxy-image?url=${encodeURIComponent(slides[i].imageUrl!)}`
            : slides[i].imageUrl!;
          const res = await fetch(src);
          if (res.ok) {
            blob = await res.blob();
          }
        } catch (e) {
          console.error('Failed to fetch image directly for ZIP, falling back to canvas', e);
        }
      }

      if (!blob) {
        const canvas = await this.renderSlideToCanvas(slides[i], i, slides.length, brandHandle);
        blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/png');
        });
      }

      if (blob) {
        // Pad index for correct sorting (e.g. slide_01.png)
        const filename = `slide_${String(i + 1).padStart(2, '0')}.png`;
        zip.file(filename, blob);
      }
    }

    if (onProgress) {
      onProgress(slides.length, slides.length, 'Compactando arquivo ZIP...');
    }

    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Helper to trigger file download in browser
   */
  public static triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
