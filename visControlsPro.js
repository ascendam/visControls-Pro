// ==UserScript==
// @name         visControls Pro
// @namespace    forgeren.tools.image-hover-controls
// @version      1.9.7
// @description  Universal image tooling: zoom, rotate, move (with grid snap), reset, hide, save (single/ZIP), opacity, compare overlay, magnifier, hard mode targeting, viewport snapshot, background-image targeting, reveal hidden. Fixed icon display.
// @author       Peter Polgari, peterp@forgeren.com
// @match        *://*/*
// @run-at       document-end
// @grant        none
// @license      Non-commercial. No sharing, reuse, or distribution without written permission.
// @require      https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js
// @require      https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js
// @inject-into content
// ==/UserScript==
/*
 * Filename: image-hover-controls.pro.user.js
 * Author: Peter Polgari, peterp@forgeren.com
 * Version: 1.9.7
 * Created: 2025-11-13 (Europe/London)
 * License: Non-commercial. No sharing, reuse, or distribution without written permission.
 *
 * 1.9.7 (icon display fix)
 * - Restored working innerHTML icon injection from 1.9.0
 * - Removed problematic attachSVG/DOMParser approach
 * - Icons now display reliably across all contexts
 * - All 1.9.6 bug fixes preserved (z-index, pointer-events, etc.)
 */

