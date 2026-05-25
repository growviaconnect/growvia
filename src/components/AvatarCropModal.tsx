"use client";

import { useState, useRef } from "react";

const CROP_SIZE = 280;

export default function AvatarCropModal({
  objectUrl,
  onConfirm,
  onCancel,
}: {
  objectUrl: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const imgRef                      = useRef<HTMLImageElement>(null);
  const [ready,      setReady]      = useState(false);
  const [imgNW,      setImgNW]      = useState(0);
  const [imgNH,      setImgNH]      = useState(0);
  const [cropScale,  setCropScale]  = useState(1);
  const [offsetX,    setOffsetX]    = useState(0);
  const [offsetY,    setOffsetY]    = useState(0);

  const fitScaleRef  = useRef(1);
  const cropScaleRef = useRef(1);
  const offsetXRef   = useRef(0);
  const offsetYRef   = useRef(0);

  function setCS(v: number) { cropScaleRef.current = v; setCropScale(v); }
  function setOX(v: number) { offsetXRef.current   = v; setOffsetX(v);  }
  function setOY(v: number) { offsetYRef.current   = v; setOffsetY(v);  }

  const ptrMap    = useRef(new Map<number, { x: number; y: number }>());
  const dragStart = useRef<{ ptrX: number; ptrY: number; offX: number; offY: number } | null>(null);
  const pinchInit = useRef<{ dist: number; scale: number } | null>(null);

  function onLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    const fit = Math.max(CROP_SIZE / img.naturalWidth, CROP_SIZE / img.naturalHeight);
    fitScaleRef.current = fit;
    setImgNW(img.naturalWidth);
    setImgNH(img.naturalHeight);
    setOX((CROP_SIZE - img.naturalWidth  * fit) / 2);
    setOY((CROP_SIZE - img.naturalHeight * fit) / 2);
    setReady(true);
  }

  function ptDist() {
    const pts = Array.from(ptrMap.current.values());
    return pts.length >= 2 ? Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) : 0;
  }

  function onPD(e: React.PointerEvent<HTMLDivElement>) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    ptrMap.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrMap.current.size === 1) {
      dragStart.current = { ptrX: e.clientX, ptrY: e.clientY, offX: offsetXRef.current, offY: offsetYRef.current };
    } else {
      dragStart.current = null;
      pinchInit.current = { dist: ptDist(), scale: cropScaleRef.current };
    }
  }

  function onPM(e: React.PointerEvent<HTMLDivElement>) {
    ptrMap.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrMap.current.size >= 2 && pinchInit.current) {
      setCS(Math.min(8, Math.max(0.5, pinchInit.current.scale * (ptDist() / pinchInit.current.dist))));
    } else if (dragStart.current) {
      setOX(dragStart.current.offX + e.clientX - dragStart.current.ptrX);
      setOY(dragStart.current.offY + e.clientY - dragStart.current.ptrY);
    }
  }

  function onPU(e: React.PointerEvent<HTMLDivElement>) {
    ptrMap.current.delete(e.pointerId);
    pinchInit.current = null;
    if (ptrMap.current.size === 1) {
      const [pt] = ptrMap.current.values();
      dragStart.current = { ptrX: pt.x, ptrY: pt.y, offX: offsetXRef.current, offY: offsetYRef.current };
    } else if (ptrMap.current.size === 0) {
      dragStart.current = null;
    }
  }

  function onWh(e: React.WheelEvent<HTMLDivElement>) {
    e.preventDefault();
    setCS(Math.min(8, Math.max(0.5, cropScaleRef.current * (1 - e.deltaY * 0.001))));
  }

  function confirm() {
    const img = imgRef.current;
    if (!img || !ready) return;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 400;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 400, 400);
    const ratio = 400 / CROP_SIZE;
    ctx.drawImage(
      img,
      offsetXRef.current * ratio,
      offsetYRef.current * ratio,
      imgNW * fitScaleRef.current * cropScaleRef.current * ratio,
      imgNH * fitScaleRef.current * cropScaleRef.current * ratio,
    );
    canvas.toBlob(blob => { if (blob) onConfirm(blob); }, "image/jpeg", 0.9);
  }

  const dW = imgNW * fitScaleRef.current * cropScale;
  const dH = imgNH * fitScaleRef.current * cropScale;

  return (
    <>
      <style>{`@keyframes cm-spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}>
        <div style={{
          background: "#13111F", borderRadius: 24, padding: 28,
          border: "1px solid rgba(255,255,255,0.08)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
          width: "min(90vw, 380px)",
        }}>
          <h3 style={{ color: "white", fontWeight: 700, fontSize: 17, margin: 0 }}>
            Recadrer la photo
          </h3>

          <div
            style={{
              width: CROP_SIZE, height: CROP_SIZE, borderRadius: "50%",
              overflow: "hidden", position: "relative",
              cursor: "grab", background: "#000", flexShrink: 0,
              border: "3px solid #7C3AED",
              boxShadow: "0 0 0 4px rgba(124,58,237,0.2), 0 8px 32px rgba(0,0,0,0.6)",
              touchAction: "none",
            }}
            onPointerDown={onPD}
            onPointerMove={onPM}
            onPointerUp={onPU}
            onPointerCancel={onPU}
            onWheel={onWh}
          >
            <img ref={imgRef} src={objectUrl} alt="" onLoad={onLoad} style={{ display: "none" }} />
            {ready
              ? <img src={objectUrl} alt="" draggable={false} style={{
                  position: "absolute", left: offsetX, top: offsetY,
                  width: dW, height: dH, pointerEvents: "none", userSelect: "none",
                }} />
              : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "#7C3AED", animation: "cm-spin 0.8s linear infinite" }} />
                </div>
            }
          </div>

          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, margin: 0, textAlign: "center" }}>
            Glissez pour repositionner · Molette ou pincement pour zoomer
          </p>

          <div style={{ display: "flex", gap: 10, width: "100%" }}>
            <button type="button" onClick={onCancel}
              style={{
                flex: 1, padding: "13px 0", borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
                color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 500, cursor: "pointer",
              }}>
              Annuler
            </button>
            <button type="button" onClick={confirm} disabled={!ready}
              style={{
                flex: 2, padding: "13px 0", borderRadius: 14, border: "none",
                background: "#7C3AED", color: "white", fontSize: 14, fontWeight: 600,
                cursor: ready ? "pointer" : "default", opacity: ready ? 1 : 0.5,
              }}>
              Recadrer &amp; Enregistrer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
