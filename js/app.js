const DATA = window.MSK_DATA;
const SOURCE_LOOKUP = new Map((DATA.source_manifest || []).map((source) => [source.path, source]));
const SEARCH_LIMIT = 36;

const STORE='md818_e3_platform_state_v1';
function readState(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')||{};}catch(e){try{localStorage.removeItem(STORE);}catch(_){}return {};}}
let storageAvailable=true;
let state=readState();
state.completed=state.completed||{};state.correct=state.correct||0;state.attempts=state.attempts||0;state.missed=state.missed||[];state.streak=state.streak||0;state.flagged=state.flagged||{};state.positions=state.positions||{};state.moduleIndex=state.moduleIndex||{};state.imageIndex=state.imageIndex||0;state.hotspotIndex=state.hotspotIndex||0;state.caseIndex=state.caseIndex||0;state.discriminatorIndex=state.discriminatorIndex||0;state.managementIndex=state.managementIndex||0;state.repairIndex=state.repairIndex||0;state.confidence=state.confidence||{};state.examMode=state.examMode||false;
let dashboardScroll=0;
function save(){try{localStorage.setItem(STORE,JSON.stringify(state));storageAvailable=true;}catch(e){storageAvailable=false;}renderStats();}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
function rich(s){const text=String(s??'');const hits=[];DATA.glossary.slice().sort((a,b)=>b.term.length-a.term.length).forEach(g=>{const re=new RegExp('\\b'+g.term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b','gi');let m;while((m=re.exec(text))!==null){const start=m.index,end=start+m[0].length;if(!hits.some(h=>start<h.end&&end>h.start))hits.push({start,end,term:g.term});if(m.index===re.lastIndex)re.lastIndex++;}});hits.sort((a,b)=>a.start-b.start);let out='',pos=0;hits.forEach(h=>{out+=esc(text.slice(pos,h.start));out+=`<span class="term-link" onclick='openTerm(${JSON.stringify(h.term)})'>${esc(text.slice(h.start,h.end))}</span>`;pos=h.end;});out+=esc(text.slice(pos));return out;}
function sourceMeta(src){const s=String(src||'Exam 3 source folder');if(s.startsWith('http'))return `<div class="source-list"><b>Source:</b> <a class="image-source-link" href="${esc(s)}" target="_blank" rel="noopener">external image page</a></div>`;return `<div class="source-list"><b>Source:</b> ${esc(s)}</div>`}
function sourceBlock(sources){if(!sources||!sources.length)return'';return `<details class="source-details"><summary>Sources (${sources.length})</summary>${sources.map(sourceMeta).join('')}</details>`}
function moduleControls(id){return `<div class="toolbar"><button onclick="showSection('dashboard')">Back</button><button onclick="showSection('dashboard')">Dashboard</button><button onclick="openGlossaryBrowser()">Glossary</button><button onclick="resetModule('${id}')">Reset module</button><button class="primary" onclick="startChallenge('${id}')">Start challenge</button></div>`}
function applyMode(){document.body.classList.toggle('exam-mode',!!state.examMode);document.querySelectorAll('[data-mode-label]').forEach(el=>el.textContent=state.examMode?'Exam mode':'Study mode');}
function toggleStudyMode(){state.examMode=!state.examMode;save();applyMode();renderDashboard();}
function moduleRail(id){if(id==='dashboard')return'';const items=[['Top','scrollTo(0,0)'],['Dashboard',`showSection('dashboard')`],['Images',`showSection('visuals')`],['Hotspot',`showSection('hotspots')`],['Compare',`showSection('discriminators')`],['Manage',`showSection('management')`],['Repair',`showSection('repair')`],['LO map',`showSection('objectives')`]];return `<aside class="module-rail">${items.map(([label,action])=>`<button class="${label==='Top'?'primary':''}" onclick="${action}">${esc(label)}</button>`).join('')}</aside>`}
function activityHub(id){if(id==='dashboard')return'';const defs={objectives:[['LO mastery','Review weak clusters',`showSection('objectives')`],['Repair misses','Resurface weak items',`showSection('repair')`],['Mixed exam','Interleaved practice',`showSection('mixed')`]],glossary:[['Term sprint','Definition recall',`drawGlossaryGame(1)`],['Repair misses','Term mistakes',`showSection('repair')`],['Mixed exam','Use terms in context',`showSection('mixed')`]],disease:[['Compare-two','Separate similar diagnoses',`showSection('discriminators')`],['Management','Choose next step',`showSection('management')`],['LO map','Find objective context',`showSection('objectives')`]],drugs:[['Mechanism match','Drug property recall',`drawDrugGame(1)`],['Management','Treatment choices',`showSection('management')`],['Mixed exam','Apply in cases',`showSection('mixed')`]],visuals:[['Image quiz','Name the finding',`drawImageQuiz(0)`],['Hotspot','Localize first',`showSection('hotspots')`],['Source coverage','Audit source set',`document.getElementById('sourceCoverage')?.scrollIntoView({behavior:'smooth'})`]],hotspots:[['Current target','Click the feature',`drawHotspot(0)`],['Next target','New image feature',`drawHotspot(1)`],['Image bank','Return to recognition',`showSection('visuals')`]],discriminators:[['Compare-two','Current look-alike',`drawDiscriminator(0)`],['Management','Act on diagnosis',`showSection('management')`],['Repair','Fix misses',`showSection('repair')`]],management:[['Current round','Pick next action',`drawManagement(0)`],['Compare-two','Why this not that',`showSection('discriminators')`],['Repair','Fix misses',`showSection('repair')`]],repair:[['Repair queue','Target misses',`drawRepair(0)`],['Images','Visual misses',`showSection('visuals')`],['Mixed exam','Retest broadly',`showSection('mixed')`]],regional:[['Case simulator','Step through pain cases',`drawCaseSim(0)`],['Hotspot','Localize anatomy',`showSection('hotspots')`],['Management','Choose action',`showSection('management')`]],clinical:[['Current case','Exam-style reasoning',`drawQuestionDeck('clinical',0)`],['Mixed exam','Interleaved block',`showSection('mixed')`],['Repair','Fix misses',`showSection('repair')`]],mixed:[['Boss round','Interleaved case block',`drawQuestionDeck('mixed',0)`],['LO map','Check coverage',`showSection('objectives')`],['Repair','Fix misses',`showSection('repair')`]]};const fallback=[['Rapid recall','Review anchors',`startChallenge('${id}')`],['Compare-two','Find discriminators',`showSection('discriminators')`],['Repair','Fix misses',`showSection('repair')`]];const cards=defs[id]||fallback;return `<div class="activity-hub"><div><span class="tag">Activity hub</span><h3>Choose the work style</h3></div><div class="activity-hub-grid">${cards.map(([title,desc,action])=>`<button class="activity-card" onclick="${action}"><b>${esc(title)}</b><span>${esc(desc)}</span></button>`).join('')}</div></div>`}
function renderStats(){const total=Object.keys(state.completed).length;const acc=state.attempts?Math.round(100*state.correct/state.attempts):0;document.querySelectorAll('.stats').forEach(el=>el.innerHTML=`<div class="stat"><b>${state.correct}</b><br>Correct</div><div class="stat"><b>${state.attempts}</b><br>Attempts</div><div class="stat"><b>${acc}%</b><br>Accuracy</div><div class="stat"><b>${state.streak}</b><br>Precision run</div><div class="stat"><b>${total}</b><br>Completed items</div><div class="stat"><b>${state.missed.length}</b><br>Missed queue</div>`);}
function showSection(id){if(id==='repair'&&typeof renderRepair==='function')renderRepair();if(document.getElementById('dashboard').classList.contains('active'))dashboardScroll=window.scrollY;document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');if(id==='dashboard')setTimeout(()=>scrollTo(0,dashboardScroll),0);else scrollTo(0,0);}
function resetAll(){if(confirm('Reset all local progress for this platform?')){try{localStorage.removeItem(STORE);}catch(e){}location.reload();}}
function resetModule(id){Object.keys(state.completed).filter(k=>k.startsWith(id+':')).forEach(k=>delete state.completed[k]);state.moduleIndex[id]=0;save();renderAll();}
function complete(id,ok){state.attempts++;if(ok){state.correct++;state.streak++;state.completed[id]=true;state.missed=state.missed.filter(m=>m.id!==id);}else{state.streak=0;state.missed=state.missed.filter(m=>m.id!==id);state.missed.unshift({id,date:new Date().toISOString()});state.missed=state.missed.slice(0,80);}save();}
function guarded(btn,val,answer,explain,itemId,feedId,distractors,clue){const box=btn.parentElement; if(box.dataset.locked==='1')return; if(val===answer){btn.classList.add('correct');box.dataset.locked='1';complete(itemId,true);showFeedback(feedId,`<b>Correct.</b> ${rich(explain)}<br><b>Key clue:</b> ${rich(clue||'Source-aligned discriminator.')}${distractorHtml(distractors)}`);}else{btn.classList.add('wrong');box.dataset.wrong=String((+box.dataset.wrong||0)+1);complete(itemId,false);if((+box.dataset.wrong)>=(+box.dataset.total-1)){box.dataset.locked='1';[...box.children].forEach(c=>{if(c.textContent===answer)c.classList.add('correct')});showFeedback(feedId,`<b>Answer:</b> ${esc(answer)}. ${rich(explain)}<br><b>Key clue:</b> ${rich(clue||'Source-aligned discriminator.')}${distractorHtml(distractors)}`);}}}
function distractorHtml(d){if(!d)return'';return '<hr><b>Why the other choices are wrong:</b><ul>'+Object.entries(d).map(([k,v])=>`<li><b>${esc(k)}:</b> ${rich(v)}</li>`).join('')+'</ul>';}
function showFeedback(id,html){const f=document.getElementById(id);f.innerHTML=html;f.classList.add('show');}
function qnav(id,idx,total,drawFn){return `<div class="toolbar"><button onclick="${drawFn}(-1)">Previous question</button><span class="counter">${idx+1}/${total}</span><button onclick="${drawFn}(1)">Next question</button></div>`}
function startChallenge(id){state.moduleIndex[id]=0;if(id==='visuals')state.imageIndex=0;if(id==='hotspots')state.hotspotIndex=0;if(id==='regional')state.caseIndex=0;if(id==='discriminators')state.discriminatorIndex=0;if(id==='management')state.managementIndex=0;if(id==='repair')state.repairIndex=0;save(); if(id==='clinical'||id==='mixed')drawQuestionDeck(id,0); else if(id==='visuals'){renderVisuals();drawImageQuiz(0);showSection(id);} else if(id==='hotspots'){renderHotspots();drawHotspot(0);showSection(id);} else if(id==='regional'){renderTopic(id);drawCaseSim(0);showSection(id);} else if(id==='discriminators'){renderDiscriminators();drawDiscriminator(0);showSection(id);} else if(id==='management'){renderManagement();drawManagement(0);showSection(id);} else if(id==='repair'){renderRepair();showSection(id);} else showSection(id);}
function loCountForModule(m){if(!m.lo_prefixes)return DATA.objectives.length;return DATA.objectives.filter(o=>m.lo_prefixes.some(p=>o.id.startsWith(p+'.'))).length;}
function loMasteryMap(){const prefixes=[...new Set(DATA.objectives.map(o=>o.id.split('.')[0]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));const completed=Object.keys(state.completed);const cards=prefixes.map(p=>{const objs=DATA.objectives.filter(o=>o.id.startsWith(p+'.'));const mods=DATA.modules.filter(m=>(m.lo_prefixes||[]).includes(p));const moduleIds=mods.map(m=>m.id);const done=completed.filter(k=>moduleIds.some(id=>k.startsWith(id+':'))).length;const pct=Math.min(100,Math.round((done/Math.max(1,objs.length))*100));const primary=mods[0]?.id||'clinical';return `<article class="lo-tile"><div><b>LO ${esc(p)}</b><span>${objs.length} objectives</span></div><div class="lo-bar"><span style="width:${pct}%"></span></div><p>${done} practice completions</p><button onclick="showSection('${primary}')">Practice cluster</button></article>`;}).join('');return `<article class="card mastery-card"><div class="arena-top"><div><span class="tag">LO mastery map</span><h3>Progress by objective cluster</h3></div><button onclick="showSection('repair')">Repair weak items</button></div><div class="lo-grid">${cards}</div></article>`}
function dashboardCockpit(){const files=DATA.source_manifest||[];const imageRounds=DATA.images.filter(x=>x.answer).length;const ext=DATA.images.filter(x=>x.mode==='External image search').length;const transcriptCount=files.filter(f=>f.path.startsWith('Transcripts/')).length;const practiceCount=files.filter(f=>f.path.startsWith('Practice/')).length;const visualDone=Object.keys(state.completed).filter(k=>k.startsWith('visuals:')).length;const hotspotDone=Object.keys(state.completed).filter(k=>k.startsWith('hotspots:')).length;const clinicalDone=Object.keys(state.completed).filter(k=>k.startsWith('clinical:')||k.startsWith('mixed:')).length;const discDone=Object.keys(state.completed).filter(k=>k.startsWith('discriminators:')).length;const mgmtDone=Object.keys(state.completed).filter(k=>k.startsWith('management:')).length;return `<div class="cockpit"><article class="card cockpit-card"><span class="tag">Learning cockpit</span><h2>Pick a mode by task, not by module</h2><p>Use image rounds for recognition, hotspot localization, discriminator drills for look-alikes, management rounds for next steps, repair queue for misses, and vignettes for exam-style reasoning.</p><div class="cockpit-actions"><button class="primary" onclick="showSection('visuals')">Image rounds</button><button onclick="showSection('hotspots')">Hotspots</button><button onclick="showSection('discriminators')">Discriminators</button><button onclick="showSection('management')">Management</button><button onclick="showSection('repair')">Repair queue</button><button onclick="showSection('clinical')">Clinical vignettes</button><button onclick="showSection('objectives')">LO map</button><button onclick="toggleStudyMode()"><span data-mode-label>${state.examMode?'Exam mode':'Study mode'}</span></button></div><div class="mode-shelf"><button onclick="showSection('regional')">Case</button><button onclick="showSection('visuals')">Image</button><button onclick="showSection('glossary')">Rapid Recall</button><button onclick="showSection('infection')">Sort</button><button onclick="showSection('discriminators')">Compare</button><button onclick="showSection('tumors')">Build</button><button onclick="showSection('mixed')">Exam</button></div><div class="progress-strip"><div class="progress-tile"><b>${imageRounds}</b>image quiz rounds</div><div class="progress-tile"><b>${hotspotDone}/${DATA.hotspots.length}</b>hotspots done</div><div class="progress-tile"><b>${discDone}/${DATA.discriminators.length}</b>discriminators done</div><div class="progress-tile"><b>${mgmtDone}/${DATA.management.length}</b>management done</div><div class="progress-tile"><b>${state.missed.length}</b>repair queue</div><div class="progress-tile"><b>${clinicalDone}</b>case questions done</div><div class="progress-tile"><b>${DATA.objectives.length}</b>learning objectives</div></div></article><article class="card cockpit-card"><span class="tag source">Source refresh</span><h3>${files.length} files scanned</h3><div class="source-cloud"><span class="source-chip">${transcriptCount} transcripts</span><span class="source-chip">${practiceCount} practice files</span><span class="source-chip">${ext} external image-search rounds</span><span class="source-chip">${DATA.images.length} total visuals</span><span class="source-chip">${DATA.hotspots.length} hotspot rounds</span><span class="source-chip">${DATA.discriminators.length} discriminator drills</span><span class="source-chip">${DATA.management.length} management rounds</span></div><p class="small" style="margin-top:12px">External images are clearly labeled and used only as supplemental recognition practice; course documents remain the content anchor.</p></article></div>`}
function renderDashboard(){const q=(document.getElementById('search')?.value||'').toLowerCase();const cards=[{id:'objectives',title:'Learning Objective Tracker',tag:'Reference',desc:`${DATA.objectives.length} objectives from ${DATA.objective_source||'learning objective spreadsheet'}.`},{id:'glossary',title:'Glossary',tag:'Reference',desc:'Alphabetized terms with term sprint practice.'},{id:'disease',title:'Disease / Diagnosis Index',tag:'Reference',desc:'Searchable disease and diagnosis cards with compact high-yield summaries.'},{id:'drugs',title:'Drug and Mechanism Matrix',tag:'Reference',desc:'Antibiotic, chemotherapy, and osteoprotective medication anchors.'},...DATA.modules.map(m=>({...m,tag:['visuals','hotspots','discriminators','management','repair'].includes(m.id)?'New practice':'Practice',desc:`${m.desc} ${loCountForModule(m)} mapped LOs.`}))].filter(m=>(m.title+' '+m.desc+' '+(m.sources||[]).join(' ')).toLowerCase().includes(q));document.getElementById('dashboard').innerHTML=`${dashboardCockpit()}<div class="stats"></div><div class="grid">${cards.map(m=>`<article class="card module-card"><div><span class="tag">${esc(m.tag)}</span><h2>${esc(m.title)}</h2><p>${rich(m.desc)}</p></div><div class="small">${Object.keys(state.completed).filter(k=>k.startsWith(m.id+':')).length} completed</div><button class="primary" onclick="showSection('${m.id}')">Open</button></article>`).join('')}</div>`;renderStats();applyMode();}
function renderShell(id,title,desc,sources,body){document.getElementById(id).innerHTML=`<div class="module-head"><div><h2>${esc(title)}</h2><p>${rich(desc)}</p></div>${moduleControls(id)}</div><div class="module-layout">${moduleRail(id)}<div class="module-content">${activityHub(id)}<div class="stats"></div>${sourceBlock(sources)}${body}</div></div>`;renderStats();applyMode();}
function renderObjectives(){const sessions=[...new Set(DATA.objectives.map(o=>o.session).filter(Boolean))];const body=`${loMasteryMap()}<div class="pillbar"><input id="loSearch" class="search" placeholder="Search LO IDs, sessions, diseases, objective text..." oninput="drawObjectives()"><select id="loSession" onchange="drawObjectives()"><option value="">All sessions</option>${sessions.map(s=>`<option>${esc(s)}</option>`).join('')}</select></div><div class="card"><p><b>${DATA.objectives.length}</b> learning objectives loaded from ${esc(DATA.objective_source||'the Exam 3 spreadsheet')}.</p></div><div id="objectiveRows"></div>`;renderShell('objectives','Learning Objective Tracker','Full Exam 3 learning objective tracker from the spreadsheet, with session, disease, and platform-module mapping.',[],body);drawObjectives();}
function objectiveModule(o){const found=DATA.modules.find(m=>(m.lo_prefixes||[]).some(p=>o.id.startsWith(p+'.')));return found?found.title:'Reference';}
function drawObjectives(){const q=(loSearch?.value||'').toLowerCase(),session=loSession?.value||'';const rows=DATA.objectives.filter(o=>(!session||o.session===session)&&JSON.stringify(o).toLowerCase().includes(q)).map(o=>`<tr><td><b>${esc(o.id)}</b></td><td>${esc(o.session)}</td><td>${rich(o.objective)}</td><td>${esc(o.disease||'')}</td><td>${esc(objectiveModule(o))}</td></tr>`).join('');objectiveRows.innerHTML=`<div class="card"><table class="table"><thead><tr><th>LO ID</th><th>Session</th><th>Learning objective</th><th>Disease mentioned</th><th>Platform module</th></tr></thead><tbody>${rows}</tbody></table></div>`;}
function renderGlossary(){const cats=[...new Set(DATA.glossary.map(g=>g.category))].sort();const body=`<div class="pillbar"><input id="glossarySearch" class="search" placeholder="Search glossary..." oninput="drawGlossaryList()"><select id="glossaryCat" onchange="drawGlossaryList()"><option value="">All categories</option>${cats.map(c=>`<option>${esc(c)}</option>`).join('')}</select></div><div id="glossaryGame"></div><div id="glossaryList" class="glossary-list"></div>`;renderShell('glossary','Glossary','Alphabetized source-aligned terms. Term sprint gives active recall practice.',[],body);drawGlossaryGame(0);drawGlossaryList();}
function drawGlossaryList(){const q=(glossarySearch?.value||'').toLowerCase(),cat=glossaryCat?.value||'';glossaryList.innerHTML=DATA.glossary.filter(g=>(!cat||g.category===cat)&&(g.term+' '+g.definition).toLowerCase().includes(q)).sort((a,b)=>a.term.localeCompare(b.term)).map(g=>`<article class="card glossary-card"><span class="tag">${esc(g.category)}</span><h3>${esc(g.term)}</h3><p>${rich(g.definition)}</p></article>`).join('');}
let glossaryIdx=0;function drawGlossaryGame(d=0){glossaryIdx=(glossaryIdx+d+DATA.glossary.length)%DATA.glossary.length;const g=DATA.glossary[glossaryIdx];const opts=[g.term,...DATA.glossary.filter(x=>x.term!==g.term).sort(()=>Math.random()-.5).slice(0,4).map(x=>x.term)].sort(()=>Math.random()-.5);glossaryGame.innerHTML=`<article class="card question-box">${qnav('glossary',glossaryIdx,DATA.glossary.length,'drawGlossaryGame')}<span class="tag">Term sprint</span><p>${rich(g.definition)}</p><div data-wrong="0" data-total="${opts.length}" data-locked="0">${opts.map(o=>`<button class="choice" onclick="guarded(this,'${esc(o)}','${esc(g.term)}','${esc(g.term)}: ${esc(g.definition)}','glossary:${glossaryIdx}','glossaryFeed',null,'Match the definition to the term.')">${esc(o)}</button>`).join('')}</div><div id="glossaryFeed" class="feedback"></div></article>`;}
function openTerm(term){const g=DATA.glossary.find(x=>x.term.toLowerCase()===term.toLowerCase());glossaryModalTitle.textContent=g?g.term:'Glossary';glossaryModalBody.innerHTML=g?`<p><span class="tag">${esc(g.category)}</span></p><p>${rich(g.definition)}</p>`:'<p>Term not found.</p>';glossaryModal.classList.add('open');}
function openGlossaryBrowser(){glossaryModalTitle.textContent='Glossary';const rows=DATA.glossary.slice().sort((a,b)=>a.term.localeCompare(b.term)).map(g=>`<article class="glossary-browser-item"><div class="glossary-browser-term">${esc(g.term)}</div><p class="glossary-browser-def">${esc(g.definition)}</p></article>`).join('');glossaryModalBody.innerHTML=`<div class="glossary-browser">${rows}</div>`;glossaryModal.classList.add('open');}
function closeGlossaryModal(){glossaryModal.classList.remove('open');}
function renderDisease(){const groups=[...new Set(DATA.diseases.map(d=>d.group))].sort();const body=`<div class="pillbar"><input id="diseaseSearch" class="search" placeholder="Search diagnoses..." oninput="drawDisease()"><select id="diseaseGroup" onchange="drawDisease()"><option value="">All groups</option>${groups.map(g=>`<option>${esc(g)}</option>`).join('')}</select></div><div id="diseaseRows" class="grid"></div>`;renderShell('disease','Disease / Diagnosis Index','Searchable and filterable diagnosis bank with compact high-yield cards.',[],body);drawDisease();}
function drawDisease(){const q=(diseaseSearch?.value||'').toLowerCase(),g=diseaseGroup?.value||'';diseaseRows.innerHTML=DATA.diseases.filter(d=>(!g||d.group===g)&&JSON.stringify(d).toLowerCase().includes(q)).map(d=>`<article class="card diagnosis-card"><span class="tag">${esc(d.group)}</span><span class="tag source">LO ${esc(d.lo||'source-mapped')}</span><h3>${esc(d.name)}</h3><p><b>Also:</b> ${rich(d.also)}</p><p>${rich(d.description)}</p><p><b>Clinical:</b> ${rich(d.clinical)}</p><p><b>Testing:</b> ${rich(d.testing)}</p><p><b>Treatment:</b> ${rich(d.treatment)}</p></article>`).join('');}
function renderDrugs(){const rows=DATA.drugs.map((d,i)=>`<tr><td>${rich(d.drug)}</td><td>${rich(d.class)}</td><td>${rich(d.uses)}</td><td>${rich(d.mechanism)}</td><td>${rich(d.adverse)}</td></tr>`).join('');renderShell('drugs','Drug and Mechanism Matrix','Antibiotic, chemotherapy, and osteoprotective medication anchors with matching practice.',[],`<div id="drugGame"></div><div class="card"><table class="table"><thead><tr><th>Drug</th><th>Class</th><th>Use</th><th>Mechanism</th><th>Adverse / safety</th></tr></thead><tbody>${rows}</tbody></table></div>`);drawDrugGame(0);}
let drugIdx=0;function drawDrugGame(d=0){drugIdx=(drugIdx+d+DATA.drugs.length)%DATA.drugs.length;const row=DATA.drugs[drugIdx],fields=['class','uses','mechanism','adverse'],field=fields[drugIdx%fields.length];const opts=[row[field],...DATA.drugs.map(x=>x[field]).filter(x=>x!==row[field]).sort(()=>Math.random()-.5).slice(0,4)].sort(()=>Math.random()-.5);drugGame.innerHTML=`<article class="card question-box">${qnav('drugs',drugIdx,DATA.drugs.length,'drawDrugGame')}<span class="tag">Mechanism match</span><p><b>${esc(row.drug)}</b>: choose the correct ${field}.</p><div data-wrong="0" data-total="${opts.length}" data-locked="0">${opts.map(o=>`<button class="choice" onclick="guarded(this,'${esc(o)}','${esc(row[field])}','${esc(row.drug)}: ${esc(row.class)}. Use: ${esc(row.uses)}. Mechanism: ${esc(row.mechanism)}. Safety: ${esc(row.adverse)}','drugs:${drugIdx}','drugFeed',null,'Medication stem asks for a type-matched property.')">${esc(o)}</button>`).join('')}</div><div id="drugFeed" class="feedback"></div></article>`;}
function confidenceBar(itemId){const cur=state.confidence[itemId]||'';return `<div class="confidence-bar"><span class="small"><b>Confidence:</b></span>${['low','medium','high'].map(v=>`<button class="${cur===v?'selected':''}" onclick="setConfidence('${itemId}','${v}',this)">${v}</button>`).join('')}</div>`}
function setConfidence(itemId,val,btn){state.confidence[itemId]=val;save();btn.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));btn.classList.add('selected');}
function renderDiscriminators(){const m=DATA.modules.find(x=>x.id==='discriminators');const body=`<div class="activity-tabs"><button class="primary" onclick="drawDiscriminator(0)">Current drill</button><button onclick="drawDiscriminator(1)">Next look-alike</button><button onclick="drawDiscriminator(Math.floor(Math.random()*DATA.discriminators.length)-state.discriminatorIndex)">Randomize</button></div><div id="discriminatorGame"></div>`;renderShell('discriminators',m.title,m.desc,m.sources,body);drawDiscriminator(0);}
function drawDiscriminator(d=0){const deck=DATA.discriminators||[];if(!deck.length||!document.getElementById('discriminatorGame'))return;state.discriminatorIndex=(state.discriminatorIndex+d+deck.length)%deck.length;save();const idx=state.discriminatorIndex,item=deck[idx],itemId=`discriminators:${idx}`;discriminatorGame.innerHTML=`<article class="card question-box arena-card">${qnav('discriminators',idx,deck.length,'drawDiscriminator')}<div class="arena-top"><div><span class="tag">Find the discriminator</span><span class="tag source">${esc(item.module)}</span></div><span class="small">${Object.keys(state.completed).filter(k=>k.startsWith('discriminators:')).length}/${deck.length} done</span></div><p class="pair-title">${esc(item.pair)}</p><p><b>${rich(item.stem)}</b></p><p>${rich(item.question)}</p>${confidenceBar(itemId)}<div class="visual-options" data-wrong="0" data-total="${item.choices.length}" data-locked="0">${item.choices.map(o=>`<button class="choice" data-value="${esc(o)}" data-answer="${esc(item.answer)}" onclick="checkDiscriminatorChoice(this,'${itemId}')">${rich(o)}</button>`).join('')}</div><div id="discriminatorFeed" class="feedback"></div></article>`;}
function checkDiscriminatorChoice(btn,itemId){const box=btn.parentElement;if(box.dataset.locked==='1')return;const item=DATA.discriminators[state.discriminatorIndex];const val=btn.dataset.value,answer=btn.dataset.answer;if(val===answer){btn.classList.add('correct');box.dataset.locked='1';complete(itemId,true);showFeedback('discriminatorFeed',`<b>Correct.</b> ${rich(item.why)}${sourceMeta(item.source)}`);}else{btn.classList.add('wrong');box.dataset.wrong=Number(box.dataset.wrong||0)+1;if(Number(box.dataset.wrong)>=Number(box.dataset.total)-1){box.dataset.locked='1';complete(itemId,false);showFeedback('discriminatorFeed',`<b>Target clue:</b> ${rich(answer)}<br>${rich(item.why)}${sourceMeta(item.source)}`);}}}
function urgencyTag(u){const c=(u||'').toLowerCase();return `<span class="tag urgency ${c==='emergency'?'emergency':c==='routine'?'routine':''}">${esc(u||'Action')}</span>`}
function renderManagement(){const m=DATA.modules.find(x=>x.id==='management');const body=`<div class="activity-tabs"><button class="primary" onclick="drawManagement(0)">Current round</button><button onclick="drawManagement(1)">Next action</button><button onclick="drawManagement(Math.floor(Math.random()*DATA.management.length)-state.managementIndex)">Randomize</button></div><div id="managementGame"></div>`;renderShell('management',m.title,m.desc,m.sources,body);drawManagement(0);}
function drawManagement(d=0){const deck=DATA.management||[];if(!deck.length||!document.getElementById('managementGame'))return;state.managementIndex=(state.managementIndex+d+deck.length)%deck.length;save();const idx=state.managementIndex,item=deck[idx],itemId=`management:${idx}`;managementGame.innerHTML=`<article class="card question-box arena-card">${qnav('management',idx,deck.length,'drawManagement')}<div class="arena-top"><div><span class="tag">Next step</span><span class="tag source">${esc(item.module)}</span>${urgencyTag(item.urgency)}</div><span class="small">${Object.keys(state.completed).filter(k=>k.startsWith('management:')).length}/${deck.length} done</span></div><h3>${esc(item.title)}</h3><p><b>${rich(item.stem)}</b></p><p>${rich(item.question)}</p>${confidenceBar(itemId)}<div class="visual-options" data-wrong="0" data-total="${item.choices.length}" data-locked="0">${item.choices.map(o=>`<button class="choice" data-value="${esc(o)}" data-answer="${esc(item.answer)}" onclick="checkManagementChoice(this,'${itemId}')">${rich(o)}</button>`).join('')}</div><div id="managementFeed" class="feedback"></div></article>`;}
function checkManagementChoice(btn,itemId){const box=btn.parentElement;if(box.dataset.locked==='1')return;const item=DATA.management[state.managementIndex];const val=btn.dataset.value,answer=btn.dataset.answer;if(val===answer){btn.classList.add('correct');box.dataset.locked='1';complete(itemId,true);showFeedback('managementFeed',`<b>Correct.</b> ${rich(item.why)}${sourceMeta(item.source)}`);}else{btn.classList.add('wrong');box.dataset.wrong=Number(box.dataset.wrong||0)+1;if(Number(box.dataset.wrong)>=Number(box.dataset.total)-1){box.dataset.locked='1';complete(itemId,false);showFeedback('managementFeed',`<b>Target action:</b> ${rich(answer)}<br>${rich(item.why)}${sourceMeta(item.source)}`);}}}
function repairInfo(id){let m;if((m=id.match(/^visuals:(\d+)$/))){const x=imageDeck()[Number(m[1])];return x?{id,kind:'Image',title:x.title,stem:x.prompt,choices:x.choices,answer:x.answer,why:x.why,source:x.source,image:x.data,tag:x.key}:null;}if((m=id.match(/^hotspots:(\d+)$/))){const x=hotspotDeck().find(h=>h.index===Number(m[1]));return x?{id,kind:'Hotspot',title:x.title,stem:x.prompt,choices:[x.target,'joint space','normal soft tissue','background artifact'],answer:x.target,why:x.why,source:x.source,image:x.image.data,tag:x.key}:null;}if((m=id.match(/^regional-case:(\d+)$/))){const x=DATA.regional_cases[Number(m[1])];return x?{id,kind:'Case',title:x.title,stem:x.stem+' '+x.question,choices:x.choices,answer:x.answer,why:x.why,source:x.source,tag:x.region}:null;}if((m=id.match(/^discriminators:(\d+)$/))){const x=DATA.discriminators[Number(m[1])];return x?{id,kind:'Discriminator',title:x.pair,stem:x.stem+' '+x.question,choices:x.choices,answer:x.answer,why:x.why,source:x.source,tag:x.module}:null;}if((m=id.match(/^management:(\d+)$/))){const x=DATA.management[Number(m[1])];return x?{id,kind:'Management',title:x.title,stem:x.stem+' '+x.question,choices:x.choices,answer:x.answer,why:x.why,source:x.source,tag:x.module}:null;}if((m=id.match(/^clinical:(\d+)$/))){const x=DATA.mcqs[Number(m[1])];return x?{id,kind:'Vignette',title:x.module,stem:x.stem+' '+x.question,choices:x.choices,answer:x.answer,why:x.why,source:x.source,tag:x.skill}:null;}if((m=id.match(/^glossary:(\d+)$/))){const x=DATA.glossary[Number(m[1])];return x?{id,kind:'Glossary',title:x.term,stem:x.definition,choices:[x.term,...DATA.glossary.filter(g=>g.term!==x.term).slice(0,3).map(g=>g.term)],answer:x.term,why:x.term+': '+x.definition,source:'Glossary',tag:x.category}:null;}return null;}
function repairDeck(){const seen=new Set();return (state.missed||[]).map(m=>m.id).filter(id=>{if(seen.has(id))return false;seen.add(id);return true;}).map(repairInfo).filter(Boolean);}
function renderRepair(){const m=DATA.modules.find(x=>x.id==='repair');const body=`<div id="repairBody"></div>`;renderShell('repair',m.title,m.desc,m.sources,body);drawRepair(0);}
function drawRepair(d=0){const deck=repairDeck();if(!document.getElementById('repairBody'))return;if(!deck.length){repairBody.innerHTML=`<article class="card repair-empty"><span class="tag">Repair queue</span><h2>No missed items waiting</h2><p>Missed image, case, discriminator, management, and vignette items will appear here automatically after an incorrect attempt.</p></article>`;return;}state.repairIndex=(state.repairIndex+d+deck.length)%deck.length;save();const idx=state.repairIndex,item=deck[idx];repairBody.innerHTML=`<article class="card question-box arena-card">${qnav('repair',idx,deck.length,'drawRepair')}<div class="arena-top"><div><span class="tag">Repair</span><span class="tag source">${esc(item.kind)}</span><span class="tag">${esc(item.tag||'')}</span></div><span class="small">${deck.length} missed items queued</span></div><h3>${esc(item.title)}</h3>${item.image?zoomableImage(item.image,item.title):''}<p><b>${rich(item.stem)}</b></p>${confidenceBar('repair:'+item.id)}<div class="visual-options" data-wrong="0" data-total="${item.choices.length}" data-locked="0">${item.choices.map(o=>`<button class="choice" data-value="${esc(o)}" data-answer="${esc(item.answer)}" onclick="checkRepairChoice(this)">${rich(o)}</button>`).join('')}</div><div id="repairFeed" class="feedback"></div></article><article class="card"><h3>Queued misses</h3>${deck.map((x,i)=>`<div class="repair-item"><div><span class="tag">${esc(x.kind)}</span> <b>${esc(x.title)}</b><p class="small">${esc(x.id)}</p></div><button onclick="state.repairIndex=${i};save();drawRepair(0)">Open</button></div>`).join('')}</article>`;renderStats();}
function checkRepairChoice(btn){const box=btn.parentElement;if(box.dataset.locked==='1')return;const item=repairDeck()[state.repairIndex];if(!item)return;const val=btn.dataset.value,answer=btn.dataset.answer;if(val===answer){btn.classList.add('correct');box.dataset.locked='1';complete(item.id,true);showFeedback('repairFeed',`<b>Repaired.</b> This item was removed from the missed queue.<br>${rich(item.why)}${sourceMeta(item.source)}`);}else{btn.classList.add('wrong');box.dataset.wrong=Number(box.dataset.wrong||0)+1;if(Number(box.dataset.wrong)>=Number(box.dataset.total)-1){box.dataset.locked='1';complete(item.id,false);showFeedback('repairFeed',`<b>Still needs repair.</b> Target: ${rich(answer)}<br>${rich(item.why)}${sourceMeta(item.source)}`);}}}
function renderTopic(id){const m=DATA.modules.find(x=>x.id===id);let body='';if(id==='infection')body=flashRows(['Osteomyelitis','Septic'])+sortRows(0)+sequenceRows(0);else if(id==='injury')body=flashRows(['Sprain','Strain','PRICE','Grade'])+regionalRows(['Ankle']);else if(id==='genetics')body=flashRows(['Duchenne','Becker','Myotonic','Osteogenesis','Gower'])+diseaseMini(['Osteogenesis imperfecta','Duchenne muscular dystrophy','Becker muscular dystrophy','Myotonic dystrophy','Marfan syndrome','Ehlers-Danlos syndrome']);else if(id==='tumors')body=imageAtlas(['tumors'])+diseaseMini(['Osteosarcoma','Ewing sarcoma','Chondrosarcoma','Bone metastases'])+sortRows(1)+sequenceRows(1);else if(id==='muscle')body=imageAtlas(['muscle','myopathy'])+flashRows(['T-tubule','SERCA','Cross-bridge','Myalgia','Rhabdomyolysis','NMS','Malignant','Dermatomyositis','Inclusion'])+diseaseMini(['Rhabdomyolysis','Mitochondrial myopathy','Glycogen storage myopathy','Fibromyalgia','Neuroleptic malignant syndrome','Malignant hyperthermia','Polymyositis','Dermatomyositis','Inclusion body myositis'])+sortRows(2)+`<article class="card"><h3>Active prompt</h3><p>For muscle pain or weakness, first decide whether the patient has pain-predominant myalgia, true muscle fiber weakness, acute myonecrosis, metabolic energy failure, inflammatory myopathy, or a drug-triggered hyperthermic syndrome. CK level, urine color, medication/anesthesia exposure, rash, distribution, and tempo are the fastest discriminators.</p>${sourceMeta(DATA.sources.muscle)}</article>`;else if(id==='ultrasound')body=imageAtlas(['ultrasound'])+flashRows(['Ultrasound','anisotropy'])+`<article class="card"><h3>Dynamic assessment check</h3><p>${rich('When scanning tendon or ligament, maintain probe angle to avoid ultrasound anisotropy and use dynamic assessment when motion changes the suspected lesion.')}</p>${sourceMeta(DATA.sources.ultrasound)}</article>`;else if(id==='regional')body=caseSimulator()+imageAtlas(['knee','regional','upper','redhot'])+regionalRows()+sortRows(3)+diseaseMini(['Knee osteoarthritis','ACL tear','PCL tear','Meniscal tear','Patellofemoral pain syndrome','Prepatellar bursitis','Osgood-Schlatter disease','Baker cyst','Iliotibial band syndrome']);renderShell(id,m.title,m.desc,m.sources,body);if(id==='regional')drawCaseSim(0);}
function flashRows(keys){const rows=DATA.flashcards.filter(f=>keys.some(k=>(f.front+f.back).toLowerCase().includes(k.toLowerCase())));return `<div class="grid">${rows.map((f,i)=>`<article class="card practice-card"><span class="tag">Rapid recall</span><h3>${rich(f.front)}</h3><details><summary><b>Reveal answer</b></summary><p>${rich(f.back)}</p>${sourceMeta(f.source)}</details></article>`).join('')}</div>`}
function diseaseMini(names){return `<div class="grid">${DATA.diseases.filter(d=>names.includes(d.name)).map(d=>`<article class="card disease-mini"><span class="tag">${esc(d.group)}</span><h3>${esc(d.name)}</h3><p>${rich(d.description)}</p><p><b>Discriminator:</b> ${rich(d.clinical)}</p></article>`).join('')}</div>`}
function regionalRows(filter){let rows=DATA.regional;if(filter)rows=rows.filter(r=>filter.some(f=>r.title.includes(f)));return `<div class="grid">${rows.map((r,i)=>`<article class="card"><span class="tag">Case lab</span><h3>${esc(r.title)}</h3><p>${rich(r.anchor)}</p><label>What is your next discriminating question or exam maneuver?</label><textarea id="reg${i}" style="width:100%;margin-top:8px"></textarea><button onclick="document.getElementById('regFeed${i}').classList.add('show')">Check anchor</button><div id="regFeed${i}" class="feedback"><b>Anchor:</b> ${rich(r.anchor)} ${sourceMeta(r.source)}</div></article>`).join('')}</div>`}
function caseSimulator(){return `<article class="card question-box case-card"><div id="caseSim"></div></article>`}
function drawCaseSim(d=0){const deck=DATA.regional_cases||[];if(!deck.length||!document.getElementById('caseSim'))return;state.caseIndex=(state.caseIndex+d+deck.length)%deck.length;save();const idx=state.caseIndex,c=deck[idx];caseSim.innerHTML=`${qnav('regional',idx,deck.length,'drawCaseSim')}<div class="meta"><span class="tag">Decision case</span><span class="tag source">${esc(c.region)}</span></div><h3>${esc(c.title)}</h3><p><b>${rich(c.stem)}</b></p><p>${rich(c.question)}</p><div class="decision-grid" data-wrong="0" data-total="${c.choices.length}" data-locked="0">${c.choices.map(o=>`<button class="choice" data-value="${esc(o)}" data-answer="${esc(c.answer)}" onclick="checkCaseChoice(this,'regional-case:${idx}')">${rich(o)}</button>`).join('')}</div><div id="caseFeed" class="feedback"></div>`;}
function checkCaseChoice(btn,itemId){const box=btn.parentElement;if(box.dataset.locked==='1')return;const c=DATA.regional_cases[state.caseIndex];const val=btn.dataset.value,answer=btn.dataset.answer;if(val===answer){btn.classList.add('correct');box.dataset.locked='1';complete(itemId,true);showFeedback('caseFeed',`<b>Correct.</b> ${rich(c.why)}${sourceMeta(c.source)}`);}else{btn.classList.add('wrong');box.dataset.wrong=Number(box.dataset.wrong||0)+1;if(Number(box.dataset.wrong)>=Number(box.dataset.total)-1){box.dataset.locked='1';complete(itemId,false);showFeedback('caseFeed',`<b>Target answer:</b> ${rich(answer)}<br>${rich(c.why)}${sourceMeta(c.source)}`);}}}
function sortRows(i){const s=DATA.sorts[i];const cats=Object.keys(s.categories);const items=Object.entries(s.categories).flatMap(([cat,vals])=>vals.map(v=>({item:v,cat})));return `<article class="card"><h3>${esc(s.title)}</h3><p class="small">Drag each chip into a category. On mobile, tap a chip and then tap a target category.</p><div class="drag-sort" data-selected=""><div class="sort-bank">${shuffle(items).map(({item,cat})=>`<button class="sort-chip" draggable="true" data-answer="${esc(cat)}" ondragstart="dragSortStart(event)" onclick="selectSortChip(this)">${rich(item)}</button>`).join('')}</div><div class="sort-zones">${cats.map(cat=>`<div class="sort-zone" data-cat="${esc(cat)}" ondragover="event.preventDefault()" ondrop="dropSortChip(event,this)" onclick="tapDropSortChip(this)"><h4>${esc(cat)}</h4></div>`).join('')}</div></div><div class="control-row"><button onclick="checkSort(this,'sort:${i}')">Check sorting</button><button onclick="resetSortBoard(this)">Reset board</button></div><div class="feedback"></div>${sourceMeta(s.source)}</article>`}
function dragSortStart(ev){ev.dataTransfer.setData('text/plain',ev.target.dataset.answer+'||'+ev.target.textContent);window.__dragChip=ev.target;}
function dropSortChip(ev,zone){ev.preventDefault();if(window.__dragChip)zone.appendChild(window.__dragChip);window.__dragChip=null;}
function selectSortChip(btn){const board=btn.closest('.drag-sort');board.querySelectorAll('.sort-chip').forEach(x=>x.classList.remove('selected'));board.dataset.selected='1';board.__selectedChip=btn;btn.classList.add('selected');}
function tapDropSortChip(zone){const board=zone.closest('.drag-sort');const chip=board.__selectedChip;if(chip){zone.appendChild(chip);chip.classList.remove('selected');board.__selectedChip=null;board.dataset.selected='';}}
function resetSortBoard(btn){const article=btn.closest('.card'),bank=article.querySelector('.sort-bank');article.querySelectorAll('.sort-zone .sort-chip').forEach(chip=>bank.appendChild(chip));article.querySelectorAll('.sort-chip').forEach(chip=>chip.classList.remove('correct','wrong','selected'));article.querySelector('.feedback').classList.remove('show');}
function checkSort(btn,id){const article=btn.closest('.card');let ok=0,total=0;article.querySelectorAll('.sort-chip').forEach(chip=>{total++;const zone=chip.closest('.sort-zone');const good=zone&&zone.dataset.cat===chip.dataset.answer;chip.classList.toggle('correct',!!good);chip.classList.toggle('wrong',!good);if(good)ok++;});complete(id,ok===total);const f=article.querySelector('.feedback');f.classList.add('show');f.innerHTML=`${ok}/${total} correct. Move red chips and recheck until every item sits in the right bucket.`;}
function sequenceRows(i){const s=DATA.sequences[i];const mixed=shuffle([...s.steps]);return `<article class="card"><h3>${esc(s.title)}</h3><p class="small">Reorder the pathway. Drag steps, or use the arrow buttons for precise control.</p><div class="sequence-list build-sequence" data-index="${i}">${mixed.map((step,idx)=>`<div class="sequence-item seq-token" draggable="true" data-answer="${esc(step)}" ondragstart="dragSeqStart(event)" ondragover="event.preventDefault()" ondrop="dropSeqToken(event,this)"><span class="sequence-index">${idx+1}</span><span>${rich(step)}</span><div class="seq-actions"><button onclick="moveSeq(this,-1)">↑</button><button onclick="moveSeq(this,1)">↓</button></div></div>`).join('')}</div><div class="control-row"><button onclick="checkSeq(this,'seq:${i}')">Check sequence</button><button onclick="shuffleSeq(this)">Shuffle</button></div><div class="feedback"></div>${sourceMeta(s.source)}</article>`}
function renumberSeq(list){list.querySelectorAll('.sequence-index').forEach((el,i)=>el.textContent=i+1);}
function dragSeqStart(ev){window.__dragSeq=ev.currentTarget;}
function dropSeqToken(ev,target){ev.preventDefault();const dragged=window.__dragSeq;if(!dragged||dragged===target)return;const list=target.parentElement;const rect=target.getBoundingClientRect();if(ev.clientY<rect.top+rect.height/2)list.insertBefore(dragged,target);else list.insertBefore(dragged,target.nextSibling);renumberSeq(list);window.__dragSeq=null;}
function moveSeq(btn,delta){const item=btn.closest('.seq-token'),list=item.parentElement;if(delta<0&&item.previousElementSibling)list.insertBefore(item,item.previousElementSibling);if(delta>0&&item.nextElementSibling)list.insertBefore(item.nextElementSibling,item);renumberSeq(list);}
function shuffleSeq(btn){const list=btn.closest('.card').querySelector('.build-sequence');shuffle([...list.children]).forEach(n=>list.appendChild(n));renumberSeq(list);}
function checkSeq(btn,id){const article=btn.closest('.card'),list=article.querySelector('.build-sequence');let ok=0,total=0;list.querySelectorAll('.seq-token').forEach((token,i)=>{total++;const expected=DATA.sequences[Number(list.dataset.index)].steps[i];const good=token.dataset.answer===expected;token.classList.toggle('correct',good);token.classList.toggle('wrong',!good);if(good)ok++;});complete(id,ok===total);const f=article.querySelector('.feedback');f.classList.add('show');f.innerHTML=`${ok}/${total} in order. ${rich(DATA.sequences[Number(list.dataset.index)].why)}`;}
function imageDeck(){return DATA.images.filter(img=>img.answer&&img.choices&&img.choices.length)}
function hotspotDeck(){return (DATA.hotspots||[]).map((h,i)=>{const img=DATA.images.find(x=>x.title===h.image_title)||DATA.images.find(x=>x.key===h.key&&x.answer)||DATA.images.find(x=>x.key===h.key);return img?{...h,index:i,image:img}:null;}).filter(Boolean);}
function renderHotspots(){const m=DATA.modules.find(x=>x.id==='hotspots');const body=`<div class="activity-tabs"><button class="primary" onclick="drawHotspot(0)">Current hotspot</button><button onclick="drawHotspot(1)">Next target</button><button onclick="showSection('visuals')">Image bank</button></div><div id="hotspotGame"></div>`;renderShell('hotspots',m.title,m.desc,m.sources,body);drawHotspot(0);}
function drawHotspot(d=0){const deck=hotspotDeck();if(!document.getElementById('hotspotGame'))return;if(!deck.length){hotspotGame.innerHTML='<article class="card"><p>No hotspot rounds are available.</p></article>';return;}state.hotspotIndex=(state.hotspotIndex+d+deck.length)%deck.length;save();const idx=state.hotspotIndex,h=deck[idx],img=h.image,itemId=`hotspots:${h.index}`;hotspotGame.innerHTML=`<article class="card question-box hotspot-card">${qnav('hotspots',idx,deck.length,'drawHotspot')}<div class="image-quiz"><div><div class="hotspot-stage" data-item="${itemId}" data-x="${h.box.x}" data-y="${h.box.y}" data-w="${h.box.w}" data-h="${h.box.h}" data-tries="0" data-locked="0" onclick="checkHotspot(event)"><img src="${esc(img.data)}" alt="${esc(h.title)}" loading="lazy"><span class="hotspot-reticle" style="left:${h.box.x+h.box.w/2}%;top:${h.box.y+h.box.h/2}%"></span></div><p class="small">${esc(img.mode||'Image round')} • ${esc(img.source_note||'source image')} ${img.page?`• page ${esc(img.page)}`:''}</p>${sourceMeta(img.source)}</div><div><div class="meta"><span class="tag">Hotspot</span><span class="tag source">${esc(h.key)}</span></div><h3>${esc(h.title)}</h3><p>${rich(h.prompt)}</p><p class="small"><b>Target:</b> ${esc(h.target)}. Click directly on the image.</p>${confidenceBar(itemId)}<div id="hotspotFeed" class="feedback"></div></div></div></article>`;}
function checkHotspot(ev){const stage=ev.currentTarget;if(stage.dataset.locked==='1')return;const rect=stage.getBoundingClientRect();const x=((ev.clientX-rect.left)/rect.width)*100,y=((ev.clientY-rect.top)/rect.height)*100;const bx=Number(stage.dataset.x),by=Number(stage.dataset.y),bw=Number(stage.dataset.w),bh=Number(stage.dataset.h);const hit=x>=bx&&x<=bx+bw&&y>=by&&y<=by+bh;stage.querySelectorAll('.hotspot-click').forEach(n=>n.remove());const dot=document.createElement('span');dot.className='hotspot-click '+(hit?'correct':'wrong');dot.style.left=x+'%';dot.style.top=y+'%';stage.appendChild(dot);const h=hotspotDeck()[state.hotspotIndex];if(hit){stage.dataset.locked='1';complete(stage.dataset.item,true);showFeedback('hotspotFeed',`<b>Correct localization.</b> ${rich(h.why)}${sourceMeta(h.source)}`);}else{stage.dataset.tries=String(Number(stage.dataset.tries||0)+1);if(Number(stage.dataset.tries)>=2){stage.dataset.locked='1';complete(stage.dataset.item,false);stage.classList.add('show-target');showFeedback('hotspotFeed',`<b>Target area:</b> ${rich(h.target)}<br>${rich(h.why)}${sourceMeta(h.source)}`);}else{showFeedback('hotspotFeed','Try once more. Re-orient to the feature named in the prompt.');}}}
function renderVisuals(){const m=DATA.modules.find(x=>x.id==='visuals');const body=`<div class="activity-tabs"><button class="primary" onclick="drawImageQuiz(0)">Quiz current image</button><button onclick="drawImageQuiz(1)">Next image</button><button onclick="document.getElementById('sourceCoverage').scrollIntoView({behavior:'smooth'})">Source coverage</button></div><div id="imageQuiz"></div><article class="card"><h3>Full visual atlas</h3><p class="small">Course images appear first. External image-search items are labeled and linked back to their image page.</p>${imageAtlas()}</article><article id="sourceCoverage" class="card"><h3>Source coverage</h3>${sourceCoverageTable()}</article>`;renderShell('visuals',m.title,m.desc,m.sources,body);drawImageQuiz(0);}
function drawImageQuiz(d=0){const deck=imageDeck();if(!document.getElementById('imageQuiz'))return;if(!deck.length){imageQuiz.innerHTML='<article class="card"><p>No image quiz rounds are available.</p></article>';return;}state.imageIndex=(state.imageIndex+d+deck.length)%deck.length;save();const idx=state.imageIndex,img=deck[idx];imageQuiz.innerHTML=`<article class="card question-box"><div class="image-quiz"><div>${qnav('visuals',idx,deck.length,'drawImageQuiz')}${zoomableImage(img.data,img.title+' - '+img.source)}<p class="small">${esc(img.mode||'Image round')} • ${esc(img.source_note||'source image')} ${img.page?`• page ${esc(img.page)}`:''}</p>${sourceMeta(img.source)}</div><div><div class="meta"><span class="tag">Image round</span><span class="tag source">${esc(img.key)}</span></div><h3>${esc(img.title)}</h3><p>${rich(img.prompt||'Choose the best visual diagnosis.')}</p><div class="visual-options" data-wrong="0" data-total="${img.choices.length}" data-locked="0">${img.choices.map(o=>`<button class="choice" data-value="${esc(o)}" data-answer="${esc(img.answer)}" onclick="checkImageChoice(this,'visuals:${idx}')">${rich(o)}</button>`).join('')}</div><div id="imageFeed" class="feedback"></div></div></div></article>`;}
function checkImageChoice(btn,itemId){const box=btn.parentElement;if(box.dataset.locked==='1')return;const img=imageDeck()[state.imageIndex];const val=btn.dataset.value,answer=btn.dataset.answer;if(val===answer){btn.classList.add('correct');box.dataset.locked='1';complete(itemId,true);showFeedback('imageFeed',`<b>Correct.</b> ${rich(img.why||'Good visual recognition.')}${sourceMeta(img.source)}`);}else{btn.classList.add('wrong');box.dataset.wrong=Number(box.dataset.wrong||0)+1;if(Number(box.dataset.wrong)>=Number(box.dataset.total)-1){box.dataset.locked='1';complete(itemId,false);showFeedback('imageFeed',`<b>Target answer:</b> ${rich(answer)}<br>${rich(img.why||'Review the source clue and try another image.')}${sourceMeta(img.source)}`);}}}
function sourceCoverageTable(){const files=DATA.source_manifest||[];const rows=files.map(f=>`<div class="source-row"><span class="tag source">${esc(f.type)}</span><span>${esc(f.path)}</span><span>${Math.max(1,Math.round(f.bytes/1024))} KB</span></div>`).join('');return `<div class="source-panel">${rows}</div>`}
function imageAtlas(keys){let imgs=DATA.images;if(keys)imgs=imgs.filter(img=>keys.includes(img.key));return `<div class="grid">${imgs.map((img,i)=>`<article class="card"><span class="tag">${esc(img.mode||'Image prompt')}</span><h3>${esc(img.title)}</h3>${zoomableImage(img.data,img.title+' - '+img.source)}<p class="small">${esc(img.source_note||'Source image')} ${img.page?`• page ${esc(img.page)}`:''}</p>${sourceMeta(img.source)}</article>`).join('')}</div>`}
function zoomableImage(src,cap){return `<div class="image-wrap"><img src="${esc(src)}" alt="${esc(cap)}" loading="lazy"><button class="zoom" data-src="${esc(src)}" data-cap="${esc(cap)}" onclick="openLightbox(this.dataset.src,this.dataset.cap)" aria-label="Enlarge image">⌕</button></div>`}
function openLightbox(src,cap){lightboxImg.src=src;lightboxImg.alt=cap;lightboxCaption.textContent=cap;lightbox.classList.add('open');}
function closeLightbox(){lightbox.classList.remove('open');lightboxImg.src='';}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeLightbox();closeGlossaryModal();}});
function drawQuestionDeck(id,d=0){const deck=id==='clinical'?DATA.mcqs:shuffle([...DATA.mcqs,...DATA.mcqs.slice(0,4)]);let idx=state.moduleIndex[id]||0;idx=(idx+d+deck.length)%deck.length;state.moduleIndex[id]=idx;save();const q=deck[idx];const opts=[...q.choices];renderShell(id,id==='clinical'?'Clinical Vignettes':'Boss Round Mixed Review',id==='clinical'?'Original source-aligned questions with full explanations.':'Mixed review reuses missed-topic style and shuffles across modules.',[q.source],`<article class="card question-box">${qnav(id,idx,deck.length,`drawQuestionDeck('${id}')`)}<div class="meta"><span class="tag source">${esc(q.module)}</span><span class="tag source">LO ${esc(q.lo||'source-mapped')}</span><span class="tag">${esc(q.skill)}</span></div><p><b>${rich(q.stem)}</b></p><p>${rich(q.question)}</p><div data-wrong="0" data-total="${opts.length}" data-locked="0">${opts.map(o=>`<button class="choice" onclick="guarded(this,'${esc(o)}','${esc(q.answer)}','${esc(q.why)}','${id}:${idx}','qfeed',${esc(JSON.stringify(q.distractors))},'${esc(q.clue)}')">${esc(o)}</button>`).join('')}</div><button onclick="state.flagged['${id}:${idx}']=!state.flagged['${id}:${idx}'];save();this.textContent=state.flagged['${id}:${idx}']?'Flagged':'Flag question'">Flag question</button><div id="qfeed" class="feedback"></div></article>`);showSection(id);}
function shuffle(a){return a.sort(()=>Math.random()-.5)}
function renderMatchingSection(){}
function showStartupError(e){const dash=document.getElementById('dashboard');if(!dash)return;dash.classList.add('active');dash.innerHTML=`<article class="card question-box"><h2>Platform startup needs a reset</h2><p>The browser preview blocked the interactive startup. This is usually stale local preview storage, not missing content.</p><p class="small">${esc(e&&e.message?e.message:e)}</p><button class="primary" onclick="try{localStorage.removeItem(STORE)}catch(_){};location.reload()">Clear preview state and reload</button></article>`;}

const renderedSections = new Set();
const richCache = new Map();

function rich(s){
  const text=String(s??'');
  if(richCache.has(text))return richCache.get(text);
  const hits=[];
  DATA.glossary.slice().sort((a,b)=>b.term.length-a.term.length).forEach(g=>{
    const re=new RegExp('\\b'+g.term.replace(/[.*+?^$\{\}()|[\]\\]/g,'\\$&')+'\\b','gi');
    let m;
    while((m=re.exec(text))!==null){
      const start=m.index,end=start+m[0].length;
      if(!hits.some(h=>start<h.end&&end>h.start))hits.push({start,end,term:g.term});
      if(m.index===re.lastIndex)re.lastIndex++;
    }
  });
  hits.sort((a,b)=>a.start-b.start);
  let out='',pos=0;
  hits.forEach(h=>{out+=esc(text.slice(pos,h.start));out+=`<span class="term-link" onclick='openTerm(${JSON.stringify(h.term)})'>${esc(text.slice(h.start,h.end))}</span>`;pos=h.end;});
  out+=esc(text.slice(pos));
  richCache.set(text,out);
  return out;
}

function sourcePieces(src){
  return String(src||'Exam 3 source folder').split(';').map(s=>s.trim()).filter(Boolean);
}

function sourceMeta(src){
  const pieces=sourcePieces(src);
  return `<div class="source-list"><b>Source:</b> ${pieces.map(piece=>{
    if(/^https?:\/\//i.test(piece)){
      let host='external source';
      try{host=new URL(piece).hostname.replace(/^www\./,'');}catch(_){}
      return `<span class="source-item"><a class="image-source-link source-path" href="${esc(piece)}" target="_blank" rel="noopener">${esc(host)}</a><span class="source-note">external supplemental image source; license on source page</span></span>`;
    }
    const manifest=SOURCE_LOOKUP.get(piece)||[...SOURCE_LOOKUP.values()].find(item=>item.path&&piece.endsWith(item.path));
    const meta=manifest?`<span class="source-note">${esc(manifest.type)} • ${Math.max(1,Math.round(manifest.bytes/1024))} KB</span>`:'<span class="source-note">course source</span>';
    return `<span class="source-item"><span class="source-path">${esc(piece)}</span>${meta}</span>`;
  }).join('')}</div>`;
}

function sourceBlock(sources){
  if(!sources||!sources.length)return'';
  return `<details class="source-details"><summary>Sources (${sources.length})</summary>${sources.map(sourceMeta).join('')}</details>`;
}

function moduleControls(id){
  return `<div class="toolbar module-actions"><button onclick="showSection('dashboard')">Back</button><button onclick="openGlossaryBrowser()">Glossary</button><button onclick="resetModule('${id}')">Reset module</button><button class="primary" onclick="startChallenge('${id}')">Start challenge</button></div>`;
}

function moduleRail(id){
  if(id==='dashboard')return'';
  const items=[['Top','scrollTo(0,0)'],['Home',`showSection('dashboard')`],['Images',`showSection('visuals')`],['Compare',`showSection('discriminators')`],['Repair',`showSection('repair')`],['LO map',`showSection('objectives')`]];
  return `<aside class="module-rail">${items.map(([label,action])=>`<button class="${label==='Top'?'primary':''}" onclick="${action}">${esc(label)}</button>`).join('')}</aside>`;
}

function qnav(id,idx,total,drawFn){
  const call=(delta)=>{
    const questionMatch=String(drawFn).match(/^drawQuestionDeck\('([^']+)'\)$/);
    if(questionMatch)return `drawQuestionDeck('${questionMatch[1]}',${delta})`;
    return `${drawFn}(${delta})`;
  };
  return `<div class="toolbar"><button onclick="${call(-1)}">Previous question</button><span class="counter">${idx+1}/${total}</span><button onclick="${call(1)}">Next question</button></div>`;
}

function moduleIdForObjective(o){
  return DATA.modules.find(m=>(m.lo_prefixes||[]).some(p=>o.id.startsWith(p+'.')))?.id || 'objectives';
}

function addSearchResult(results, q, kind, title, body, target, score=1){
  const haystack=`${title} ${body}`.toLowerCase();
  if(haystack.includes(q))results.push({kind,title,body,target,score});
}

function globalSearch(query){
  const q=query.trim().toLowerCase();
  if(!q)return[];
  const results=[];
  DATA.modules.forEach(m=>addSearchResult(results,q,'Module',m.title,`${m.desc} ${(m.sources||[]).join(' ')}`,m.id,8));
  DATA.objectives.forEach(o=>addSearchResult(results,q,'Learning objective',`LO ${o.id}: ${o.disease||o.session}`,`${o.session}. ${o.objective}. Concepts: ${(o.concepts||[]).join(', ')}`,moduleIdForObjective(o),7));
  DATA.diseases.forEach(d=>addSearchResult(results,q,'Diagnosis',d.name,`${d.group}. ${d.also||''} ${d.description} ${d.clinical} ${d.testing} ${d.treatment}`,'disease',6));
  DATA.glossary.forEach(g=>addSearchResult(results,q,'Glossary',g.term,`${g.category}. ${g.definition}`,'glossary',5));
  DATA.drugs.forEach(d=>addSearchResult(results,q,'Drug',d.drug,`${d.class} ${d.uses} ${d.mechanism} ${d.adverse}`,'drugs',5));
  DATA.mcqs.forEach((item,i)=>addSearchResult(results,q,'Clinical vignette',`${item.module}: ${item.answer}`,`${item.stem} ${item.question} ${item.why}`,'clinical',4));
  (DATA.lo_drills||[]).forEach(item=>addSearchResult(results,q,'LO drill',`LO ${item.lo}: ${item.answer}`,`${item.stem} ${item.question} ${item.why}`,'mixed',4));
  DATA.discriminators.forEach(item=>addSearchResult(results,q,'Discriminator',item.pair,`${item.stem} ${item.question} ${item.why}`,'discriminators',4));
  DATA.management.forEach(item=>addSearchResult(results,q,'Management',item.title,`${item.stem} ${item.question} ${item.why} ${item.answer}`,'management',4));
  DATA.images.forEach(img=>addSearchResult(results,q,'Image',img.title,`${img.key} ${img.prompt||''} ${img.answer||''} ${img.source||''}`,'visuals',4));
  return results.sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title)).slice(0,SEARCH_LIMIT);
}

