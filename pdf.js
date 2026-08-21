/* ============================================================
   pdf.js — 인쇄/PDF 출력 전용 모듈  (index.html 에서 분리)
   ------------------------------------------------------------
   · 모두 window.open() + 문자열 템플릿 방식의 독립 함수입니다.
   · index.html 의 전역(api, esc, fmt, opN, mName, toast, today,
     USER, NCRS, ECNS, GAUGES, TROWS, DOCROWS ...)을 참조하므로
     반드시 index 의 인라인 <script> 뒤에서 로드해야 합니다.
   ============================================================ */
function exportDocPDF(){
  if(!DOCROWS.length)return toast('출력할 항목이 없습니다');
  const done=DOCROWS.filter(r=>r.done).length;
  let last='';
  const body=DOCROWS.map(r=>{
    const first=(last!==r.op);last=r.op;
    return `<tr class="${r.done?'':'nd'}">
      <td class="c">${first?opN(r.op)+' '+esc(r.pname):''}</td>
      <td class="c">${first?r.dept:''}</td>
      <td>${esc(r.name)}</td>
      <td class="c">${r.done?'○':'×'}</td>
      <td class="c">${r.date||''}</td>
      <td class="c">${esc(r.worker)}</td>
      <td class="c">${r.photo?`<img src="${r.photo}">`:''}</td>
    </tr>`;}).join('');
  const html=`<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>출력물 점검표</title><style>
    @page{size:A4;margin:13mm}
    body{font-family:'Malgun Gothic','Noto Sans KR',sans-serif;color:#232a35;font-size:10.5px}
    h1{font-size:19px;text-align:center;margin:0 0 4px;letter-spacing:3px}
    .sub{text-align:center;font-size:11px;color:#666;margin-bottom:6px}
    .sign{display:flex;justify-content:flex-end;gap:0;margin-bottom:8px}
    .sign div{border:1px solid #999;width:70px;text-align:center;font-size:9.5px}
    .sign div .t{background:#f2f2f2;padding:2px;border-bottom:1px solid #999}
    .sign div .b{height:34px}
    table{width:100%;border-collapse:collapse}
    th{background:#16233c;color:#fff;border:1px solid #16233c;padding:5px 4px;font-size:10px}
    td{border:1px solid #bbb;padding:4px 6px;vertical-align:middle}
    td.c{text-align:center}
    tr.nd td{background:#fdf2f2}
    td img{width:44px;height:34px;object-fit:cover;border:1px solid #ccc}
    .ft{margin-top:10px;display:flex;justify-content:space-between;font-size:10px;color:#777}
  </style></head><body>
  <h1>출 력 물 점 검 표</h1>
  <div class="sub">${esc(docTitle())}</div>
  <div class="sign">
    <div><div class="t">작성</div><div class="b"></div></div>
    <div><div class="t">검토</div><div class="b"></div></div>
    <div><div class="t">승인</div><div class="b"></div></div>
  </div>
  <table>
    <thead><tr><th style="width:110px">공정</th><th style="width:42px">부서</th><th>결과물</th><th style="width:34px">작성</th><th style="width:62px">작성일</th><th style="width:56px">작성자</th><th style="width:52px">증빙</th></tr></thead>
    <tbody>${body}</tbody>
  </table>
  <div class="ft"><span>작성 ${done} / 전체 ${DOCROWS.length} 항목 (${Math.round(done/DOCROWS.length*100)}%)</span>
  <span>출력: ${new Date().toLocaleString('ko-KR')} · ${USER||''}</span></div>
  <script>window.onload=()=>setTimeout(()=>window.print(),400)<\/script>
  </body></html>`;
  const w=window.open('','_blank');
  if(!w)return toast('팝업이 차단되었습니다. 허용 후 다시 시도하세요');
  w.document.write(html);w.document.close();
}

