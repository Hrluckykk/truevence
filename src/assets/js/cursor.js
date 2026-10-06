/* ============================================================
   INVESTIGATIVE CURSOR — magnifying glass
   ============================================================ */
.tv-cursor-wrap {
  position: fixed;
  top: 0; left: 0;
  width: 40px; height: 40px;
  pointer-events: none;
  z-index: 2147483647;
  opacity: 0;
  transform-origin: 45% 45%;
  will-change: transform, opacity;
  transition:
    opacity .2s ease,
    transform .28s cubic-bezier(.2,.8,.2,1);
}
body.cursor-ready .tv-cursor-wrap { opacity: 1; }

.tv-cursor-svg {
  display: block;
  overflow: visible;
  filter:
    drop-shadow(0 0 6px rgba(124,58,237,.55))
    drop-shadow(0 2px 4px rgba(0,0,0,.35));
  transition: transform .3s cubic-bezier(.2,.8,.2,1), filter .3s ease;
  transform-origin: 45% 45%;
}

/* Nudge the lens so the pointer sits inside the glass */
.tv-cursor-svg { transform: translate(-8%, -8%) rotate(-15deg); }

/* Hover state — magnifier scans (rotates slightly, grows, glows brighter) */
body.cursor-active .tv-cursor-svg {
  transform: translate(-8%, -8%) rotate(-5deg) scale(1.15);
  filter:
    drop-shadow(0 0 12px rgba(124,58,237,.85))
    drop-shadow(0 2px 6px rgba(0,0,0,.4));
}
body.cursor-active .tv-cursor-lens {
  fill: rgba(124,58,237,.18);
  stroke: #A78BFA;
}
body.cursor-active .tv-cursor-cross { stroke: #C9BEFB; }
body.cursor-active .tv-cursor-shine { fill: rgba(255,255,255,.85); }

/* Hide native cursor site-wide while custom cursor is active */
body.custom-cursor,
body.custom-cursor a,
body.custom-cursor button,
body.custom-cursor input,
body.custom-cursor textarea,
body.custom-cursor label,
body.custom-cursor select,
body.custom-cursor [role="button"] { cursor: none; }

/* Touch devices: no custom cursor */
@media (pointer: coarse) {
  .tv-cursor-wrap { display: none !important; }
  body.custom-cursor,
  body.custom-cursor * { cursor: auto !important; }
}