function searchPanel(q){
  const results=globalSearch(q);
  const resultHtml=results.length?results.map(r=>`<article class="search-result"><div><span class="tag">${esc(r.kind)}</span></div><h3>${rich(r.title)}</h3><p>${rich(r.body)}</p><button onclick="showSection('${esc(r.target)}')">Open ${esc(r.target)}</button></article>`).join(''):`<article class="card empty-state"><h3>No direct matches</h3><p>Try a diagnosis, region, drug, imaging finding, or learning objective term.</p></article>`;
  return `<article class="card search-panel" aria-live="polite"><span class="tag">Global search</span><h2>${results.length} result${results.length===1?'':'s'} for "${esc(q)}"</h2><p class="small">Search covers modules, objectives, diagnoses, glossary, drugs, image prompts, clinical questions, management rounds, and discriminator drills.</p><div class="search-result-grid">${resultHtml}</div></article>`;
}

function handleGlobalSearchInput(){
  const q=(document.getElementById('search')?.value||'').trim();
  if(q && !document.getElementById('dashboard').classList.contains('active'))showSection('dashboard');
  else renderDashboard();
}

function handleGlobalSearchKey(event){
  if(event.key==='Escape'){
    event.currentTarget.value='';
    renderDashboard();
    return;
  }
  if(event.key!=='Enter')return;
  const q=(event.currentTarget.value||'').trim();
  const first=globalSearch(q)[0];
  if(first)showSection(first.target);
}

