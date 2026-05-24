import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const originalIndex = path.join(root, "index.html");

function slugify(value) {
  return String(value || "item")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "item";
}

function extractLegacyParts(html) {
  const styleStart = html.indexOf("<style>");
  const styleEnd = html.indexOf("</style>", styleStart);
  const dataStart = html.indexOf("const DATA=") + "const DATA=".length;
  const dataEnd = html.indexOf("\nconst STORE", dataStart);
  const appStart = html.indexOf("const STORE=", dataEnd);
  const renderAllStart = html.indexOf("function renderAll()", appStart);
  const scriptEnd = html.indexOf("</script>", appStart);
  if ([styleStart, styleEnd, dataStart, dataEnd, appStart, renderAllStart, scriptEnd].some((x) => x < 0)) {
    throw new Error("Could not locate legacy style, data, or app script blocks.");
  }
  return {
    css: html.slice(styleStart + "<style>".length, styleEnd).trim(),
    data: JSON.parse(html.slice(dataStart, dataEnd).replace(/;\s*$/, "")),
    appTail: html.slice(appStart, renderAllStart).trim(),
  };
}

const conceptRules = [
  [/disseminated gonococc?ocal infection|disseminated gonococcal arthritis/i, "Disseminated gonococcal infection"],
  [/septic arthritis(?: of the hip)?/i, "Septic arthritis"],
  [/osteomyelitis/i, "Osteomyelitis"],
  [/ankle sprain/i, "Ankle sprain"],
  [/common acute injuries of the knee/i, "Acute knee injuries"],
  [/acromioclavicular joint separation/i, "Acromioclavicular joint separation"],
  [/muscle strain/i, "Muscle strain"],
  [/osteogenesis imperfecta/i, "Osteogenesis imperfecta"],
  [/ehlers[- ]?danlos/i, "Ehlers-Danlos syndrome"],
  [/marfan/i, "Marfan syndrome"],
  [/muscular dystrophy|dystrophy/i, "Muscular dystrophy"],
  [/osteosarcoma/i, "Osteosarcoma"],
  [/ewing/i, "Ewing sarcoma"],
  [/metastatic bone disease/i, "Bone metastases"],
  [/osteoid osteoma/i, "Osteoid osteoma"],
  [/motor unit/i, "Motor unit"],
  [/sliding filament/i, "Sliding filament contraction"],
  [/tropomyosin and troponin|troponin|tropomyosin/i, "Troponin/tropomyosin regulation"],
  [/calcium and the sarcoplasmic reticulum|sarcoplasmic reticulum/i, "Calcium handling"],
  [/mitochondrial myopath/i, "Mitochondrial myopathy"],
  [/glycogen storage/i, "Glycogen storage myopathy"],
  [/myalgia/i, "Myalgia"],
  [/rhabdomyolysis/i, "Rhabdomyolysis"],
  [/fibromyalgia/i, "Fibromyalgia"],
  [/neuroleptic malignant syndrome/i, "Neuroleptic malignant syndrome"],
  [/malignant hyperthermia/i, "Malignant hyperthermia"],
  [/polymyalgia rheumatica/i, "Polymyalgia rheumatica"],
  [/polymyositis/i, "Polymyositis"],
  [/dermatomyositis/i, "Dermatomyositis"],
  [/inclusion body myositis/i, "Inclusion body myositis"],
  [/layers of soft tissue|sonography/i, "Ultrasound anatomy"],
  [/soft tissue edema|fluid collections|solid masses/i, "Ultrasound soft tissue pathology"],
  [/joint effusion|tendon tear|fracture|foreign body|venous thrombosis/i, "Ultrasound extremity pathology"],
  [/arteries and veins/i, "Ultrasound vascular anatomy"],
  [/femoral artery, vein, and nerve/i, "Femoral neurovascular anatomy"],
  [/monoarticular arthritis/i, "Monoarticular arthritis"],
  [/knee pain/i, "Knee pain"],
  [/osteoarthritis of knee|osteoarthritis/i, "Osteoarthritis"],
  [/osgood[- ]schlatter/i, "Osgood-Schlatter disease"],
  [/patellofemoral pain syndrome/i, "Patellofemoral pain syndrome"],
  [/meniscal tear/i, "Meniscal tear"],
  [/cruciate ligament tear|anterior\/posterior cruciate/i, "ACL/PCL tear"],
  [/prepatellar bursitis/i, "Prepatellar bursitis"],
  [/low back pain/i, "Low back pain"],
  [/ankylosing spondylitis/i, "Ankylosing spondylitis"],
  [/scoliosis/i, "Scoliosis"],
  [/spondylolysis/i, "Spondylolysis"],
  [/degenerative disk disease/i, "Degenerative disk disease"],
  [/cauda equina|cord compression/i, "Cauda equina/cord compression"],
  [/intervertebral disc herniation/i, "Intervertebral disc herniation"],
  [/spinal stenosis/i, "Spinal stenosis"],
  [/discitis/i, "Discitis"],
  [/musculoskeletal low back pain|musculoskeletal back pain/i, "Musculoskeletal back pain"],
  [/ankle and foot pain/i, "Ankle and foot pain"],
  [/plantar fasc?iitis|plantar fascitis/i, "Plantar fasciitis"],
  [/tarsal tunnel syndrome/i, "Tarsal tunnel syndrome"],
  [/achilles tendonitis/i, "Achilles tendinopathy"],
  [/hip pain/i, "Hip pain"],
  [/developmental dysplasia of the hip/i, "Developmental dysplasia of the hip"],
  [/legg[- ]calve[- ]perthes/i, "Legg-Calve-Perthes disease"],
  [/slipped capital femoral epiphysis/i, "Slipped capital femoral epiphysis"],
  [/trochanteric bursitis/i, "Trochanteric bursitis"],
  [/osteonecrosis of the hip/i, "Osteonecrosis of the hip"],
  [/transient synovitis/i, "Transient synovitis"],
  [/meralgia paresthetica/i, "Meralgia paresthetica"],
  [/rotator cuff pathology|rotator cuff tear/i, "Rotator cuff pathology"],
  [/shoulder pain/i, "Shoulder pain"],
  [/elbow pain/i, "Elbow pain"],
  [/wrist pain/i, "Wrist pain"],
  [/hand pain/i, "Hand pain"],
  [/medial\/lateral epicondylitis|epicondylitis/i, "Epicondylitis"],
  [/carpal tunnel/i, "Carpal tunnel syndrome"],
  [/scaphoid fracture/i, "Scaphoid fracture"],
  [/little league shoulder/i, "Little League shoulder"],
  [/dupuytrens|dupuytren/i, "Dupuytren contracture"],
];

