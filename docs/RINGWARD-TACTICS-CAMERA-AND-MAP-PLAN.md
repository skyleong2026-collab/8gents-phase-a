# Ringward Tactics — Camera + Bigger Map plan (prototyped 2026-06-14)

Goal: a slide-and-zoom camera, plus larger battle maps. Both are **flat 2D** moves on the existing
CSS 2.5D board — no real 3D. **Build both INTO `public/ringward-tactics.html` AFTER the Claude Design
reskin merges into the repo** (they touch the same file/CSS; sequence them to avoid merge pain).

## What the prototype proved (live, via runtime injection — no file changed)
- **Zoom works** and stays crisp: a CSS `transform: scale()` on a wrapper around `#board`, with
  `image-rendering: pixelated` on sprites → chunky-retro, not blurry. ~2x is comfortable headroom
  (sprites are 128px shown ~53–74px).
- **Pan works**: `transform: translate()` on the same wrapper.
- **Input is transform-SAFE.** Earlier I wrongly thought the camera broke clicks. It does not:
  clicks are per-tile DOM listeners — `d.addEventListener('click',()=>onTileClick(c,r))`
  (ringward-tactics.html ~line 766) — and the browser hit-tests through CSS transforms. Verified:
  with the camera active, `document.elementFromPoint(x,y)` at a tile center returns the correct
  `.tile` element. The failed test-clicks were me hitting the soldier's overlapping billboard
  sprite instead of its tile (a 2.5D overlap aiming issue, present with or without a camera).

## Camera — build notes
- Implement as a transform on a wrapper around `#board` (or fold scale/translate into the board's
  own transform alongside the existing tilt/`--rot`). Keep it OUTSIDE the tilt so it composes as a
  plain 2D camera over the already-tilted board.
- Controls: wheel = zoom toward cursor; right-drag or WASD/arrows = pan; "+/–" buttons; **follow
  active unit** (recenter on the selected `.occ`). Clamp pan to board bounds.
- **Follow-centering needs a tilt offset.** The board tilts `rotateX(56deg)` (`#board.tilt`,
  ~line 60), so a unit's *visual* center sits above its geometric `getBoundingClientRect` center.
  Centering on the raw rect frames slightly low — add a vertical correction (or center on the
  unit's foot point, transform-origin `50% 98%`).
- Alt zoom path: tile size is the CSS var `--tile` and `#board { width: calc(var(--tile)*12) }`
  (~line 13), so zoom could also just scale `--tile` (re-layout) — but a transform is smoother.

## Bigger map — build notes
- The grid is **12 × 8**, defined by `#board { width: calc(var(--tile)*12); height:
  calc(var(--tile)*8) }` (~line 13) + a tile-build loop that wires `onTileClick(c,r)` /
  `onTileHover(c,r)` per cell (~line 766). Tile size = `--tile` CSS var.
- To enlarge: bump the cols/rows the loop uses + the `#board` `calc()` dimensions, then make sure
  spawn / pod / cover / objective generation fills the larger space (more cover lanes, longer
  sightlines). Bigger maps **require** the camera — they won't fit on screen at a readable size.
- Perf: 12×8 ≈ 96 tiles / ~113 board nodes today; a 20×16 map ≈ 320 tiles — still fine for the DOM
  renderer. Watch z-sort (`depthOf`, ~line 833) and overwatch/AI loops as unit counts grow.

## Prototype camera module (starting point — refine on integration)
```js
// Wrap #board in a transformed layer; pan/zoom/follow. Hooks only stable ids/classes.
(function(){
  const board=document.querySelector('#board'); if(!board) return;
  const host=board.parentElement; host.style.overflow='hidden';
  if(getComputedStyle(host).position==='static') host.style.position='relative';
  let cam=document.getElementById('rw-cam');
  if(!cam){ cam=document.createElement('div'); cam.id='rw-cam';
    cam.style.transformOrigin='0 0'; host.insertBefore(cam,board); cam.appendChild(board); }
  const S={s:1,tx:0,ty:0,MIN:0.7,MAX:3};
  const apply=()=>cam.style.transform=`translate(${S.tx}px,${S.ty}px) scale(${S.s})`;
  const hr=()=>host.getBoundingClientRect();
  function center(el){ if(!el) return; const h=hr(),r=el.getBoundingClientRect();
    // NOTE: add a tilt offset to r's center for correct framing under #board.tilt
    S.tx+=h.width/2-(r.left+r.width/2-h.left); S.ty+=h.height/2-(r.bottom-6-h.top); apply(); }
  host.addEventListener('wheel',e=>{e.preventDefault();const h=hr(),mx=e.clientX-h.left,my=e.clientY-h.top,o=S.s;
    S.s=Math.min(S.MAX,Math.max(S.MIN,S.s*(e.deltaY<0?1.12:0.89)));
    S.tx=mx-(mx-S.tx)*(S.s/o); S.ty=my-(my-S.ty)*(S.s/o); apply();},{passive:false});
  let dg=false,lx,ly; host.addEventListener('contextmenu',e=>e.preventDefault());
  host.addEventListener('mousedown',e=>{if(e.button===2){dg=true;lx=e.clientX;ly=e.clientY;}});
  addEventListener('mousemove',e=>{if(dg){S.tx+=e.clientX-lx;S.ty+=e.clientY-ly;lx=e.clientX;ly=e.clientY;apply();}});
  addEventListener('mouseup',()=>dg=false);
  addEventListener('keydown',e=>{const k=e.key.toLowerCase(),st=44;let h=1;
    if(k==='w'||k==='arrowup')S.ty+=st;else if(k==='s'||k==='arrowdown')S.ty-=st;
    else if(k==='a'||k==='arrowleft')S.tx+=st;else if(k==='d'||k==='arrowright')S.tx-=st;else h=0; if(h)apply();});
  board.querySelectorAll('.base').forEach(b=>b.style.imageRendering='pixelated');
  window.RWCam={S,center,recenter(){center(document.querySelector('.occ.sel,.occ.selected,.occ.active,.occ.player'));}};
})();
```