function renderDashboard(){
  const q=(document.getElementById('search')?.value||'').trim().toLowerCase();
  const cards=[{id:'objectives',title:'Learning Objective Tracker',tag:'Reference',desc:`${DATA.objectives.length} validated objectives from ${DATA.objective_source||'learning objective spreadsheet'}.`},{id:'glossary',title:'Glossary',tag:'Reference',desc:'Alphabetized terms with term sprint practice.'},{id:'disease',title:'Disease / Diagnosis Index',tag:'Reference',desc:'Searchable disease and diagnosis cards with compact high-yield summaries.'},{id:'drugs',title:'Drug and Mechanism Matrix',tag:'Reference',desc:'Antibiotic, chemotherapy, and osteoprotective medication anchors.'},...DATA.modules.map(m=>({...m,tag:['visuals','hotspots','discriminators','management','repair'].includes(m.id)?'Practice mode':'Practice',desc:`${m.desc} ${loCountForModule(m)} mapped LOs.`}))];
  const body=q?searchPanel(q):`<div class="grid">${cards.map(m=>`<article class="card module-card"><div><span class="tag">${esc(m.tag)}</span><h2>${esc(m.title)}</h2><p>${rich(m.desc)}</p></div><div class="small">${Object.keys(state.completed).filter(k=>k.startsWith(m.id+':')).length} completed</div><button class="primary" onclick="showSection('${m.id}')">Open</button></article>`).join('')}</div>`;
  document.getElementById('dashboard').innerHTML=q?`${body}<div class="stats"></div>${dashboardCockpit()}`:`${dashboardCockpit()}<div class="stats"></div>${body}`;
  renderStats();
  applyMode();
}