function exportTracePDF(){
  if(!TRPJ)return;
  const rows=trList().map(e=>`<tr><td class="mono">${fmt(e.t)}</td><td>${esc(e.k)}</td>
    <td>${e.op?opN(e.op)+' '+esc(mName(e.op)):'-'}</td><td>${esc(e.d)}</td><td>${esc(e.w||'-')}</td></tr>`).join('');
  const html=`<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>금형 전체이력</title><style>
  @page{size:A4;margin:14mm}
  body{font-family:'Malgun Gothic',sans-serif;color:#111;font-size:11px}
  h1{font-size:17px;margin:0 0 4px}.sub{color:#555;font-size:11px;margin-bottom:10px}
  table{width:100%;border-collapse:collapse}
  th,td{border:1px solid #999;padding:4px 6px;text-align:left;vertical-align:top}
  th{background:#eee;font-size:10.5px}
  .mono{font-family:Consolas,monospace;white-space:nowrap}
  .sg{margin-top:14px;display:flex;gap:8px}
  .sg div{flex:1;border:1px solid #999;height:52px;font-size:10px;padding:3px 5px}
  </style></head><body>
  <h1>금형 제작 전체이력 (추적성 기록)</h1>
  <div class="sub">금형번호 ${esc(TRPJ.mold_no)} · 금형명 ${esc(TRPJ.mold_name)} ${TRPJ.customer?'· 고객사 '+esc(TRPJ.customer):''}
   · 출력일 ${new Date().toISOString().slice(0,10)} · 총 ${trList().length}건</div>
  <table><thead><tr><th style="width:80px">일시</th><th style="width:52px">구분</th><th style="width:90px">공정</th><th>내용</th><th style="width:60px">담당</th></tr></thead>
  <tbody>${rows}</tbody></table>
  <div class="sg"><div>작성</div><div>검토</div><div>승인</div></div>
  </body></html>`;
  const w=window.open('');w.document.write(html);w.document.close();setTimeout(()=>w.print(),400);
}

async function apprPDF(id){
  const a=APPRS.find(x=>x.id===id);if(!a)return;
  const signs=[];
  // 작성 + 코스 단계 → qaPdf 결재란 (작성/검토/확인/승인 순 배치)
  ['작성','검토','확인','승인'].forEach(role=>{
    const st=a.steps.find(x=>x.role===role);
    signs.push(st?{role,name:st.name,img:st.sig||null,date:st.signed_at?String(st.signed_at).slice(0,10):''}:{role,name:''});
  });
  let body='';
  try{
    if(a.doc_type==='ncr'){
      const [r]=await api("/mm_ncr?select=*&id=eq."+a.ref_id);
      if(r)body=ncrPdfBody(r);
    }else if(a.doc_type==='ecn'){
      const [r]=await api("/mm_ecn?select=*&id=eq."+a.ref_id);
      if(r)body=ecnPdfBody(r);
    }else if(a.doc_type==='insp'&&a.snapshot){
      if(Array.isArray(a.snapshot)&&a.snapshot.length){
        const rows=await api("/mm_inspect?select=*&id=in.("+a.snapshot.join(',')+")&order=created_at");
        body=inspTableHtml(rows);
      }else if(a.snapshot&&Array.isArray(a.snapshot.rows)){
        body=inspTableHtml(a.snapshot.rows);
      }
    }else{
      body='<div class="sect">'+esc(a.title)+'</div><div class="qbx">본 문서는 결재용 표지입니다. 상세 내역은 해당 화면의 PDF를 참조하세요.</div>';
    }
  }catch(e){}
  body+=`<div class="sect">결재 이력</div>
  <table class="dt"><thead><tr><th style="width:52px">단계</th><th style="width:70px">결재자</th><th style="width:60px">상태</th><th style="width:120px">일시</th><th>의견 / 무결성 해시</th></tr></thead>
  <tbody>${a.steps.map(x=>`<tr><td>${esc(x.role)}</td><td>${esc(x.name)}</td>
    <td class="${x.status==='반려'?'ng':x.status==='승인'?'ok':''}">${esc(x.status)}</td>
    <td class="mono" style="font-size:9.5px">${x.signed_at?fmt(x.signed_at):'-'}</td>
    <td style="font-size:9px">${x.memo?esc(x.memo)+'<br>':''}${x.hash?'<span class="mono" style="color:#666">'+x.hash.slice(0,24)+'...</span>':''}</td></tr>`).join('')}</tbody></table>`;
  FOOTKIND=a.doc_type||'etc';
  qaPdf(a.doc_type.toUpperCase()+'-'+String(a.ref_id||a.id).padStart(4,'0'),
    a.status==='완료'?'전자결재 문서 (승인 완료)':'전자결재 문서 ['+a.status+']',
    a.title,'전자결재 · SHA-256 무결성 해시 적용',body,signs);
}

