import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(root, "data", "platform-data.js");

function parseData(text) {
  const prefix = "window.MSK_DATA = ";
  if (!text.startsWith(prefix)) throw new Error("Unexpected platform data wrapper.");
  return JSON.parse(text.slice(prefix.length).replace(/;\s*$/, ""));
}

function writeData(data) {
  return `window.MSK_DATA = ${JSON.stringify(data)};\n`;
}

function upsertBy(items, keyFn, item) {
  const key = keyFn(item);
  const idx = items.findIndex((x) => keyFn(x) === key);
  if (idx >= 0) items[idx] = { ...items[idx], ...item };
  else items.push(item);
}

function addUniqueBy(items, keyFn, item) {
  const key = keyFn(item);
  if (!items.some((x) => keyFn(x) === key)) items.push(item);
}

function sourceFor(module, data) {
  const S = data.sources;
  return {
    infection: S.septic,
    injury: S.sprains,
    genetics: S.genetic,
    tumors: S.tumors,
    muscle: S.muscle,
    ultrasound: S.ultrasound,
    regional: [S.redhot, S.knee, S.back, S.ankle, S.hip, S.upper].filter(Boolean).join("; "),
  }[module] || "Exam 3 source folder";
}

const text = await fs.readFile(dataPath, "utf8");
const data = parseData(text);

data.diseases ||= [];
data.glossary ||= [];
data.flashcards ||= [];
data.mcqs ||= [];
data.diagnosis_coverage ||= [];

