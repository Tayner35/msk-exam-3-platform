(function(){
  if(!window.MSK_DATA)return;

  const moduleDef={
    id:'osce',
    title:'Physical Exam OSCE',
    desc:'Shoulder, lumbar/thoracic spine, and knee physical exam practice with checklist recall, finding-to-diagnosis drills, and LearningSpace-style differential reasoning.',
    sources:[],
    lo_prefixes:['12','13','16']
  };
  if(!DATA.modules.some(m=>m.id==='osce'))DATA.modules.push(moduleDef);

  DATA.osce_physical_exam={
    prep:[
      'Wash hands in sight of the patient before the exam.',
      'Use a transition phrase from history to exam, then talk through inspection, palpation, range of motion, strength, neurologic testing, and special tests.',
      'Perform every graded maneuver for the affected joint and compare both sides when the checklist calls for bilateral performance.',
      'Maneuvers must be done as written. The standardized patient grades each correctly performed maneuver as one point.',
      'After the encounter, select the most likely diagnosis, two supporting findings, and a leading alternative diagnosis.'
    ],
    regions:{
      shoulder:{
        id:'shoulder',
        label:'Shoulder',
        chief:'Upper-extremity pain, weakness, limited overhead motion, or focal shoulder tenderness.',
        checklist:[
          {item:'Inspect shoulders',category:'Inspection',steps:'Expose both shoulders completely and compare for asymmetry, swelling, scars, deformity, posture, and atrophy.'},
          {item:'Palpate clavicles',category:'Palpation',steps:'Use fingertips to palpate along both clavicles and ask about focal tenderness.'},
          {item:'Palpate sternoclavicular joints',category:'Palpation',steps:'Palpate both sternoclavicular joints for tenderness, swelling, or asymmetry.'},
          {item:'Palpate acromioclavicular joints',category:'Palpation',steps:'Palpate both AC joints for focal tenderness, swelling, or step-off.'},
          {item:'Palpate bicipital groove',category:'Palpation',steps:'Shake the patient hand with elbow flexed 90 degrees. Ask them to flex the biceps by squeezing your hand while you supinate/externally rotate and palpate the bicipital groove bilaterally.'},
          {item:'Shoulder flexion',category:'Range of motion',steps:'Start with arms at the side and ask the patient to raise both arms forward/anteriorly above the head.'},
          {item:'Shoulder extension',category:'Range of motion',steps:'From the raised position, return the arms and continue into posterior extension.'},
          {item:'Shoulder abduction',category:'Range of motion',steps:'Ask the patient to raise both arms laterally to shoulder level, about 90 degrees, palms down.'},
          {item:'Shoulder adduction',category:'Range of motion',steps:'Ask the patient to lower both arms back to the side.'},
          {item:'Shoulder internal rotation',category:'Range of motion',steps:'Ask the patient to place both hands behind the small of the back.'},
          {item:'Shoulder external rotation',category:'Range of motion',steps:'Ask the patient to place both hands behind the neck with elbows out.'},
          {item:'Empty can / supraspinatus',category:'Special test',steps:'Place the arm in 90 degrees abduction and 30 degrees forward flexion with thumb down, then ask the patient to raise against resistance on each side separately.'},
          {item:'Resisted external rotation / infraspinatus',category:'Special test',steps:'With the arm at the side and elbow flexed about 90 degrees, stabilize the elbow and ask the patient to externally rotate against resistance on each side separately.'},
          {item:'Resisted internal rotation / subscapularis',category:'Special test',steps:'With the arm at the side and elbow flexed about 90 degrees, stabilize the elbow and ask the patient to internally rotate against resistance on each side separately.'},
          {item:'Neer or Hawkins-Kennedy impingement test',category:'Special test',steps:'Neer: pronate the arm, stabilize the shoulder, and passively forward flex to 180 degrees. Hawkins-Kennedy: flex shoulder and elbow to 90 degrees, stabilize the shoulder, and passively internally rotate. Test each side separately.'}
        ],
        map:[
          {exam:'Inspect shoulders',diagnoses:['AC separation/dislocation','Prior surgery or chronic pathology','Nerve injury with atrophy'],finding:'Asymmetry, swelling, scar, deformity, postural change, or muscle atrophy.'},
          {exam:'Palpate clavicles',diagnoses:['Clavicle fracture','Sternoclavicular or acromioclavicular pathology'],finding:'Focal bony tenderness, deformity, or pain along the clavicle.'},
          {exam:'Palpate sternoclavicular joints',diagnoses:['SC sprain/dislocation','Inflammatory arthritis'],finding:'Tenderness, swelling, or asymmetry at the sternoclavicular joint.'},
          {exam:'Palpate acromioclavicular joints',diagnoses:['AC joint separation/arthritis'],finding:'Focal AC tenderness or step-off, especially after fall onto shoulder.'},
          {exam:'Palpate bicipital groove',diagnoses:['Biceps tendinitis','Labral/biceps pathology'],finding:'Anterior shoulder pain and focal bicipital groove tenderness.'},
          {exam:'Shoulder flexion/extension',diagnoses:['Rotator cuff pathology','Impingement','Adhesive capsulitis','Osteoarthritis'],finding:'Pain, weakness, or restricted overhead/extension motion.'},
          {exam:'Shoulder abduction/adduction',diagnoses:['Rotator cuff tear/tendinopathy','Impingement','Adhesive capsulitis'],finding:'Painful arc, asymmetric motion, weakness, or limited abduction.'},
          {exam:'Shoulder internal rotation',diagnoses:['Subscapularis tear/tendinopathy','Adhesive capsulitis'],finding:'Limited behind-back motion or pain with internal rotation.'},
          {exam:'Shoulder external rotation',diagnoses:['Adhesive capsulitis','Infraspinatus injury','Impingement'],finding:'Limited behind-head motion, pain, or weakness.'},
          {exam:'Empty can / supraspinatus',diagnoses:['Supraspinatus rotator cuff tear/tendinopathy'],finding:'Pain or weakness with resisted empty-can testing.'},
          {exam:'Resisted external rotation / infraspinatus',diagnoses:['Infraspinatus rotator cuff tear/tendinopathy'],finding:'Pain or weakness with resisted external rotation.'},
          {exam:'Resisted internal rotation / subscapularis',diagnoses:['Subscapularis rotator cuff tear/tendinopathy'],finding:'Pain or weakness with resisted internal rotation.'},
          {exam:'Neer or Hawkins-Kennedy impingement test',diagnoses:['Shoulder impingement','Rotator cuff tendinopathy'],finding:'Anterior or lateral shoulder pain reproduced by Neer or Hawkins-Kennedy.'}
        ],
        helpful:['Cross-body adduction/scarf test for AC joint pain','Speed test for biceps/labral pathology']
      },
      spine:{
        id:'spine',
        label:'Lumbar/Thoracic Spine',
        chief:'Back pain with or without radiation, neurologic symptoms, stiffness, or red flags.',
        checklist:[
          {item:'Inspect thoracic/lumbar spine',category:'Inspection',steps:'With the patient standing and back fully exposed, inspect posterior and lateral spine for asymmetry, curvature, deformity, and guarding.'},
          {item:'Palpate thoracic/lumbar spine',category:'Palpation',steps:'Use fingertips down the spine on skin and ask about tenderness over the spinous processes.'},
          {item:'Palpate paraspinal muscles',category:'Palpation',steps:'Use fingertips just lateral to the spine on skin and ask about paraspinal tenderness or spasm.'},
          {item:'Lumbar flexion',category:'Range of motion',steps:'With the patient standing, ask them to bend forward and try to touch the toes while keeping the legs straight.'},
          {item:'Lumbar extension',category:'Range of motion',steps:'Ask the standing patient to bend backward.'},
          {item:'Lumbar lateral bending',category:'Range of motion',steps:'Stabilize the pelvis with hands on hips and ask the patient to lean right and left.'},
          {item:'Lumbar rotation',category:'Range of motion',steps:'Stabilize the pelvis and ask the patient to rotate right and left.'},
          {item:'Quadriceps strength L4',category:'Motor',steps:'With the patient seated or lying, test each leg separately by resisting knee extension while stabilizing the knee.'},
          {item:'Great toe dorsiflexion L5',category:'Motor',steps:'With legs off the table, ask the patient to dorsiflex each great toe against resistance separately.'},
          {item:'Great toe plantarflexion S1',category:'Motor',steps:'With legs off the table, ask the patient to plantarflex each great toe against resistance separately.'},
          {item:'Patellar reflex L4',category:'Reflex',steps:'Check both patellar reflexes with the knees flexed about 90 degrees.'},
          {item:'Achilles reflex S1',category:'Reflex',steps:'Check both Achilles reflexes with the leg hanging and the foot dorsiflexed/everted.'},
          {item:'L4 sensation',category:'Sensation',steps:'With eyes closed, use light touch on both thighs just above the knee and ask the patient to compare sides.'},
          {item:'L5 sensation',category:'Sensation',steps:'With eyes closed, use light touch in the web space between the great and second toes bilaterally and compare sides.'},
          {item:'S1 sensation',category:'Sensation',steps:'With eyes closed, use light touch on the lateral foot bilaterally and compare sides.'},
          {item:'Straight leg raise',category:'Special test',steps:'With the patient supine, lift each extended leg separately to about 40 to 70 degrees and ask whether pain radiates below the knee.'}
        ],
        map:[
          {exam:'Inspect thoracic/lumbar spine',diagnoses:['Scoliosis','Kyphosis/lordosis','Trauma or deformity'],finding:'Asymmetry, abnormal curvature, guarding, or visible deformity.'},
          {exam:'Palpate thoracic/lumbar spine',diagnoses:['Fracture','Metastatic bone disease','Discitis/vertebral osteomyelitis'],finding:'Midline bony tenderness or focal vertebral pain.'},
          {exam:'Palpate paraspinal muscles',diagnoses:['Musculoskeletal low back strain','Paraspinal spasm'],finding:'Paraspinal tenderness without neurologic deficit.'},
          {exam:'Lumbar flexion',diagnoses:['Axial spondyloarthritis/ankylosing spondylitis','Mechanical back pain','Disc disease'],finding:'Limited flexion or pain; inflammatory back pain may reduce mobility.'},
          {exam:'Lumbar extension',diagnoses:['Spondylolysis','Spinal stenosis','Facet-mediated pain'],finding:'Pain reproduced by extension, especially in an adolescent athlete or with stenosis symptoms.'},
          {exam:'Lumbar lateral bending/rotation',diagnoses:['Mechanical low back pain','Degenerative disc disease'],finding:'Restricted or painful movement with pelvis stabilized.'},
          {exam:'Quadriceps strength L4',diagnoses:['L4 radiculopathy','Femoral nerve involvement'],finding:'Weak knee extension.'},
          {exam:'Great toe dorsiflexion L5',diagnoses:['L5 radiculopathy','Lumbar disc herniation'],finding:'Weak great-toe extension/dorsiflexion.'},
          {exam:'Great toe plantarflexion S1',diagnoses:['S1 radiculopathy'],finding:'Weak great-toe plantarflexion.'},
          {exam:'Patellar reflex L4',diagnoses:['L4 radiculopathy or nerve compression'],finding:'Decreased or asymmetric patellar reflex.'},
          {exam:'Achilles reflex S1',diagnoses:['S1 radiculopathy or disc herniation'],finding:'Decreased or asymmetric Achilles reflex.'},
          {exam:'L4 sensation',diagnoses:['L4 radiculopathy'],finding:'Decreased sensation over distal thigh/medial knee region.'},
          {exam:'L5 sensation',diagnoses:['L5 radiculopathy'],finding:'Decreased sensation in the first dorsal web space.'},
          {exam:'S1 sensation',diagnoses:['S1 radiculopathy'],finding:'Decreased sensation on the lateral foot.'},
          {exam:'Straight leg raise',diagnoses:['Lumbar disc herniation with radiculopathy'],finding:'Radiating pain below the knee between 40 and 70 degrees.'}
        ],
        helpful:['Percuss thoracic/lumbar spine for focal pain','Palpate sacroiliac joints','If cauda equina is suspected, assess perianal sensation, anal reflex, and sphincter tone']
      },
      knee:{
        id:'knee',
        label:'Knee',
        chief:'Knee pain, swelling, instability, locking, trauma, or anterior knee symptoms.',
        checklist:[
          {item:'Inspect knees',category:'Inspection',steps:'Expose both knees and distal quadriceps. Compare for swelling, redness, deformity, scars, and quadriceps atrophy.'},
          {item:'Palpate patella',category:'Palpation',steps:'With the patient seated, knees flexed about 90 degrees and legs slightly off the table, palpate both patellae.'},
          {item:'Palpate patellar tendon',category:'Palpation',steps:'In the seated position with knees about 90 degrees, palpate both patellar tendons.'},
          {item:'Palpate tibial tuberosity',category:'Palpation',steps:'In the seated position with knees about 90 degrees, palpate both tibial tuberosities.'},
          {item:'Palpate medial joint line',category:'Palpation',steps:'With the knee at about 90 degrees, palpate the medial joint line and flex/extend as needed to confirm the line.'},
          {item:'Palpate lateral joint line',category:'Palpation',steps:'With the knee at about 90 degrees, palpate the lateral joint line and flex/extend as needed to confirm the line.'},
          {item:'Compress/milk patella for effusion',category:'Effusion',steps:'With the patient supine and knee extended, press down on the patella and milk fluid by pressing superior to the patella while pushing the patella with the other hand.'},
          {item:'Assess knee flexion',category:'Range of motion',steps:'With the patient supine, bend each knee separately toward the chest.'},
          {item:'Assess knee extension',category:'Range of motion',steps:'With the patient supine, straighten each knee separately back to the table.'},
          {item:'Lachman or anterior drawer',category:'Special test',steps:'Lachman: knee flexed about 30 degrees, grasp femur and tibia, push femur down and pull tibia up. Anterior drawer: knee 90 degrees, foot flat, sit on foot, thumbs at tibial tuberosity, fingers posterior calf, pull anteriorly.'},
          {item:'Posterior drawer',category:'Special test',steps:'With knee flexed 90 degrees and foot flat, thumbs at tibial tuberosity and fingers posterior calf, push the tibia posteriorly.'},
          {item:'Valgus/abduction stress',category:'Special test',steps:'With knee flexed about 30 degrees, place one hand at the lateral knee and the other at the medial ankle. Apply medial force at the knee and lateral force at the ankle.'},
          {item:'Varus/adduction stress',category:'Special test',steps:'With knee flexed about 30 degrees, place one hand at the medial knee and the other at the lateral ankle. Apply lateral force at the knee and medial force at the ankle.'}
        ],
        map:[
          {exam:'Inspect knees',diagnoses:['Effusion','Arthritis/inflammation','Trauma','Bursitis','Deformity','Quadriceps atrophy'],finding:'Swelling, asymmetry, redness, deformity, scars, or quadriceps atrophy.'},
          {exam:'Palpate patella',diagnoses:['Patellofemoral pain','Patellar fracture/contusion','Prepatellar bursitis'],finding:'Patellar or anterior knee tenderness.'},
          {exam:'Palpate patellar tendon',diagnoses:['Patellar tendinopathy'],finding:'Focal patellar tendon tenderness, often with jumping/running.'},
          {exam:'Palpate tibial tuberosity',diagnoses:['Osgood-Schlatter disease'],finding:'Tenderness or swelling at tibial tuberosity in an adolescent athlete.'},
          {exam:'Palpate medial joint line',diagnoses:['Medial meniscal tear','Medial compartment osteoarthritis'],finding:'Focal medial joint-line tenderness.'},
          {exam:'Palpate lateral joint line',diagnoses:['Lateral meniscal tear','Lateral compartment osteoarthritis'],finding:'Focal lateral joint-line tenderness.'},
          {exam:'Compress/milk patella for effusion',diagnoses:['Acute ligament injury','Meniscal injury','Septic/inflammatory arthritis','Osteoarthritis flare'],finding:'Floating/bouncing patella, fluid wave, bulge, or asymmetric effusion.'},
          {exam:'Knee flexion/extension range of motion',diagnoses:['Intra-articular pathology','Meniscal tear','Septic arthritis','Osteoarthritis','Fracture or severe sprain'],finding:'Painful or limited range of motion.'},
          {exam:'Lachman or anterior drawer',diagnoses:['ACL tear'],finding:'Increased anterior tibial translation or soft endpoint.'},
          {exam:'Posterior drawer',diagnoses:['PCL tear'],finding:'Posterior tibial translation.'},
          {exam:'Valgus/abduction stress',diagnoses:['MCL sprain/tear'],finding:'Medial pain or laxity with valgus stress.'},
          {exam:'Varus/adduction stress',diagnoses:['LCL sprain/tear'],finding:'Lateral pain or laxity with varus stress.'}
        ],
        helpful:['McMurray test can support meniscal tear when joint-line pain, locking, or catching is present','Patellar grind can support patellofemoral pain']
      }
    },
    cases:[
      {id:'shoulder-rtc',region:'shoulder',title:'Overhead lateral shoulder weakness',history:'A 54-year-old has lateral shoulder pain and difficulty reaching overhead after yard work.',examFindings:['Painful abduction arc','Weak and painful empty-can test','Mild pain with Neer/Hawkins'],diagnosis:'Supraspinatus rotator cuff tear/tendinopathy',alternative:'Shoulder impingement',evidence:['Pain or weakness with empty can','Painful/limited abduction','Overhead lateral shoulder pain'],distractors:['Bicipital groove tenderness','Posterior drawer laxity','Positive straight leg raise'],required:['Shoulder abduction/adduction','Empty can / supraspinatus','Neer or Hawkins-Kennedy impingement test']},
      {id:'shoulder-impingement',region:'shoulder',title:'Pain reproduced by impingement maneuver',history:'A 46-year-old reports anterior-lateral shoulder pain when placing dishes on a high shelf.',examFindings:['Neer or Hawkins-Kennedy reproduces pain','Rotator cuff strength is mostly preserved','No AC step-off'],diagnosis:'Shoulder impingement',alternative:'Rotator cuff tendinopathy',evidence:['Anterior or lateral shoulder pain with Neer/Hawkins','Preserved strength argues against a large tear','Pain provoked by overhead motion'],distractors:['Medial joint-line tenderness','L5 web-space numbness','Posterior tibial translation'],required:['Shoulder flexion/extension','Shoulder abduction/adduction','Neer or Hawkins-Kennedy impingement test']},
      {id:'shoulder-ac',region:'shoulder',title:'Fall onto point of shoulder',history:'A 21-year-old fell directly onto the shoulder during a game and now has focal superior shoulder pain.',examFindings:['Focal AC joint tenderness','Subtle step-off compared with the other side','Pain with shoulder motion but preserved distal neurovascular exam'],diagnosis:'AC joint separation/arthritis',alternative:'Clavicle fracture',evidence:['Focal AC tenderness or step-off','Fall onto the shoulder','Comparison with the opposite shoulder shows asymmetry'],distractors:['Positive Lachman','Great-toe dorsiflexion weakness','Bicipital groove tenderness only'],required:['Inspect shoulders','Palpate acromioclavicular joints','Palpate clavicles']},
      {id:'shoulder-biceps',region:'shoulder',title:'Anterior shoulder pain at bicipital groove',history:'A 36-year-old has anterior shoulder pain after repetitive lifting.',examFindings:['Focal bicipital groove tenderness','Pain increases when the patient flexes the biceps during the palpation setup','Rotator cuff resistance is not clearly weak'],diagnosis:'Biceps tendinitis',alternative:'Labral/biceps pathology',evidence:['Focal bicipital groove tenderness','Anterior shoulder pain','Pain with biceps activation during palpation setup'],distractors:['Tibial tuberosity swelling','Midline vertebral tenderness','Patellar effusion'],required:['Palpate bicipital groove','Resisted internal rotation / subscapularis','Resisted external rotation / infraspinatus']},
      {id:'shoulder-capsulitis',region:'shoulder',title:'Globally stiff shoulder',history:'A 62-year-old with diabetes reports months of worsening shoulder stiffness.',examFindings:['Marked limitation with external rotation','Internal rotation behind the back is limited','Flexion and abduction are globally restricted'],diagnosis:'Adhesive capsulitis',alternative:'Shoulder osteoarthritis',evidence:['Global range-of-motion loss','External rotation is especially limited','Progressive stiffness over months'],distractors:['Soft endpoint on Lachman','Pain below knee with straight leg raise','Tibial tuberosity tenderness'],required:['Shoulder flexion/extension','Shoulder abduction/adduction','Shoulder internal rotation','Shoulder external rotation']},
      {id:'back-strain',region:'spine',title:'Paraspinal pain without neurologic deficit',history:'A 31-year-old has low back pain after lifting boxes. Pain stays in the back.',examFindings:['Paraspinal muscle tenderness','No midline bony tenderness','Normal strength, reflexes, sensation, and straight leg raise'],diagnosis:'Musculoskeletal low back strain',alternative:'Lumbar disc herniation with radiculopathy',evidence:['Paraspinal tenderness','No neurologic deficit','Straight leg raise is negative'],distractors:['Focal AC step-off','Floating patella','Weak empty-can test'],required:['Palpate paraspinal muscles','Lumbar flexion','L4/L5/S1 motor, reflex, and sensation screen','Straight leg raise']},
      {id:'back-l5',region:'spine',title:'Radiating leg pain with L5 clues',history:'A 43-year-old has low back pain radiating down the lateral leg into the foot.',examFindings:['Straight leg raise causes pain below the knee at 50 degrees','Weak great-toe dorsiflexion','Decreased sensation in the first dorsal web space'],diagnosis:'Lumbar disc herniation with L5 radiculopathy',alternative:'Spinal stenosis',evidence:['Positive straight leg raise with pain below knee','Weak great-toe dorsiflexion','L5 web-space sensory loss'],distractors:['Medial knee laxity with valgus stress','Bicipital groove tenderness','Patellar tendon tenderness'],required:['Great toe dorsiflexion L5','L5 sensation','Straight leg raise']},
      {id:'back-spondylolysis',region:'spine',title:'Extension-provoked adolescent back pain',history:'A 16-year-old gymnast has focal low back pain worse with back extension.',examFindings:['Lumbar extension reproduces pain','Neurologic screen is normal','No fever or systemic symptoms'],diagnosis:'Spondylolysis',alternative:'Mechanical low back pain',evidence:['Pain reproduced by lumbar extension','Adolescent athlete context','Normal neurologic screen'],distractors:['Posterior drawer translation','Bicipital groove pain','First web-space sensory loss'],required:['Lumbar extension','Inspect thoracic/lumbar spine','L4/L5/S1 neurologic screen']},
      {id:'back-inflammatory',region:'spine',title:'Inflammatory stiffness and reduced flexion',history:'A 27-year-old reports months of morning back stiffness that improves with activity.',examFindings:['Lumbar flexion is restricted','Paraspinal tenderness is mild','Neurologic exam is normal'],diagnosis:'Axial spondyloarthritis/ankylosing spondylitis',alternative:'Mechanical low back pain',evidence:['Reduced lumbar flexion','Morning stiffness that improves with activity','Chronic symptoms in a young adult'],distractors:['Focal patellar tendon pain','AC step-off','Soft endpoint on anterior drawer'],required:['Lumbar flexion','Lumbar lateral bending','Inspect thoracic/lumbar spine']},
      {id:'back-redflag',region:'spine',title:'Midline pain with red flags',history:'A 69-year-old with cancer history has worsening night back pain and malaise.',examFindings:['Focal midline vertebral tenderness','Paraspinal tenderness is less prominent','Neurologic screen must be checked carefully'],diagnosis:'Metastatic bone disease or vertebral osteomyelitis/discitis',alternative:'Musculoskeletal low back strain',evidence:['Midline bony tenderness','History/systemic red flags','Pain pattern is not simple paraspinal strain'],distractors:['Patellar tendon pain','Painful empty-can test','Valgus knee laxity'],required:['Palpate thoracic/lumbar spine','Palpate paraspinal muscles','L4/L5/S1 neurologic screen']},
      {id:'knee-acl',region:'knee',title:'Pop, effusion, and anterior translation',history:'A 20-year-old pivoted during basketball, felt a pop, and developed rapid swelling.',examFindings:['Effusion on patellar compression/milking','Lachman has increased anterior translation with soft endpoint','Joint-line palpation is not the main finding'],diagnosis:'ACL tear',alternative:'Meniscal tear',evidence:['Pop with rapid effusion','Positive Lachman/anterior drawer','Instability after pivoting injury'],distractors:['Neer/Hawkins shoulder pain','S1 sensory loss','Bicipital groove tenderness'],required:['Compress/milk patella for effusion','Lachman or anterior drawer','Palpate medial and lateral joint lines']},
      {id:'knee-pcl',region:'knee',title:'Dashboard injury with posterior translation',history:'A 33-year-old hit the dashboard in a motor vehicle crash and now has deep knee pain.',examFindings:['Posterior drawer shows posterior tibial translation','Effusion is present','Lachman is less impressive than posterior drawer'],diagnosis:'PCL tear',alternative:'ACL tear',evidence:['Posterior tibial translation','Dashboard mechanism','Effusion after trauma'],distractors:['Pain with empty-can test','Positive straight leg raise','Focal AC step-off'],required:['Posterior drawer','Compress/milk patella for effusion','Lachman or anterior drawer']},
      {id:'knee-meniscus',region:'knee',title:'Locking with joint-line tenderness',history:'A 45-year-old has twisting knee pain with intermittent locking and catching.',examFindings:['Medial joint-line tenderness','Painful terminal flexion','Effusion is mild and recurrent'],diagnosis:'Medial meniscal tear',alternative:'Medial compartment osteoarthritis',evidence:['Medial joint-line tenderness','Locking/catching history','Painful or limited range of motion'],distractors:['First dorsal web-space numbness','Bicipital groove tenderness','Limited shoulder external rotation'],required:['Palpate medial joint line','Assess knee flexion','Compress/milk patella for effusion']},
      {id:'knee-mcl',region:'knee',title:'Medial pain after lateral blow',history:'A soccer player took a blow to the outside of the knee and now has medial pain.',examFindings:['Valgus stress reproduces medial pain and mild laxity','Varus stress is stable','No posterior drawer translation'],diagnosis:'MCL sprain/tear',alternative:'Medial meniscal tear',evidence:['Medial pain or laxity with valgus stress','Lateral blow mechanism','Varus and posterior drawer are not the main abnormal tests'],distractors:['Neer/Hawkins shoulder pain','L5 dorsiflexion weakness','Patellar tendon tenderness'],required:['Valgus/abduction stress','Varus/adduction stress','Palpate medial joint line']},
      {id:'knee-osgood',region:'knee',title:'Adolescent tibial tuberosity pain',history:'A 13-year-old runner has anterior knee pain worse with jumping and stairs.',examFindings:['Tender swollen tibial tuberosity','Patellar tendon is less tender than the tuberosity','No effusion or ligament laxity'],diagnosis:'Osgood-Schlatter disease',alternative:'Patellar tendinopathy',evidence:['Tibial tuberosity tenderness/swelling','Adolescent athlete context','No ligament laxity or effusion'],distractors:['Positive straight leg raise','AC step-off','Posterior drawer translation'],required:['Palpate tibial tuberosity','Palpate patellar tendon','Inspect knees']},
      {id:'knee-prepatellar',region:'knee',title:'Anterior kneecap swelling after kneeling',history:'A 48-year-old tile worker has anterior knee swelling after kneeling for long hours.',examFindings:['Tender swelling over the patella','Range of motion is uncomfortable but possible','No valgus/varus laxity'],diagnosis:'Prepatellar bursitis',alternative:'Septic/inflammatory arthritis',evidence:['Anterior swelling over patella','Patellar/anterior tenderness','Kneeling occupational exposure'],distractors:['Bicipital groove tenderness','L5 sensory loss','AC joint step-off'],required:['Inspect knees','Palpate patella','Assess knee flexion/extension range of motion']},
      {id:'knee-effusion-hot',region:'knee',title:'Hot swollen knee with painful motion',history:'A 58-year-old has acute knee swelling, warmth, fever, and severe pain with motion.',examFindings:['Large effusion on patellar compression/milking','Flexion and extension are very painful','Inspection shows warmth/redness'],diagnosis:'Septic/inflammatory arthritis',alternative:'Osteoarthritis flare',evidence:['Effusion with hot swollen joint','Painful limited range of motion','Fever/systemic inflammatory features'],distractors:['Weak great-toe dorsiflexion','Painful empty-can test','Bicipital groove tenderness'],required:['Inspect knees','Compress/milk patella for effusion','Assess knee flexion','Assess knee extension']}
    ]
  };

  const originalActivityHub=window.activityHub;
  if(typeof originalActivityHub==='function'){
    window.activityHub=function activityHub(id){
      if(id==='osce'){
        const cards=[
          ['Checklist','Exact maneuvers','osceDrawChecklist()'],
          ['Findings','Diagnosis map','osceDrawDiagnosis()'],
          ['Differential','LearningSpace logic','osceDrawCase(0)']
        ];
        return `<div class="activity-hub"><div><span class="tag">Activity hub</span><h3>Choose the work style</h3></div><div class="activity-hub-grid">${cards.map(([title,desc,action])=>`<button class="activity-card" onclick="${action}"><b>${esc(title)}</b><span>${esc(desc)}</span></button>`).join('')}</div></div>`;
      }
      return originalActivityHub(id);
    };
  }

  function osceState(){
    state.oscePhysicalExam=state.oscePhysicalExam||{region:'shoulder',checklistIndex:0,dxIndex:0,maneuverIndex:0,caseIndex:0};
    return state.oscePhysicalExam;
  }

  function regions(){return Object.values(DATA.osce_physical_exam.regions);}
  function region(id){return DATA.osce_physical_exam.regions[id]||DATA.osce_physical_exam.regions.shoulder;}
  function wrapIndex(idx,total){return (idx+total)%total;}
  function shuffle(list){return list.slice().sort(()=>Math.random()-.5);}
  function norm(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
  function allDiagnoses(){
    const set=new Set();
    regions().forEach(r=>(r.map||[]).forEach(m=>(m.diagnoses||[]).forEach(d=>set.add(d))));
    DATA.osce_physical_exam.cases.forEach(c=>{set.add(c.diagnosis);set.add(c.alternative);});
    return [...set];
  }
  function regionTabs(active,fn){
    return `<div class="osce-region-tabs">${regions().map(r=>`<button class="${r.id===active?'primary':''}" onclick="${fn}('${r.id}',0)">${esc(r.label)}</button>`).join('')}</div>`;
  }
  function miniScore(){
    const done=Object.keys(state.completed).filter(k=>k.startsWith('osce:')).length;
    const checklistTotal=regions().reduce((sum,r)=>sum+r.checklist.length,0);
    const mapTotal=regions().reduce((sum,r)=>sum+r.map.length,0);
    return `<div class="osce-scorebar"><span><b>${done}</b>OSCE completions</span><span><b>${checklistTotal}</b>graded maneuvers</span><span><b>${mapTotal}</b>finding maps</span><span><b>${DATA.osce_physical_exam.cases.length}</b>diagnosis cases</span></div>`;
  }
  function choiceSet(values,attrs=''){
    return values.map(v=>`<button class="choice osce-option" data-value="${esc(v)}" ${attrs}>${rich(v)}</button>`).join('');
  }
  function feedback(id,html){
    const f=document.getElementById(id);
    if(!f)return;
    f.innerHTML=html;
    f.classList.add('show');
  }
  function lockChoices(btn){
    const box=btn.closest('[data-osce-lock]');
    if(!box||box.dataset.osceLock==='1')return null;
    box.dataset.osceLock='1';
    return box;
  }
  function markButtons(box,correctValues,selected){
    const correct=correctValues.map(norm);
    [...box.querySelectorAll('button')].forEach(b=>{
      if(correct.includes(norm(b.dataset.value)))b.classList.add('correct');
      else if(norm(b.dataset.value)===norm(selected))b.classList.add('wrong');
    });
  }
  function record(id,ok){
    complete(id,ok);
    save();
  }

  window.renderPhysicalExam=function renderPhysicalExam(){
    const m=DATA.modules.find(x=>x.id==='osce')||moduleDef;
    const body=`<article class="card osce-hero"><div><span class="tag">SP encounter prep</span><h3>Practice the exam exactly as it will be graded</h3><p>The module covers every graded shoulder, spine, and knee checklist portion, then turns findings into diagnosis and differential practice.</p>${miniScore()}</div><div class="osce-rules">${DATA.osce_physical_exam.prep.map(x=>`<div>${rich(x)}</div>`).join('')}</div></article><div id="osceGame"></div>`;
    renderShell('osce',m.title,m.desc,m.sources,body);
    osceDrawHome();
  };

  window.osceDrawHome=function osceDrawHome(){
    const cards=regions().map(r=>`<article class="card osce-region-card"><span class="tag">${esc(r.label)}</span><h3>${esc(r.chief)}</h3><p>${r.checklist.length} graded checklist items and ${r.map.length} finding-to-diagnosis links.</p><div class="toolbar"><button onclick="osceDrawChecklist('${r.id}',0)">Checklist</button><button onclick="osceDrawDiagnosis('${r.id}',0)">Findings</button><button onclick="osceDrawManeuver('${r.id}',0)">Maneuvers</button></div></article>`).join('');
    osceGame.innerHTML=`<div class="osce-mode-grid"><button class="card osce-mode" onclick="osceDrawChecklist()"><b>Checklist trainer</b><span>Recall each exact PE maneuver from the grading checklist.</span></button><button class="card osce-mode" onclick="osceDrawDiagnosis()"><b>Diagnosis from findings</b><span>Turn a positive maneuver or abnormal finding into the likely diagnosis.</span></button><button class="card osce-mode" onclick="osceDrawManeuver()"><b>Maneuver match</b><span>Pick the exam portion that supports a diagnosis.</span></button><button class="card osce-mode" onclick="osceDrawCase(0)"><b>Differential builder</b><span>Select most likely diagnosis, two evidence points, and leading alternative.</span></button><button class="card osce-mode" onclick="osceDrawRapidMap()"><b>Full PE map</b><span>Review every graded portion of the OSCE checklist.</span></button></div><div class="grid">${cards}</div>`;
  };

  window.osceDrawChecklist=function osceDrawChecklist(regionId,delta=0){
    const s=osceState();
    const r=region(regionId||s.region);
    s.region=r.id;
    s.checklistIndex=wrapIndex((regionId?s.checklistIndex: s.checklistIndex)+(delta||0),r.checklist.length);
    if(regionId&&delta===0)s.checklistIndex=0;
    save();
    const item=r.checklist[s.checklistIndex];
    const options=shuffle([item.item,...r.checklist.filter(x=>x.item!==item.item).map(x=>x.item).slice(0,3)]);
    osceGame.innerHTML=`<article class="card question-box osce-question">${regionTabs(r.id,'osceDrawChecklist')}<div class="toolbar"><button onclick="osceDrawChecklist('${r.id}',-1)">Previous maneuver</button><span class="counter">${s.checklistIndex+1}/${r.checklist.length}</span><button onclick="osceDrawChecklist('${r.id}',1)">Next maneuver</button><button onclick="osceDrawRapidMap()">Full map</button></div><span class="tag">${esc(r.label)} checklist</span><h3>${esc(item.category)}</h3><p>${rich(item.steps)}</p><p class="small">Which graded maneuver is being described?</p><div data-osce-lock="0">${choiceSet(options,`onclick="osceAnswerChecklist(this,'${r.id}',${s.checklistIndex})"`)} </div><div id="osceChecklistFeed" class="feedback"></div></article>`;
  };

  window.osceAnswerChecklist=function osceAnswerChecklist(btn,regionId,idx){
    const r=region(regionId),item=r.checklist[idx],box=lockChoices(btn);
    if(!box)return;
    const selected=btn.dataset.value;
    const ok=norm(selected)===norm(item.item);
    markButtons(box,[item.item],selected);
    record(`osce:checklist:${regionId}:${idx}`,ok);
    feedback('osceChecklistFeed',`<b>${ok?'Correct.':'Review this one.'}</b> ${rich(item.item)} is the checklist item. <br><b>Performance:</b> ${rich(item.steps)}`);
  };

  window.osceDrawDiagnosis=function osceDrawDiagnosis(regionId,delta=0){
    const s=osceState();
    const r=region(regionId||s.region);
    s.region=r.id;
    s.dxIndex=wrapIndex((regionId?s.dxIndex:s.dxIndex)+(delta||0),r.map.length);
    if(regionId&&delta===0)s.dxIndex=0;
    save();
    const item=r.map[s.dxIndex];
    const options=shuffle([item.diagnoses[0],...allDiagnoses().filter(d=>!item.diagnoses.map(norm).includes(norm(d))).slice(0,4)]).slice(0,5);
    osceGame.innerHTML=`<article class="card question-box osce-question">${regionTabs(r.id,'osceDrawDiagnosis')}<div class="toolbar"><button onclick="osceDrawDiagnosis('${r.id}',-1)">Previous finding</button><span class="counter">${s.dxIndex+1}/${r.map.length}</span><button onclick="osceDrawDiagnosis('${r.id}',1)">Next finding</button><button onclick="osceDrawManeuver('${r.id}',0)">Maneuver match</button></div><span class="tag">${esc(r.label)} finding</span><h3>${esc(item.exam)}</h3><p>${rich(item.finding)}</p><p class="small">Which diagnosis or condition does this most directly support?</p><div data-osce-lock="0">${choiceSet(options,`onclick="osceAnswerDiagnosis(this,'${r.id}',${s.dxIndex})"`)} </div><div id="osceDxFeed" class="feedback"></div></article>`;
  };

  window.osceAnswerDiagnosis=function osceAnswerDiagnosis(btn,regionId,idx){
    const r=region(regionId),item=r.map[idx],box=lockChoices(btn);
    if(!box)return;
    const selected=btn.dataset.value;
    const ok=item.diagnoses.map(norm).includes(norm(selected));
    markButtons(box,item.diagnoses,selected);
    record(`osce:dx:${regionId}:${idx}`,ok);
    feedback('osceDxFeed',`<b>${ok?'Correct.':'Main association:'}</b> ${rich(item.diagnoses.join(' / '))}.<br><b>Finding:</b> ${rich(item.finding)}<br><b>Exam portion:</b> ${rich(item.exam)}`);
  };

  window.osceDrawManeuver=function osceDrawManeuver(regionId,delta=0){
    const s=osceState();
    const r=region(regionId||s.region);
    s.region=r.id;
    s.maneuverIndex=wrapIndex((regionId?s.maneuverIndex:s.maneuverIndex)+(delta||0),r.map.length);
    if(regionId&&delta===0)s.maneuverIndex=0;
    save();
    const item=r.map[s.maneuverIndex];
    const options=shuffle([item.exam,...r.map.filter(x=>x.exam!==item.exam).map(x=>x.exam).slice(0,4)]).slice(0,5);
    osceGame.innerHTML=`<article class="card question-box osce-question">${regionTabs(r.id,'osceDrawManeuver')}<div class="toolbar"><button onclick="osceDrawManeuver('${r.id}',-1)">Previous map</button><span class="counter">${s.maneuverIndex+1}/${r.map.length}</span><button onclick="osceDrawManeuver('${r.id}',1)">Next map</button><button onclick="osceDrawDiagnosis('${r.id}',0)">Diagnosis mode</button></div><span class="tag">${esc(r.label)} maneuver match</span><h3>${rich(item.diagnoses.join(' / '))}</h3><p>${rich(item.finding)}</p><p class="small">Which exam portion produces or screens for this finding?</p><div data-osce-lock="0">${choiceSet(options,`onclick="osceAnswerManeuver(this,'${r.id}',${s.maneuverIndex})"`)} </div><div id="osceManeuverFeed" class="feedback"></div></article>`;
  };

  window.osceAnswerManeuver=function osceAnswerManeuver(btn,regionId,idx){
    const r=region(regionId),item=r.map[idx],box=lockChoices(btn);
    if(!box)return;
    const selected=btn.dataset.value;
    const ok=norm(selected)===norm(item.exam);
    markButtons(box,[item.exam],selected);
    record(`osce:maneuver:${regionId}:${idx}`,ok);
    feedback('osceManeuverFeed',`<b>${ok?'Correct.':'Use this maneuver:'}</b> ${rich(item.exam)}.<br><b>Positive finding:</b> ${rich(item.finding)}<br><b>Diagnosis link:</b> ${rich(item.diagnoses.join(' / '))}`);
  };

  window.osceDrawCase=function osceDrawCase(delta=0){
    const s=osceState();
    const cases=DATA.osce_physical_exam.cases;
    s.caseIndex=wrapIndex((s.caseIndex||0)+(delta||0),cases.length);
    save();
    const c=cases[s.caseIndex],r=region(c.region);
    const likelyOptions=shuffle([c.diagnosis,c.alternative,...allDiagnoses().filter(d=>norm(d)!==norm(c.diagnosis)&&norm(d)!==norm(c.alternative)).slice(0,4)]).slice(0,6);
    const altOptions=shuffle([c.alternative,c.diagnosis,...allDiagnoses().filter(d=>norm(d)!==norm(c.diagnosis)&&norm(d)!==norm(c.alternative)).slice(4,8)]).slice(0,6);
    const evidenceOptions=shuffle([...c.evidence,...c.distractors]).slice(0,6);
    osceGame.innerHTML=`<article class="card osce-case question-box"><div class="toolbar"><button onclick="osceDrawCase(-1)">Previous case</button><span class="counter">${s.caseIndex+1}/${cases.length}</span><button onclick="osceDrawCase(1)">Next case</button><button onclick="osceDrawRapidMap()">Full PE map</button></div><span class="tag">${esc(r.label)} differential builder</span><h3>${esc(c.title)}</h3><p>${rich(c.history)}</p><div class="osce-finding-grid">${c.examFindings.map(f=>`<div><b>SP finding</b><span>${rich(f)}</span></div>`).join('')}</div><div class="osce-required"><b>Checklist portions to cover:</b>${c.required.map(x=>`<span>${esc(x)}</span>`).join('')}</div><div class="osce-decision-grid"><div><h3>Most likely diagnosis</h3>${likelyOptions.map(v=>`<button class="choice osce-option" data-group="likely" data-value="${esc(v)}" onclick="osceChooseOne(this)">${rich(v)}</button>`).join('')}</div><div><h3>Leading alternative</h3>${altOptions.map(v=>`<button class="choice osce-option" data-group="alternative" data-value="${esc(v)}" onclick="osceChooseOne(this)">${rich(v)}</button>`).join('')}</div><div><h3>Supporting evidence</h3><p class="small">Pick at least two.</p>${evidenceOptions.map(v=>`<button class="choice osce-option" data-group="evidence" data-value="${esc(v)}" onclick="osceToggleEvidence(this)">${rich(v)}</button>`).join('')}</div></div><button class="primary" onclick="osceSubmitCase('${esc(c.id)}')">Submit differential</button><div id="osceCaseFeed" class="feedback"></div></article>`;
  };

  window.osceChooseOne=function osceChooseOne(btn){
    const group=btn.dataset.group;
    btn.closest('.osce-decision-grid').querySelectorAll(`[data-group="${group}"]`).forEach(b=>b.classList.remove('selected'));
    btn.classList.add('selected');
  };

  window.osceToggleEvidence=function osceToggleEvidence(btn){
    btn.classList.toggle('selected');
  };

  window.osceSubmitCase=function osceSubmitCase(caseId){
    const c=DATA.osce_physical_exam.cases.find(x=>x.id===caseId);
    if(!c)return;
    const likely=document.querySelector('[data-group="likely"].selected')?.dataset.value||'';
    const alternative=document.querySelector('[data-group="alternative"].selected')?.dataset.value||'';
    const evidence=[...document.querySelectorAll('[data-group="evidence"].selected')].map(b=>b.dataset.value);
    const likelyOk=norm(likely)===norm(c.diagnosis);
    const altOk=norm(alternative)===norm(c.alternative);
    const evidenceOk=evidence.filter(v=>c.evidence.map(norm).includes(norm(v))).length;
    const score=(likelyOk?1:0)+(altOk?1:0)+Math.min(2,evidenceOk);
    const ok=score===4;
    document.querySelectorAll('[data-group="likely"]').forEach(b=>{if(norm(b.dataset.value)===norm(c.diagnosis))b.classList.add('correct');else if(b.classList.contains('selected'))b.classList.add('wrong');});
    document.querySelectorAll('[data-group="alternative"]').forEach(b=>{if(norm(b.dataset.value)===norm(c.alternative))b.classList.add('correct');else if(b.classList.contains('selected'))b.classList.add('wrong');});
    document.querySelectorAll('[data-group="evidence"]').forEach(b=>{if(c.evidence.map(norm).includes(norm(b.dataset.value)))b.classList.add('correct');else if(b.classList.contains('selected'))b.classList.add('wrong');});
    record(`osce:case:${c.id}`,ok);
    feedback('osceCaseFeed',`<b>Score: ${score}/4.</b> Most likely: ${rich(c.diagnosis)}. Leading alternative: ${rich(c.alternative)}.<br><b>Support:</b> ${rich(c.evidence.join('; '))}<br><b>Checklist focus:</b> ${rich(c.required.join('; '))}`);
  };

  window.osceDrawRapidMap=function osceDrawRapidMap(){
    const checklist=regions().map(r=>`<details class="osce-map-section" open><summary>${esc(r.label)} checklist: ${r.checklist.length} graded portions</summary><div class="osce-checklist-grid">${r.checklist.map((item,i)=>`<article class="osce-step"><span>${i+1}</span><div><b>${esc(item.item)}</b><small>${esc(item.category)}</small><p>${rich(item.steps)}</p></div></article>`).join('')}</div>${r.helpful?.length?`<p class="small"><b>Helpful but not core checklist:</b> ${rich(r.helpful.join('; '))}</p>`:''}</details>`).join('');
    const maps=regions().map(r=>`<article class="card"><span class="tag">${esc(r.label)} diagnosis map</span><table class="table osce-map-table"><thead><tr><th>Exam portion</th><th>Positive finding</th><th>Diagnoses supported</th></tr></thead><tbody>${r.map.map(item=>`<tr><td>${rich(item.exam)}</td><td>${rich(item.finding)}</td><td>${rich(item.diagnoses.join(' / '))}</td></tr>`).join('')}</tbody></table></article>`).join('');
    osceGame.innerHTML=`<div class="toolbar"><button onclick="osceDrawHome()">OSCE home</button><button onclick="osceDrawChecklist()">Checklist trainer</button><button onclick="osceDrawCase(0)">Differential builder</button></div><article class="card"><span class="tag">Complete OSCE coverage</span><h3>Every graded PE portion from the checklist</h3><p>This view keeps the full shoulder, lumbar/thoracic spine, and knee exam visible for rapid review before switching back into active recall.</p></article>${checklist}<div class="grid">${maps}</div>`;
  };

  if(document.getElementById('dashboard')?.classList.contains('active')&&typeof renderDashboard==='function')renderDashboard();
})();