async function exportNcrOnePDF(id){
  const r=NCRS.find(x=>x.id===id)||(await api("/mm_ncr?select=*&id=eq."+id))[0];
  if(!r)return;
  const appr=await findAppr('ncr',id,null);
  const body=ncrPdfBody(r)+apprHistHtml(appr);
  FOOTKIND='ncr';
  qaPdf('NCR-'+String(id).padStart(4,'0'),'부적합 · 시정조치 보고서 (NCR)',qaMold(r.project_id),
    (r.occur_date||'')+' · '+(r.kind||''),body,apprSigns(appr));
}

async function exportEcnOnePDF(id){
  const r=ECNS.find(x=>x.id===id)||(await api("/mm_ecn?select=*&id=eq."+id))[0];
  if(!r)return;
  const appr=await findAppr('ecn',id,null);
  const body=ecnPdfBody(r)+apprHistHtml(appr);
  FOOTKIND='ecn';
  qaPdf('ECN-'+String(id).padStart(4,'0'),'설계 · 4M 변경 통지서 (ECN)',qaMold(r.project_id),
    (r.change_date||'')+' · '+(r.kind||''),body,apprSigns(appr));
}

function ncrPdfBody(r){
  return `<table class="meta">
    <tr><th>금형</th><td>${esc(qaMold(r.project_id))}</td><th>공정</th><td>${r.op_code?opN(r.op_code)+' '+esc(mName(r.op_code)):'-'}</td></tr>
    <tr><th>발생일</th><td>${r.occur_date||'-'}</td><th>구분</th><td>${esc(r.kind||'-')}</td></tr>
    <tr><th>조치자</th><td>${esc(r.worker||'-')}</td><th>확인자</th><td>${esc(r.checker||'-')}</td></tr></table>
  <div class="sect" style="font-size:10.5px">부적합 내용</div><div class="qbx">${esc(r.description)}</div>
  <div class="sect" style="font-size:10.5px">원인 분석</div><div class="qbx">${esc(r.cause||'')}</div>
  <div class="sect" style="font-size:10.5px">시정 조치</div><div class="qbx">${esc(r.action||'')}</div>
  <div class="sect" style="font-size:10.5px">재발 방지 대책</div><div class="qbx">${esc(r.prevention||'')}</div>`;
}

function ecnPdfBody(r){
  return `<table class="meta">
    <tr><th>금형</th><td>${esc(qaMold(r.project_id))}</td><th>변경일</th><td>${r.change_date||'-'}</td></tr>
    <tr><th>구분(4M)</th><td>${esc(r.kind||'-')}</td><th>요청/승인</th><td>${esc(r.worker||'-')} / ${esc(r.approver||'-')}</td></tr></table>
  <div class="sect" style="font-size:10.5px">변경 전</div><div class="qbx">${esc(r.before_val||'')}</div>
  <div class="sect" style="font-size:10.5px">변경 후</div><div class="qbx">${esc(r.after_val)}</div>
  <div class="sect" style="font-size:10.5px">변경 사유</div><div class="qbx">${esc(r.reason||'')}</div>`;
}