const diseaseRepairs = [
  {
    module: "infection", group: "Infection: Joint", lo: "02.02, 02.03", name: "Disseminated gonococcal infection",
    also: "DGI; gonococcal arthritis when the joint is the dominant manifestation",
    description: "Systemic Neisseria gonorrhoeae infection that can present with migratory polyarthralgia, tenosynovitis, dermatitis, or purulent arthritis.",
    clinical: "Young sexually active patient; fever may be mild; asymmetric migratory joint pain, wrist/ankle/knee involvement, tenosynovitis, and dermatitis raise suspicion.",
    testing: "Obtain synovial fluid when a joint is involved, plus NAAT testing from exposed mucosal sites; do not wait on a positive synovial culture if the syndrome fits.",
    treatment: "Treat promptly with ceftriaxone-based therapy and cover likely chlamydial coinfection when not excluded; drain a purulent joint when present."
  },
  {
    module: "infection", group: "Infection: Joint", lo: "02.03", name: "Disseminated gonococcal arthritis",
    also: "Purulent arthritis pattern of disseminated gonococcal infection",
    description: "A septic-arthritis phenotype caused by disseminated gonococcal infection rather than typical nongonococcal monoarticular bacterial arthritis.",
    clinical: "Tenosynovitis, dermatitis, migratory arthralgia, or sexual exposure history separates it from a purely local septic joint presentation.",
    testing: "Joint aspiration remains important, but mucosal NAAT often has higher yield than synovial culture.",
    treatment: "Ceftriaxone-centered antimicrobial therapy, partner/sexual health management, and drainage when the joint is purulent."
  },
  {
    module: "injury", group: "Soft Tissue Injury", lo: "03.03, 16.07", name: "Acromioclavicular joint separation",
    also: "AC separation; shoulder separation",
    description: "Injury to the acromioclavicular and coracoclavicular ligament complex after direct shoulder impact or fall onto the shoulder.",
    clinical: "Focal AC joint pain, tenderness, pain with cross-body adduction, and possible step-off deformity depending on grade.",
    testing: "Compare shoulder radiographs when deformity or higher grade injury is suspected.",
    treatment: "Most low-grade injuries use sling, analgesia, and progressive return; high-grade displacement or athletic/occupational needs may need orthopedic referral."
  },
  {
    module: "injury", group: "Soft Tissue Injury", lo: "03.04", name: "Muscle strain",
    also: "Pulled muscle; musculotendinous strain",
    description: "Overstretch or tear of muscle fibers, usually at the musculotendinous junction.",
    clinical: "Acute localized pain after eccentric loading, tenderness, pain with resisted contraction, and swelling or bruising when more severe.",
    testing: "Usually clinical; ultrasound or MRI is reserved for uncertain diagnosis, high-grade injury, or return-to-play decisions.",
    treatment: "Relative rest, protected loading, compression, early pain-limited motion, and graded rehabilitation."
  },
  {
    module: "muscle", group: "Myalgia / Myopathy", lo: "08.09", name: "Polymyalgia rheumatica",
    also: "PMR",
    description: "Inflammatory syndrome of older adults with proximal shoulder and hip girdle pain and stiffness rather than true destructive muscle disease.",
    clinical: "Age over 50, bilateral shoulder/hip stiffness, morning stiffness, elevated inflammatory markers, and concern for giant cell arteritis symptoms.",
    testing: "ESR/CRP support the diagnosis; CK is typically normal, which helps separate PMR from inflammatory myositis or rhabdomyolysis.",
    treatment: "Low-dose glucocorticoids are typical first-line therapy; screen for headache, jaw claudication, or vision symptoms that suggest giant cell arteritis."
  },
  {
    module: "ultrasound", group: "Ultrasound Finding", lo: "10.02", name: "Soft tissue edema",
    also: "Cobblestoning on ultrasound",
    description: "Increased fluid in subcutaneous tissues creating echogenic fat lobules separated by hypoechoic fluid bands.",
    clinical: "Supports cellulitis, trauma-related swelling, venous/lymphatic congestion, or inflammatory soft tissue change depending on context.",
    testing: "Use linear probe, compare sides, and distinguish diffuse edema from a focal drainable collection.",
    treatment: "Management follows the cause; the ultrasound task is to decide whether there is a collection, mass, tendon injury, or vascular problem."
  },
  {
    module: "ultrasound", group: "Ultrasound Finding", lo: "10.02", name: "Fluid collection",
    also: "Abscess; seroma; hematoma when clinically matched",
    description: "Focal anechoic or hypoechoic pocket that may show posterior acoustic enhancement and internal debris.",
    clinical: "Tender swelling, fluctuance, erythema, trauma, or post-procedure history directs the differential.",
    testing: "Compressibility, internal echoes, peripheral hyperemia, and dynamic motion help separate simple fluid, abscess, hematoma, and cyst.",
    treatment: "Drainage is considered when the clinical picture and ultrasound suggest a drainable abscess or symptomatic collection."
  },
  {
    module: "ultrasound", group: "Ultrasound Finding", lo: "10.02", name: "Solid mass",
    also: "Soft tissue mass on ultrasound",
    description: "A non-fluid focal lesion with tissue echotexture, variable vascularity, and less posterior enhancement than a simple collection.",
    clinical: "Persistent, enlarging, deep, painful, or vascular masses need more cautious evaluation.",
    testing: "Assess size, depth, margins, echogenicity, vascularity, and relationship to fascia; escalate uncertain or concerning masses.",
    treatment: "Avoid treating as abscess unless fluid is present; suspicious masses require definitive imaging or referral."
  },
  {
    module: "ultrasound", group: "Ultrasound Finding", lo: "10.03", name: "Joint effusion",
    also: "Intra-articular fluid",
    description: "Excess fluid in a joint recess, seen as an anechoic or hypoechoic distention of the capsule or bursa region.",
    clinical: "Supports inflammatory, infectious, traumatic, or degenerative joint pathology depending on the joint and symptoms.",
    testing: "Use the expected recess for the joint, compare sides, and consider aspiration when septic arthritis or crystal arthritis is possible.",
    treatment: "Treat the underlying cause; urgent aspiration is important for a red, hot, swollen joint with infection concern."
  },
  {
    module: "ultrasound", group: "Ultrasound Finding", lo: "10.03", name: "Tendon tear",
    also: "Partial or full-thickness tendon disruption",
    description: "Loss of normal fibrillar tendon continuity, often with focal hypoechoic gap, retraction, or dynamic separation.",
    clinical: "Pain, weakness, traumatic pop, or loss of function supports a clinically meaningful tear.",
    testing: "Scan in long and short axis, correct anisotropy, and use dynamic assessment to confirm fiber discontinuity.",
    treatment: "Immobilize or refer for major functional tears; milder partial tears use protected rehab based on site and severity."
  },
  {
    module: "ultrasound", group: "Ultrasound Finding", lo: "10.03", name: "Foreign body",
    also: "Retained soft tissue foreign body",
    description: "Echogenic object in soft tissue, commonly with shadowing, reverberation, or surrounding hypoechoic inflammatory halo.",
    clinical: "Puncture wound, persistent focal pain, drainage, or sensation of retained material raises suspicion.",
    testing: "Scan in two planes and mark the depth/orientation before removal attempts.",
    treatment: "Remove when symptomatic, infected, high-risk, or accessible; avoid blind probing near critical structures."
  },
  {
    module: "ultrasound", group: "Ultrasound Vascular", lo: "10.03", name: "Venous thrombosis",
    also: "DVT on compression ultrasound",
    description: "Thrombus in a vein, classically suggested by failure of the vein to fully compress with probe pressure.",
    clinical: "Unilateral swelling, pain, risk factors, and a noncompressible vein make thrombosis a priority diagnosis.",
    testing: "Compression is the key maneuver; Doppler augments flow assessment but does not replace compression technique.",
    treatment: "Escalate according to thrombosis location and risk; suspected proximal DVT needs prompt definitive management."
  },
  {
    module: "regional", group: "Red Hot Swollen Joint", lo: "11.01, 11.05, 11.09", name: "Monoarticular arthritis",
    also: "Acute monoarthritis",
    description: "One inflamed joint; the platform focus is triage of septic arthritis, crystal disease, trauma, and inflammatory mimics.",
    clinical: "Hot swollen joint, fever, inability to bear weight, immunosuppression, or severe pain with passive motion are high-risk features.",
    testing: "Arthrocentesis is central when infection or crystals are possible; do not rely on serum markers alone.",
    treatment: "Treat septic arthritis as an emergency while diagnostic workup proceeds."
  },
  {
    module: "regional", group: "Back Pain", lo: "13.02", name: "Axial spondyloarthritis",
    also: "AxSpA; ankylosing spondylitis spectrum",
    description: "Inflammatory back pain syndrome on the axial spondyloarthritis spectrum; ankylosing spondylitis is the radiographic/classic form emphasized by the LO.",
    clinical: "Back pain starting at younger age, morning stiffness, improvement with exercise rather than rest, alternating buttock pain, and possible extra-articular features.",
    testing: "Look for sacroiliitis pattern and inflammatory features; radiographs or MRI are used depending on duration and suspicion.",
    treatment: "Exercise/physical therapy and anti-inflammatory therapy are core; persistent inflammatory disease needs rheumatology-directed management."
  },
  {
    module: "regional", group: "Back Pain", lo: "13.03", name: "Scoliosis",
    also: "Spinal curvature",
    description: "Lateral spinal curvature with rotation; in this platform it is a back pain differential and exam/radiograph recognition item.",
    clinical: "Asymmetric shoulder or rib prominence, abnormal Adams forward bend test, or chronic mechanical symptoms.",
    testing: "Standing radiographs quantify Cobb angle when clinically indicated.",
    treatment: "Observation, bracing, or referral depends on age, curve magnitude, progression, and symptoms."
  },
  {
    module: "regional", group: "Back Pain", lo: "13.01", name: "Kyphosis",
    also: "Excess sagittal thoracic curvature",
    description: "Exaggerated posterior spinal curvature that belongs in the posture/spinal-deformity differential for back pain.",
    clinical: "Rounded thoracic posture, pain with prolonged posture or extension demands, and concern for structural deformity when rigid or progressive.",
    testing: "Standing spine radiographs quantify curvature when deformity is clinically meaningful or progressive.",
    treatment: "Postural/extension strengthening and observation for flexible mild cases; bracing or referral is considered for progressive structural kyphosis."
  },
  {
    module: "regional", group: "Back Pain", lo: "13.04", name: "Spondylolysis",
    also: "Pars interarticularis stress injury",
    description: "Stress injury or defect of the pars interarticularis, classically producing extension-related low back pain in adolescents or athletes.",
    clinical: "Back pain worsened by extension, sports with repetitive hyperextension, hamstring tightness, and focal lumbar discomfort.",
    testing: "Radiographs may be used initially; advanced imaging is considered when suspicion remains or symptoms persist.",
    treatment: "Activity modification, core/hip rehabilitation, and gradual return to sport; refer for neurologic symptoms or refractory pain."
  },
  {
    module: "regional", group: "Back Pain", lo: "13.05", name: "Degenerative disk disease",
    also: "Degenerative disc disease",
    description: "Age- and load-related disc degeneration that can contribute to chronic axial mechanical low back pain.",
    clinical: "Activity-related axial pain, stiffness, and recurrent mechanical flares without infection, cancer, fracture, or cauda equina signs.",
    testing: "Imaging is not routine early without red flags because degenerative findings are common and must match the clinical picture.",
    treatment: "Exercise-based care, activity maintenance, analgesics when appropriate, and escalation only for persistent disabling or neurologic features."
  },
  {
    module: "regional", group: "Back Pain", lo: "13.06, 13.12", name: "Cauda equina syndrome/cord compression",
    also: "Cauda equina/cord compression; spinal cord compression",
    description: "Neurologic emergency from compression of cauda equina nerve roots or spinal cord structures.",
    clinical: "Saddle anesthesia, urinary retention or incontinence, bowel dysfunction, progressive bilateral neurologic deficits, or myelopathic signs.",
    testing: "Urgent MRI is the key test when suspected; do not delay for routine outpatient workup.",
    treatment: "Emergency spine/neurosurgical consultation and decompression-directed management when confirmed or strongly suspected."
  },
  {
    module: "regional", group: "Back Pain", lo: "13.07, 13.14", name: "Intervertebral disc herniation",
    also: "Herniated disc; lumbar radiculopathy source",
    description: "Disc material protrudes and can compress or irritate a nerve root.",
    clinical: "Radiating leg pain, dermatomal sensory symptoms, reflex change, or pain worsened by maneuvers that increase nerve tension.",
    testing: "MRI is reserved for severe/progressive neurologic deficits, red flags, or persistent symptoms after conservative care.",
    treatment: "Initial conservative management unless red flags or progressive neurologic compromise are present."
  },
  {
    module: "regional", group: "Back Pain", lo: "13.09", name: "Discitis",
    also: "Vertebral osteomyelitis/disc space infection",
    description: "Infection involving the intervertebral disc space and adjacent vertebral endplates.",
    clinical: "Persistent back pain with fever, bacteremia risk, immunosuppression, or elevated inflammatory markers.",
    testing: "MRI is the key imaging test; cultures guide antibiotics.",
    treatment: "Urgent evaluation, targeted antimicrobials, and specialist involvement when neurologic compromise or abscess is possible."
  },
  {
    module: "regional", group: "Back Pain", lo: "13.08", name: "Spinal stenosis",
    also: "Lumbar spinal stenosis; neurogenic claudication",
    description: "Narrowing of the spinal canal or foramina producing exertional leg symptoms from neural compression.",
    clinical: "Leg pain, numbness, or weakness with walking or standing that improves with sitting or lumbar flexion.",
    testing: "MRI is used when symptoms are persistent, severe, neurologic, or when procedural/surgical decisions are being considered.",
    treatment: "Flexion-biased exercise, activity modification, analgesics when appropriate, injections or surgery for selected persistent neurologic limitation."
  },
  {
    module: "regional", group: "Back Pain", lo: "13.10, 13.13", name: "Musculoskeletal low back pain",
    also: "Mechanical low back pain; nonspecific low back pain",
    description: "Back pain without objective red-flag, radicular, infectious, inflammatory, fracture, or cord/cauda equina features.",
    clinical: "Pain related to activity, posture, or strain with preserved neurologic function and no systemic warning signs.",
    testing: "Avoid routine imaging early when no red flags are present.",
    treatment: "Reassurance, activity as tolerated, NSAIDs/acetaminophen when appropriate, and exercise-based recovery."
  },
  {
    module: "regional", group: "Foot and Ankle", lo: "03.01, 03.05, 14.03, 14.06", name: "Ankle sprain",
    also: "Lateral ankle ligament sprain; inversion ankle sprain",
    description: "Stretch or tear of the ankle ligament complex, most often the lateral ligaments after inversion injury.",
    clinical: "Lateral ankle pain, swelling, ecchymosis, tenderness over ATFL/CFL region, and difficulty bearing weight depending on grade.",
    testing: "Use Ottawa-style bony tenderness/weight-bearing logic to decide on radiographs; grade instability and compare neurovascular status.",
    treatment: "Functional support, protected weight-bearing, early range of motion, progressive strengthening/proprioception, and referral for fracture or high-grade instability."
  },
  {
    module: "regional", group: "Foot and Ankle", lo: "14.02, 14.07", name: "Plantar fasciitis",
    also: "Plantar fascitis spelling variant; plantar heel pain",
    description: "Overload/degeneration of the plantar fascia causing inferior heel pain.",
    clinical: "Sharp plantar medial heel pain that is worst with first steps after rest and improves after warming up.",
    testing: "Clinical diagnosis; focal plantar fascia origin tenderness is more important than routine imaging.",
    treatment: "Stretching of plantar fascia/calf, footwear or orthotic support, activity modification, and gradual load management."
  },
  {
    module: "regional", group: "Foot and Ankle", lo: "14.04", name: "Tarsal tunnel syndrome",
    also: "Posterior tibial nerve entrapment",
    description: "Compression neuropathy of the posterior tibial nerve or branches as they pass through the tarsal tunnel.",
    clinical: "Burning, tingling, or numbness in the plantar foot, often worsened by standing or activity, sometimes with Tinel sign posterior to medial malleolus.",
    testing: "Clinical localization first; electrodiagnostics or imaging are used for uncertain, persistent, or mass-related cases.",
    treatment: "Reduce compression, footwear/orthotic changes, anti-inflammatory measures when appropriate, and referral for refractory or structural compression."
  },
  {
    module: "regional", group: "Foot and Ankle", lo: "14.05", name: "Achilles tendonitis",
    also: "Achilles tendinopathy; Achilles tendinitis",
    description: "Painful overuse tendinopathy of the Achilles tendon, usually midportion or insertional.",
    clinical: "Posterior heel or calf-tendon pain with activity, tendon thickening/tenderness, and pain with resisted plantarflexion or loading.",
    testing: "Clinical diagnosis; ultrasound or MRI is reserved for uncertain diagnosis, severe symptoms, or rupture concern.",
    treatment: "Activity/load modification, heel lift when helpful, progressive calf strengthening/eccentric loading, and rupture precautions."
  },
  {
    module: "regional", group: "Foot and Ankle", lo: "14.01 source-level foot differential", name: "Hallux deformity",
    also: "Hallux valgus; bunion; hallux rigidus comparator",
    description: "Forefoot deformity category involving abnormal great-toe alignment or motion, commonly hallux valgus or hallux rigidus.",
    clinical: "Medial first MTP prominence, great-toe deviation, shoe-wear pain, reduced first-MTP motion, or pain with push-off.",
    testing: "Weight-bearing foot radiographs are used when severity, arthritis, or operative planning matters.",
    treatment: "Wide toe-box footwear, padding/orthotics, activity modification, and referral for progressive deformity, arthritis, or refractory pain."
  },
  {
    module: "regional", group: "Hip Pain", lo: "15.04", name: "Developmental dysplasia of the hip",
    also: "DDH",
    description: "Abnormal development or instability of the acetabulum/femoral head relationship.",
    clinical: "Infant hip instability, asymmetric abduction or thigh folds, or later gait abnormality depending on age.",
    testing: "Ultrasound is used in young infants; radiographs become more useful with ossification.",
    treatment: "Early orthopedic-directed positioning or bracing; delayed cases may need reduction or surgery."
  },
  {
    module: "regional", group: "Hip Pain", lo: "15.05", name: "Legg-Calve-Perthes disease",
    also: "Perthes disease",
    description: "Idiopathic osteonecrosis of the femoral head in children.",
    clinical: "Child with limp, hip/groin/thigh/knee pain, and limited internal rotation or abduction.",
    testing: "AP pelvis and frog-leg lateral radiographs; MRI can detect early disease.",
    treatment: "Orthopedic management to maintain femoral head containment and range of motion."
  },
  {
    module: "regional", group: "Hip Pain", lo: "15.06", name: "Slipped capital femoral epiphysis",
    also: "SCFE",
    description: "Displacement of the proximal femoral epiphysis through the growth plate.",
    clinical: "Adolescent with limp and hip, groin, thigh, or knee pain; classically limited internal rotation.",
    testing: "AP pelvis and frog-leg lateral radiographs unless unstable; avoid forcing motion.",
    treatment: "Non-weight-bearing and urgent orthopedic fixation."
  },
  {
    module: "regional", group: "Hip Pain", lo: "15.07", name: "Trochanteric bursitis",
    also: "Greater trochanteric pain syndrome",
    description: "Lateral hip pain syndrome involving trochanteric bursa, gluteal tendons, or adjacent soft tissues.",
    clinical: "Lateral hip tenderness, pain lying on the affected side, and pain with resisted abduction.",
    testing: "Usually clinical; imaging is used when diagnosis is uncertain or symptoms persist.",
    treatment: "Activity modification, NSAIDs when appropriate, physical therapy focused on hip abductors, and selected injections."
  },
  {
    module: "regional", group: "Hip Pain", lo: "15.02", name: "Osteonecrosis of the hip",
    also: "Avascular necrosis of femoral head",
    description: "Compromised blood supply to the femoral head leading to bone death and possible collapse.",
    clinical: "Groin pain, limp, pain with internal rotation; risk factors include steroids, alcohol, trauma, and hemoglobinopathy.",
    testing: "MRI detects early osteonecrosis before radiographs become obvious.",
    treatment: "Early orthopedic referral; management depends on collapse stage and symptoms."
  },
  {
    module: "regional", group: "Hip Pain", lo: "15.11", name: "Meralgia paresthetica",
    also: "Lateral femoral cutaneous nerve entrapment",
    description: "Sensory neuropathy from compression of the lateral femoral cutaneous nerve.",
    clinical: "Burning, numbness, or paresthesia over the anterolateral thigh without motor weakness.",
    testing: "Clinical diagnosis; evaluate provoking tight garments, obesity, pregnancy, diabetes, or prior procedures.",
    treatment: "Remove compression, weight/risk modification, neuropathic pain measures if needed, and reassurance when mild."
  },
  {
    module: "regional", group: "Upper Extremity", lo: "16.06", name: "Medial/lateral epicondylitis",
    also: "Golfer elbow; tennis elbow",
    description: "Tendinopathy at the medial or lateral elbow epicondyle from repetitive wrist flexor or extensor loading.",
    clinical: "Point tenderness at epicondyle and pain with resisted wrist flexion/pronation or extension/supination.",
    testing: "Clinical diagnosis; imaging is reserved for atypical or refractory cases.",
    treatment: "Activity modification, counterforce bracing, progressive tendon loading, and selected injections after conservative care."
  },
  {
    module: "regional", group: "Upper Extremity", lo: "16.08", name: "Carpal tunnel syndrome",
    also: "Carpal tunnel; median nerve compression at the wrist",
    description: "Median neuropathy at the carpal tunnel causing sensory symptoms and, when advanced, thenar weakness.",
    clinical: "Numbness or tingling in the thumb, index, middle, and radial ring finger distribution, often worse at night or with wrist flexion.",
    testing: "Clinical maneuvers and distribution guide diagnosis; electrodiagnostic testing is used for uncertain, severe, or preoperative cases.",
    treatment: "Night splinting, ergonomic/activity changes, steroid injection in selected cases, and surgical release for severe or refractory disease."
  },
  {
    module: "regional", group: "Upper Extremity", lo: "16.09", name: "Scaphoid fracture",
    also: "Navicular fracture of wrist",
    description: "Fracture of the scaphoid after fall on an outstretched hand, important because missed injury risks nonunion or avascular necrosis.",
    clinical: "Anatomic snuffbox tenderness, scaphoid tubercle tenderness, and pain with axial thumb loading.",
    testing: "Initial radiographs can be negative; immobilize and repeat imaging or obtain advanced imaging when suspicion remains.",
    treatment: "Thumb-spica immobilization and orthopedic follow-up when suspected or confirmed."
  },
  {
    module: "regional", group: "Upper Extremity", lo: "16.10", name: "Rotator cuff tear",
    also: "Full or partial thickness rotator cuff tear",
    description: "Tear of rotator cuff tendon fibers, often supraspinatus, causing shoulder pain and weakness.",
    clinical: "Painful arc, night pain, weakness with abduction or external rotation, or traumatic inability to raise the arm.",
    testing: "Exam localizes involved cuff; ultrasound or MRI confirms tear when management depends on severity.",
    treatment: "Physical therapy for many degenerative tears; acute traumatic weakness or major functional deficit needs prompt referral."
  },
  {
    module: "regional", group: "Upper Extremity", lo: "16.11", name: "Little League shoulder",
    also: "Proximal humeral epiphysiolysis",
    description: "Overuse injury of the proximal humeral growth plate in throwing athletes.",
    clinical: "Youth thrower with lateral shoulder pain, decreased throwing velocity or control, and proximal humeral tenderness.",
    testing: "Radiographs may show widening of the proximal humeral physis.",
    treatment: "Rest from throwing, rehab, and gradual return-to-throwing progression."
  },
  {
    module: "regional", group: "Upper Extremity", lo: "16.12", name: "Dupuytren contracture",
    also: "Palmar fibromatosis",
    description: "Fibroproliferative palmar fascia disease causing nodules and flexion contractures, usually ring and small fingers.",
    clinical: "Palmar nodules, cords, and progressive inability to lay the hand flat.",
    testing: "Clinical diagnosis; measure contracture severity and functional limitation.",
    treatment: "Observation when mild; collagenase injection, needle aponeurotomy, or surgery when function is impaired."
  }
];

