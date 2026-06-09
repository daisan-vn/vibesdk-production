/**
 * Visual-edit bridge: a tiny, self-contained <script> injected into the preview
 * HTML at serve time. It lets the studio offer Lovable-style "click an element to
 * edit it": the studio toggles select mode and receives the clicked element's
 * descriptor, all over postMessage (the studio never touches the cross-origin DOM).
 *
 * Constraints mirrored from the error overlay: idempotent (`__daisanVE` flag),
 * self-contained, and safe to survive the HTML pipeline. It only reads the DOM and
 * posts plain descriptors to the parent — it never executes parent-provided code.
 */
export const VISUAL_EDIT_BRIDGE_SNIPPET =
	`<script>(function(){` +
	`if(window.__daisanVE)return;window.__daisanVE=1;` +
	`var active=false,box=null;` +
	`function ensureBox(){if(box)return box;box=document.createElement('div');box.id='__daisan_ve_box';` +
	`box.style.cssText='position:fixed;z-index:2147483646;pointer-events:none;border:2px solid #ff5a1f;background:rgba(255,90,31,0.08);border-radius:3px;display:none';` +
	`(document.body||document.documentElement).appendChild(box);return box;}` +
	`function moveBox(el){var b=ensureBox();var r=el.getBoundingClientRect();b.style.display='block';b.style.left=r.left+'px';b.style.top=r.top+'px';b.style.width=r.width+'px';b.style.height=r.height+'px';}` +
	`function hideBox(){if(box)box.style.display='none';}` +
	`function describe(el){` +
	`var classes=typeof el.className==='string'?el.className:'';` +
	`var text=(el.textContent||'').replace(/\\s+/g,' ').trim().slice(0,140);` +
	`var path=[];var n=el;var depth=0;` +
	`while(n&&n.nodeType===1&&depth<4){var t=n.tagName.toLowerCase();var p=n.parentElement;` +
	`if(p){var same=Array.prototype.filter.call(p.children,function(c){return c.tagName===n.tagName;});` +
	`if(same.length>1){t+=':nth-of-type('+(same.indexOf(n)+1)+')';}}path.unshift(t);n=n.parentElement;depth++;}` +
	`return {tag:el.tagName.toLowerCase(),id:el.id||'',classes:classes,text:text,selector:path.join(' > ')};}` +
	`function onMove(e){if(!active)return;var el=e.target;if(!el||el===box)return;moveBox(el);}` +
	`function onClick(e){if(!active)return;e.preventDefault();e.stopPropagation();var el=e.target;if(!el||el===box)return;` +
	`parent.postMessage({source:'daisan-ve',type:'selected',payload:describe(el)},'*');}` +
	`function setMode(on){active=!!on;document.documentElement.style.cursor=active?'crosshair':'';if(!active)hideBox();}` +
	`window.addEventListener('message',function(e){var d=e.data;if(!d||d.source!=='daisan')return;` +
	`if(d.type==='setMode')setMode(d.active);else if(d.type==='clear')hideBox();});` +
	`document.addEventListener('mousemove',onMove,true);` +
	`document.addEventListener('click',onClick,true);` +
	`window.addEventListener('scroll',function(){if(active)hideBox();},true);` +
	`parent.postMessage({source:'daisan-ve',type:'ready'},'*');` +
	`})();</script>`;

/**
 * Inject the visual-edit bridge into an HTML document. Idempotent and tolerant of
 * documents without a <head>. Returns the HTML unchanged if already injected.
 */
export function injectVisualEditBridge(html: string): string {
	if (html.includes('__daisanVE')) {
		return html;
	}
	if (html.includes('</head>')) {
		return html.replace('</head>', `${VISUAL_EDIT_BRIDGE_SNIPPET}\n</head>`);
	}
	if (html.includes('<body>')) {
		return html.replace('<body>', `<body>\n${VISUAL_EDIT_BRIDGE_SNIPPET}`);
	}
	return `${VISUAL_EDIT_BRIDGE_SNIPPET}\n${html}`;
}
