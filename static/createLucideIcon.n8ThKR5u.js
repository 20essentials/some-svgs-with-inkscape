import{j as L}from"./jsx-runtime.D_zvdyIk.js";import{r}from"./index.DJ4e78gH.js";import{M as T,i as P,u as D,g as j,P as U,z as K,L as _}from"./react.Bmdr-KqO.js";function B(t,e){if(typeof t=="function")return t(e);t!=null&&(t.current=e)}function q(...t){return e=>{let o=!1;const n=t.map(l=>{const c=B(l,e);return!o&&typeof c=="function"&&(o=!0),c});if(o)return()=>{for(let l=0;l<n.length;l++){const c=n[l];typeof c=="function"?c():B(t[l],null)}}}}function G(...t){return r.useCallback(q(...t),t)}class O extends r.Component{getSnapshotBeforeUpdate(e){const o=this.props.childRef.current;if(P(o)&&e.isPresent&&!this.props.isPresent&&this.props.pop!==!1){const n=o.offsetParent,l=P(n)&&n.offsetWidth||0,c=P(n)&&n.offsetHeight||0,u=getComputedStyle(o),i=this.props.sizeRef.current;i.height=parseFloat(u.height),i.width=parseFloat(u.width),i.top=o.offsetTop,i.left=o.offsetLeft,i.right=l-i.width-i.left,i.bottom=c-i.height-i.top,i.direction=u.direction}return null}componentDidUpdate(){}render(){return this.props.children}}function V({children:t,isPresent:e,anchorX:o,anchorY:n,root:l,pop:c}){const u=r.useId(),i=r.useRef(null),m=r.useRef({width:0,height:0,top:0,left:0,right:0,bottom:0,direction:"ltr"}),{nonce:b}=r.useContext(T),f=c!==!1?t.props?.ref??t?.ref:void 0,k=G(i,f);return r.useInsertionEffect(()=>{const{width:s,height:a,top:g,left:h,right:d,bottom:R,direction:N}=m.current;if(e||c===!1||!i.current||!s||!a)return;const y=N==="rtl",x=o==="left"?y?`right: ${d}`:`left: ${h}`:y?`left: ${h}`:`right: ${d}`,v=n==="bottom"?`bottom: ${R}`:`top: ${g}`;i.current.dataset.motionPopId=u;const C=document.createElement("style");b&&(C.nonce=b);const S=l??document.head;return S.appendChild(C),C.sheet&&C.sheet.insertRule(`
          [data-motion-pop-id="${u}"] {
            position: absolute !important;
            width: ${s}px !important;
            height: ${a}px !important;
            ${x}px !important;
            ${v}px !important;
          }
        `),()=>{i.current?.removeAttribute("data-motion-pop-id"),S.contains(C)&&S.removeChild(C)}},[e]),L.jsx(O,{isPresent:e,childRef:i,sizeRef:m,pop:c,children:c===!1?t:r.cloneElement(t,{ref:k})})}const X=({children:t,initial:e,isPresent:o,onExitComplete:n,custom:l,presenceAffectsLayout:c,mode:u,anchorX:i,anchorY:m,root:b})=>{const f=D(Y),k=r.useId(),s=r.useRef(o),a=r.useRef(n);j(()=>{s.current=o,a.current=n});let g=!0,h=r.useMemo(()=>(g=!1,{id:k,initial:e,isPresent:o,custom:l,onExitComplete:d=>{f.set(d,!0);for(const R of f.values())if(!R)return;n&&n()},register:d=>(f.set(d,!1),()=>{f.delete(d),!s.current&&!f.size&&a.current?.()})}),[o,f,n]);return c&&g&&(h={...h}),r.useMemo(()=>{f.forEach((d,R)=>f.set(R,!1))},[o]),r.useEffect(()=>{!o&&!f.size&&n&&n()},[o]),t=L.jsx(V,{pop:u==="popLayout",isPresent:o,anchorX:i,anchorY:m,root:b,children:t}),L.jsx(U.Provider,{value:h,children:t})};function Y(){return new Map}const A=t=>t.key||"";function F(t){const e=[];return r.Children.forEach(t,o=>{r.isValidElement(o)&&e.push(o)}),e}const fe=({children:t,custom:e,initial:o=!0,onExitComplete:n,presenceAffectsLayout:l=!0,mode:c="sync",propagate:u=!1,anchorX:i="left",anchorY:m="top",root:b})=>{const[f,k]=K(u),s=r.useMemo(()=>F(t),[t]),a=u&&!f?[]:s.map(A),g=r.useRef(!0),h=r.useRef(s),d=D(()=>new Map),R=r.useRef(new Set),[N,y]=r.useState(s),[x,v]=r.useState(s);j(()=>{u&&!f&&!x.length&&k?.()},[f,u,x.length,k]),j(()=>{g.current=!1,h.current=s;for(let w=0;w<x.length;w++){const p=A(x[w]);a.includes(p)?(d.delete(p),R.current.delete(p)):d.get(p)!==!0&&d.set(p,!1)}},[x,a.length,a.join("-")]);const C=[];if(s!==N){let w=[...s],p=0;for(const E of x){const $=a.indexOf(A(E));$===-1?(w.splice(p++,0,E),C.push(E)):p=$+C.length+1}return c==="wait"&&C.length&&(w=C),v(F(w)),y(s),null}const{forceRender:S}=r.useContext(_);return L.jsx(L.Fragment,{children:x.map(w=>{const p=A(w),E=u&&!f?!1:s===x||a.includes(p),$=()=>{if(R.current.has(p))return;if(d.has(p))R.current.add(p),d.set(p,!0);else return;let M=!0;d.forEach(H=>{H||(M=!1)}),M&&(S?.(),v(h.current),y(h.current),u&&k?.(),n&&n())};return L.jsx(X,{isPresent:E,initial:!g.current||o?void 0:!1,custom:e,presenceAffectsLayout:l,mode:c,root:b,onExitComplete:E?void 0:$,anchorX:i,anchorY:m,children:w},p)})})};/**
 * @license lucide-react v1.48.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z=t=>t?.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase();/**
 * @license lucide-react v1.48.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function J(t,e,o=[]){if(e==null)throw new Error("[lucide]: iconNode is required when icon name is used");return{name:Z(t),size:24,node:e,...o.length>0?{aliases:o}:{}}}/**
 * @license lucide-react v1.48.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=t=>{let e="",o=!1;for(const n of t){if(n==="-"||n==="_"||n<=" "){o=e.length>0;continue}e.length===0?e+=n.toLowerCase():e+=o?n.toUpperCase():n,o=!1}return e};/**
 * @license lucide-react v1.48.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee=t=>{const e=Q(t);return e.charAt(0).toUpperCase()+e.slice(1)};/**
 * @license lucide-react v1.48.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=(...t)=>t.filter((e,o,n)=>!!e&&e.trim()!==""&&n.indexOf(e)===o).join(" ").trim();/**
 * @license lucide-react v1.48.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor","stroke-width":2,"stroke-linecap":"round","stroke-linejoin":"round"};/**
 * @license lucide-react v1.48.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function W(t){return t!=null}function te(t,e={}){const o=e.attributeNames??{},n=s=>o[s]??s,l=t.size??t.width??z.width,c=t.size??t.height??z.height,u=t.aliases?.filter(s=>typeof s=="string"&&s.trim()!=="").map(s=>`lucide-${s}`)??[],i=[...t.name?[`lucide-${t.name}`]:[],...u],m=e.className?.split(" ").filter(Boolean)??[],b=e.includeDefaultClasses===!1?I(...m):I("lucide",...i,...m),f=e.absoluteStrokeWidth?Number(e.strokeWidth??z["stroke-width"])*Number(t.size??t.width??z.width)/Number(e.size??e.width??z.width):e.strokeWidth??z["stroke-width"];return["svg",{...Object.entries(z).reduce((s,[a,g])=>(s[n(a)]=g,s),{}),..."color"in e&&e.color&&{[n("stroke")]:e.color},..."size"in e&&W(e.size)&&{[n("width")]:e.size,[n("height")]:e.size},..."width"in e&&W(e.width)&&{[n("width")]:e.width},..."height"in e&&W(e.height)&&{[n("height")]:e.height},[n("stroke-width")]:f,...b&&{[n("class")]:b},[n("viewBox")]:`0 0 ${l} ${c}`,...e.hasA11yProp===!1?{[n("aria-hidden")]:"true"}:{},..."attributes"in e&&e.attributes},t.node.map(s=>{const[a,g,h]=s,d=e.nonScalingStroke?{[n("vector-effect")]:"non-scaling-stroke",...g}:g;return h?[a,d,h]:[a,d]})]}/**
 * @license lucide-react v1.48.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function ne(t,e={}){return te(t,{...e,attributeNames:{...e.attributeNames,class:"className","stroke-width":"strokeWidth","stroke-linecap":"strokeLinecap","stroke-linejoin":"strokeLinejoin","vector-effect":"vectorEffect"}})}/**
 * @license lucide-react v1.48.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const oe=t=>{for(const e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0;return!1},se=r.createContext({}),re=()=>r.useContext(se),ie=r.forwardRef(({color:t,size:e,width:o,height:n,strokeWidth:l,absoluteStrokeWidth:c,nonScalingStroke:u,className:i="",children:m,iconNode:b=[],icon:f={node:b,aliases:[],size:24},...k},s)=>{const{size:a=24,strokeWidth:g=2,absoluteStrokeWidth:h=!1,nonScalingStroke:d=!1,color:R="currentColor",className:N=""}=re()??{},y=!!m||oe(k),[x,v,C=[]]=ne(f,{color:t??R,width:o??e??a,height:n??e??a,strokeWidth:l??g,absoluteStrokeWidth:c??h,nonScalingStroke:u??d,className:I(N,i),hasA11yProp:y,attributes:k});return r.createElement(x,{ref:s,...v},[...C.map(([S,w])=>r.createElement(S,w)),...Array.isArray(m)?m:[m]])});/**
 * @license lucide-react v1.48.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */function de(t,e=[],o=[]){const n=typeof t=="string"?J(t,e,o):t,l=r.forwardRef(({className:c,...u},i)=>r.createElement(ie,{ref:i,icon:n,className:c,...u}));return n.name&&(l.displayName=ee(n.name)),l}export{fe as A,de as c};