for (const item of diseaseRepairs) {
  upsertBy(data.diseases, (x) => String(x.name).toLowerCase(), { ...item, source: sourceFor(item.module, data) });
  addUniqueBy(data.glossary, (x) => String(x.term).toLowerCase(), {
    term: item.name,
    category: item.group,
    definition: `${item.description} Key exam anchor: ${item.clinical}`,
  });
  addUniqueBy(data.flashcards, (x) => String(x.front).toLowerCase(), {
    front: `${item.name} anchor`,
    back: `${item.clinical} Testing: ${item.testing} Treatment: ${item.treatment}`,
    source: sourceFor(item.module, data),
  });
}

const supplementalGlossary = [
  ["Marfan's Syndrome", "Connective tissue disorder also listed as Marfan syndrome; exam anchors include tall habitus, lens findings, and aortic root risk.", "Genetics"],
  ["Common acute injuries of the knee", "Knee pain category covering ligament tears, meniscal injury, patellofemoral pain, bursitis, apophysitis, and acute traumatic patterns.", "Regional Knee"],
  ["Anterior/posterior cruciate ligament tear", "ACL/PCL injury pattern; ACL classically follows pivoting/noncontact injury while PCL is associated with posterior tibial force.", "Regional Knee"],
  ["Osgood-Schlatter", "Traction apophysitis at the tibial tubercle in an adolescent with anterior knee pain.", "Regional Knee"],
  ["Osteoarthritis of knee", "Degenerative knee joint disease with activity-related pain, stiffness, crepitus, and chronic functional limitation.", "Regional Knee"],
  ["Musculoskeletal back pain", "Mechanical back pain without red-flag, radicular, infectious, inflammatory, or cord/cauda equina features.", "Back Pain"],
  ["Cauda equina/cord compression", "Emergency back pain pattern with neurologic compromise such as saddle anesthesia, bowel/bladder symptoms, progressive weakness, or myelopathic signs.", "Back Pain"],
  ["Rotator cuff pathology", "Shoulder pain category involving rotator cuff tendinopathy, impingement, or tear identified by pain/weakness patterns on exam.", "Upper Extremity"],
  ["Carpal tunnel", "Median neuropathy at the wrist causing paresthesias in the thumb, index, middle, and radial ring finger distribution.", "Upper Extremity"],
  ["Septic arthritis of the hip", "Hip septic arthritis is an emergency presentation with fever, inability to bear weight, and painful limited range of motion.", "Hip Pain"],
  ["Transient synovitis", "Self-limited pediatric hip inflammation that must be separated from septic arthritis.", "Hip Pain"],
  ["Plantar fasciitis", "Inferior heel pain from plantar fascia overload, worst with first steps after rest.", "Foot and Ankle"],
  ["Tarsal tunnel syndrome", "Posterior tibial nerve compression causing plantar foot paresthesias or burning pain.", "Foot and Ankle"],
  ["Achilles tendonitis", "Posterior heel pain from Achilles tendinopathy, often activity-related with tendon tenderness.", "Foot and Ankle"],
  ["Fracture", "Cortical disruption or bony injury; ultrasound may identify cortical step-off in selected superficial bones, while radiographs remain the usual first test.", "Ultrasound Finding"]
];