function ensureSectionRendered(id){
  if(id==='dashboard')return;
  if(id==='repair'){
    renderRepair();
    renderedSections.add(id);
    return;
  }
  if(renderedSections.has(id))return;
  renderedSections.add(id);
  if(id==='objectives')renderObjectives();
  else if(id==='glossary')renderGlossary();
  else if(id==='disease')renderDisease();
  else if(id==='drugs')renderDrugs();
  else if(id==='visuals')renderVisuals();
  else if(id==='hotspots')renderHotspots();
  else if(id==='discriminators')renderDiscriminators();
  else if(id==='management')renderManagement();
  else if(['infection','injury','genetics','tumors','muscle','ultrasound','regional'].includes(id))renderTopic(id);
  else if(['clinical','mixed'].includes(id))drawQuestionDeck(id,0);
}

function showSection(id){
  const target=document.getElementById(id);
  if(!target)return;
  if(document.getElementById('dashboard').classList.contains('active'))dashboardScroll=window.scrollY;
  if(id==='dashboard')renderDashboard(); else ensureSectionRendered(id);
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  target.classList.add('active');
  if(id==='dashboard')setTimeout(()=>scrollTo(0,dashboardScroll),0);else scrollTo(0,0);
}

function resetModule(id){
  Object.keys(state.completed).filter(k=>k.startsWith(id+':')).forEach(k=>delete state.completed[k]);
  state.missed=state.missed.filter(m=>!m.id.startsWith(id+':'));
  state.moduleIndex[id]=0;
  save();
  renderedSections.delete(id);
  showSection(id);
}