function qaPdf(docNo,title,moldLabel,filterLabel,bodyHtml,signs){
  const sg=signs||[{role:'작성',name:USER||''},{role:'검토',name:''},{role:'확인',name:''},{role:'승인',name:''}];
  const html=`<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>${esc(title)}</title><style>
  @page{size:A4;margin:12mm}
  body{font-family:'Malgun Gothic','맑은 고딕',sans-serif;color:#111;font-size:11px;line-height:1.5;margin:0}
  .hd{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px}
  .hd .tt h1{font-size:19px;margin:0 0 4px;letter-spacing:2px}
  .hd .tt .sub{font-size:10.5px;color:#555}
  .apv{border-collapse:collapse}
  .apv th,.apv td{border:1px solid #333;text-align:center}
  .apv th{background:#efefef;font-size:10px;padding:3px 0;width:64px}
  .apv td.sig{height:52px;vertical-align:middle}
  .apv td.sig img{max-height:44px;max-width:58px}
  .apv td.nm{font-size:9.5px;padding:2px 0;height:14px}
  table.dt{width:100%;border-collapse:collapse;margin-top:6px}
  .dt th,.dt td{border:1px solid #888;padding:4px 6px;text-align:left;vertical-align:top}
  .dt th{background:#eee;font-size:10px;white-space:nowrap}
  .mono{font-family:Consolas,monospace}
  .ng{color:#c00;font-weight:700}.ok{color:#0a58c9;font-weight:700}
  .sect{font-size:12px;font-weight:700;margin:12px 0 4px;border-left:4px solid #333;padding-left:6px}
  .meta{width:100%;border-collapse:collapse;margin-top:4px}
  .meta th,.meta td{border:1px solid #888;padding:4px 6px;font-size:10.5px}
  .meta th{background:#eee;width:82px;white-space:nowrap}
  .ft{margin-top:14px;font-size:9.5px;color:#444;display:flex;justify-content:space-between;border-top:1px solid #999;padding-top:4px}
  .ft span:nth-child(2){flex:1;text-align:center}
  .ft span:nth-child(3){text-align:right}
  .qbx{border:1px solid #888;padding:6px 8px;min-height:34px;margin-top:2px}
  </style></head><body>
  <div class="hd">
    <div class="tt">
      <h1>${esc(title)}</h1>
      <div class="sub">${esc(moldLabel)}<br>조회조건: ${esc(filterLabel)} · 출력일 ${today()}</div>
    </div>
    <table class="apv">
      <tr>${sg.map(x=>`<th>${esc(x.role)}</th>`).join('')}</tr>
      <tr>${sg.map(x=>`<td class="sig">${x.img?`<img src="${x.img}">`:''}</td>`).join('')}</tr>
      <tr>${sg.map(x=>`<td class="nm">${esc(x.name||'')}${x.date?'<br>'+esc(x.date):''}</td>`).join('')}</tr>
    </table>
  </div>
  ${bodyHtml}
  <div class="ft"><span>${esc(footOf(FOOTKIND).l)}</span><span>${esc(footOf(FOOTKIND).c)}</span><span>${esc(footOf(FOOTKIND).r)}</span></div>
  </body></html>`;
  const w=window.open('','_blank');
  if(!w)return toast('팝업이 차단되었습니다. 허용 후 재시도하세요');
  w.document.write(html);w.document.close();
  setTimeout(()=>{try{w.focus();w.print()}catch(e){}},400);
}

function exportNcrPDF(){
  if(!NCRS.length)return toast('출력할 기록이 없습니다');
  const pid=document.getElementById('ncrsel').value;
  const fl=qaFilterLabel(g('nf-from'),g('nf-to'),[['상태',document.getElementById('nf-status').value],['구분',document.getElementById('nf-kind').value]]);
  const body=NCRS.map((r,i)=>`
    ${i>0?'<div style="page-break-before:always"></div>':''}
    <div class="sect">NCR-${String(r.id).padStart(4,'0')} <span style="font-weight:400;color:${r.status==='완료'?'#0a7a3d':'#c00'}">[${esc(r.status)}]</span></div>
    <table class="meta">
      <tr><th>금형</th><td>${esc(qaMold(r.project_id))}</td><th>공정</th><td>${r.op_code?opN(r.op_code)+' '+esc(mName(r.op_code)):'-'}</td></tr>
      <tr><th>발생일</th><td>${r.occur_date||'-'}</td><th>구분</th><td>${esc(r.kind||'-')}</td></tr>
      <tr><th>조치자</th><td>${esc(r.worker||'-')}</td><th>확인자</th><td>${esc(r.checker||'-')}${r.closed_date?' · 완료 '+r.closed_date:''}</td></tr>
    </table>
    <div class="sect" style="font-size:10.5px">부적합 내용</div><div class="qbx">${esc(r.description)}</div>
    <div class="sect" style="font-size:10.5px">원인 분석</div><div class="qbx">${esc(r.cause||'')}</div>
    <div class="sect" style="font-size:10.5px">시정 조치</div><div class="qbx">${esc(r.action||'')}</div>
    <div class="sect" style="font-size:10.5px">재발 방지 대책</div><div class="qbx">${esc(r.prevention||'')}</div>`).join('');
  FOOTKIND='ncr';
  qaPdf('NCR-'+today().replace(/-/g,''),'부적합 · 시정조치 보고서',pid?qaMold(pid):'전체 금형',fl,body);
}