function conceptsFromText(text) {
  const concepts = [];
  for (const [pattern, concept] of conceptRules) {
    if (pattern.test(text) && !concepts.includes(concept)) concepts.push(concept);
  }
  return concepts;
}

function deriveObjectiveConcepts(objective) {
  const objectiveText = String(objective.objective || "");
  const sessionText = String(objective.session || "");
  const concepts = conceptsFromText(objectiveText);
  if (!concepts.length) concepts.push(...conceptsFromText(sessionText));
  if (!concepts.length) {
    const match = `${objectiveText} ${sessionText}`.match(/diagnose ([^,.]+)|for ([^,]+), based|presenting with ([^.]+)/i);
    if (match) concepts.push((match[1] || match[2] || match[3]).trim());
  }
  return concepts;
}

function sanitizeObjectives(data) {
  data.objectives = data.objectives.map((objective) => {
    const concepts = deriveObjectiveConcepts(objective);
    const raw = objective.disease || "";
    return {
      ...objective,
      source_disease_raw: raw,
      disease: concepts.join("; "),
      concepts,
      disease_validation: raw && raw !== concepts.join("; ") ? "replaced_mismatched_import" : "derived_from_objective_text",
    };
  });
}

function sourceLookup(data) {
  const byPath = new Map();
  for (const source of data.source_manifest || []) byPath.set(source.path, source);
  return byPath;
}