function imageAttribution(img){
  const pieces=[];
  if(img.attribution)pieces.push(`<p class="small"><b>Attribution:</b> ${esc(img.attribution)}</p>`);
  if(img.license_note)pieces.push(`<p class="small"><b>License note:</b> ${esc(img.license_note)}</p>`);
  if(img.remote_url)pieces.push(`<p class="small"><b>Original image URL:</b> <a href="${esc(img.remote_url)}" target="_blank" rel="noopener">open source image</a></p>`);
  return pieces.join('');
}

function imageAtlas(keys){
  let imgs=DATA.images;
  if(keys)imgs=imgs.filter(img=>keys.includes(img.key));
  return `<div class="grid">${imgs.map((img,i)=>`<article class="card"><span class="tag">${esc(img.mode||'Image prompt')}</span><h3>${esc(img.title)}</h3>${zoomableImage(img.data,img.title+' - '+img.source)}<p class="small">${esc(img.source_note||'Source image')} ${img.page?`• page ${esc(img.page)}`:''}</p>${sourceMeta(img.source)}${imageAttribution(img)}</article>`).join('')}</div>`;
}

function loadVisualAtlas(){
  const mount=document.getElementById('visualAtlasMount');
  if(mount)mount.innerHTML=imageAtlas();
}

function renderVisuals(){
  const m=DATA.modules.find(x=>x.id==='visuals');
  const body=`<div class="activity-tabs"><button class="primary" onclick="drawImageQuiz(0)">Quiz current image</button><button onclick="drawImageQuiz(1)">Next image</button><button onclick="document.getElementById('sourceCoverage').scrollIntoView({behavior:'smooth'})">Source coverage</button></div><div id="imageQuiz"></div><details class="card"><summary><b>Full visual atlas</b> - load only when you need the full image bank</summary><div id="visualAtlasMount" class="atlas-placeholder"><p>Atlas images are deferred so the quiz loads fast and hidden images do not inflate the page.</p><button onclick="loadVisualAtlas()">Load visual atlas</button></div></details><article id="sourceCoverage" class="card"><h3>Source coverage</h3>${sourceCoverageTable()}</article>`;
  renderShell('visuals',m.title,m.desc,m.sources,body);
  drawImageQuiz(0);
}