function exportEcnPDF(){
  if(!ECNS.length)return toast('출력할 기록이 없습니다');
  const pid=document.getElementById('ecnsel').value;
  const fl=qaFilterLabel(g('ef-from'),g('ef-to'),[['상태',document.getElementById('ef-status').value],['구분',document.getElementById('ef-kind').value]]);
  const body=`<div class="sect">설계·4M 변경 관리대장 (${ECNS.length}건)</div>
  <table class="dt"><thead><tr><th style="width:66px">ECN번호</th><th style="width:100px">금형</th><th style="width:66px">변경일</th><th style="width:70px">구분</th><th>변경 전 → 후 / 사유</th><th style="width:48px">요청</th><th style="width:48px">승인</th><th style="width:48px">상태</th></tr></thead>
  <tbody>${ECNS.map(r=>`<tr>
    <td class="mono">ECN-${String(r.id).padStart(4,'0')}</td>
    <td>${esc(qaMold(r.project_id))}</td>
    <td class="mono">${r.change_date||'-'}</td>
    <td>${esc((r.kind||'').split(' ')[0])}</td>
    <td>${r.before_val?esc(r.before_val)+' → ':''}<b>${esc(r.after_val)}</b>${r.reason?'<br><span style="font-size:9px;color:#666">사유: '+esc(r.reason)+'</span>':''}</td>
    <td>${esc(r.worker||'-')}</td>
    <td>${esc(r.approver||'-')}</td>
    <td class="${r.status==='승인'?'ok':r.status==='반려'?'ng':''}">${esc(r.status)}</td></tr>`).join('')}</tbody></table>`;
  FOOTKIND='ecn';
  qaPdf('ECN-'+today().replace(/-/g,''),'설계 · 4M 변경 관리대장',pid?qaMold(pid):'전체 금형',fl,body);
}

async function exportGaugePDF(){
  if(!GAUGES.length)return toast('출력할 계측기가 없습니다');
  const act=GAUGES.filter(x=>x.status!=='폐기');
  const body=`<div class="sect">계측기 관리대장 (총 ${GAUGES.length}대 · 사용 ${GAUGES.filter(x=>x.status==='사용').length}대)</div>
  <table class="dt"><thead><tr><th style="width:52px">관리번호</th><th>계측기명 / 모델</th><th style="width:70px">측정범위</th><th style="width:50px">정밀도</th><th style="width:36px">주기</th><th style="width:62px">최근교정</th><th style="width:62px">차기교정</th><th style="width:64px">교정기관</th><th style="width:56px">위치</th><th style="width:36px">상태</th></tr></thead>
  <tbody>${GAUGES.map(x=>{
    const nx=guNext(x),d=guDday(x);const late=d!==null&&d<0;
    return `<tr><td class="mono">${esc(x.mgmt_no)}</td>
    <td><b>${esc(x.name)}</b>${x.model?'<br><span style="font-size:9px;color:#666">'+esc(x.model)+(x.serial_no?' · SN '+esc(x.serial_no):'')+'</span>':''}</td>
    <td class="mono">${esc(x.range_val||'-')}</td><td class="mono">${esc(x.accuracy||'-')}</td>
    <td style="text-align:center">${x.cal_cycle||'-'}</td>
    <td class="mono">${x.last_cal||'-'}</td>
    <td class="mono ${late?'ng':''}">${nx||'-'}${late?' 초과':''}</td>
    <td style="font-size:9px">${esc(x.agency||'-')}${x.cert_no?'<br>'+esc(x.cert_no):''}</td>
    <td style="font-size:9px">${esc(x.location||'-')}</td>
    <td class="${x.status==='폐기'?'ng':x.status==='사용'?'ok':''}" style="text-align:center">${esc(x.status)}</td></tr>`}).join('')}</tbody></table>`;
  FOOTKIND='gauge';
  qaPdf('MG-'+today().replace(/-/g,''),'계측기 관리대장','전체 계측기','교정주기 기준 차기 교정일 자동계산 · 출력일 '+today(),body);
}

