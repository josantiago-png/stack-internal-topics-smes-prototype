import"./BxG5rCjX.js";import{p as Ne,m as Oe,A as r,f as U,a as Le,y as A,aM as Qe,c as o,r as n,aD as We,s as m,v as a,t as N,z as x,aN as oe}from"./BHXETinu.js";import{d as Be,e as Ve,s as $,a as E}from"./4fH_H_Dc.js";import{c as Fe,a as I,f as M}from"./Doo-DDvF.js";import{i as O}from"./fkVOlGLF.js";import{h as ce}from"./CA5CCcbp.js";import{r as Ke}from"./DPmdL7k-.js";import{b as de,a as Ue}from"./zpnwiIZT.js";import{p as C}from"./VBO5zCrZ.js";import{g as ve}from"./B6nRM1no.js";const $e="Giamir Buoncristiani",je="Hey Giamir — I couldn't find an answer. Can you help?",ze="Why Giamir?",Ye="Why is this answer low trust?",p=[{value:"giamir",label:"Giamir Buoncristiani",handle:"@giamir",description:"Staff Developer",kind:"sme",avatar:"/community-embed/Home%20-%20Stack%20Overflow%20Demo%20Site_files/user.svg"},{value:"sander",label:"Sander van Vliet",handle:"@sander",description:"Data platform SME",kind:"sme",avatar:"/community-embed/Home%20-%20Stack%20Overflow%20Demo%20Site_files/user.svg"},{value:"priya",label:"Priya Shah",handle:"@priya",description:"Cloud infrastructure SME",kind:"sme",avatar:"/community-embed/Home%20-%20Stack%20Overflow%20Demo%20Site_files/user.svg"},{value:"cloud-infra",label:"#cloud-infra",handle:"#cloud-infra",description:"Public channel for infrastructure questions",kind:"channel"},{value:"eng-platform",label:"#eng-platform",handle:"#eng-platform",description:"Public channel for platform engineering questions",kind:"channel"}],Ze=[{title:"Yak migrations spike",author:"Giamir Buoncristiani",icon:"/icon-google-docs.svg"}];function u(e){return e.trim().toLowerCase().replace(/[^\w@\s]/g,"").replace(/\s+/g," ")}function me(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function c(e){return me(e.trim())}function ue(e){return ve.parse(me(e.trim()),{breaks:!1})}function Je(e=Ze){return e.length?`<div class="ask-giamir-slack-preview__sources" aria-label="Sources">${e.map(i=>{const v=[i.author,i.date].filter(Boolean).join(" · ");return`<div class="ask-giamir-slack-preview__source-card" role="group" aria-label="${c(i.title)} source">
    <img class="ask-giamir-slack-preview__source-icon" src="${c(i.icon??"/icon-google-docs.svg")}" alt="" aria-hidden="true" />
    <span class="ask-giamir-slack-preview__source-copy">
      <span class="ask-giamir-slack-preview__source-title">${c(i.title)}</span>
      <span class="ask-giamir-slack-preview__source-author">${c(v)}</span>
    </span>
  </div>`}).join("")}</div>`:""}function j(e=p[0]){return e.kind==="channel"?"team":e.label.split(" ")[0]||e.label}function pa(e=p[0]){return e.kind==="channel"?"Hi team — I couldn't find an answer. Can someone help?":`Hey ${j(e)} — I couldn't find an answer. Can you help?`}function ga(e){const s=u(e);return s==="ask giamir"||s==="ask @giamir"}function wa(e){const s=u(e);return s==="1"||["send","send message","send it","yes"].includes(s)}function fa(e){const s=u(e);return s==="2"||["edit","edit message","modify","change","change message"].includes(s)}function ka(e){const s=u(e);return s==="4"||["who else can i ask","whoe else can i ask","who else","other smes","other sme","other channels","alternatives","show alternatives"].includes(s)}function ba(e){const s=u(e);return[u(ze),"why ask giamir","why giamir buoncristiani","why this sme","why this reviewer"].includes(s)}function ya(e){const s=u(e);return[u(Ye),"why low trust","why is this low trust","why is the answer low trust","why should i ask someone"].includes(s)}function Sa(e){const i=u(e).replace(/^@/,"");return p.find(v=>{const g=u(v.label),T=u(v.handle).replace(/^@/,""),L=u(v.value);return[g,T,L].includes(i)})}function Aa(){const e=p.filter(i=>i.kind==="sme").map(i=>`<li>
      <button class="ask-giamir-alternatives__option" type="button" data-ask-giamir-destination="${c(i.value)}">
        <span class="ask-giamir-alternatives__option-main">
          <strong>${c(i.label)}</strong>
          <span>${c(i.handle)} · ${c(i.description)}</span>
        </span>
      </button>
    </li>`).join(""),s=p.filter(i=>i.kind==="channel").map(i=>`<li>
      <button class="ask-giamir-alternatives__option" type="button" data-ask-giamir-destination="${c(i.value)}">
        <span class="ask-giamir-alternatives__option-main">
          <strong>${c(i.label)}</strong>
          <span>${c(i.description)}</span>
        </span>
      </button>
    </li>`).join("");return`<div class="ask-giamir-alternatives" aria-label="People and channels to ask">
    <p class="ask-giamir-alternatives__intro">You can send this to an SME or a public Slack channel.</p>
    <p class="ask-giamir-alternatives__prompt">Who should I ask?</p>
    <h3 class="ask-giamir-alternatives__heading">SMEs</h3>
    <div class="ask-giamir-alternatives__section">
      <ul>${e}</ul>
    </div>
    <h3 class="ask-giamir-alternatives__heading">Public channels</h3>
    <div class="ask-giamir-alternatives__section">
      <ul>${s}</ul>
    </div>
  </div>`}function Xe({shareFullHistory:e,destination:s=p[0]}){const i=e??!0,v=i?"On":"Off",g=s.kind==="channel"?"the channel has":`${j(s)} has`;return`<div class="ask-giamir-preview__history">
    <span class="ask-giamir-preview__history-copy">
      <span class="ask-giamir-preview__history-title">Share full chat history</span>
      <span class="ask-giamir-preview__history-desc">${i?`Full chat history will be shared so ${g} the context to review.`:"Only this question and AI suggested answer will be shared."}</span>
    </span>
    <span class="ask-giamir-preview__toggle" data-state="${i?"on":"off"}">
      <input class="s-toggle-switch ask-giamir-preview__toggle-switch" type="checkbox" ${i?"checked":""} tabindex="-1" aria-hidden="true">
      <span class="ask-giamir-preview__toggle-state">${v}</span>
    </span>
  </div>`}function xa({intro:e,question:s,answer:i,destination:v=p[0]}){const g=v.kind==="channel"?"the channel":j(v);return`<div class="ask-giamir-edit-form" aria-label="Edit message for reviewer">
  <div class="ask-giamir-preview__message">
    <div class="ask-giamir-preview__message-header">
      <h3>Intro message to ${c(g)}</h3>
    </div>
    <textarea class="ask-giamir-edit-form__textarea" data-ask-giamir-field="intro" rows="4">${c(e)}</textarea>
  </div>
  <div class="ask-giamir-preview__field">
    <div class="ask-giamir-preview__field-header">
      <h3>Question</h3>
    </div>
    <textarea class="ask-giamir-edit-form__textarea" data-ask-giamir-field="question" rows="5">${c(s)}</textarea>
  </div>
  <div class="ask-giamir-preview__field ask-giamir-preview__field--answer">
    <h3>AI suggested answer</h3>
    <div class="ask-giamir-preview__answer">${ue(i)}</div>
  </div>
  <div class="ask-giamir-edit-form__actions">
    <button class="s-btn s-btn__secondary-outline ask-giamir-edit-form__cancel" type="button" data-ask-giamir-action="cancel-edits">Cancel</button>
    <button class="s-btn s-btn__primary ask-giamir-edit-form__save" type="button" data-ask-giamir-action="save-edits">Save and preview</button>
  </div>
</div>`}function he({intro:e,question:s,answer:i,sources:v}){return`<div class="ask-giamir-slack-preview" aria-label="Slack message preview">
  <div class="ask-giamir-slack-preview__icon" aria-hidden="true">
    <img src="/avatars/app-icon-stack.svg" alt="" />
  </div>
  <div class="ask-giamir-slack-preview__body">
    <div class="ask-giamir-slack-preview__meta">
      <strong>Stack Internal</strong>
      <span class="ask-giamir-slack-preview__app">APP</span>
      <span>10:15 AM</span>
    </div>
    <p class="ask-giamir-slack-preview__intro">${c(e)}</p>
    <div class="ask-giamir-slack-preview__payload">
      <p class="ask-giamir-slack-preview__question">${c(s)}</p>
      <div class="ask-giamir-slack-preview__answer">${ue(i)}</div>
      ${Je(v)}
    </div>
  </div>
</div>`}function Ia(e){return`<div class="ask-giamir-preview">
  <p class="ask-giamir-preview__lead">Before sending, here is a preview of the message.</p>
  <p class="ask-giamir-preview__slack-label">Slack preview</p>
  ${he(e)}
  ${Xe(e)}
</div>`}function Ca(){return"Please choose `1` to send the message or `2` to edit the message."}function Ea(e=$e){return`Sent to ${e} through the Stack Internal app in Slack. You'll be notified when they reply.`}function Ma(){return"Giamir is suggested because his role is closely related to this topic, and he is the author of a couple of documents found across the company, including the document cited for this answer."}function Ta(){return"This answer is low trust because the document shown is potentially outdated, and the information could not be corroborated with any other source."}var ea=M('<div class="review-modal__preview svelte-18mnhe5"></div>'),aa=M('<div class="review-modal__message svelte-18mnhe5"><label class="review-modal__label svelte-18mnhe5" for="review-message"> </label> <textarea id="review-message" class="s-textarea review-modal__textarea svelte-18mnhe5" rows="4" placeholder="Add context for the reviewer..."></textarea></div> <div class="review-modal__payload svelte-18mnhe5" aria-label="Question being shared"><div class="review-modal__field svelte-18mnhe5"><label class="review-modal__label svelte-18mnhe5" for="review-question">Question</label> <textarea id="review-question" class="s-textarea review-modal__textarea review-modal__textarea--question svelte-18mnhe5" rows="4"></textarea></div> <div class="review-modal__field svelte-18mnhe5"><label class="review-modal__label svelte-18mnhe5" for="review-answer">AI suggested answer</label> <div id="review-answer" class="review-modal__readonly-answer svelte-18mnhe5" aria-label="AI suggested answer"></div></div></div>',1),sa=M('<label class="review-modal__toggle svelte-18mnhe5" for="share-chat-history"><span class="review-modal__toggle-copy svelte-18mnhe5"><span class="review-modal__toggle-title svelte-18mnhe5">Share full chat history</span> <span class="review-modal__toggle-desc svelte-18mnhe5">Allow the reviewer to open the full conversation for context.</span></span> <span class="review-modal__toggle-control svelte-18mnhe5"><input id="share-chat-history" class="s-toggle-switch" type="checkbox"/></span></label>'),ia=M('<button class="s-btn s-btn__secondary-outline svelte-18mnhe5" type="button">Edit</button> <button class="s-btn s-btn__primary" type="button"> </button>',1),ta=M('<button class="s-btn s-btn__primary" type="button">Save and preview</button>'),ra=M('<div class="review-modal-backdrop svelte-18mnhe5" role="presentation"><div class="review-modal svelte-18mnhe5" role="dialog" aria-modal="true" aria-labelledby="review-modal-title"><header class="review-modal__header svelte-18mnhe5"><div class="review-modal__heading svelte-18mnhe5"><h2 id="review-modal-title" class="review-modal__title svelte-18mnhe5"> </h2> <p class="review-modal__subtitle svelte-18mnhe5">This message will be sent through the Stack Internal app in Slack.</p></div> <button class="review-modal__close svelte-18mnhe5" type="button" aria-label="Close"><svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M5.22 5.22a.75.75 0 0 1 1.06 0L10 8.94l3.72-3.72a.75.75 0 1 1 1.06 1.06L11.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06L10 11.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06L8.94 10 5.22 6.28a.75.75 0 0 1 0-1.06Z"></path></svg></button></header> <div class="review-modal__body svelte-18mnhe5"><!> <!></div> <footer class="review-modal__footer svelte-18mnhe5"><button class="s-btn s-btn__secondary-outline review-modal__cancel svelte-18mnhe5" type="button">Cancel</button> <div class="review-modal__footer-actions svelte-18mnhe5"><!></div></footer></div></div>');function Ra(e,s){Ne(s,!0);let i=C(s,"visible",3,!1),v=C(s,"reviewerName",3,"Giamir Buoncristiani"),g=C(s,"defaultMessage",3,je),T=C(s,"question",3,""),L=C(s,"answer",3,""),z=C(s,"destinations",3,p),_e=C(s,"selectedDestinationValue",19,()=>p[0].value),b=A(""),w=A(""),y=A(""),f=A(""),R=A(""),q=A(!0),k=A("preview"),Y=x(()=>z().find(d=>d.value===_e())??z()[0]),G=x(()=>a(Y)?.label??v()),Z=x(()=>a(Y)?.kind==="channel"||a(G).startsWith("#")),Q=x(()=>a(Z)?a(G):a(G).split(" ")[0]||a(G)),pe=x(()=>a(Z)?"the channel":a(Q)),ge=x(()=>ve.parse(Se(a(R).trim()),{breaks:!1})),we=x(()=>he({intro:a(b),question:a(y),answer:a(R),shareFullHistory:a(q),sources:s.sources}));Oe(()=>{i()&&(r(b,g(),!0),r(w,g(),!0),r(y,T()),r(f,T()),r(R,L()),r(q,!0),r(k,"preview"))});function fe(){const d=a(b).trim(),S=a(y).trim(),P=a(R).trim();!d||!S||!P||s.onSend?.({message:d,question:S,answer:P,shareFullHistory:a(q)})}function ke(){!a(w).trim()||!a(f).trim()||(r(b,a(w).trim(),!0),r(y,a(f).trim(),!0),r(k,"preview"))}function be(){r(w,a(b),!0),r(f,a(y),!0),r(k,"edit")}function ye(){if(a(k)==="edit"){r(w,a(b),!0),r(f,a(y),!0),r(k,"preview");return}s.onCancel?.()}function Se(d){return d.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function Ae(d){d.target===d.currentTarget&&s.onCancel?.()}function xe(d){i()&&d.key==="Escape"&&s.onCancel?.()}var J=Fe();Ve("keydown",Qe,xe);var Ie=U(J);{var Ce=d=>{var S=ra(),P=o(S),W=o(P),B=o(W),X=o(B),Ee=o(X);n(X),We(2),n(B);var Me=m(B,2);n(W);var V=m(W,2),ee=o(V);{var Te=t=>{var l=ea();ce(l,()=>a(we),!0),n(l),I(t,l)},Re=t=>{var l=aa(),h=U(l),_=o(h),D=o(_);n(_);var H=m(_,2);oe(H),n(h);var te=m(h,2),F=o(te),re=m(o(F),2);oe(re),n(F);var ne=m(F,2),le=m(o(ne),2);ce(le,()=>a(ge),!0),n(le),n(ne),n(te),N(()=>$(D,`Intro message to ${a(pe)??""}`)),de(H,()=>a(w),K=>r(w,K)),de(re,()=>a(f),K=>r(f,K)),I(t,l)};O(ee,t=>{a(k)==="preview"?t(Te):t(Re,-1)})}var qe=m(ee,2);{var Pe=t=>{var l=sa(),h=m(o(l),2),_=o(h);Ke(_),n(h),n(l),Ue(_,()=>a(q),D=>r(q,D)),I(t,l)};O(qe,t=>{a(k)==="preview"&&t(Pe)})}n(V);var ae=m(V,2),se=o(ae),ie=m(se,2),De=o(ie);{var Ge=t=>{var l=ia(),h=U(l),_=m(h,2),D=o(_);n(_),N(H=>{_.disabled=H,$(D,`Send to ${a(Q)??""}`)},[()=>!a(b).trim()||!a(y).trim()||!a(R).trim()]),E("click",h,be),E("click",_,fe),I(t,l)},He=t=>{var l=ta();N(h=>l.disabled=h,[()=>!a(w).trim()||!a(f).trim()]),E("click",l,ke),I(t,l)};O(De,t=>{a(k)==="preview"?t(Ge):t(He,-1)})}n(ie),n(ae),n(P),n(S),N(()=>$(Ee,`Preview Slack message to ${a(Q)??""}`)),E("click",S,Ae),E("click",Me,function(...t){s.onCancel?.apply(this,t)}),E("click",se,ye),I(d,S)};O(Ie,d=>{i()&&d(Ce)})}I(e,J),Le()}Be(["click"]);export{p as A,Ra as a,ya as b,ka as c,ga as d,Ia as e,Aa as f,pa as g,wa as h,ba as i,Ea as j,fa as k,xa as l,Sa as m,Ma as n,Ta as o,Ca as p,ze as q,Ye as r};