function normalizedQuestion(item,itemId,kind){
  return {...item,itemId,kind};
}

function mixedSourceDeck(){
  const items=[];
  DATA.mcqs.forEach((q,i)=>items.push(normalizedQuestion(q,`clinical:${i}`,'Clinical')));
  (DATA.lo_drills||[]).forEach((q,i)=>items.push(normalizedQuestion(q,`lo:${q.lo||i}`,'LO drill')));
  DATA.management.forEach((m,i)=>items.push(normalizedQuestion({module:m.module,lo:m.lo||'source-mapped',skill:'Management',source:m.source,stem:m.stem,question:m.question,choices:m.choices,answer:m.answer,why:m.why,clue:m.urgency||'Choose the next best action.',distractors:{}},`management:${i}`,'Management')));
  DATA.discriminators.forEach((d,i)=>items.push(normalizedQuestion({module:d.module,lo:d.lo||'source-mapped',skill:'Discriminator',source:d.source,stem:d.stem,question:d.question,choices:d.choices,answer:d.answer,why:d.why,clue:d.pair,distractors:{}},`discriminator:${i}`,'Discriminator')));
  DATA.regional_cases.forEach((c,i)=>items.push(normalizedQuestion({module:c.region,lo:c.lo||'regional',skill:'Regional case',source:c.source,stem:c.stem,question:c.question,choices:c.choices,answer:c.answer,why:c.why,clue:c.title,distractors:{}},`regional-case:${i}`,'Regional case')));
  return items;
}

