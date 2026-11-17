'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Move,
  Camera,
  Crop,
  Sparkles,
} from 'lucide-react';

interface AvatarCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}

const VIEWPORT_SIZE = 300; // 300x300 px crop viewport
const OUTPUT_SIZE = 512;   // 512x512 px sharp exported 1:1 avatar

export default function AvatarCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
}: AvatarCropModalProps) {
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const imageRef = useRef<HTMLImageElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // Load natural dimensions when imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setRotation(0);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Compute effective dimensions based on rotation
  const isPerpendicular = rotation === 90 || rotation === 270;
  const effectiveWidth = naturalSize ? (isPerpendicular ? naturalSize.height : naturalSize.width) : VIEWPORT_SIZE;
  const effectiveHeight = naturalSize ? (isPerpendicular ? naturalSize.width : naturalSize.height) : VIEWPORT_SIZE;

  // Base scale to cover the 1:1 viewport completely (no empty gaps)
  const baseScale = Math.max(VIEWPORT_SIZE / effectiveWidth, VIEWPORT_SIZE / effectiveHeight);

  // Current rendered dimensions of image before rotation
  const renderedWidth = (naturalSize?.width || VIEWPORT_SIZE) * baseScale;
  const renderedHeight = (naturalSize?.height || VIEWPORT_SIZE) * baseScale;

  // Bounds for panning
  const currentEffectiveWidth = effectiveWidth * baseScale * zoom;
  const currentEffectiveHeight = effectiveHeight * baseScale * zoom;
  const maxPanX = Math.max(0, (currentEffectiveWidth - VIEWPORT_SIZE) / 2);
  const maxPanY = Math.max(0, (currentEffectiveHeight - VIEWPORT_SIZE) / 2);

  const clampPan = useCallback((x: number, y: number) => {
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, y)),
    };
  }, [maxPanX, maxPanY]);

  // Handle Drag Start
  const handleStartDrag = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({
      x: clientX - pan.x,
      y: clientY - pan.y,
    });
  };

  // Handle Drag Move
  const handleMoveDrag = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const newX = clientX - dragStart.x;
    const newY = clientY - dragStart.y;
    setPan(clampPan(newX, newY));
  };

  // Handle Drag End
  const handleEndDrag = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom((prev) => {
      const nextZoom = Math.max(1, Math.min(3.5, prev + delta));
      return Number(nextZoom.toFixed(2));
    });
  };

  // Re-clamp pan if zoom changes
  useEffect(() => {
    setPan((prev) => clampPan(prev.x, prev.y));
  }, [zoom, clampPan]);

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
    setPan({ x: 0, y: 0 }); // reset pan on rotation to maintain safe boundary
  };

  // Reset to initial centered fit
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  // Generate cropped 1:1 image on HTML5 Canvas
  const handleApplyCrop = () => {
    if (!imageSrc || !naturalSize) return;

    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const scaleFactor = OUTPUT_SIZE / VIEWPORT_SIZE;

    // Center canvas
    ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);

    // Apply pan in canvas coordinates
    ctx.translate(pan.x * scaleFactor, pan.y * scaleFactor);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply zoom & base scale
    const drawScale = baseScale * zoom * scaleFactor;
    const drawW = naturalSize.width * drawScale;
    const drawH = naturalSize.height * drawScale;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.90);
      onCropComplete(dataUrl);
      onClose();
    };
    img.src = imageSrc;
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-3xl bg-[#101114] border border-border-subtle shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">Edit & Crop Avatar</h2>
              <p className="text-[11px] text-text-muted">Reposition and zoom to fit 1:1 circle</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Crop Stage Viewport */}
        <div className="p-6 flex flex-col items-center gap-5">
          <div
            ref={viewportRef}
            style={{ width: `${VIEWPORT_SIZE}px`, height: `${VIEWPORT_SIZE}px` }}
            className={`relative rounded-2xl overflow-hidden bg-black/90 border border-border-subtle select-none shadow-inner touch-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            onMouseDown={(e) => handleStartDrag(e.clientX, e.clientY)}
            onMouseMove={(e) => handleMoveDrag(e.clientX, e.clientY)}
            onMouseUp={handleEndDrag}
            onMouseLeave={handleEndDrag}
            onTouchStart={(e) => {
              if (e.touches.length === 1) {
                handleStartDrag(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 1) {
                handleMoveDrag(e.touches[0].clientX, e.touches[0].clientY);
              }
            }}
            onTouchEnd={handleEndDrag}
            onWheel={handleWheel}
          >
            {/* Image Layer transformed */}
            <div
              className="absolute left-1/2 top-1/2 will-change-transform"
              style={{
                transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px))`,
                transition: isDragging ? 'none' : 'transform 0.05s ease-out',
              }}
            >
              <div
                style={{
                  transform: `rotate(${rotation}deg) scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.05s ease-out',
                }}
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop preview"
                  draggable={false}
                  className="max-w-none pointer-events-none select-none"
                  style={{
                    width: `${renderedWidth}px`,
                    height: `${renderedHeight}px`,
                    transform: 'translate(-50%, -50%)',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                />
              </div>
            </div>

            {/* Circular Mask & Guide Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${VIEWPORT_SIZE} ${VIEWPORT_SIZE}`}
            >
              <defs>
                <mask id="avatar-crop-mask">
                  <rect width={VIEWPORT_SIZE} height={VIEWPORT_SIZE} fill="white" />
                  <circle
                    cx={VIEWPORT_SIZE / 2}
                    cy={VIEWPORT_SIZE / 2}
                    r={VIEWPORT_SIZE / 2 - 12}
                    fill="black"
                  />
                </mask>
              </defs>
              {/* Darkened Vignette outside the 1:1 circle */}
              <rect
                width={VIEWPORT_SIZE}
                height={VIEWPORT_SIZE}
                fill="rgba(8, 9, 12, 0.72)"
                mask="url(#avatar-crop-mask)"
              />
              {/* Circular Gold Target Border */}
              <circle
                cx={VIEWPORT_SIZE / 2}
                cy={VIEWPORT_SIZE / 2}
                r={VIEWPORT_SIZE / 2 - 12}
                fill="none"
                stroke="#C9A94D"
                strokeWidth="2"
                strokeDasharray="6 4"
                opacity="0.85"
              />
              {/* Subtle Center Target Reticle */}
              <line
                x1={VIEWPORT_SIZE / 2 - 8}
                y1={VIEWPORT_SIZE / 2}
                x2={VIEWPORT_SIZE / 2 + 8}
                y2={VIEWPORT_SIZE / 2}
                stroke="#C9A94D"
                strokeWidth="1.5"
                opacity="0.5"
              />
              <line
                x1={VIEWPORT_SIZE / 2}
                y1={VIEWPORT_SIZE / 2 - 8}
                x2={VIEWPORT_SIZE / 2}
                y2={VIEWPORT_SIZE / 2 + 8}
                stroke="#C9A94D"
                strokeWidth="1.5"
                opacity="0.5"
              />
            </svg>

            {/* Floating Drag Hint Pill */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-text-muted flex items-center gap-1.5 pointer-events-none">
              <Move className="w-3 h-3 text-accent" />
              <span>Drag to position</span>
            </div>
          </div>

          {/* Controls Bar: Zoom Slider + Action Buttons */}
          <div className="w-full space-y-3.5">
            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-text-muted font-medium flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5 text-accent" />
                  Zoom Level
                </span>
                <span className="font-mono text-accent font-bold">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1, Number((z - 0.1).toFixed(2))))}
                  className="p-1 rounded-lg hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.02"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 accent-accent h-1.5 bg-surface rounded-lg appearance-none cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}
                  className="p-1 rounded-lg hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Adjustment Tools */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-hover border border-border-subtle text-xs text-text-secondary hover:text-text-primary transition-all active:scale-95"
                >
                  <RotateCw className="w-3.5 h-3.5 text-accent" />
                  <span>Rotate 90°</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-hover border border-border-subtle text-xs text-text-secondary hover:text-text-primary transition-all active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-text-muted" />
                  <span>Reset</span>
                </button>
              </div>

              <span className="text-[10px] text-text-muted font-mono">512 × 512 Hi-Res</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-surface/50 border-t border-border-subtle">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-border-subtle text-xs font-semibold text-text-secondary hover:text-text-primary transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-accent text-[#101114] hover:bg-accent-hover font-bold text-xs shadow-md shadow-[#C9A94D]/25 transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Apply Crop</span>
          </button>
        </div>
      </div>
    </div>
  );
}