function exportTryoutPDF(){
  if(!TROWS.length)return toast('출력할 일지가 없습니다');
  const f=g('t-from'),t=g('t-to');
  const period=(f||t)?`${f||'~'} ~ ${t||'~'}`:'전체 기간';
  const body=TROWS.map(r=>`
    <div class="rp">
      <div class="rh">
        <span class="rd">${r.log_date}</span>
        <b>${esc(r.mm_project?r.mm_project.mold_no+' — '+r.mm_project.mold_name:'')}</b>
        <span class="rt">${esc(r.stage)} / ${esc(r.status)}</span>
        <span class="ra">작성자: ${esc(r.author||'')}</span>
      </div>
      <table>
        <tr><th>작업 내용</th><td>${esc(r.work_done||'-').replace(/\n/g,'<br>')}</td></tr>
        <tr><th>이슈 사항</th><td>${esc(r.issues||'-').replace(/\n/g,'<br>')}</td></tr>
        <tr><th>다음 계획</th><td>${esc(r.next_plan||'-').replace(/\n/g,'<br>')}</td></tr>
      </table>
      ${(r.photos&&r.photos.length)?`<div class="rimgs">${r.photos.map(p=>`<img src="${p}">`).join('')}</div>`:''}
    </div>`).join('');
  const html=`<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><title>T/O보고서</title>
  <style>
    @page{size:A4;margin:14mm}
    body{font-family:'Malgun Gothic','Noto Sans KR',sans-serif;color:#232a35;font-size:11px}
    h1{font-size:19px;text-align:center;margin:0 0 4px;letter-spacing:2px}
    .sub{text-align:center;font-size:11px;color:#777;margin-bottom:14px;border-bottom:2px solid #16233c;padding-bottom:8px}
    .rp{border:1px solid #ccc;border-radius:5px;padding:9px 11px;margin-bottom:9px;page-break-inside:avoid}
    .rh{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:7px;font-size:11.5px}
    .rd{background:#fdf3cd;border:1px solid #e2cd7e;padding:1px 8px;border-radius:4px;font-weight:700}
    .rt{background:#eef2f8;padding:1px 8px;border-radius:4px}
    .ra{margin-left:auto;color:#777}
    table{width:100%;border-collapse:collapse}
    th{width:70px;background:#f4f6fa;border:1px solid #ddd;padding:4px 7px;text-align:left;font-size:10.5px;color:#555;vertical-align:top}
    td{border:1px solid #ddd;padding:4px 8px;line-height:1.55}
    .rimgs{display:flex;gap:6px;margin-top:7px;flex-wrap:wrap}
    .rimgs img{width:150px;height:110px;object-fit:cover;border:1px solid #ddd;border-radius:4px}
    .ft{margin-top:14px;font-size:10px;color:#444;display:flex;justify-content:space-between;border-top:1px solid #999;padding-top:4px}
    .ft span:nth-child(2){flex:1;text-align:center}
    .ft span:nth-child(3){text-align:right}
    @media print{.noprint{display:none}}
  
</style></head><body>
  <h1>T/O보고서 (Tryout 작업일지)</h1>
  <div class="sub">기간: ${period} &nbsp;|&nbsp; 총 ${TROWS.length}건 &nbsp;|&nbsp; 출력: ${new Date().toLocaleString('ko-KR')} (${USER||''})</div>
  ${body}
  <div class="ft"><span>${esc(footOf('tryout').l)}</span><span>${esc(footOf('tryout').c)}</span><span>${esc(footOf('tryout').r)}</span></div>
  <script>window.onload=()=>setTimeout(()=>window.print(),400)<\/script>
  </body></html>`;
  const w=window.open('','_blank');
  if(!w)return toast('팝업이 차단되었습니다. 허용 후 다시 시도하세요');
  w.document.write(html);w.document.close();
}