function stableMixedDeck(){
  const source=mixedSourceDeck();
  if(!Array.isArray(state.mixedOrder)||state.mixedOrder.length!==source.length){
    state.mixedOrder=source.map((_,i)=>i);
    for(let i=state.mixedOrder.length-1;i>0;i--){
      const j=(i*37+17)%state.mixedOrder.length;
      [state.mixedOrder[i],state.mixedOrder[j]]=[state.mixedOrder[j],state.mixedOrder[i]];
    }
    save();
  }
  return state.mixedOrder.map(i=>source[i]).filter(Boolean);
}

function deckForQuestionSection(id){
  return id==='clinical'?DATA.mcqs.map((q,i)=>normalizedQuestion(q,`clinical:${i}`,'Clinical')):stableMixedDeck();
}

function drawQuestionDeck(id,d=0){
  const deck=deckForQuestionSection(id);
  if(!deck.length)return;
  let idx=state.moduleIndex[id]||0;
  idx=(idx+d+deck.length)%deck.length;
  state.moduleIndex[id]=idx;
  save();
  const q=deck[idx];
  const itemId=id==='mixed'?`mixed:${q.itemId}`:`clinical:${idx}`;
  renderShell(id,id==='clinical'?'Clinical Vignettes':'Boss Round Mixed Review',id==='clinical'?'Original source-aligned questions with full explanations.':'Interleaved review across clinical vignettes, LO drills, management, discriminators, and regional cases.',[q.source],`<article class="card question-box">${qnav(id,idx,deck.length,`drawQuestionDeck('${id}')`)}<div class="meta"><span class="tag source">${esc(q.module)}</span><span class="tag source">LO ${esc(q.lo||'source-mapped')}</span><span class="tag">${esc(q.kind||q.skill)}</span></div><p><b>${rich(q.stem)}</b></p><p>${rich(q.question)}</p><div data-wrong="0" data-total="${q.choices.length}" data-locked="0">${q.choices.map(o=>`<button class="choice" onclick="guarded(this,'${esc(o)}','${esc(q.answer)}','${esc(q.why)}','${itemId}','qfeed',${esc(JSON.stringify(q.distractors||{}))},'${esc(q.clue||'Source-aligned discriminator.')}')">${rich(o)}</button>`).join('')}</div><button onclick="state.flagged['${itemId}']=!state.flagged['${itemId}'];save();this.textContent=state.flagged['${itemId}']?'Flagged':'Flag question'">${state.flagged[itemId]?'Flagged':'Flag question'}</button><div id="qfeed" class="feedback"></div></article>`);
  showSection(id);
}

