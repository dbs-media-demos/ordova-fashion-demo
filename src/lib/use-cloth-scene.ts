"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { after3DGate, can3D, mark3DOff, on3DOff, warm3D, yieldIdle } from "@/lib/three-gate";
import type { ClothScene, Mode } from "@/components/fx/cloth/ClothScene";
import type { FabricId } from "@/content/fabrics";

type Setup = {
  mode: Mode;
  canvas: RefObject<HTMLCanvasElement | null>;
  /** The element whose visibility starts and stops the loop. */
  host: RefObject<HTMLElement | null>;
  /** Read when the build starts (the fabric picked so far). */
  fabric?: () => FabricId;
  /** Wire the scene up once it is ready; returns the undo. */
  attach?: (s: ClothScene) => () => void;
  /** Hold the warm-up queue until this scene's first two seconds are timed (the hero). */
  holdQueue?: boolean;
  /** false: never build a scene and never fetch three.js; the still stays (the /v2 homepage). */
  enabled?: boolean;
};

const FADE_MS = 1400;
/** The hero's two timed seconds plus its fade-in, at most: then the next scene may warm up. */
const PROBE_WAIT = 2600;

/**
 * A desktop cloth scene that never stutters on the way in. The still underneath stays until the
 * scene is built, settled, compiled and has drawn a hidden frame; scenes warm one by one in idle
 * time after load (page order). No real GPU, or a slow first two seconds, fades back to the still,
 * frees the GPU and keeps every scene on its still for the visit. three.js is only fetched inside
 * the gate, so phones, tablets, reduced motion and Save-Data never download it.
 */
export function useClothScene({ mode, canvas, host, fabric, attach, holdQueue, enabled = true }: Setup) {
  const scene = useRef<ClothScene | null>(null);
  const [live, setLive] = useState(false);
  const cb = useRef({ fabric, attach });
  useEffect(() => {
    cb.current = { fabric, attach };
  });

  useEffect(() => {
    if (!enabled) return;
    let s: ClothScene | null = null;
    let disposed = false;
    let detach = () => {};
    let fade = 0;
    let leaving: ClothScene | null = null;

    const toStill = () => {
      const h = s;
      if (!h) return;
      s = null;
      scene.current = null;
      h.setVisible(false);
      detach();
      detach = () => {};
      setLive(false);
      leaving = h;
      fade = window.setTimeout(() => {
        leaving = null;
        h.dispose();
      }, FADE_MS);
    };
    const offOff = on3DOff(toStill);

    const cancel = after3DGate(() =>
      warm3D(async () => {
        const { createClothScene, NoGpuError, SlowCpuError } = await import("@/components/fx/cloth/ClothScene");
        const cv = canvas.current;
        const el = host.current;
        if (disposed || !cv || !el) return;
        let h: ClothScene;
        try {
          h = await createClothScene(cv, {
            mode,
            fabric: cb.current.fabric?.(),
            pause: yieldIdle,
            onSlow: (fps, worst, work) => mark3DOff(`${mode}: ${Math.round(fps)} fps, worst frame ${Math.round(worst)} ms, ${work.toFixed(1)} ms work`),
          });
        } catch (e) {
          performance.mark(`3d:${mode}:failed`, { detail: String(e) });
          if (e instanceof NoGpuError || e instanceof SlowCpuError) mark3DOff(e.message);
          return; // the still stays
        }
        if (disposed || !can3D()) return h.dispose();
        s = h;
        scene.current = h;
        const io = new IntersectionObserver(([en]) => h.setVisible(en.isIntersecting));
        const ro = new ResizeObserver(() => h.resize());
        io.observe(el);
        ro.observe(cv);
        const undo = cb.current.attach?.(h);
        detach = () => {
          io.disconnect();
          ro.disconnect();
          undo?.();
        };
        setLive(true);
        if (holdQueue) await Promise.race([h.probed, new Promise((r) => setTimeout(r, PROBE_WAIT))]);
      }),
    );

    return () => {
      disposed = true;
      cancel();
      offOff();
      detach();
      window.clearTimeout(fade);
      scene.current = null;
      s?.dispose();
      leaving?.dispose();
    };
  }, [mode, canvas, host, holdQueue, enabled]);

  return { scene, live };
}