for (const [term, definition, category] of supplementalGlossary) {
  addUniqueBy(data.glossary, (x) => String(x.term).toLowerCase(), { term, definition, category });
}

const newQuestions = [
  {
    module: "Infection",
    lo: "02.02",
    skill: "Diagnosis discriminator",
    source: data.sources.septic,
    stem: "A young adult has migratory arthralgia, tenosynovitis, small pustular skin lesions, and a swollen wrist.",
    question: "Which diagnosis best matches this pattern?",
    choices: ["Disseminated gonococcal infection", "Osteomyelitis", "Osteoarthritis", "Polymyalgia rheumatica"],
    answer: "Disseminated gonococcal infection",
    clue: "Migratory arthralgia plus tenosynovitis and dermatitis.",
    why: "DGI can present with arthritis-dermatitis syndrome and may evolve into purulent gonococcal arthritis.",
    distractors: {
      Osteomyelitis: "Bone infection causes focal bone pain and imaging/lab patterns rather than migratory tenosynovitis dermatitis.",
      Osteoarthritis: "OA is a chronic mechanical joint disease, not an infectious migratory syndrome.",
      "Polymyalgia rheumatica": "PMR causes proximal stiffness in older adults and usually has normal CK."
    }
  },
  {
    module: "Muscle",
    lo: "08.09",
    skill: "Myalgia triage",
    source: data.sources.muscle,
    stem: "A 72-year-old has bilateral shoulder and hip girdle aching with morning stiffness. CK is normal but ESR/CRP are elevated.",
    question: "Which diagnosis should be prioritized?",
    choices: ["Polymyalgia rheumatica", "Rhabdomyolysis", "Dermatomyositis", "Malignant hyperthermia"],
    answer: "Polymyalgia rheumatica",
    clue: "Older adult, proximal stiffness, elevated inflammatory markers, normal CK.",
    why: "PMR is pain/stiffness predominant and is separated from myositis or rhabdomyolysis by normal CK and the older-adult proximal stiffness pattern.",
    distractors: {
      Rhabdomyolysis: "Rhabdomyolysis causes acute muscle breakdown with high CK and possible myoglobinuria.",
      Dermatomyositis: "Dermatomyositis causes inflammatory weakness and characteristic rash.",
      "Malignant hyperthermia": "This is an anesthesia-triggered hypermetabolic crisis."
    }
  },
  {
    module: "Ultrasound",
    lo: "10.02",
    skill: "Image finding logic",
    source: data.sources.ultrasound,
    stem: "A painful swollen soft-tissue area shows diffuse cobblestoning but no focal pocket with posterior enhancement.",
    question: "Which ultrasound category is most appropriate?",
    choices: ["Soft tissue edema", "Fluid collection", "Solid mass", "Tendon tear"],
    answer: "Soft tissue edema",
    clue: "Diffuse cobblestoning without a drainable pocket.",
    why: "Soft tissue edema appears as diffuse fluid tracking through subcutaneous tissues; a collection is focal.",
    distractors: {
      "Fluid collection": "A collection is a focal pocket, often anechoic/hypoechoic with enhancement.",
      "Solid mass": "A solid mass has tissue echotexture and is not a diffuse cobblestone pattern.",
      "Tendon tear": "A tendon tear is assessed in a fibrillar tendon, not diffuse subcutaneous edema."
    }
  },
  {
    module: "Ultrasound",
    lo: "10.03",
    skill: "Vascular ultrasound",
    source: data.sources.ultrasound,
    stem: "A leg vein remains round and does not collapse with direct probe compression.",
    question: "Which finding is being tested?",
    choices: ["Venous thrombosis", "Joint effusion", "Foreign body", "Soft tissue edema"],
    answer: "Venous thrombosis",
    clue: "Noncompressible vein.",
    why: "Compression ultrasound relies on venous compressibility; a noncompressible vein is the key DVT finding.",
    distractors: {
      "Joint effusion": "Effusion is intra-articular fluid, not a noncompressible vein.",
      "Foreign body": "Foreign bodies are echogenic structures with artifact or halo.",
      "Soft tissue edema": "Edema is diffuse subcutaneous fluid tracking."
    }
  },
  {
    module: "Red Hot Swollen Joint",
    lo: "11.01",
    skill: "Acute monoarthritis triage",
    source: data.sources.redhot,
    stem: "A patient has one hot swollen knee, fever, and severe pain with passive range of motion.",
    question: "What is the most important diagnostic step?",
    choices: ["Arthrocentesis", "Routine outpatient MRI", "Start a running program", "Only check rheumatoid factor"],
    answer: "Arthrocentesis",
    clue: "Acute monoarthritis with infection concern.",
    why: "Septic arthritis must be ruled out urgently with synovial fluid testing when a red, hot, swollen joint is concerning.",
    distractors: {
      "Routine outpatient MRI": "MRI does not replace synovial fluid evaluation for suspected septic arthritis.",
      "Start a running program": "This ignores an emergency presentation.",
      "Only check rheumatoid factor": "Serologies cannot rule out septic arthritis."
    }
  },
  {
    module: "Back Pain",
    lo: "13.04, 13.05, 13.06",
    skill: "Back pain discriminator",
    source: data.sources.back,
    stem: "A patient has low back pain radiating below the knee with dermatomal numbness, but no fever, cancer history, or bowel/bladder symptoms.",
    question: "Which diagnosis best fits the core pattern?",
    choices: ["Intervertebral disc herniation", "Discitis", "Cauda equina/cord compression", "Scoliosis"],
    answer: "Intervertebral disc herniation",
    clue: "Radicular leg symptoms without red flags.",
    why: "Disc herniation commonly causes radicular symptoms; discitis and cauda equina require red-flag features.",
    distractors: {
      Discitis: "Discitis is suggested by infection risk, fever, elevated inflammatory markers, or persistent severe pain.",
      "Cauda equina/cord compression": "This requires neurologic emergency features such as saddle anesthesia or bladder/bowel dysfunction.",
      Scoliosis: "Scoliosis is a curvature pattern rather than an acute radicular syndrome."
    }
  },
  {
    module: "Hip Pain",
    lo: "15.04, 15.05, 15.06",
    skill: "Pediatric hip discriminator",
    source: data.sources.hip,
    stem: "An adolescent has limp, hip/knee pain, and limited internal rotation. The clinician stops weight-bearing while arranging urgent imaging.",
    question: "Which diagnosis is most likely?",
    choices: ["Slipped capital femoral epiphysis", "Legg-Calve-Perthes disease", "Developmental dysplasia of the hip", "Trochanteric bursitis"],
    answer: "Slipped capital femoral epiphysis",
    clue: "Adolescent, limp, limited internal rotation, urgent non-weight-bearing.",
    why: "SCFE is an adolescent physeal slip and should be treated as an urgent orthopedic problem.",
    distractors: {
      "Legg-Calve-Perthes disease": "Perthes is idiopathic femoral head osteonecrosis, usually in younger children.",
      "Developmental dysplasia of the hip": "DDH is primarily an infant/early-childhood hip development problem.",
      "Trochanteric bursitis": "This causes lateral hip pain rather than urgent adolescent physeal disease."
    }
  },
  {
    module: "Hip Pain",
    lo: "15.02",
    skill: "Adult hip discriminator",
    source: data.sources.hip,
    stem: "An adult with chronic steroid exposure has groin pain and pain with hip internal rotation. Early radiographs are subtle.",
    question: "Which diagnosis needs MRI-sensitive evaluation?",
    choices: ["Osteonecrosis of the hip", "Transient synovitis", "Meralgia paresthetica", "Plantar fasciitis"],
    answer: "Osteonecrosis of the hip",
    clue: "Steroid risk plus groin pain and early subtle radiographs.",
    why: "Femoral head osteonecrosis can be occult early on radiographs; MRI is sensitive for early disease.",
    distractors: {
      "Transient synovitis": "Transient synovitis is a pediatric hip inflammation mimic.",
      "Meralgia paresthetica": "Meralgia causes sensory anterolateral thigh symptoms without hip joint pain.",
      "Plantar fasciitis": "Plantar fasciitis causes inferior heel pain."
    }
  },
  {
    module: "Upper Extremity",
    lo: "16.06, 16.08, 16.09",
    skill: "Upper extremity discriminator",
    source: data.sources.upper,
    stem: "After a fall on an outstretched hand, a patient has anatomic snuffbox tenderness and initial wrist radiographs are negative.",
    question: "What diagnosis should still be protected?",
    choices: ["Scaphoid fracture", "Carpal tunnel syndrome", "Medial/lateral epicondylitis", "Dupuytren contracture"],
    answer: "Scaphoid fracture",
    clue: "FOOSH plus snuffbox tenderness.",
    why: "A suspected scaphoid fracture should be immobilized even if early radiographs are negative.",
    distractors: {
      "Carpal tunnel syndrome": "Carpal tunnel is median neuropathy, not post-traumatic snuffbox pain.",
      "Medial/lateral epicondylitis": "Epicondylitis localizes to elbow tendons.",
      "Dupuytren contracture": "Dupuytren is a palmar contracture process."
    }
  },
  {
    module: "Upper Extremity",
    lo: "16.10, 16.11, 16.12",
    skill: "Shoulder and hand discriminator",
    source: data.sources.upper,
    stem: "A youth pitcher has lateral shoulder pain and radiographs show widening of the proximal humeral physis.",
    question: "Which diagnosis is most consistent?",
    choices: ["Little League shoulder", "Rotator cuff tear", "AC joint separation", "Dupuytren contracture"],
    answer: "Little League shoulder",
    clue: "Throwing athlete plus proximal humeral physeal widening.",
    why: "Little League shoulder is proximal humeral epiphysiolysis from throwing overuse.",
    distractors: {
      "Rotator cuff tear": "Rotator cuff tear causes tendon weakness/pain and is not defined by physeal widening.",
      "AC joint separation": "AC separation follows direct shoulder impact with AC tenderness/step-off.",
      "Dupuytren contracture": "Dupuytren affects palmar fascia and finger flexion."
    }
  }
];