function repairInfo(id){
  let m;
  if((m=id.match(/^mixed:(.+)$/))){
    const x=stableMixedDeck().find(item=>item.itemId===m[1]);
    return x?{id,kind:x.kind||'Mixed',title:x.clue||x.module,stem:x.stem+' '+x.question,choices:x.choices,answer:x.answer,why:x.why,source:x.source,tag:x.module}:null;
  }
  if((m=id.match(/^visuals:(\d+)$/))){const x=imageDeck()[Number(m[1])];return x?{id,kind:'Image',title:x.title,stem:x.prompt,choices:x.choices,answer:x.answer,why:x.why,source:x.source,image:x.data,tag:x.key}:null;}
  if((m=id.match(/^hotspots:(\d+)$/))){const x=hotspotDeck().find(h=>h.index===Number(m[1]));return x?{id,kind:'Hotspot',title:x.title,stem:x.prompt,choices:[x.target,'joint space','normal soft tissue','background artifact'],answer:x.target,why:x.why,source:x.source,image:x.image.data,tag:x.key}:null;}
  if((m=id.match(/^regional-case:(\d+)$/))){const x=DATA.regional_cases[Number(m[1])];return x?{id,kind:'Case',title:x.title,stem:x.stem+' '+x.question,choices:x.choices,answer:x.answer,why:x.why,source:x.source,tag:x.region}:null;}
  if((m=id.match(/^discriminators:(\d+)$/))){const x=DATA.discriminators[Number(m[1])];return x?{id,kind:'Discriminator',title:x.pair,stem:x.stem+' '+x.question,choices:x.choices,answer:x.answer,why:x.why,source:x.source,tag:x.module}:null;}
  if((m=id.match(/^management:(\d+)$/))){const x=DATA.management[Number(m[1])];return x?{id,kind:'Management',title:x.title,stem:x.stem+' '+x.question,choices:x.choices,answer:x.answer,why:x.why,source:x.source,tag:x.module}:null;}
  if((m=id.match(/^clinical:(\d+)$/))){const x=DATA.mcqs[Number(m[1])];return x?{id,kind:'Vignette',title:x.module,stem:x.stem+' '+x.question,choices:x.choices,answer:x.answer,why:x.why,source:x.source,tag:x.skill}:null;}
  if((m=id.match(/^glossary:(\d+)$/))){const x=DATA.glossary[Number(m[1])];return x?{id,kind:'Glossary',title:x.term,stem:x.definition,choices:[x.term,...DATA.glossary.filter(g=>g.term!==x.term).slice(0,3).map(g=>g.term)],answer:x.term,why:x.term+': '+x.definition,source:'Glossary',tag:x.category}:null;}
  return null;
}

function renderAll(){
  try{
    renderedSections.clear();
    renderDashboard();
    renderedSections.add('dashboard');
    applyMode();
    showSection('dashboard');
  }catch(e){
    console.error(e);
    showStartupError(e);
  }
}

window.addEventListener('error',e=>showStartupError(e.error||e.message));
renderAll();
