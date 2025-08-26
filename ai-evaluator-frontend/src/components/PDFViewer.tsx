import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Try multiple worker sources for better compatibility
try {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
} catch {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

interface PDFViewerProps {
  file: string;
  className?: string;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ file, className = '' }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [baseScale, setBaseScale] = useState<number>(1); // The calculated fit-to-width scale
  const [manualZoomLevel, setManualZoomLevel] = useState<number>(1); // Manual zoom multiplier
  const [pageWidth, setPageWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const documentRef = useRef<HTMLDivElement>(null);

  const calculateScale = useCallback(() => {
    if (!containerRef.current || pageWidth === 0) return;
    
    const containerWidth = containerRef.current.clientWidth;
    const padding = 32; // Account for padding and margins
    const availableWidth = containerWidth - padding;
    
    // Calculate base scale (fit-to-width)
    const calculatedBaseScale = Math.min(availableWidth / pageWidth, 2.0); // Max base scale of 2.0
    const minBaseScale = 0.3; // Minimum base scale to ensure readability
    const finalBaseScale = Math.max(minBaseScale, calculatedBaseScale);
    
    setBaseScale(finalBaseScale);
    
    // Apply manual zoom level to base scale
    const finalScale = finalBaseScale * manualZoomLevel;
    setScale(finalScale);
  }, [pageWidth, manualZoomLevel]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onPageLoadSuccess = (page: any) => {
    if (pageWidth === 0) {
      setPageWidth(page.width);
    }
  };

  // Zoom control functions
  const handleZoomIn = useCallback(() => {
    setManualZoomLevel(prev => Math.min(prev * 1.2, 5.0)); // Max 5x zoom
  }, []);

  const handleZoomOut = useCallback(() => {
    setManualZoomLevel(prev => Math.max(prev / 1.2, 0.2)); // Min 0.2x zoom
  }, []);

  const handleResetZoom = useCallback(() => {
    setManualZoomLevel(1);
  }, []);

  // Mouse wheel zoom
  const handleWheel = useCallback((event: WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const zoomDelta = event.deltaY > 0 ? 0.9 : 1.1;
      setManualZoomLevel(prev => Math.min(Math.max(prev * zoomDelta, 0.2), 5.0));
    }
  }, []);

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    console.log('PDF file path:', file);
    console.log('Full URL:', `${window.location.origin}${file}`);
    setError(`Failed to load PDF: ${error.message}`);
    setLoading(false);
  };

  // Effect to calculate scale when page width changes
  useEffect(() => {
    if (pageWidth > 0) {
      calculateScale();
    }
  }, [pageWidth, calculateScale]);

  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      calculateScale();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [calculateScale]);

  // Effect to handle mouse wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      
      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel]);

  // Effect to handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case '=':
          case '+':
            event.preventDefault();
            handleZoomIn();
            break;
          case '-':
            event.preventDefault();
            handleZoomOut();
            break;
          case '0':
            event.preventDefault();
            handleResetZoom();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleZoomIn, handleZoomOut, handleResetZoom]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-center p-8">
          <div className="text-red-600 text-lg font-medium mb-2">Error Loading PDF</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`bg-gray-50 relative ${className}`}>
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white/90 hover:bg-white border border-gray-300 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
          title="Zoom In (Ctrl/Cmd + +, or Ctrl/Cmd + Scroll Up)"
        >
          <ZoomIn className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white/90 hover:bg-white border border-gray-300 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
          title="Zoom Out (Ctrl/Cmd + -, or Ctrl/Cmd + Scroll Down)"
        >
          <ZoomOut className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 bg-white/90 hover:bg-white border border-gray-300 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
          title="Reset Zoom - Fit to Width (Ctrl/Cmd + 0)"
        >
          <RotateCcw className="w-4 h-4 text-gray-700" />
        </button>
        
        {/* Zoom Level Indicator */}
        <div className="px-2 py-1 bg-white/90 border border-gray-300 rounded-lg shadow-lg text-xs font-medium text-gray-700 text-center">
          {Math.round(manualZoomLevel * 100)}%
        </div>
      </div>

      {/* Scale indicator for debugging (can be removed in production) */}
      {import.meta.env.MODE === 'development' && scale > 0 && (
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
          Scale: {scale.toFixed(2)} (Base: {baseScale.toFixed(2)} × {manualZoomLevel.toFixed(2)})
        </div>
      )}
      
      <div className="h-full overflow-auto">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }
        >
          <div ref={documentRef} className="flex flex-col items-center space-y-4 p-4">
            {!loading &&
              Array.from(new Array(numPages), (_, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  scale={scale}
                  onLoadSuccess={index === 0 ? onPageLoadSuccess : undefined}
                  className="shadow-lg border border-gray-300 transition-all duration-300 ease-in-out"
                />
              ))}
          </div>
        </Document>
      </div>
    </div>
  );
};