function buildLoDrills(data) {
  const allConcepts = [...new Set(data.objectives.flatMap((o) => o.concepts || []).filter(Boolean))];
  data.lo_drills = data.objectives.map((objective, index) => {
    const answer = objective.concepts?.[0] || objective.session || `LO ${objective.id}`;
    const distractors = allConcepts.filter((concept) => concept !== answer).slice(index % Math.max(1, allConcepts.length), index % Math.max(1, allConcepts.length) + 12);
    while (distractors.length < 4) {
      for (const concept of allConcepts) {
        if (concept !== answer && !distractors.includes(concept)) distractors.push(concept);
        if (distractors.length >= 4) break;
      }
      if (!allConcepts.length) break;
    }
    const choices = [answer, ...distractors.slice(0, 4)].sort((a, b) => a.localeCompare(b));
    return {
      module: "Learning Objective Drill",
      lo: objective.id,
      skill: "LO mapping",
      source: objective.objective_source || data.objective_source || "E3 Learning Objectives.xlsx",
      stem: `${objective.session}: ${objective.objective}`,
      question: "Which concept is this learning objective primarily testing?",
      choices,
      answer,
      clue: `LO ${objective.id} is from ${objective.session}.`,
      why: `This objective is mapped to ${answer}. The previous imported disease field was validated and replaced when it did not match the objective text.`,
      distractors: Object.fromEntries(choices.filter((choice) => choice !== answer).map((choice) => [choice, "A related MSK topic, but not the primary target of this objective."])),
    };
  });
}

async function downloadExternalImage(url, destination) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const contentType = response.headers.get("content-type") || "";
  const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : contentType.includes("gif") ? "gif" : "jpg";
  const buffer = Buffer.from(await response.arrayBuffer());
  const finalPath = destination.replace(/\.[^.]+$/, `.${ext}`);
  await fs.writeFile(path.join(root, finalPath), buffer);
  return finalPath;
}

async function extractImages(data) {
  const imageDir = path.join(root, "assets", "images");
  await fs.mkdir(imageDir, { recursive: true });
  for (let i = 0; i < data.images.length; i += 1) {
    const image = data.images[i];
    const value = String(image.data || "");
    const baseName = `${String(i + 1).padStart(2, "0")}-${slugify(image.title)}`;
    const dataMatch = value.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if (dataMatch) {
      const mime = dataMatch[1];
      const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : mime.includes("gif") ? "gif" : "jpg";
      const rel = `assets/images/${baseName}.${ext}`;
      await fs.writeFile(path.join(root, rel), Buffer.from(dataMatch[2], "base64"));
      image.data = rel;
      image.asset_path = rel;
      image.asset_kind = "local-course-asset";
      image.attribution = image.source || "Course source";
      image.license_note = "Course-derived study asset; use within the local study platform.";
    } else if (/^https?:\/\//i.test(value)) {
      image.remote_url = value;
      image.asset_kind = "external-wikimedia-asset";
      image.attribution = image.source || value;
      image.license_note = "External Wikimedia Commons asset; verify the file page license before redistribution.";
      try {
        const rel = await downloadExternalImage(value, `assets/images/${baseName}.jpg`);
        image.data = rel;
        image.asset_path = rel;
        image.remote_cache_status = "cached";
      } catch (error) {
        image.remote_cache_status = `remote_only: ${error.message}`;
      }
    }
  }
}

function buildCss(css) {
  return `${css}

.skip-link{position:absolute;left:-999px;top:8px;background:#fff;color:#0057b8;border:1px solid #006edb;border-radius:8px;padding:8px 10px;z-index:50}
.skip-link:focus{left:8px}
.choice .term-link{color:inherit;text-decoration:none;font-weight:inherit;pointer-events:none}
.source-list{display:grid;gap:4px}
.source-item{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.source-path{overflow-wrap:anywhere}
.source-note{color:#59677d;font-size:.86rem}
.search-panel{border-left:4px solid #006edb}
.search-result{display:grid;gap:7px;border:1px solid #d9dee7;border-radius:8px;background:#fff;padding:11px 12px}
.search-result h3{margin:0}
.search-result p{margin:0;color:#334155}
.search-result-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px}
.empty-state{padding:24px;text-align:center;color:#59677d}
.atlas-placeholder{border:1px dashed #b8c0cc;border-radius:8px;padding:18px;background:#fbfdff}
.module-actions{align-items:center}
.module-actions button{min-height:36px}
@media(max-width:720px){.search-result-grid{grid-template-columns:1fr}.module-actions{display:grid;grid-template-columns:1fr 1fr;width:100%}}
`;
}