for (const q of newQuestions) {
  addUniqueBy(data.mcqs, (x) => `${x.module}|${x.lo}|${x.answer}|${x.stem}`.toLowerCase(), q);
}

const coverageRows = [
  ["infection", "Osteomyelitis", "Explicit LO 01.01 diagnostic target", "Diagnose from history, exam, and diagnostic tests.", "Disease card, glossary, LO drill, rapid recall, sort/sequence infection workflow, image/discriminator/management practice.", "Full diagnostic-weight coverage: local bone pain, fever risk, MRI/culture logic, and treatment triage."],
  ["infection", "Septic arthritis", "Explicit LO 02.01 and 02.04 diagnostic/management target", "Diagnose and recommend therapy for septic arthritis.", "Disease card, glossary, LO drills, rapid recall, infection sequence, red-hot-joint management, and vignettes.", "Emergency joint infection: aspiration, antibiotics, drainage, and high-risk passive-ROM pain."],
  ["infection", "Disseminated gonococcal infection", "Explicit LO 02.02 diagnostic target", "Diagnose DGI from history, exam, and testing.", "Added disease card, glossary, rapid recall, DGI vignette, LO drill, and infection coverage row.", "Migratory arthralgia, tenosynovitis, dermatitis, mucosal NAAT, and gonococcal arthritis link."],
  ["infection", "Disseminated gonococcal arthritis", "Explicit LO 02.03 therapeutic target", "Recommend therapy for disseminated gonococcal arthritis.", "Added disease card, glossary, rapid recall, treatment-linked coverage row, and DGI vignette reinforcement.", "Ceftriaxone-centered therapy, chlamydia coinfection logic, sexual health management, and joint drainage when purulent."],
  ["injury", "Ankle sprain", "Explicit LO 03.01 and 03.05 diagnostic/management target", "Diagnose and manage ankle sprain.", "Existing regional ankle practice, glossary linking, rapid recall, injury module, and coverage row.", "Grade severity, Ottawa-style imaging logic, PRICE/protected weightbearing, rehab progression."],
  ["injury", "Common acute injuries of the knee", "Explicit LO 03.02 diagnostic target", "Diagnose common acute knee injuries.", "Glossary alias, knee regional cases, LO drill, discriminators, and coverage row.", "Separate ligament, meniscus, patellofemoral, bursitis, apophysitis, fracture, and effusion patterns."],
  ["injury", "Acromioclavicular joint separation", "Explicit LO 03.03 and 16.07 diagnostic target", "Diagnose AC joint separation.", "Added disease card, glossary, rapid recall, coverage row, and upper-extremity linkage.", "Direct shoulder impact, AC tenderness, cross-body adduction pain, deformity grading, referral thresholds."],
  ["injury", "Muscle strain", "Explicit LO 03.04 therapeutic target", "Recommend therapy for muscle strain.", "Added disease card, glossary, rapid recall, and coverage row.", "Pain with resisted contraction, severity grade, protected loading, and progressive rehab."],
  ["genetics", "Osteogenesis imperfecta", "Explicit LO 04.01 diagnostic target", "Diagnose osteogenesis imperfecta.", "Existing disease card/glossary/flashcard plus genetics coverage row.", "Fragility fractures, blue sclera/dentin/hearing clues, collagen disorder recognition."],
  ["genetics", "Ehlers Danlos", "Explicit LO 05.01 diagnostic target", "Diagnose Ehlers-Danlos syndrome.", "Existing disease card with coverage row and glossary linkage.", "Hypermobility, skin extensibility, tissue fragility, and vascular warning phenotype."],
  ["genetics", "Marfan's Syndrome", "Explicit LO 05.02 diagnostic target", "Diagnose Marfan syndrome.", "Existing disease card with coverage row and glossary linkage.", "Tall habitus, lens/aortic risk, connective tissue recognition."],
  ["genetics", "Muscular dystrophy", "Explicit LO 05.03 and 05.04 structure/diagnosis target", "Describe structural genetic changes and diagnose muscular dystrophy.", "Existing dystrophy disease cards, glossary, flashcards, LO drills, and coverage row.", "Duchenne/Becker/myotonic distinctions, Gower sign, inheritance, and muscle weakness pattern."],
  ["tumors", "Osteosarcoma", "Explicit LO 06.01 diagnostic target", "Diagnose osteosarcoma.", "Disease card, glossary, LO drill, image practice, tumor sort/sequence, and coverage row.", "Aggressive metaphyseal bone tumor, sunburst/Codman pattern, adolescent pain/swelling."],
  ["tumors", "Ewing's Sarcoma", "Explicit LO 06.02 diagnostic target", "Diagnose Ewing sarcoma.", "Disease card, glossary, LO drill, tumor imaging/discriminator coverage, and coverage row.", "Diaphyseal small round blue cell tumor, onion-skin periosteal reaction, systemic symptoms."],
  ["tumors", "Metastatic bone disease", "Explicit LO 06.03 diagnostic target", "Diagnose metastatic bone disease.", "Disease card, glossary, LO drill, tumor practice, and coverage row.", "Older adult or known cancer with destructive bone lesions, axial skeleton, fracture risk."],
  ["tumors", "Osteoid osteoma", "Explicit LO 06.04 diagnostic target", "Diagnose osteoid osteoma.", "Disease card, glossary, LO drill, image quiz, hotspot, flashcard, benign tumor sort, discriminator, management round, and vignette.", "Night pain relieved by NSAIDs and radiolucent nidus with reactive bone."],
  ["muscle", "Mitochondrial myopathies", "Explicit LO 08.01 mechanism target", "Describe metabolic alterations causing mitochondrial myopathy manifestations.", "Existing disease card/glossary/LO drill plus coverage row.", "Exercise intolerance, energy failure, and metabolic myopathy logic."],
  ["muscle", "Glycogen storage diseases", "Explicit LO 08.02 mechanism target", "Describe glycogen storage alterations causing myopathy.", "Existing disease card/glossary/LO drill plus coverage row.", "Fuel-use defects, exertional symptoms, and metabolic myopathy comparison."],
  ["muscle", "Myopathy", "Explicit LO 08 cluster concept", "Recognize muscle disease patterns across weakness, pain, CK, and triggers.", "Disease cards, glossary terms, myopathy/myositis sort, vignettes, and coverage row.", "Separate true weakness from myalgia, inflammatory myositis, metabolic disease, and acute myonecrosis."],
  ["muscle", "Rhabdomyolysis", "Explicit LO 08.04 and 08.10 diagnostic/management target", "Diagnose and treat rhabdomyolysis.", "Disease card, glossary, LO drills, flashcard, management content, and coverage row.", "High CK, dark urine/myoglobin risk, renal protection, fluids, and trigger removal."],
  ["muscle", "Fibromyalgia", "Explicit LO 08.05 and 08.08 diagnostic/management target", "Diagnose and treat fibromyalgia.", "Disease card, glossary, LO drills, myalgia comparison, and coverage row.", "Chronic widespread pain, fatigue/sleep symptoms, normal inflammatory muscle tests, non-opioid management."],
  ["muscle", "Neuroleptic malignant syndrome", "Explicit LO 08.06 therapeutic target", "Recommend therapy for NMS.", "Disease card, glossary, LO drill, rapid recall, and coverage row.", "Dopamine blockade, rigidity, hyperthermia, autonomic instability, CK elevation, supportive care/dantrolene-bromocriptine logic."],
  ["muscle", "Malignant hyperthermia", "Explicit LO 08.07 therapeutic target", "Recommend therapy for malignant hyperthermia.", "Disease card, glossary, LO drill, rapid recall, and coverage row.", "Anesthesia trigger, hypermetabolism, calcium release, dantrolene."],
  ["muscle", "Polymyalgia rheumatica", "Explicit LO 08.09 therapeutic target", "Recommend therapy for PMR.", "Added disease card, glossary, rapid recall, vignette, and coverage row.", "Older adult proximal stiffness, high ESR/CRP, normal CK, steroid response, and GCA screening."],
  ["muscle", "Polymyositis", "Explicit LO 09.01 diagnostic target", "Diagnose polymyositis.", "Disease card, glossary, LO drill, flashcards, myositis sort, and coverage row.", "Symmetric proximal weakness, high CK, inflammatory myopathy without dermatomyositis rash."],
  ["muscle", "Dermatomyositis", "Explicit LO 09.02 diagnostic target", "Diagnose dermatomyositis.", "Disease card, glossary, LO drill, flashcards, myositis sort, and coverage row.", "Proximal weakness with heliotrope/Gottron-type rash and malignancy awareness."],
  ["muscle", "Inclusion body myositis", "Explicit LO 09.03 diagnostic target", "Diagnose inclusion body myositis.", "Disease card, glossary, LO drill, flashcards, and coverage row.", "Older adult, insidious asymmetric distal/proximal weakness, finger flexor/quadriceps pattern."],
  ["ultrasound", "Soft tissue edema", "Explicit LO 10.02 ultrasound target", "Distinguish edema from collections and solid masses.", "Added disease/finding card, glossary, rapid recall, ultrasound vignette, and coverage row.", "Diffuse cobblestoning versus focal drainable fluid or solid tissue lesion."],
  ["ultrasound", "Fluid collections", "Explicit LO 10.02 ultrasound target", "Distinguish collections from edema and solid masses.", "Added disease/finding card, glossary, rapid recall, and coverage row.", "Focal anechoic/hypoechoic pocket, enhancement/debris, abscess/hematoma/seroma logic."],
  ["ultrasound", "Solid masses", "Explicit LO 10.02 ultrasound target", "Distinguish solid masses from edema and collections.", "Added disease/finding card, glossary, rapid recall, and coverage row.", "Tissue echotexture, margins, depth, vascularity, and escalation rather than drainage."],
  ["ultrasound", "Joint effusion", "Explicit LO 10.03 ultrasound target", "Identify joint effusion on ultrasound.", "Added disease/finding card, glossary, rapid recall, image/hotspot linkage, and coverage row.", "Intra-articular fluid and aspiration decision when septic/crystal arthritis is possible."],
  ["ultrasound", "Tendon tear", "Explicit LO 10.03 ultrasound target", "Identify tendon tear on ultrasound.", "Added disease/finding card, glossary, rapid recall, and coverage row.", "Loss of fibrillar continuity, anisotropy correction, and dynamic assessment."],
  ["ultrasound", "Fracture", "Explicit LO 10.03 ultrasound target", "Identify fracture when appropriate on ultrasound.", "Glossary term, ultrasound image logic, and coverage row.", "Cortical step-off is a selected ultrasound clue; radiographs usually anchor diagnosis."],
  ["ultrasound", "Foreign body", "Explicit LO 10.03 ultrasound target", "Identify foreign body on ultrasound.", "Added disease/finding card, glossary, rapid recall, and coverage row.", "Echogenic retained object with shadow/reverberation and surrounding halo."],
  ["ultrasound", "Venous thrombosis", "Explicit LO 10.03 ultrasound target", "Identify venous thrombosis on ultrasound.", "Added disease/finding card, glossary, rapid recall, vascular vignette, and coverage row.", "Noncompressible vein is the key compression ultrasound finding."],
  ["regional", "Monoarticular arthritis", "Explicit LO 11.01, 11.05, 11.09 diagnostic/management target", "Evaluate monoarticular arthritis and recognize septic arthritis vs mimics.", "Added disease card, glossary, rapid recall, acute monoarthritis vignette, and coverage row.", "Arthrocentesis-first logic for hot swollen joint; infection and crystals cannot be missed."],
  ["regional", "Osteoarthritis of knee", "Explicit LO 12.02 diagnostic target", "Diagnose knee osteoarthritis.", "Glossary alias, regional knee disease/practice, LO drill, and coverage row.", "Chronic mechanical knee pain, stiffness, crepitus, and activity limitation."],
  ["regional", "Osgood-Schlatter", "Explicit LO 12.03 diagnostic target", "Diagnose Osgood-Schlatter disease.", "Glossary alias, regional practice, LO drill, and coverage row.", "Adolescent anterior knee pain at tibial tubercle with traction apophysitis."],
  ["regional", "Patellofemoral pain syndrome", "Explicit LO 12.04 diagnostic target", "Diagnose patellofemoral pain syndrome.", "Regional disease/practice, glossary linkage, LO drill, and coverage row.", "Anterior knee pain with stairs/squatting/prolonged sitting and maltracking mechanics."],
  ["regional", "Medial/lateral meniscal tear", "Explicit LO 12.05 diagnostic target", "Diagnose meniscal tear.", "Regional disease/practice, LO drill, and coverage row.", "Joint-line pain, locking/catching, twisting injury, and provocative exam pattern."],
  ["regional", "Anterior/posterior cruciate ligament tear", "Explicit LO 12.06 diagnostic target", "Diagnose ACL/PCL tear.", "Glossary alias, regional practice, LO drill, and coverage row.", "ACL pivot/pop/effusion versus PCL dashboard/posterior tibial force logic."],
  ["regional", "Prepatellar bursitis", "Explicit LO 12.07 diagnostic/management target", "Diagnose and treat prepatellar bursitis.", "Regional practice, glossary/flashcard linkage, LO drill, and coverage row.", "Anterior kneecap swelling from kneeling/trauma; evaluate infection when red/hot/systemic."],
  ["regional", "Osteoarthritis", "Explicit LO 12.02 and regional degenerative target", "Recognize osteoarthritis across regional pain modules.", "Glossary/disease linkage, knee module, LO drills, and coverage row.", "Mechanical degenerative joint pain, stiffness, crepitus, and function-focused management."],
  ["regional", "Axial spondyloarthritis", "Explicit LO 13.02 ankylosing spondylitis spectrum target", "Represent the broader axial spondyloarthritis spectrum while preserving the ankylosing spondylitis LO anchor.", "Added disease card, glossary, rapid recall, and coverage row.", "Inflammatory back pain, morning stiffness, improvement with exercise, sacroiliitis, and extra-articular clues."],
  ["regional", "Ankylosing spondylitis", "Explicit LO 13.02 diagnostic target", "Diagnose ankylosing spondylitis.", "Existing regional back practice, glossary linkage, and coverage row.", "Inflammatory back pain, morning stiffness, improvement with exercise, sacroiliitis pattern."],
  ["regional", "Scoliosis", "Explicit LO 13.03 diagnostic target", "Diagnose scoliosis.", "Added disease card, glossary, rapid recall, and coverage row.", "Spinal curvature/rotation, Adams test, standing radiographs/Cobb angle when indicated."],
  ["regional", "Kyphosis", "Source-level LO 13.01 back pain differential", "Recognize kyphosis as a spinal alignment/deformity contributor in the low back pain differential.", "Added disease card, glossary, rapid recall, and coverage row.", "Excess sagittal curvature, flexible versus structural posture, and radiographic measurement when progressive."],
  ["regional", "Spondylolysis", "Explicit LO 13.04 diagnostic target", "Diagnose spondylolysis.", "Regional back practice, glossary linkage, and coverage row.", "Pars stress injury, extension-related low back pain in athletes."],
  ["regional", "Degenerative disk disease", "Explicit LO 13.05 diagnostic target", "Diagnose degenerative disc disease.", "Regional back practice, glossary linkage, and coverage row.", "Chronic mechanical axial back pain and age-related disc degeneration."],
  ["regional", "Cauda equina/cord compression", "Explicit LO 13.06 and 13.12 diagnostic/management target", "Identify and treat cauda equina or cord compression.", "Glossary alias, regional red-flag practice, rapid recall, and coverage row.", "Saddle anesthesia, bowel/bladder dysfunction, progressive neurologic deficit, myelopathy signs, urgent MRI and decompression pathway."],
  ["regional", "Cauda equina syndrome/cord compression", "Explicit LO 13.06 and 13.12 diagnostic/management target", "Identify and treat cauda equina syndrome or cord compression.", "Added disease card, glossary, rapid recall, and coverage row under the requested name.", "Neurologic emergency: saddle anesthesia, bladder/bowel dysfunction, progressive deficits, urgent MRI, and spine/neurosurgical escalation."],
  ["regional", "Intervertebral disc herniation", "Explicit LO 13.07 and 13.14 diagnostic/management target", "Diagnose and treat disc herniation/radiculopathy.", "Added disease card, glossary, rapid recall, back-pain vignette, and coverage row.", "Radicular pain, dermatomal symptoms, nerve tension signs, conservative care unless red flags or progressive deficit."],
  ["regional", "Spinal stenosis", "Explicit LO 13.08 diagnostic target", "Diagnose spinal stenosis.", "Regional back practice, glossary linkage, and coverage row.", "Neurogenic claudication, relief with flexion/sitting, walking limitation."],
  ["regional", "Discitis", "Explicit LO 13.09 diagnostic target", "Diagnose discitis.", "Added disease card, glossary, rapid recall, and coverage row.", "Back pain with infection risk, fever/ESR-CRP, MRI and culture-directed therapy."],
  ["regional", "Musculoskeletal low back pain", "Explicit LO 13.10 and 13.13 diagnostic/management target", "Diagnose and treat musculoskeletal low back pain.", "Added disease card, glossary, rapid recall, and coverage row.", "No red flags, activity as tolerated, avoid routine early imaging, conservative recovery plan."],
  ["regional", "Musculoskeletal back pain", "Explicit LO 13.10 and 13.13 diagnostic/management target", "Synonym/alias for mechanical low back pain.", "Glossary alias and coverage row tied to musculoskeletal low back pain card.", "Same mechanical back pain logic; separate from radicular, inflammatory, infectious, and emergency patterns."],
  ["regional", "Ankle sprain", "Explicit LO 03.01, 03.05, 14.03, and 14.06 diagnostic/management target", "Diagnose and manage ankle sprain in injury and foot/ankle modules.", "Disease card, glossary, rapid recall, injury module, regional foot/ankle practice, LO drill, and coverage row.", "Inversion mechanism, lateral ligament tenderness, Ottawa-style imaging logic, support, protected weight-bearing, and proprioceptive rehab."],
  ["regional", "Plantar fasciitis", "Explicit LO 14.02 and 14.07 diagnostic/management target", "Diagnose and treat plantar fasciitis.", "Promoted to disease card with glossary, rapid recall, regional foot practice, LO drill, and coverage row.", "Inferior heel pain worst with first steps; stretching/load modification and footwear support."],
  ["regional", "Tarsal tunnel syndrome", "Explicit LO 14.04 diagnostic target", "Diagnose tarsal tunnel syndrome.", "Promoted to disease card with glossary, rapid recall, regional foot practice, LO drill, and coverage row.", "Posterior tibial nerve compression with plantar paresthesias and medial ankle Tinel localization."],
  ["regional", "Achilles tendonitis", "Explicit LO 14.05 diagnostic target", "Diagnose Achilles tendinopathy/tendonitis.", "Promoted to disease card with glossary, rapid recall, regional foot practice, LO drill, and coverage row.", "Posterior heel tendon pain, load sensitivity, progressive calf strengthening, and rupture precautions."],
  ["regional", "Hallux deformity", "Source-level LO 14.01 foot/ankle pain differential", "Recognize hallux deformity as a foot pain differential even though it is not a separate spreadsheet LO.", "Added disease card, glossary, rapid recall, and coverage row.", "Great-toe alignment or motion problem: hallux valgus/bunion or hallux rigidus, shoe-wear pain, push-off pain, and weight-bearing radiographs when needed."],
  ["regional", "Developmental dysplasia of the hip", "Explicit LO 15.04 diagnostic target", "Diagnose DDH.", "Added disease card, glossary, rapid recall, and coverage row.", "Infant hip instability, limited abduction, ultrasound/radiograph age logic."],
  ["regional", "Legg-Calve-Perthes disease", "Explicit LO 15.05 diagnostic target", "Diagnose Perthes disease.", "Added disease card, glossary, rapid recall, pediatric hip vignette contrast, and coverage row.", "Child limp with femoral head osteonecrosis and limited hip motion."],
  ["regional", "Slipped capital femoral epiphysis", "Explicit LO 15.06 diagnostic target", "Diagnose SCFE.", "Added disease card, glossary, rapid recall, pediatric hip vignette, and coverage row.", "Adolescent limp/hip-knee pain, limited internal rotation, non-weight-bearing and urgent ortho."],
  ["regional", "Trochanteric bursitis", "Explicit LO 15.07 diagnostic target", "Diagnose trochanteric bursitis/GTPS.", "Added disease card, glossary, rapid recall, and coverage row.", "Lateral hip pain/tenderness, pain lying on side, abductor rehab."],
  ["regional", "Osteonecrosis of the hip", "Explicit LO 15.02 diagnostic target", "Diagnose hip osteonecrosis.", "Added disease card, glossary, rapid recall, adult hip vignette, and coverage row.", "Groin pain, steroid/alcohol/trauma risks, MRI-sensitive early disease."],
  ["regional", "Transient synovitis", "Explicit LO 15.08 and 15.10 diagnostic/management target", "Diagnose and treat transient synovitis.", "Glossary alias, regional hip practice, LO drill, and coverage row.", "Pediatric self-limited hip pain; must separate from septic arthritis."],
  ["regional", "Septic arthritis of the hip", "Explicit LO 15.09 diagnostic target", "Diagnose septic arthritis of the hip.", "Glossary alias, septic arthritis linkage, hip LO drill, and coverage row.", "Fever, inability to bear weight, painful limited ROM, urgent aspiration/therapy."],
  ["regional", "Meralgia paresthetica", "Explicit LO 15.11 management target", "Treat meralgia paresthetica.", "Added disease card, glossary, rapid recall, and coverage row.", "Anterolateral thigh sensory symptoms from lateral femoral cutaneous nerve compression."],
  ["regional", "Rotator cuff pathology", "Explicit LO 16.01 and 16.02 exam/diagnosis target", "Identify involved cuff muscles and shoulder pain diagnosis.", "Glossary alias, regional upper practice, LO drill, and coverage row.", "Painful arc, weakness pattern, impingement/tendinopathy/tear differentiation."],
  ["regional", "Medial/lateral epicondylitis", "Explicit LO 16.06 diagnostic target", "Diagnose epicondylitis.", "Added disease card, glossary, rapid recall, upper-extremity vignette contrast, and coverage row.", "Epicondyle tenderness and resisted wrist flexion/extension pain."],
  ["regional", "Carpal tunnel", "Explicit LO 16.08 diagnostic target", "Diagnose carpal tunnel syndrome.", "Glossary alias, regional upper practice, LO drill, and coverage row.", "Median nerve paresthesias, nocturnal symptoms, provocative maneuvers."],
  ["regional", "Scaphoid fracture", "Explicit LO 16.09 diagnostic target", "Diagnose scaphoid fracture.", "Added disease card, glossary, rapid recall, upper-extremity vignette, and coverage row.", "FOOSH, snuffbox tenderness, negative early x-ray does not exclude, thumb-spica protection."],
  ["regional", "Rotator cuff tear", "Explicit LO 16.10 diagnostic target", "Diagnose rotator cuff tear.", "Added disease card, glossary, rapid recall, and coverage row.", "Shoulder weakness, traumatic inability to elevate arm, ultrasound/MRI when management changes."],
  ["regional", "Little League Shoulder", "Explicit LO 16.11 diagnostic target", "Diagnose Little League shoulder.", "Added disease card, glossary, rapid recall, youth-thrower vignette, and coverage row.", "Throwing athlete, proximal humeral physeal pain/widening, rest and gradual return."],
  ["regional", "Dupuytrens contracture", "Explicit LO 16.12 diagnostic target", "Diagnose Dupuytren contracture.", "Added disease card, glossary, rapid recall, and coverage row.", "Palmar nodules/cords, finger flexion contracture, hand-flat function threshold."]
];

for (const [module, diagnosis, scope, objective, coverage, focus] of coverageRows) {
  upsertBy(data.diagnosis_coverage, (x) => `${x.module}|${x.diagnosis}`.toLowerCase(), {
    module, diagnosis, scope, objective, coverage, focus,
  });
  addUniqueBy(data.flashcards, (x) => String(x.front).toLowerCase(), {
    front: `Coverage check: ${diagnosis}`,
    back: `${scope}. ${focus}`,
    source: sourceFor(module, data),
  });
}

data.glossary.sort((a, b) => String(a.term).localeCompare(String(b.term), undefined, { sensitivity: "base" }));
data.diseases.sort((a, b) => String(a.group).localeCompare(String(b.group)) || String(a.name).localeCompare(String(b.name)));

await fs.writeFile(dataPath, writeData(data), "utf8");
console.log(JSON.stringify({
  diseases: data.diseases.length,
  glossary: data.glossary.length,
  flashcards: data.flashcards.length,
  mcqs: data.mcqs.length,
  diagnosis_coverage: data.diagnosis_coverage.length,
}, null, 2));