(function () {
  'use strict';

  /* =========================================================
     SETTINGS (unchanged except version and IDs)
     ========================================================= */
  const APP = {
    id: 'ihc',
    ver: '1.9.7',
    z: {
      portal: 2147483645,   // below overlay+widget
      overlay: 2147483646,  // image tools
      widget: 2147483647,   // FAB and menus
      grid: 2147483600,
      outline: 2147483599
    },
    i18n: {
      lang: 'en',
      texts: {
        en: {
          zoomIn: 'Zoom in (+/=)',
          zoomOut: 'Zoom out (-)',
          rotate: 'Rotate 45° (←/→)',
          move: 'Move (click to place)',
          reset: 'Reset/Restore',
          hide: 'Hide image',
          save: 'Save this image',
          opacityCtl: 'Opacity',
          compare: 'Compare overlay',
          describe: 'Describe this image',
          hardMode: 'Hard Mode: click elements to attach controls',
          hardOff: 'Hard Mode: OFF',
          grid: 'Grid cycle',
          magnifier: 'Magnifier 2×/4×/8×/OFF',
          snapshot: 'Snapshot viewport (PNG)',
          saveAll: 'Save ALL images (ZIP)',
          bgToggle: 'Toggle background-image targeting',
          reveal: 'Unhide all',
          on: 'ON',
          off: 'OFF',
          saved: 'Saved',
          nothing: 'Nothing to reveal',
          cors: 'Blocked by CORS',
          cancelled: 'Cancelled',
          armed: 'Hard Mode armed',
          picked: 'Target attached'
        },
        de: {
          zoomIn: 'Vergrößern (+/=)',
          zoomOut: 'Verkleleinern (-)',
          rotate: 'Drehen 45° (←/→)',
          move: 'Bewegen (Klick → Platzierung)',
          reset: 'Zurücksetzen',
          hide: 'Bild ausblenden',
          save: 'Dieses Bild speichern',
          opacityCtl: 'Deckkraft',
          compare: 'Vergleichen',
          describe: 'Bild beschreiben',
          hardMode: 'Hard Mode: Elemente anklicken',
          hardOff: 'Hard Mode: AUS',
          grid: 'Raster wechseln',
          magnifier: 'Lupe 2×/4×/8×/Aus',
          snapshot: 'Ansicht speichern (PNG)',
          saveAll: 'Alle Bilder speichern (ZIP)',
          bgToggle: 'Hintergrundbilder ein/aus',
          reveal: 'Alle einblenden',
          on: 'AN',
          off: 'AUS',
          saved: 'Gespeichert',
          nothing: 'Nichts zum Einblenden',
          cors: 'Von CORS blockiert',
          cancelled: 'Abgebrochen',
          armed: 'Hard Mode aktiv',
          picked: 'Ziel verknüpft'
        },
        hu: {
          zoomIn: 'Nagyítás (+/=)',
          zoomOut: 'Kicsinyítés (-)',
          rotate: 'Forgatás 45° (←/→)',
          move: 'Mozgatás (katt → helyezés)',
          reset: 'Visszaállítás',
          hide: 'Kép elrejtése',
          save: 'Kép mentése',
          opacityCtl: 'Átlátszóság',
          compare: 'Összehasonlítás',
          describe: 'Kép leírása',
          hardMode: 'Hard mód: kattints elemekre',
          hardOff: 'Hard mód: KI',
          grid: 'Rács váltás',
          magnifier: 'Nagyító 2×/4×/8×/KI',
          snapshot: 'Nézet mentése (PNG)',
          saveAll: 'Összes kép mentése (ZIP)',
          bgToggle: 'Háttérképek be/ki',
          reveal: 'Mind visszahoz',
          on: 'BE',
          off: 'KI',
          saved: 'Mentve',
          nothing: 'Nincs mit visszahozni',
          cors: 'CORS blokkolta',
          cancelled: 'Megszakítva',
          armed: 'Hard mód aktív',
          picked: 'Cél csatlakoztatva'
        }
      }
    },
    theme: {
      widgetBg: 'rgba(0,0,0,.5)',
      widgetIcon: '#fff',
      toolBg: '#000',
      toolIcon: '#fff',
      toolBgAlt: '#fff',
      toolIconAlt: '#000',
      powerOn: '#00a84f',
      powerOff: '#ff3b30',
      hardOn: '#00a84f',
      hardHover: '#ff3b30'
    },
    settings: {
      storageMode: 1, // 0 none, 1 session, 2 local
      storageKey: 'imageHoverControls:v1',
      buttonSize: 28,
      toolIconScale: 0.63,
      widgetMiniSize: 40,
      buttonSpacing: 6,
      baseOpacity: 0.5,
      hoverOpacity: 1.0,
      offsetTop: 0,
      offsetRight: 10,
      toleranceRight: 5,
      toleranceBottom: 10,
      fadeDuration: 1500,
      fadeEasing: 'cubic-bezier(0.4,0,0.2,1)',
      transformDuration: 300,
      transformEasing: 'cubic-bezier(0.4,0,0.2,1)',
      hoverDelay: 300,
      minVisibleMs: 2000,
      zoomStep: 0.2,
      minScale: 0.2,
      rotateStep: 45,
      gridCycle: [0,5,10,20],
      magCycle: [2,4,8,0],
      magSizePx: 200,
      writeDebounceMs: 200
    }
  };

  const T = APP.settings;
  const TXT = ()=>APP.i18n.texts[APP.i18n.lang]||APP.i18n.texts.en;

  /* =========================================================
     SAFE LOAD FALLBACKS (CSP-friendly)
     ========================================================= */
  function ensureLibs() {
    const tasks = [];
    if (typeof window.html2canvas !== 'function') {
      tasks.push(loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'));
    }
    if (typeof window.JSZip !== 'function') {
      tasks.push(loadScript('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js'));
    }
    return Promise.all(tasks).catch(()=>{ /* ignore; features will toast on use if missing */ });
  }
  function loadScript(src){
    return new Promise((resolve, reject)=>{
      const s=document.createElement('script');
      s.src=src; s.async=true; s.referrerPolicy='no-referrer';
      s.onload=()=>resolve(); s.onerror=()=>reject(new Error('load failed: '+src));
      document.documentElement.appendChild(s);
    });
  }

  /* =========================================================
     STATE + UTILS (unchanged logic)
     ========================================================= */
  let enabled = true;
  let currentTarget = null;
  let activeForOpacity = null;

  const imgState = new WeakMap();
  let storage = null, persisted = {}, pendingWrite = null;

  let overlay, btn = {};
  let tooltip;
  let fabWrap, fabMain, mini = {};
  let liveRegion;
  let gridCanvas, gridCtx;
  let magnifier, magSnapshotURL=null, magSnapW=0, magSnapH=0, magIndex=0;

  let hardArmed = false;
  let hardHoverEl = null;

  const portal = document.createElement('div');
  Object.assign(portal, { id: `${APP.id}-portal` });
  Object.assign(portal.style, {
    position:'fixed', inset:'0',
    zIndex:String(APP.z.portal),
    pointerEvents:'none' // entire portal ignores pointer events
  });
  // ensure portal is attached immediately (no race)
  document.documentElement.appendChild(portal);

  let portalImg = null;

  let dragging=false, startBox=null, startTx=0, startTy=0;

  function el(tag, attrs={}, css={}){ const n=document.createElement(tag); for(const[k,v] of Object.entries(attrs)) if(v!=null) n.setAttribute(k,v); Object.assign(n.style, css); return n; }

  function announce(text){ if(!liveRegion) return; liveRegion.textContent=''; setTimeout(()=>{ liveRegion.textContent=text; },10); }
  function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
  function snap(v,step){ if(!step) return v; return Math.round(v/step)*step; }
  function rect(el){ return el.getBoundingClientRect(); }
    
  function displayFor(el){
  const d = getComputedStyle(el).display;
  return d === 'inline' ? 'inline-block' : d || 'block';
  }

  function makeStorage(mode){
    const noop={mode:0,get:()=>({}),set:()=>{},clear:()=>{}};
    try{
      if(mode===1&&sessionStorage){return{mode:1,get:()=>JSON.parse(sessionStorage.getItem(T.storageKey)||'{}'),set:o=>sessionStorage.setItem(T.storageKey,JSON.stringify(o)),clear:()=>sessionStorage.removeItem(T.storageKey)}}
      if(mode===2&&localStorage){return{mode:2,get:()=>JSON.parse(localStorage.getItem(T.storageKey)||'{}'),set:o=>localStorage.setItem(T.storageKey,JSON.stringify(o)),clear:()=>localStorage.removeItem(T.storageKey)}}
    }catch{}
    return noop;
  }
  function loadPersistence(){ storage = makeStorage(T.storageMode); persisted = storage.get()||{}; }
  function scheduleWrite(){ if(!storage||storage.mode===0) return; if(pendingWrite) return; pendingWrite=setTimeout(()=>{try{storage.set(persisted)}catch{} pendingWrite=null;}, T.writeDebounceMs); }
  function clearAllPersistence(){ persisted={}; if(pendingWrite){clearTimeout(pendingWrite); pendingWrite=null;} storage&&storage.clear&&storage.clear(); }

  function imageSignature(el){
    if (!el) return '';
    if (el.tagName==='IMG') return `${location.pathname}|img|${el.currentSrc||el.src||''}|${el.naturalWidth}x${el.naturalHeight}|${indexAmongSame(el)}`;
    if (el.tagName==='SVG') return `${location.pathname}|svg|inline|${(el.viewBox?.baseVal?.width||el.width?.baseVal?.value||'') }x${(el.viewBox?.baseVal?.height||el.height?.baseVal?.value||'')}|${indexAmongSame(el)}`;
    return `${location.pathname}|bg|${bgUrlOf(el)||''}|${indexAmongSame(el)}`;
  }
  function indexAmongSame(el){ const all=[...document.querySelectorAll(el.tagName.toLowerCase())]; let i=0; for(const n of all){ if(n===el) break; i++; } return `#${i}`; }
  function bgUrlOf(el){ const cs=getComputedStyle(el); const v=cs.backgroundImage||''; const m=v.match(/url\((['"]?)(.*?)\1\)/i); return m?m[2]:null; }

  function resolveCandidate(el){
    if (!el) return {type:null,node:null};
    if (el.tagName==='IMG'||el.tagName==='SVG') return {type:el.tagName.toLowerCase(), node:el};
    if (!APP.__bg) return {type:null,node:null};
    let n = el;
    while(n && n!==document.documentElement){
      const u=bgUrlOf(n); if(u) return {type:'bg', node:n};
      n=n.parentElement;
    }
    return {type:null,node:null};
  }

  function stateFor(el){
      if(!imgState.has(el)){
          imgState.set(el, {
              scale:1, rotate:0, tx:0, ty:0,
              placed:false, absTop:null, absLeft:null,
              hidden:false, opacity:1, compare:false,
              portalActive:false, origHidden:false,
              // new
              origParent:null, origNext:null,
              placeholder:null, fixedW:null, fixedH:null
          });
      }
      return imgState.get(el);
  }

  const compose = s=>`translate(${s.tx}px,${s.ty}px) scale(${s.scale}) rotate(${s.rotate}deg)`;

  function detectClipping(el){
    let n=el.parentElement;
    while(n&&n!==document.documentElement){
      const cs=getComputedStyle(n);
      const hidden=v=>v&&v!=='visible'&&v!=='unset'&&v!=='initial';
      if(hidden(cs.overflow)||hidden(cs.overflowX)||hidden(cs.overflowY)) return true;
      if (cs.clipPath && cs.clipPath!=='none') return true;
      if (cs.mask && cs.mask!=='none') return true;
      n=n.parentElement;
    }
    return false;
  }

  function enterPortal(imgEl){
    const s=stateFor(imgEl); if(s.portalActive) return;
    const r=rect(imgEl);
    portalImg = el('img',{id:`${APP.id}-portal-img`,src:imgEl.currentSrc||imgEl.src||''},{
      position:'fixed',top:`${r.top}px`,left:`${r.left}px`,width:`${r.width}px`,height:`${r.height}px`,
      transformOrigin:'center center', willChange:'transform', zIndex:String(APP.z.portal),
      pointerEvents:'none' // portal image never blocks widget
    });
    if(imgEl.srcset) portalImg.srcset=imgEl.srcset;
    if(imgEl.sizes)  portalImg.sizes =imgEl.sizes;
    portal.appendChild(portalImg);
    imgEl.style.visibility='hidden'; s.origHidden=true; s.portalActive=true;
  }
  function exitPortal(imgEl){
    const s=stateFor(imgEl); if(!s.portalActive) return;
    if (portalImg && portalImg.parentNode===portal) portal.removeChild(portalImg);
    portalImg=null; s.portalActive=false;
    if (s.origHidden){ imgEl.style.visibility=''; s.origHidden=false; }
  }

  function applyTransform(target){
    const s=stateFor(target);
    if (s.hidden) return;
    if (target.tagName==='IMG' && !s.placed && detectClipping(target)) enterPortal(target);
    const on = (target.tagName==='IMG' && s.portalActive && portalImg) ? portalImg : target;
    on.style.transition = `transform ${T.transformDuration}ms ${T.transformEasing}, opacity 200ms ease`;
    on.style.transform = compose(s);
    on.style.opacity   = `${clamp(s.opacity,0.05,1)}`;
    updateResetVisual(target);
    placeOverlay(target,true);
    if (s.compare) updateGhost(target);
    saveStateFor(target);
  }
  function saveStateFor(target){
    if(!storage||storage.mode===0||!target) return;
    const s=stateFor(target);
    const key=imageSignature(target);
    persisted[key]={scale:s.scale,rotate:s.rotate,tx:s.tx,ty:s.ty,placed:s.placed,absTop:s.absTop,absLeft:s.absLeft,hidden:s.hidden,opacity:s.opacity,compare:s.compare};
    scheduleWrite();
  }

  /* =========================================================
     OVERLAY (tools) — RESTORED WORKING ICON SYSTEM
     ========================================================= */
  overlay = el('div',{id:`${APP.id}-overlay`,role:'toolbar','aria-label':'Image controls'},{
    position:'fixed',display:'flex',flexDirection:'column',gap:`${T.buttonSpacing}px`,opacity:'0',pointerEvents:'none',
    transition:`opacity ${T.fadeDuration}ms ${T.fadeEasing}`,zIndex:String(APP.z.overlay),background:'transparent'
  });
  document.documentElement.appendChild(overlay);

  tooltip = el('div',{id:`${APP.id}-tip`,role:'tooltip'},{
    position:'fixed',padding:'6px 8px',background:'rgba(17,24,39,.95)',color:'#f9fafb',borderRadius:'6px',font:'12px/1.2 system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif',
    zIndex:String(APP.z.widget),pointerEvents:'none',opacity:'0',transform:'translateY(-4px)',transition:'opacity .12s ease, transform .12s ease'
  });
  document.documentElement.appendChild(tooltip);

  function showTip(text, anchor){
    if(!text||!anchor) return;
    const r=rect(anchor);
    tooltip.textContent=text;
    tooltip.style.maxWidth = '260px';
    tooltip.style.left = `${Math.round(r.left + r.width + 8)}px`;
    tooltip.style.top  = `${Math.round(r.top)}px`;
    tooltip.style.opacity='1';
    tooltip.style.transform='translateY(0)';
  }
  function hideTip(){ tooltip.style.opacity='0'; tooltip.style.transform='translateY(-4px)'; }

  function toolButton(id, label, svgMarkup){
    const b = el('button',{
      id,
      type:'button',
      title:label,
      'aria-label':label,
      class:`${APP.id}-tool`
    },{
      width:`${T.buttonSize}px`,
      height:`${T.buttonSize}px`,
      borderRadius:'50%',
      border:'none',
      padding:'0',
      margin:'0',
      background: APP.theme.toolBg,
      color: APP.theme.toolIcon,
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      cursor:'pointer',
      opacity:`${T.baseOpacity}`,
      transition:'opacity 200ms ease',
      overflow:'hidden'
    });

    // Simple innerHTML approach that actually works
    if (svgMarkup && svgMarkup.trim().startsWith('<svg')) {
      b.innerHTML = svgMarkup;
      const svgEl = b.querySelector('svg');
      if (svgEl) {
        const sz = Math.round(T.buttonSize * T.toolIconScale);
        svgEl.setAttribute('width', String(sz));
        svgEl.setAttribute('height', String(sz));
        svgEl.style.fill = 'currentColor';
      }
    } else if (svgMarkup) {
      b.textContent = svgMarkup;
      b.style.fontWeight = '700';
      b.style.fontSize = `${Math.round(T.buttonSize * 0.6)}px`;
    }

    return b;
  }

  const ICON = {
    plus:   '<svg viewBox="0 0 24 24"><path d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z"/></svg>',
    minus:  '<svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>',
    rotate: '<svg viewBox="0 0 24 24"><path d="M12 4a8 8 0 1 1-5.657 13.657l1.414-1.414A6 6 0 1 0 12 6v3l4-4-4-4v3z"/></svg>',
    move:   '<svg viewBox="0 0 24 24"><path d="M12 2l3 3h-2v4h4V7l3 3-3 3v-2h-4v4h2l-3 3-3-3h2v-4H7v2l-3-3 3-3v2h4V5H9l3-3z"/></svg>',
    reset:  '<svg viewBox="0 0 24 24"><path d="M12 2v10" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M7 5.5a8 8 0 1 0 10 0" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
    hide:   '<svg viewBox="0 0 24 24"><path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/></svg>',
    save:   '<svg viewBox="0 0 24 24"><path d="M17 3H5a2 2 0 0 0-2 2v14l4-4h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/></svg>',
    sun:    '<svg viewBox="0 0 24 24"><path d="M12 6a6 6 0 1 1 0 12A6 6 0 0 1 12 6zm0-4h0v3M12 19v3M3 12H0m24 0h-3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"/></svg>',
    compare:'<svg viewBox="0 0 24 24"><path d="M3 12l5-4v3h8V8l5 4-5 4v-3H8v3z"/></svg>'
  };

  btn.plus    = toolButton(`${APP.id}-plus`,   TXT().zoomIn,   ICON.plus);
  btn.minus   = toolButton(`${APP.id}-minus`,  TXT().zoomOut,  ICON.minus);
  btn.rotate  = toolButton(`${APP.id}-rot`,    TXT().rotate,   ICON.rotate);
  btn.move    = toolButton(`${APP.id}-move`,   TXT().move,     ICON.move);
  btn.reset   = toolButton(`${APP.id}-reset`,  TXT().reset,    ICON.reset);
  btn.hide    = toolButton(`${APP.id}-hide`,   TXT().hide,     ICON.hide);
  btn.save    = toolButton(`${APP.id}-save`,   TXT().save,     ICON.save);
  btn.opacity = toolButton(`${APP.id}-op`,     TXT().opacityCtl, ICON.sun);
  btn.compare = toolButton(`${APP.id}-cmp`,    TXT().compare,  ICON.compare);
  btn.qmark   = toolButton(`${APP.id}-qm`,     TXT().describe, '?');

  overlay.append(btn.plus,btn.minus,btn.rotate,btn.move,btn.reset,btn.hide,btn.save,btn.opacity,btn.compare,btn.qmark);

  function updateResetVisual(t){
    const s=stateFor(t);
    const atDefault = (Math.abs(s.scale-1)<1e-6) && (((s.rotate%360)+360)%360===0) && Math.abs(s.tx)<1e-6 && Math.abs(s.ty)<1e-6 && !s.placed && !s.hidden && Math.abs(s.opacity-1)<1e-6 && !s.compare;
    btn.reset.style.background = atDefault ? APP.theme.toolBg : APP.theme.powerOn;
    btn.reset.style.color      = atDefault ? APP.theme.toolIcon : '#fff';
  }

  /* =========================================================
     OVERLAY PLACEMENT / HOVER (guarded)
     ========================================================= */
  let overlayLocked=false;

  function placeOverlay(target, force=false){
    if(!enabled) return;
    if(overlayLocked && !force) return;
    const r=rect(target), vw=innerWidth, vh=innerHeight;
    const panelW = T.offsetRight + Math.max(T.buttonSize,1) + T.toleranceRight;
    const panelH = (T.buttonSize * overlay.childElementCount) + (T.buttonSpacing*(overlay.childElementCount-1)) + T.toleranceBottom;
    let top = r.top + T.offsetTop;
    let left;
    const rightSpace = vw - r.right;
    const leftSpace  = r.left;

    overlay.style.paddingLeft  = `${T.offsetRight}px`;
    overlay.style.paddingRight = `${T.toleranceRight}px`;
    overlay.style.paddingBottom= `${T.toleranceBottom}px`;
    overlay.style.minHeight    = `${panelH}px`;
    overlay.style.minWidth     = `${panelW}px`;

    if (rightSpace >= panelW)      left = r.right;
    else if (leftSpace >= panelW){ left = r.left - panelW; overlay.style.paddingLeft='0'; overlay.style.paddingRight=`${T.offsetRight+T.toleranceRight}px`; }
    else { top = Math.max(10,(vh-panelH)/2); left=Math.max(10,(vw-panelW)/2); }

    overlay.style.top=`${top}px`; overlay.style.left=`${left}px`;
  }
  function showOverlay(t){ if(!enabled) return; currentTarget=t; placeOverlay(t,true); overlay.style.opacity='1'; overlay.style.pointerEvents='auto'; overlayLocked=true; updateResetVisual(t); }
  function hideOverlay(){ overlay.style.opacity='0'; overlay.style.pointerEvents='none'; overlayLocked=false; currentTarget=null; hideTip(); }

  document.addEventListener('mouseover', e=>{
    if(!enabled||hardArmed||dragging) return;
    const t=e.target;
    if (!t) return;
    const cand = resolveCandidate(t);
    if (cand.node) showOverlay(cand.node);
  }, true);

  document.addEventListener('mouseout',  (e)=>{
    if(!enabled||hardArmed||dragging) return;
    const toEl = e.relatedTarget;
    // do not hide if moving within overlay or widget
    if (overlay.contains(toEl) || (fabWrap && fabWrap.contains(toEl))) return;
    if(!overlay.matches(':hover')) hideOverlay();
  }, true);

  addEventListener('scroll', ()=>{
    if(!enabled||dragging) return;
    // keep overlay if pointer is over overlay or widget
    if (overlay.matches(':hover') || (fabWrap && fabWrap.matches(':hover'))) return;
    hideOverlay();
  }, {passive:true});

  addEventListener('resize', ()=>{ if(enabled&&currentTarget) placeOverlay(currentTarget,true); });

  /* =========================================================
     MOVE (grid snap preserved)
     ========================================================= */
  function startMove(){
    if(!enabled||!currentTarget) return;
    const s=stateFor(currentTarget);
    const on = (currentTarget.tagName==='IMG' && !s.placed && detectClipping(currentTarget)) ? (enterPortal(currentTarget), portalImg) : currentTarget;
    dragging=true;
    overlayLocked=true;
    startBox = rect(on);
    startTx = s.tx; startTy = s.ty;
    document.addEventListener('pointermove', onMoveFollow, {passive:true});
    document.addEventListener('click', onMovePlace, true);
    announce(TXT().move);
  }
  function activeGridStep(){ if(!gridCanvas) return 0; return Number(gridCanvas.dataset.spacing||0); }
  function onMoveFollow(e){
    if(!dragging||!currentTarget) return;
    const s=stateFor(currentTarget);
    const cx=e.clientX, cy=e.clientY;
    const startCx = startBox.left + startBox.width/2;
    const startCy = startBox.top  + startBox.height/2;
    let nx = startTx + (cx - startCx);
    let ny = startTy + (cy - startCy);
    const step = activeGridStep();
    if (step>0){ nx = snap(nx, step); ny = snap(ny, step); }
    s.tx = nx; s.ty = ny;
    applyTransform(currentTarget);
  }
  function onMovePlace(e){
    if(!dragging||!currentTarget) return;
    e.stopImmediatePropagation(); e.preventDefault();
    const s=stateFor(currentTarget);
    dragging=false; overlayLocked=false;
    document.removeEventListener('pointermove', onMoveFollow);
    document.removeEventListener('click', onMovePlace, true);

    if (currentTarget.tagName==='IMG'){
        const on = (s.portalActive && portalImg) ? portalImg : currentTarget;
        const r = rect(on);

        // remember current absolute pixel size to prevent CSS reflow-based resizing
        s.fixedW = Math.round(r.width);
        s.fixedH = Math.round(r.height);

        // create placeholder once to preserve layout space in original parent
        if (!s.placeholder){
            s.origParent = currentTarget.parentNode;
            s.origNext   = currentTarget.nextSibling;

            const ph = document.createElement('div');
            ph.setAttribute('data-ihc-ph','');
            ph.style.width  = `${s.fixedW}px`;
            ph.style.height = `${s.fixedH}px`;
            ph.style.display = displayFor(currentTarget);

            // keep inline alignment if original was inline
            const cs = getComputedStyle(currentTarget);
            if (cs.margin) {
                ph.style.margin = cs.margin;
            }

            s.placeholder = ph;
            if (s.origParent){
                s.origParent.insertBefore(ph, s.origNext);
            }
        }

        // ensure we are no longer clipped by parents
        exitPortal(currentTarget);

        // move the image to document.body for absolute control
        if (currentTarget.parentNode !== document.body){
            document.body.appendChild(currentTarget);
        }

        // absolute positioning with frozen pixel size, no max constraints
        currentTarget.style.position  = 'absolute';
        currentTarget.style.top       = `${Math.round(scrollY + r.top)}px`;
        currentTarget.style.left      = `${Math.round(scrollX + r.left)}px`;
        currentTarget.style.zIndex    = String(APP.z.overlay);
        currentTarget.style.width     = `${s.fixedW}px`;
        currentTarget.style.height    = `${s.fixedH}px`;
        currentTarget.style.maxWidth  = 'none';
        currentTarget.style.maxHeight = 'none';
        currentTarget.style.transform = compose(s);

        s.placed = true;
        s.absTop  = Math.round(scrollY + r.top);
        s.absLeft = Math.round(scrollX + r.left);
    }

    saveStateFor(currentTarget);
    placeOverlay(currentTarget,true);
  }

  /* =========================================================
     BUTTON ACTIONS (unchanged behaviours)
     ========================================================= */
  btn.plus.addEventListener('click', ()=>{ if(!currentTarget) return; const s=stateFor(currentTarget); s.scale+=T.zoomStep; applyTransform(currentTarget); });
  btn.minus.addEventListener('click',()=>{ if(!currentTarget) return; const s=stateFor(currentTarget); s.scale=Math.max(T.minScale, s.scale-T.zoomStep); applyTransform(currentTarget); });
  btn.rotate.addEventListener('click',()=>{ if(!currentTarget) return; const s=stateFor(currentTarget); s.rotate=(s.rotate+APP.settings.rotateStep)%360; applyTransform(currentTarget); });
  btn.move.addEventListener('click', startMove);
    btn.reset.addEventListener('click',()=>{
        if(!currentTarget) return;
        const s = stateFor(currentTarget);

        Object.assign(s, {
            scale:1, rotate:0, tx:0, ty:0,
            placed:false, absTop:null, absLeft:null,
            hidden:false, opacity:1, compare:false
        });

        if (currentTarget.tagName==='IMG'){
            // drop portal and return to DOM flow
            exitPortal(currentTarget);

            // remove absolute positioning and fixed sizing
            currentTarget.style.position = '';
            currentTarget.style.top = '';
            currentTarget.style.left = '';
            currentTarget.style.zIndex = '';
            currentTarget.style.width = '';
            currentTarget.style.height = '';
            currentTarget.style.maxWidth = '';
            currentTarget.style.maxHeight = '';
            currentTarget.style.visibility = '';

            // restore original parent and order, then remove placeholder
            if (s.origParent){
                s.origParent.insertBefore(currentTarget, s.origNext || null);
            }
            if (s.placeholder){
                try { s.placeholder.remove(); } catch {}
            }
            s.placeholder = null;
            s.origParent = null;
            s.origNext = null;
            s.fixedW = null;
            s.fixedH = null;
        }

        applyTransform(currentTarget);
    });
  btn.hide.addEventListener('click',()=>{ if(!currentTarget) return; const s=stateFor(currentTarget); s.hidden=true; if(currentTarget.tagName==='IMG') exitPortal(currentTarget); currentTarget.style.display='hidden'; saveStateFor(currentTarget); hideOverlay(); announce(TXT().saved); });

  if (s.placed) currentTarget.style.pointerEvents = 'none';
    
  let opPanel=null, opVal=null;
  function buildOpacityPanel(){
    opPanel = el('div',{id:`${APP.id}-op-pane`,role:'dialog','aria-label':TXT().opacityCtl},{position:'fixed',padding:'8px',background:'rgba(0,0,0,.85)',color:'#fff',borderRadius:'8px',zIndex:String(APP.z.widget),display:'none',pointerEvents:'auto'});
    const wrap=el('div',{}, {display:'flex',alignItems:'center',gap:'8px'});
    const dec = el('button',{type:'button','aria-label':'Opacity -5%'},{background:'#fff',color:'#000',border:'none',borderRadius:'4px',cursor:'pointer',padding:'4px 8px'}); dec.textContent='–';
    const inc = el('button',{type:'button','aria-label':'Opacity +5%'},{background:'#fff',color:'#000',border:'none',borderRadius:'4px',cursor:'pointer',padding:'4px 8px'}); inc.textContent='+';
    opVal = el('span',{}, {minWidth:'42px',textAlign:'center'});
    const X = el('button',{type:'button','aria-label':'Close'},{width:'20px',height:'20px',borderRadius:'50%',background:'#fff',color:'#000',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'});
    X.textContent='×';
    X.addEventListener('click',()=>opPanel.style.display='none');
    dec.addEventListener('click',()=>adjOpacity(-5));
    inc.addEventListener('click',()=>adjOpacity(+5));
    wrap.append(dec,opVal,inc,X); opPanel.append(wrap); document.documentElement.appendChild(opPanel);
    document.addEventListener('keydown',e=>{ if(e.key==='Escape' && opPanel.style.display==='block'){ opPanel.style.display='none'; } });
  }
  function openOpacity(){
    if(!opPanel) buildOpacityPanel();
    if(!currentTarget) return;
    activeForOpacity=currentTarget;
    const r = rect((portalImg && stateFor(currentTarget).portalActive)?portalImg:currentTarget);
    opPanel.style.left = `${clamp(r.left,10,innerWidth-180)}px`;
    opPanel.style.top  = `${(r.bottom+48<innerHeight)?(r.bottom+8):Math.max(10,r.top-48)}px`;
    opPanel.style.display='block';
    opVal.textContent = `${Math.round(stateFor(activeForOpacity).opacity*100)}%`;
  }
  function adjOpacity(delta){
    if(!activeForOpacity) return;
    const s=stateFor(activeForOpacity);
    const pct = clamp(Math.round(s.opacity*100)+delta,5,100);
    s.opacity = pct/100;
    applyTransform(activeForOpacity);
    opVal.textContent = `${pct}%`;
  }
  btn.opacity.addEventListener('click', openOpacity);

  /* =========================================================
     COMPARE OVERLAY (unchanged logic)
     ========================================================= */
  let ghost=null, ghostURL=null;
  btn.compare.addEventListener('click',()=>{
    if(!currentTarget) return;
    const s=stateFor(currentTarget);
    s.compare=!s.compare;
    if(s.compare) ensureGhost(currentTarget); else removeGhost();
  });
  function ensureGhost(t){ removeGhost(); updateGhost(t); }
  function updateGhost(t){
    const s=stateFor(t);
    const on = (t.tagName==='IMG' && s.portalActive && portalImg) ? portalImg : t;
    const r=rect(on);
    if (!ghost){
      ghost = el('div',{id:`${APP.id}-ghost`},{
        position:'fixed', pointerEvents:'none', zIndex:String(APP.z.overlay-1), opacity:'0.5',
        backgroundRepeat:'no-repeat', backgroundPosition:'center center', backgroundSize:'cover'
      });
      document.documentElement.appendChild(ghost);
    }
    ghost.style.top = `${r.top}px`; ghost.style.left=`${r.left}px`;
    ghost.style.width=`${r.width}px`; ghost.style.height=`${r.height}px`;

    if (!ghost.style.backgroundImage){
      if (t.tagName==='IMG'){
        ghost.style.backgroundImage = `url("${t.currentSrc||t.src||''}")`;
      } else if (t.tagName==='SVG'){
        const xml = new XMLSerializer().serializeToString(t); const blob=new Blob([xml],{type:'image/svg+xml'}); ghostURL&&URL.revokeObjectURL(ghostURL); ghostURL=URL.createObjectURL(blob); ghost.style.backgroundImage=`url("${ghostURL}")`;
      } else {
        const u=bgUrlOf(t); if(u) ghost.style.backgroundImage=`url("${u}")`;
      }
    }
  }
  function removeGhost(){ if(ghost){ghost.remove(); ghost=null;} if(ghostURL){URL.revokeObjectURL(ghostURL); ghostURL=null;} }

  /* =========================================================
     SAVE single / SAVE ALL (ZIP) — same behaviour
     ========================================================= */
  btn.save.addEventListener('click',()=>{ if(!currentTarget) return; saveSingle(currentTarget); });

  async function saveSingle(target){
    try{
      if (target.tagName==='IMG'){
        const url=target.currentSrc||target.src||''; const blob=await fetchBlob(url);
        return blob? download(blob, filenameFrom(url,'image')) : note(url);
      } else if (target.tagName==='SVG'){
        const xml=new XMLSerializer().serializeToString(target); download(new Blob([xml],{type:'image/svg+xml'}), (target.id||'inline-svg')+'.svg'); return;
      } else {
        const url=bgUrlOf(target); if(!url) return;
        const blob=await fetchBlob(url); return blob? download(blob, filenameFrom(url,'background')) : note(url);
      }
    }catch{}
  }
  function filenameFrom(url,fallback){ try{ const u=new URL(url,location.href); const base=u.pathname.split('/').filter(Boolean).pop()||fallback; return base.replace(/[^\w.\-]+/g,'_'); }catch{ return fallback; } }
  async function fetchBlob(url){ try{ const abs=new URL(url,location.href).href; const res=await fetch(abs,{mode:'cors',credentials:'same-origin'}); if(!res.ok) return null; return await res.blob(); }catch{ return null; } }
  function download(blob,name){ const u=URL.createObjectURL(blob); const a=el('a',{download:name,href:u}); document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(u),1500); }
  function note(url){ const txt=new Blob([`Could not fetch due to CORS.\nURL: ${url}\nPage: ${location.href}\n`],{type:'text/plain'}); download(txt, filenameFrom(url,'resource')+'.note.txt'); }

  /* =========================================================
     MAGNIFIER (2×→4×→8×→OFF) — same logic
     ========================================================= */
  function toggleMagnifierCycle(){
    magIndex = (magIndex+1) % APP.settings.magCycle.length;
    const level = APP.settings.magCycle[magIndex];
    if (level===0){ disableMagnifier(); return; }
    enableMagnifier(level);
  }
  function disableMagnifier(){
    if(magnifier) magnifier.style.display='none';
    if(magSnapshotURL){ URL.revokeObjectURL(magSnapshotURL); magSnapshotURL=null; }
  }
  async function enableMagnifier(level){
    await ensureLibs();
    if (typeof window.html2canvas !== 'function'){ toast(TXT().cors); return; }
    if (!magnifier){
      magnifier = el('div',{id:`${APP.id}-mag`},{
        position:'fixed', width:`${APP.settings.magSizePx}px`, height:`${APP.settings.magSizePx}px`,
        borderRadius:'50%', boxShadow:'0 0 0 2px #fff, 0 0 12px rgba(0,0,0,.35)', overflow:'hidden', pointerEvents:'none', zIndex:String(APP.z.widget), display:'none',
        backgroundRepeat:'no-repeat', backgroundPosition:'0 0'
      });
      document.documentElement.appendChild(magnifier);
      document.addEventListener('mousemove', onMagMove, {passive:true});
      document.addEventListener('click', ()=>{ if(APP.settings.magCycle[magIndex]!==0){ toggleMagnifierCycle(); } }, true);
    }
    try{
      await new Promise(r=>requestAnimationFrame(r));
      const canvas = await window.html2canvas(document.body,{useCORS:true,backgroundColor:null,windowWidth:innerWidth,windowHeight:innerHeight});
      magSnapW=canvas.width; magSnapH=canvas.height;
      const url=canvas.toDataURL('image/png');
      if(magSnapshotURL) URL.revokeObjectURL(magSnapshotURL);
      magSnapshotURL=url;
      magnifier.style.backgroundImage=`url("${url}")`;
      magnifier.dataset.level=String(level);
      magnifier.style.display='block';
    }catch{
      magnifier.style.backgroundImage='none';
      magnifier.textContent='CORS';
      magnifier.style.display='block';
    }
  }
  function onMagMove(e){
    if(!magnifier||!magnifier.dataset.level) return;
    const d=APP.settings.magSizePx, lvl=Number(magnifier.dataset.level)||2;
    const x=clamp(e.clientX - d/2,0,innerWidth-d);
    const y=clamp(e.clientY - d/2,0,innerHeight-d);
    magnifier.style.left=`${x}px`; magnifier.style.top=`${y}px`;
    if (magSnapshotURL && magSnapW>0 && magSnapH>0){
      magnifier.style.backgroundSize = `${magSnapW*lvl}px ${magSnapH*lvl}px`;
      magnifier.style.backgroundPosition = `${-(e.clientX*lvl - d/2)}px ${-(e.clientY*lvl - d/2)}px`;
    }
  }

  /* =========================================================
     GRID (unchanged)
     ========================================================= */
  function ensureGrid(){
    if (gridCanvas) return;
    gridCanvas = el('canvas',{id:`${APP.id}-grid`},{position:'fixed',inset:'0',zIndex:String(APP.z.grid),pointerEvents:'none',display:'none'});
    document.documentElement.appendChild(gridCanvas);
    gridCtx = gridCanvas.getContext('2d');
    const resize=()=>{ gridCanvas.width=innerWidth; gridCanvas.height=innerHeight; drawGrid(); };
    addEventListener('resize', resize); resize();
  }
  function drawGrid(){
    if(!gridCanvas||!gridCtx) return;
    gridCtx.clearRect(0,0,gridCanvas.width,gridCanvas.height);
    const s = gridCanvas.dataset.spacing|0;
    if(!s) return;
    gridCtx.globalAlpha=0.25; gridCtx.strokeStyle='#00c4ff'; gridCtx.lineWidth=1;
    for(let x=0;x<=gridCanvas.width;x+=s){ gridCtx.beginPath(); gridCtx.moveTo(x+.5,0); gridCtx.lineTo(x+.5,gridCanvas.height); gridCtx.stroke(); }
    for(let y=0;y<=gridCanvas.height;y+=s){ gridCtx.beginPath(); gridCtx.moveTo(0,y+.5); gridCtx.lineTo(gridCanvas.width,y+.5); gridCtx.stroke(); }
    gridCtx.globalAlpha=1;
  }
  function cycleGrid(){
    ensureGrid();
    const arr=T.gridCycle;
    const curr=Number(gridCanvas.dataset.spacing||0);
    const next=arr[(arr.indexOf(curr)+1)%arr.length];
    gridCanvas.dataset.spacing=String(next);
    gridCanvas.style.display = next? 'block':'none';
    drawGrid();
  }

  /* =========================================================
     FAB WIDGET
     ========================================================= */

function injectFabStyles(){
  const st=el('style');
  st.textContent = `
    @keyframes ${APP.id}-slowSpin { from {transform: rotate(0);} to {transform: rotate(360deg);} }
    #${APP.id}-fab-wrap{position:fixed;top:50%;left:10px;transform:translateY(-50%);width:${T.widgetMiniSize}px;height:${T.widgetMiniSize}px;z-index:${APP.z.widget}}
    #${APP.id}-fab-main{width:${T.widgetMiniSize}px;height:${T.widgetMiniSize}px;border-radius:50%;border:2px solid ${APP.theme.powerOn};background:${APP.theme.widgetBg};color:${APP.theme.widgetIcon};display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden}
    #${APP.id}-fab-main.${APP.id}-off{border-color:${APP.theme.powerOff}}
    .${APP.id}-mini{position:absolute;top:0;left:${T.widgetMiniSize+6}px}
    #${APP.id}-mini-hard{left:${T.widgetMiniSize+6}px}
    #${APP.id}-mini-power{left:${(T.widgetMiniSize+6)*2}px}
    #${APP.id}-mini-theme{left:${(T.widgetMiniSize+6)*3}px}
    #${APP.id}-mini-grid{left:${(T.widgetMiniSize+6)*4}px}
    #${APP.id}-mini-mag{left:${(T.widgetMiniSize+6)*5}px}
    #${APP.id}-mini-snap{left:${(T.widgetMiniSize+6)*6}px}
    #${APP.id}-mini-saveall{left:${(T.widgetMiniSize+6)*7}px}
    #${APP.id}-mini-bg{left:${(T.widgetMiniSize+6)*8}px}
    #${APP.id}-mini-reveal{left:${(T.widgetMiniSize+6)*9}px}
    #${APP.id}-fab-wrap.${APP.id}-open .${APP.id}-mini{opacity:1 !important;pointer-events:auto !important;transform:translateX(0) scale(1) !important}
    .${APP.id}-hard-armed #${APP.id}-mini-hard{outline:2px solid ${APP.theme.hardOn}}
    .${APP.id}-hard-hover{outline:2px dashed ${APP.theme.hardHover} !important; outline-offset:2px !important;}
    #${APP.id}-overlay .${APP.id}-tool{background:${APP.theme.toolBg}; color:${APP.theme.toolIcon}}
  `;
  document.head.appendChild(st);
}

injectFabStyles();

fabWrap = el('div',{id:`${APP.id}-fab-wrap`,class:`${APP.id}-fab-wrap`,role:'region','aria-label':'Image tools menu'},{
  position:'fixed',top:'50%',left:'10px',transform:'translateY(-50%)',width:'40px',height:'40px',zIndex:String(APP.z.widget)
});

fabMain = el('button',{id:`${APP.id}-fab-main`,type:'button',title:'Image tools menu'},{
  width:'40px',height:'40px',borderRadius:'50%',border:`2px solid ${APP.theme.powerOn}`,background:APP.theme.widgetBg,color:APP.theme.widgetIcon,
  display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',overflow:'hidden'
});

fabMain.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" class="${APP.id}-rot-icon" style="width:100%;height:100%;opacity:.9;pointer-events:none;animation:${APP.id}-slowSpin 240s cubic-bezier(0.4,0,0.2,1) infinite;">
  <circle cx="17" cy="7" r="3" fill="currentColor"/>
  <path d="M2 18 L8 10 L12 14 L16 9 L22 18 Z" fill="currentColor"/>
</svg>`;

function miniBtn(id, title, svgMarkup, textFallback){
  const b = el('button',{
    id:`${APP.id}-mini-${id}`,
    type:'button',
    title,
    class:`${APP.id}-mini`
  },{
    width:`${APP.settings.widgetMiniSize}px`,
    height:`${APP.settings.widgetMiniSize}px`,
    borderRadius:'50%',
    border:'none',
    background:'#fff',
    color:'#000',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    cursor:'pointer',
    boxShadow:'0 6px 16px rgba(0,0,0,0.2)',
    opacity:'0',
    pointerEvents:'none',
    transform:'translateX(8px) scale(.8)',
    transition:'opacity .18s ease-out, transform .18s ease-out',
    overflow:'hidden'
  });

  if (svgMarkup && svgMarkup.trim().startsWith('<svg')) {
    b.innerHTML = svgMarkup;
    const svgEl = b.querySelector('svg');
    if (svgEl) {
      svgEl.setAttribute('width', '20');
      svgEl.setAttribute('height', '20');
      svgEl.style.fill = 'currentColor';
    }
  } else if (textFallback) {
    b.textContent = textFallback;
    b.style.fontWeight = '700';
    b.style.fontSize = '14px';
  }

  b.addEventListener('mouseenter', () => showTip(title, b));
  b.addEventListener('mouseleave', hideTip);
  return b;
}

mini.hard  = miniBtn('hard', TXT().hardMode, '<svg viewBox="0 0 24 24"><path d="M2 21l9-9 3 3-9 9H2v-3zm20-14l-2 2-5-5 2-2 5 5zM7 7l5-5 5 5-5 5L7 7z"/></svg>');
mini.power = miniBtn('power', 'Power ON/OFF', '<svg viewBox="0 0 24 24"><path d="M13 3v10h-2V3h2zm-1 19a8 8 0 1 1 5.657-13.657l-1.414 1.414A6 6 0 1 0 12 20z"/></svg>');
mini.theme = miniBtn('theme', 'Flip widget theme (light/dark)', '');
mini.theme.style.border='1px solid #000';
mini.theme.style.background='conic-gradient(#000 0 180deg, transparent 180deg 360deg)';

mini.grid   = miniBtn('grid',   TXT().grid,     '<svg viewBox="0 0 24 24"><path d="M3 3h18v18H3V3zm6 0v18m6-18v18M3 9h18M3 15h18"/></svg>');
mini.mag    = miniBtn('mag',    TXT().magnifier,'<svg viewBox="0 0 24 24"><path d="M10 2a8 8 0 1 0 4.9 14.4l4.35 4.35 1.41-1.41-4.35-4.35A8 8 0 0 0 10 2z"/></svg>');
mini.snap   = miniBtn('snap',   TXT().snapshot, '<svg viewBox="0 0 24 24"><path d="M5 7h3l2-2h4l2 2h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zm7 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10z"/></svg>');
mini.saveAll= miniBtn('saveall',TXT().saveAll,  '<svg viewBox="0 0 24 24"><path d="M12 2l4 4h-3v6H11V6H8l4-4zm8 8v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8h2v8h12v-8h2z"/></svg>');
mini.bg     = miniBtn('bg',     TXT().bgToggle, null,'BG');
mini.reveal = miniBtn('reveal', TXT().reveal,   '<svg viewBox="0 0 24 24"><path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/></svg>');

fabWrap.append(fabMain, mini.hard, mini.power, mini.theme, mini.grid, mini.mag, mini.snap, mini.saveAll, mini.bg, mini.reveal);
document.documentElement.appendChild(fabWrap);

fabMain.addEventListener('click', e=>{ e.stopPropagation(); fabWrap.classList.toggle(`${APP.id}-open`); });

mini.power.addEventListener('click', ()=>{
  enabled=!enabled;
  fabMain.classList.toggle(`${APP.id}-off`, !enabled);
  if(!enabled){
    hideOverlay(); disableMagnifier(); hardOff();
  } else {
    loadPersistence();
  }
});

mini.theme.addEventListener('click', ()=>{
  const wg=APP.theme.widgetBg, wi=APP.theme.widgetIcon, tb=APP.theme.toolBg, ti=APP.theme.toolIcon;
  APP.theme.widgetBg = (wg==='rgba(0,0,0,.5)') ? 'rgba(255,255,255,.9)' : 'rgba(0,0,0,.5)';
  APP.theme.widgetIcon = (wi==='#fff') ? '#000' : '#fff';
  APP.theme.toolBg = (tb==='#000') ? '#fff' : '#000';
  APP.theme.toolIcon = (ti==='#fff') ? '#000' : '#fff';
  fabMain.style.background = APP.theme.widgetBg; fabMain.style.color = APP.theme.widgetIcon;
  document.querySelectorAll(`.${APP.id}-tool`).forEach(b=>{ b.style.background=APP.theme.toolBg; b.style.color=APP.theme.toolIcon; });
});

mini.grid.addEventListener('click', cycleGrid);
mini.mag.addEventListener('click', toggleMagnifierCycle);

mini.snap.addEventListener('click', async()=>{
  await ensureLibs();
  if (typeof window.html2canvas!=='function'){ toast(TXT().cors); return; }
  try{
    await new Promise(r=>requestAnimationFrame(r));
    const c=await html2canvas(document.body,{useCORS:true,backgroundColor:null,windowWidth:innerWidth,windowHeight:innerHeight});
    const url=c.toDataURL('image/png'); download(dataURLtoBlob(url),'viewport-'+location.hostname+'.png');
  }catch{ toast(TXT().cors); }
});
function dataURLtoBlob(dataURL){ const arr=dataURL.split(','), mime=arr[0].match(/:(.*?);/)[1]; const bstr=atob(arr[1]); let n=bstr.length, u8=new Uint8Array(n); while(n--) u8[n]=bstr.charCodeAt(n); return new Blob([u8],{type:mime}); }

mini.saveAll.addEventListener('click', async()=>{
  await ensureLibs();
  if (typeof window.JSZip!=='function'){ toast(TXT().cors); return; }
  const zip = new JSZip();
  const ts = new Date().toISOString();
  const meta = [
    `Page: ${location.href}`,
    `Title: ${document.title}`,
    `Timestamp: ${ts}`,
    `UA: ${navigator.userAgent}`,
    `Note: Cross-origin images without CORS will be saved as .note.txt`
  ].join('\n');
  zip.file('readme.txt', meta);

  const tasks = [];
  document.querySelectorAll('img[src]').forEach((img,i)=>{
    const url = img.currentSrc||img.src||'';
    if(!url) return;
    tasks.push(addToZip(zip, url, `images/img_${i+1}_${safeName(url)}`));
  });
  document.querySelectorAll('svg').forEach((svg,i)=>{
    const xml=new XMLSerializer().serializeToString(svg);
    zip.file(`images/inline_svg_${i+1}.svg`, xml);
  });
  if (APP.__bg){
    const all = [...document.querySelectorAll('*')].filter(e=>!!bgUrlOf(e));
    all.forEach((el,i)=>{
      const url = bgUrlOf(el);
      if(!url) return;
      tasks.push(addToZip(zip, url, `images/bg_${i+1}_${safeName(url)}`));
    });
  }

  await Promise.all(tasks);
  const blob = await zip.generateAsync({type:'blob'});
  download(blob, `images_${location.hostname}_${Date.now()}.zip`);
});

APP.__bg = true;
mini.bg.addEventListener('click', ()=>{ mini.bg.textContent='BG'; APP.__bg = !APP.__bg; toast(APP.__bg?TXT().on:TXT().off); });

mini.reveal.addEventListener('click', ()=>{
  let cnt = 0;
  imgState.forEach((st, el)=>{
    if (st.hidden){
      st.hidden = false;
      el.style.visibility = '';
      cnt++;
    }
  });
  toast(cnt ? `${TXT().reveal}: ${cnt}` : TXT().nothing);
});

async function addToZip(zip, url, base){
  try{
    const blob = await fetchBlob(url);
    if (blob){
      const ext = guessExt(blob.type) || guessExtFromUrl(url) || 'bin';
      zip.file(`${base}.${ext}`, blob);
    } else {
      zip.file(`${base}.note.txt`, `Could not fetch due to CORS\nURL: ${url}\nPage: ${location.href}\n`);
    }
  }catch{
    zip.file(`${base}.note.txt`, `Error while fetching\nURL: ${url}\nPage: ${location.href}\n`);
  }
}
function guessExt(mime){
  if(!mime) return null;
  if (mime==='image/png') return 'png';
  if (mime==='image/jpeg') return 'jpg';
  if (mime==='image/gif') return 'gif';
  if (mime==='image/webp') return 'webp';
  if (mime==='image/svg+xml') return 'svg';
  return null;
}
function guessExtFromUrl(u){ const m = String(u).match(/\.(png|jpe?g|gif|webp|svg)(?:\?|#|$)/i); return m?m[1].toLowerCase():null; }
function safeName(u){ return (u||'').replace(/[^\w.\-]+/g,'_').slice(-120); }

  /* =========================================================
     HARD MODE (unchanged features, outline restored)
     ========================================================= */
  mini.hard.addEventListener('click', ()=>{
    if(hardArmed){ hardOff(); return; }
    hardOn();
  });
  function hardOn(){
    hardArmed=true;
    fabWrap.classList.add(`${APP.id}-hard-armed`);
    toast(TXT().armed);
    document.addEventListener('mousemove', hardHover, {passive:true, capture:true});
    document.addEventListener('click', hardPick, {capture:true});
  }
  function hardOff(){
    hardArmed=false;
    fabWrap.classList.remove(`${APP.id}-hard-armed`);
    clearHardHover();
    document.removeEventListener('mousemove', hardHover, {capture:true});
    document.removeEventListener('click', hardPick, {capture:true});
    toast(TXT().hardOff);
  }
  function hardHover(e){
    if(!hardArmed) return;
    const elUnder = document.elementFromPoint(e.clientX,e.clientY);
    if (elUnder===hardHoverEl) return;
    clearHardHover();
    if (!elUnder || elUnder===document.documentElement || elUnder===document.body) return;
    const cand = resolveCandidate(elUnder);
    const target = cand.node || elUnder;
    hardHoverEl = target;
    try{ hardHoverEl.classList.add(`${APP.id}-hard-hover`); }catch{}
  }
  function clearHardHover(){
    if(hardHoverEl){ try{ hardHoverEl.classList.remove(`${APP.id}-hard-hover`);}catch{} hardHoverEl=null; }
  }
  function hardPick(ev){
    if(!hardArmed) return;
    ev.stopImmediatePropagation(); ev.preventDefault();
    const elUnder = document.elementFromPoint(ev.clientX, ev.clientY);
    const cand = resolveCandidate(elUnder);
    if (!cand.node){ clearHardHover(); return; }
    clearHardHover();
    showOverlay(cand.node);
    toast(TXT().picked);
  }

  /* =========================================================
     A11Y + RIGHT-CLICK RESTORE + Shortcuts (limited)
     ========================================================= */
  liveRegion = el('div',{id:`${APP.id}-live`,role:'status','aria-live':'polite','aria-atomic':'true'},{position:'fixed',width:'1px',height:'1px',padding:0,margin:'-1px',overflow:'hidden',clip:'rect(0 0 0 0)',border:0});
  document.documentElement.appendChild(liveRegion);

  // Right-click restoration ONLY (no global click suppression)
  addEventListener('contextmenu', (e)=>{ e.stopPropagation(); }, true);
  try{ document.oncontextmenu=null; document.body&&(document.body.oncontextmenu=null);}catch{}

  document.addEventListener('keydown', e=>{
    if(!enabled) return;
    const t=e.target&&e.target.tagName?e.target.tagName.toLowerCase():'';
    if (t==='input'||t==='textarea'||t==='select'||e.isComposing) return;
    if (e.key==='Escape'){ disableMagnifier(); hideOverlay(); hardOff(); announce(TXT().cancelled); }
    if (!currentTarget) return;
    if (e.key==='+'||e.key==='='){ e.preventDefault(); btn.plus.click(); }
    if (e.key==='-'){ e.preventDefault(); btn.minus.click(); }
    if (e.key==='ArrowLeft'||e.key==='ArrowRight'){ e.preventDefault(); btn.rotate.click(); }
    if (e.key==='Enter'){ e.preventDefault(); btn.reset.click(); }
  });

  /* =========================================================
     INIT
     ========================================================= */
  function toast(msg){
    const t=el('div',{class:`${APP.id}-toast`},{position:'fixed',bottom:'16px',left:'16px',background:'rgba(0,0,0,.85)',color:'#fff',padding:'8px 12px',borderRadius:'8px',zIndex:String(APP.z.widget),font:'13px/1.2 system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif'});
    t.textContent=msg; document.documentElement.appendChild(t); setTimeout(()=>t.remove(),1600);
  }

  loadPersistence();
  ensureLibs().catch(()=>{ /* silent; features toast upon use if missing */ });

})();