function buildIndex() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MD818 Exam 3 Study Platform</title>
<link rel="stylesheet" href="css/styles.css">
</head>
<body>
<a class="skip-link" href="#main">Skip to study content</a>
<header><div class="wrap"><h1>MD818 Exam 3 Study Platform</h1><p class="sub">MSK Exam 3 - source-scoped interactive review for infection, injury, genetics, tumors, muscle, ultrasound, and regional pain cases.</p><div class="toolbar"><button class="primary" onclick="showSection('dashboard')">Dashboard</button><button class="dark" onclick="openGlossaryBrowser()">Glossary</button><input id="search" class="search" placeholder="Search modules, diseases, drugs, objectives, concepts..." oninput="handleGlobalSearchInput()"><button class="danger" onclick="resetAll()">Reset progress</button></div></div></header>
<main id="main">
<section id="dashboard" class="section active"><article class="card"><h2>Loading platform...</h2><p>If this stays visible, the browser blocked the platform startup script.</p></article></section>
<section id="glossary" class="section"></section>
<section id="disease" class="section"></section>
<section id="drugs" class="section"></section>
<section id="objectives" class="section"></section>
<section id="infection" class="section"></section><section id="injury" class="section"></section><section id="genetics" class="section"></section><section id="tumors" class="section"></section><section id="muscle" class="section"></section><section id="ultrasound" class="section"></section><section id="visuals" class="section"></section><section id="hotspots" class="section"></section><section id="discriminators" class="section"></section><section id="management" class="section"></section><section id="repair" class="section"></section><section id="regional" class="section"></section><section id="clinical" class="section"></section><section id="mixed" class="section"></section>
</main>
<nav class="mobile-dock" aria-label="Mobile study controls"><button onclick="showSection('dashboard')">Home</button><button onclick="showSection('visuals')">Images</button><button onclick="showSection('hotspots')">Hotspot</button><button onclick="showSection('repair')">Repair</button><button onclick="showSection('mixed')">Exam</button></nav>
<div id="glossaryModal" class="modal" onclick="if(event.target===this)closeGlossaryModal()"><div class="modal-card"><div class="modal-head"><h2 id="glossaryModalTitle">Glossary</h2><button onclick="closeGlossaryModal()">Close</button></div><div id="glossaryModalBody" class="modal-body"></div></div></div>
<div id="lightbox" class="lightbox" onclick="if(event.target===this)closeLightbox()"><div class="lightbox-panel"><button class="lightbox-close" onclick="closeLightbox()" aria-label="Close image">X</button><img id="lightboxImg" alt=""><p id="lightboxCaption" style="color:white"></p></div></div>
<noscript><main class="wrap"><article class="card"><h2>JavaScript required</h2><p>This interactive study platform requires JavaScript.</p></article></main></noscript>
<script src="data/platform-data.js"></script>
<script src="js/app.js"></script>
</body>
</html>
`;
}

function buildAppJs(appTail) {
  return `const DATA = window.MSK_DATA;
const SOURCE_LOOKUP = new Map((DATA.source_manifest || []).map((source) => [source.path, source]));
const SEARCH_LIMIT = 36;

${appTail}

const renderedSections = new Set();
const richCache = new Map();

function rich(s){
  const text=String(s??'');
  if(richCache.has(text))return richCache.get(text);
  const hits=[];
  DATA.glossary.slice().sort((a,b)=>b.term.length-a.term.length).forEach(g=>{
    const re=new RegExp('\\\\b'+g.term.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g,'\\\\$&')+'\\\\b','gi');
    let m;
    while((m=re.exec(text))!==null){
      const start=m.index,end=start+m[0].length;
      if(!hits.some(h=>start<h.end&&end>h.start))hits.push({start,end,term:g.term});
      if(m.index===re.lastIndex)re.lastIndex++;
    }
  });
  hits.sort((a,b)=>a.start-b.start);
  let out='',pos=0;
  hits.forEach(h=>{out+=esc(text.slice(pos,h.start));out+=\`<span class="term-link" onclick='openTerm(\${JSON.stringify(h.term)})'>\${esc(text.slice(h.start,h.end))}</span>\`;pos=h.end;});
  out+=esc(text.slice(pos));
  richCache.set(text,out);
  return out;
}

function sourcePieces(src){
  return String(src||'Exam 3 source folder').split(';').map(s=>s.trim()).filter(Boolean);
}

function sourceMeta(src){
  const pieces=sourcePieces(src);
  return \`<div class="source-list"><b>Source:</b> \${pieces.map(piece=>{
    if(/^https?:\\/\\//i.test(piece)){
      let host='external source';
      try{host=new URL(piece).hostname.replace(/^www\\./,'');}catch(_){}
      return \`<span class="source-item"><a class="image-source-link source-path" href="\${esc(piece)}" target="_blank" rel="noopener">\${esc(host)}</a><span class="source-note">external supplemental image source; license on source page</span></span>\`;
    }
    const manifest=SOURCE_LOOKUP.get(piece)||[...SOURCE_LOOKUP.values()].find(item=>item.path&&piece.endsWith(item.path));
    const meta=manifest?\`<span class="source-note">\${esc(manifest.type)} • \${Math.max(1,Math.round(manifest.bytes/1024))} KB</span>\`:'<span class="source-note">course source</span>';
    return \`<span class="source-item"><span class="source-path">\${esc(piece)}</span>\${meta}</span>\`;
  }).join('')}</div>\`;
}

function sourceBlock(sources){
  if(!sources||!sources.length)return'';
  return \`<details class="source-details"><summary>Sources (\${sources.length})</summary>\${sources.map(sourceMeta).join('')}</details>\`;
}

function moduleControls(id){
  return \`<div class="toolbar module-actions"><button onclick="showSection('dashboard')">Back</button><button onclick="openGlossaryBrowser()">Glossary</button><button onclick="resetModule('\${id}')">Reset module</button><button class="primary" onclick="startChallenge('\${id}')">Start challenge</button></div>\`;
}

function moduleRail(id){
  if(id==='dashboard')return'';
  const items=[['Top','scrollTo(0,0)'],['Home',\`showSection('dashboard')\`],['Images',\`showSection('visuals')\`],['Compare',\`showSection('discriminators')\`],['Repair',\`showSection('repair')\`],['LO map',\`showSection('objectives')\`]];
  return \`<aside class="module-rail">\${items.map(([label,action])=>\`<button class="\${label==='Top'?'primary':''}" onclick="\${action}">\${esc(label)}</button>\`).join('')}</aside>\`;
}

function qnav(id,idx,total,drawFn){
  const call=(delta)=>{
    const questionMatch=String(drawFn).match(/^drawQuestionDeck\\('([^']+)'\\)$/);
    if(questionMatch)return \`drawQuestionDeck('\${questionMatch[1]}',\${delta})\`;
    return \`\${drawFn}(\${delta})\`;
  };
  return \`<div class="toolbar"><button onclick="\${call(-1)}">Previous question</button><span class="counter">\${idx+1}/\${total}</span><button onclick="\${call(1)}">Next question</button></div>\`;
}

function moduleIdForObjective(o){
  return DATA.modules.find(m=>(m.lo_prefixes||[]).some(p=>o.id.startsWith(p+'.')))?.id || 'objectives';
}

function addSearchResult(results, q, kind, title, body, target, score=1){
  const haystack=\`\${title} \${body}\`.toLowerCase();
  if(haystack.includes(q))results.push({kind,title,body,target,score});
}

function globalSearch(query){
  const q=query.trim().toLowerCase();
  if(!q)return[];
  const results=[];
  DATA.modules.forEach(m=>addSearchResult(results,q,'Module',m.title,\`\${m.desc} \${(m.sources||[]).join(' ')}\`,m.id,8));
  DATA.objectives.forEach(o=>addSearchResult(results,q,'Learning objective',\`LO \${o.id}: \${o.disease||o.session}\`,\`\${o.session}. \${o.objective}. Concepts: \${(o.concepts||[]).join(', ')}\`,moduleIdForObjective(o),7));
  DATA.diseases.forEach(d=>addSearchResult(results,q,'Diagnosis',d.name,\`\${d.group}. \${d.description} \${d.clinical} \${d.testing} \${d.treatment}\`,'disease',6));
  DATA.glossary.forEach(g=>addSearchResult(results,q,'Glossary',g.term,\`\${g.category}. \${g.definition}\`,'glossary',5));
  DATA.drugs.forEach(d=>addSearchResult(results,q,'Drug',d.drug,\`\${d.class} \${d.uses} \${d.mechanism} \${d.adverse}\`,'drugs',5));
  DATA.mcqs.forEach((item,i)=>addSearchResult(results,q,'Clinical vignette',\`\${item.module}: \${item.answer}\`,\`\${item.stem} \${item.question} \${item.why}\`,'clinical',4));
  (DATA.lo_drills||[]).forEach(item=>addSearchResult(results,q,'LO drill',\`LO \${item.lo}: \${item.answer}\`,\`\${item.stem} \${item.question} \${item.why}\`,'mixed',4));
  DATA.discriminators.forEach(item=>addSearchResult(results,q,'Discriminator',item.pair,\`\${item.stem} \${item.question} \${item.why}\`,'discriminators',4));
  DATA.management.forEach(item=>addSearchResult(results,q,'Management',item.title,\`\${item.stem} \${item.question} \${item.why} \${item.answer}\`,'management',4));
  DATA.images.forEach(img=>addSearchResult(results,q,'Image',img.title,\`\${img.key} \${img.prompt||''} \${img.answer||''} \${img.source||''}\`,'visuals',4));
  return results.sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title)).slice(0,SEARCH_LIMIT);
}

function searchPanel(q){
  const results=globalSearch(q);
  const resultHtml=results.length?results.map(r=>\`<article class="search-result"><div><span class="tag">\${esc(r.kind)}</span></div><h3>\${rich(r.title)}</h3><p>\${rich(r.body)}</p><button onclick="showSection('\${esc(r.target)}')">Open \${esc(r.target)}</button></article>\`).join(''):\`<article class="card empty-state"><h3>No direct matches</h3><p>Try a diagnosis, region, drug, imaging finding, or learning objective term.</p></article>\`;
  return \`<article class="card search-panel"><span class="tag">Global search</span><h2>Results for "\${esc(q)}"</h2><p class="small">Search covers modules, objectives, diagnoses, glossary, drugs, image prompts, clinical questions, management rounds, and discriminator drills.</p><div class="search-result-grid">\${resultHtml}</div></article>\`;
}

function handleGlobalSearchInput(){
  const q=(document.getElementById('search')?.value||'').trim();
  renderDashboard();
  if(q && !document.getElementById('dashboard').classList.contains('active'))showSection('dashboard');
}

function renderDashboard(){
  const q=(document.getElementById('search')?.value||'').trim().toLowerCase();
  const cards=[{id:'objectives',title:'Learning Objective Tracker',tag:'Reference',desc:\`\${DATA.objectives.length} validated objectives from \${DATA.objective_source||'learning objective spreadsheet'}.\`},{id:'glossary',title:'Glossary',tag:'Reference',desc:'Alphabetized terms with term sprint practice.'},{id:'disease',title:'Disease / Diagnosis Index',tag:'Reference',desc:'Searchable disease and diagnosis cards with LO and source metadata.'},{id:'drugs',title:'Drug and Mechanism Matrix',tag:'Reference',desc:'Antibiotic, chemotherapy, and osteoprotective medication anchors.'},...DATA.modules.map(m=>({...m,tag:['visuals','hotspots','discriminators','management','repair'].includes(m.id)?'Practice mode':'Practice',desc:\`\${m.desc} \${loCountForModule(m)} mapped LOs.\`}))];
  const body=q?searchPanel(q):\`<div class="grid">\${cards.map(m=>\`<article class="card module-card"><div><span class="tag">\${esc(m.tag)}</span><h2>\${esc(m.title)}</h2><p>\${rich(m.desc)}</p></div><div class="small">\${Object.keys(state.completed).filter(k=>k.startsWith(m.id+':')).length} completed</div><button class="primary" onclick="showSection('\${m.id}')">Open</button></article>\`).join('')}</div>\`;
  document.getElementById('dashboard').innerHTML=\`\${dashboardCockpit()}<div class="stats"></div>\${body}\`;
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
  if(img.attribution)pieces.push(\`<p class="small"><b>Attribution:</b> \${esc(img.attribution)}</p>\`);
  if(img.license_note)pieces.push(\`<p class="small"><b>License note:</b> \${esc(img.license_note)}</p>\`);
  if(img.remote_url)pieces.push(\`<p class="small"><b>Original image URL:</b> <a href="\${esc(img.remote_url)}" target="_blank" rel="noopener">open source image</a></p>\`);
  return pieces.join('');
}

function imageAtlas(keys){
  let imgs=DATA.images;
  if(keys)imgs=imgs.filter(img=>keys.includes(img.key));
  return \`<div class="grid">\${imgs.map((img,i)=>\`<article class="card"><span class="tag">\${esc(img.mode||'Image prompt')}</span><h3>\${esc(img.title)}</h3>\${zoomableImage(img.data,img.title+' - '+img.source)}<p class="small">\${esc(img.source_note||'Source image')} \${img.page?\`• page \${esc(img.page)}\`:''}</p>\${sourceMeta(img.source)}\${imageAttribution(img)}</article>\`).join('')}</div>\`;
}

function loadVisualAtlas(){
  const mount=document.getElementById('visualAtlasMount');
  if(mount)mount.innerHTML=imageAtlas();
}

function renderVisuals(){
  const m=DATA.modules.find(x=>x.id==='visuals');
  const body=\`<div class="activity-tabs"><button class="primary" onclick="drawImageQuiz(0)">Quiz current image</button><button onclick="drawImageQuiz(1)">Next image</button><button onclick="document.getElementById('sourceCoverage').scrollIntoView({behavior:'smooth'})">Source coverage</button></div><div id="imageQuiz"></div><details class="card"><summary><b>Full visual atlas</b> - load only when you need the full image bank</summary><div id="visualAtlasMount" class="atlas-placeholder"><p>Atlas images are deferred so the quiz loads fast and hidden images do not inflate the page.</p><button onclick="loadVisualAtlas()">Load visual atlas</button></div></details><article id="sourceCoverage" class="card"><h3>Source coverage</h3>\${sourceCoverageTable()}</article>\`;
  renderShell('visuals',m.title,m.desc,m.sources,body);
  drawImageQuiz(0);
}

function normalizedQuestion(item,itemId,kind){
  return {...item,itemId,kind};
}

function mixedSourceDeck(){
  const items=[];
  DATA.mcqs.forEach((q,i)=>items.push(normalizedQuestion(q,\`clinical:\${i}\`,'Clinical')));
  (DATA.lo_drills||[]).forEach((q,i)=>items.push(normalizedQuestion(q,\`lo:\${q.lo||i}\`,'LO drill')));
  DATA.management.forEach((m,i)=>items.push(normalizedQuestion({module:m.module,lo:m.lo||'source-mapped',skill:'Management',source:m.source,stem:m.stem,question:m.question,choices:m.choices,answer:m.answer,why:m.why,clue:m.urgency||'Choose the next best action.',distractors:{}},\`management:\${i}\`,'Management')));
  DATA.discriminators.forEach((d,i)=>items.push(normalizedQuestion({module:d.module,lo:d.lo||'source-mapped',skill:'Discriminator',source:d.source,stem:d.stem,question:d.question,choices:d.choices,answer:d.answer,why:d.why,clue:d.pair,distractors:{}},\`discriminator:\${i}\`,'Discriminator')));
  DATA.regional_cases.forEach((c,i)=>items.push(normalizedQuestion({module:c.region,lo:c.lo||'regional',skill:'Regional case',source:c.source,stem:c.stem,question:c.question,choices:c.choices,answer:c.answer,why:c.why,clue:c.title,distractors:{}},\`regional-case:\${i}\`,'Regional case')));
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
  return id==='clinical'?DATA.mcqs.map((q,i)=>normalizedQuestion(q,\`clinical:\${i}\`,'Clinical')):stableMixedDeck();
}

function drawQuestionDeck(id,d=0){
  const deck=deckForQuestionSection(id);
  if(!deck.length)return;
  let idx=state.moduleIndex[id]||0;
  idx=(idx+d+deck.length)%deck.length;
  state.moduleIndex[id]=idx;
  save();
  const q=deck[idx];
  const itemId=id==='mixed'?\`mixed:\${q.itemId}\`:\`clinical:\${idx}\`;
  renderShell(id,id==='clinical'?'Clinical Vignettes':'Boss Round Mixed Review',id==='clinical'?'Original source-aligned questions with full explanations.':'Interleaved review across clinical vignettes, LO drills, management, discriminators, and regional cases.',[q.source],\`<article class="card question-box">\${qnav(id,idx,deck.length,\`drawQuestionDeck('\${id}')\`)}<div class="meta"><span class="tag source">\${esc(q.module)}</span><span class="tag source">LO \${esc(q.lo||'source-mapped')}</span><span class="tag">\${esc(q.kind||q.skill)}</span></div><p><b>\${rich(q.stem)}</b></p><p>\${rich(q.question)}</p><div data-wrong="0" data-total="\${q.choices.length}" data-locked="0">\${q.choices.map(o=>\`<button class="choice" onclick="guarded(this,'\${esc(o)}','\${esc(q.answer)}','\${esc(q.why)}','\${itemId}','qfeed',\${esc(JSON.stringify(q.distractors||{}))},'\${esc(q.clue||'Source-aligned discriminator.')}')">\${rich(o)}</button>\`).join('')}</div><button onclick="state.flagged['\${itemId}']=!state.flagged['\${itemId}'];save();this.textContent=state.flagged['\${itemId}']?'Flagged':'Flag question'">\${state.flagged[itemId]?'Flagged':'Flag question'}</button><div id="qfeed" class="feedback"></div></article>\`);
  showSection(id);
}

function repairInfo(id){
  let m;
  if((m=id.match(/^mixed:(.+)$/))){
    const x=stableMixedDeck().find(item=>item.itemId===m[1]);
    return x?{id,kind:x.kind||'Mixed',title:x.clue||x.module,stem:x.stem+' '+x.question,choices:x.choices,answer:x.answer,why:x.why,source:x.source,tag:x.module}:null;
  }
  if((m=id.match(/^visuals:(\\d+)$/))){const x=imageDeck()[Number(m[1])];return x?{id,kind:'Image',title:x.title,stem:x.prompt,choices:x.choices,answer:x.answer,why:x.why,source:x.source,image:x.data,tag:x.key}:null;}
  if((m=id.match(/^hotspots:(\\d+)$/))){const x=hotspotDeck().find(h=>h.index===Number(m[1]));return x?{id,kind:'Hotspot',title:x.title,stem:x.prompt,choices:[x.target,'joint space','normal soft tissue','background artifact'],answer:x.target,why:x.why,source:x.source,image:x.image.data,tag:x.key}:null;}
  if((m=id.match(/^regional-case:(\\d+)$/))){const x=DATA.regional_cases[Number(m[1])];return x?{id,kind:'Case',title:x.title,stem:x.stem+' '+x.question,choices:x.choices,answer:x.answer,why:x.why,source:x.source,tag:x.region}:null;}
  if((m=id.match(/^discriminators:(\\d+)$/))){const x=DATA.discriminators[Number(m[1])];return x?{id,kind:'Discriminator',title:x.pair,stem:x.stem+' '+x.question,choices:x.choices,answer:x.answer,why:x.why,source:x.source,tag:x.module}:null;}
  if((m=id.match(/^management:(\\d+)$/))){const x=DATA.management[Number(m[1])];return x?{id,kind:'Management',title:x.title,stem:x.stem+' '+x.question,choices:x.choices,answer:x.answer,why:x.why,source:x.source,tag:x.module}:null;}
  if((m=id.match(/^clinical:(\\d+)$/))){const x=DATA.mcqs[Number(m[1])];return x?{id,kind:'Vignette',title:x.module,stem:x.stem+' '+x.question,choices:x.choices,answer:x.answer,why:x.why,source:x.source,tag:x.skill}:null;}
  if((m=id.match(/^glossary:(\\d+)$/))){const x=DATA.glossary[Number(m[1])];return x?{id,kind:'Glossary',title:x.term,stem:x.definition,choices:[x.term,...DATA.glossary.filter(g=>g.term!==x.term).slice(0,3).map(g=>g.term)],answer:x.term,why:x.term+': '+x.definition,source:'Glossary',tag:x.category}:null;}
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
`;
}

const html = await fs.readFile(originalIndex, "utf8");
const { css, data, appTail } = extractLegacyParts(html);
sanitizeObjectives(data);
buildLoDrills(data);
await extractImages(data);

await fs.mkdir(path.join(root, "css"), { recursive: true });
await fs.mkdir(path.join(root, "js"), { recursive: true });
await fs.mkdir(path.join(root, "data"), { recursive: true });

await fs.writeFile(path.join(root, "css", "styles.css"), buildCss(css));
await fs.writeFile(path.join(root, "data", "platform-data.js"), `window.MSK_DATA = ${JSON.stringify(data)};\n`);
await fs.writeFile(path.join(root, "js", "app.js"), buildAppJs(appTail));
await fs.writeFile(originalIndex, buildIndex());

console.log(JSON.stringify({
  files: ["index.html", "css/styles.css", "data/platform-data.js", "js/app.js"],
  images: data.images.length,
  localImages: data.images.filter((image) => image.asset_path).length,
  objectives: data.objectives.length,
  loDrills: data.lo_drills.length,
}, null, 2));
