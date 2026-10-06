/*
===========================================================
 OCTOBER AI
 Local Historical Knowledge Engine
 حرب أكتوبر 1973
===========================================================

هذا ليس نموذج ذكاء اصطناعي سحابيًا.
إنه محرك معرفة محلي يعتمد على:
- التطبيع العربي
- المرادفات
- الأسماء المستعارة
- مطابقة السياق
- النوايا
- العلاقات بين الأشخاص والأحداث والأماكن
- ترتيب النتائج
- البحث داخل المحتوى
- أسئلة المتابعة

ولا يقوم باختلاق معلومة غير موجودة في قاعدة المعرفة.
===========================================================
*/

(function(){

"use strict";

const MEDIA = [

 {
  id:"map_sinai_01",
  title:"خريطة جبهة سيناء — 6 أكتوبر",
  type:"map",
  url:"https://upload.wikimedia.org/wikipedia/commons/1/1e/Yom_Kippur_War_-_Sinai_Front_%28October_6%2C_1973%29.svg",
  tags:["خريطة","سيناء","6 اكتوبر","الجبهة المصرية"]
 },

 {
  id:"map_arabic_01",
  title:"خريطة حرب أكتوبر بالعربية",
  type:"map",
  url:"https://commons.wikimedia.org/wiki/Special:FilePath/1973%20sinai%20war%20maps-ar.jpg",
  tags:["خريطة","سيناء","حرب اكتوبر"]
 },

 {
  id:"sadat_photo",
  title:"أنور السادات",
  type:"person",
  url:"https://upload.wikimedia.org/wikipedia/commons/5/5b/Anwar_Sadat.jpg",
  tags:["السادات","انور السادات"]
 },

 {
  id:"mubarak_photo",
  title:"حسني مبارك",
  type:"person",
  url:"https://upload.wikimedia.org/wikipedia/commons/5f/Hosni_Mubarak_1981.jpg",
  tags:["مبارك","حسني مبارك","القوات الجوية"]
 }

];

const PEOPLE = {

 sadat:{
  id:"sadat",
  name:"أنور السادات",
  aliases:[
   "السادات",
   "انور السادات",
   "الرئيس السادات",
   "الرئيس اللي كان وقت الحرب",
   "رئيس مصر وقت الحرب"
  ],
  role:"رئيس جمهورية مصر العربية أثناء حرب أكتوبر",
  keywords:[
   "رئيس",
   "مصر",
   "حرب اكتوبر",
   "قرار الحرب",
   "القيادة السياسية"
  ],
  summary:
   "أنور السادات كان رئيس جمهورية مصر العربية أثناء حرب أكتوبر 1973، واتخذت القيادة السياسية في عهده قرار خوض الحرب، ثم قاد المسار السياسي الذي تلاها.",
  related:["war_1973","planning","aftermath"]
 },

 ahmed_ismail:{
  id:"ahmed_ismail",
  name:"أحمد إسماعيل علي",
  aliases:[
   "احمد اسماعيل",
   "احمد اسماعيل علي",
   "وزير الحربية",
   "القائد العام"
  ],
  role:"وزير الحربية والقائد العام للقوات المسلحة المصرية",
  keywords:[
   "وزير الحربية",
   "القائد العام",
   "الجيش",
   "قيادة الحرب"
  ],
  summary:
   "تولى أحمد إسماعيل علي منصب وزير الحربية والقائد العام للقوات المسلحة المصرية خلال حرب أكتوبر 1973.",
  related:["war_1973","crossing"]
 },

 shazly:{
  id:"shazly",
  name:"سعد الشاذلي",
  aliases:[
   "سعد الشاذلي",
   "الشاذلي",
   "رئيس الاركان",
   "رئيس اركان الجيش"
  ],
  role:"رئيس أركان القوات المسلحة المصرية",
  keywords:[
   "رئيس الاركان",
   "التخطيط",
   "العمليات",
   "القيادة"
  ],
  summary:
   "كان سعد الشاذلي رئيس أركان القوات المسلحة المصرية خلال حرب أكتوبر، وارتبط دوره بالتخطيط والعمليات العسكرية.",
  related:["planning","crossing","gap"]
 },

 mubarak:{
  id:"mubarak",
  name:"محمد حسني مبارك",
  aliases:[
   "حسني مبارك",
   "مبارك",
   "محمد حسني مبارك",
   "قائد القوات الجوية",
   "قائد سلاح الجو"
  ],
  role:"قائد القوات الجوية المصرية خلال حرب أكتوبر",
  keywords:[
   "القوات الجوية",
   "الطيران",
   "الضربة الجوية",
   "الجو"
  ],
  summary:
   "كان محمد حسني مبارك قائد القوات الجوية المصرية خلال حرب أكتوبر، وارتبط دوره بإدارة القوات الجوية والعمليات في بداية الحرب.",
  related:["air_force","october_6"]
 },

 golda:{
  id:"golda",
  name:"جولدا مائير",
  aliases:[
   "جولدا مائير",
   "جولدا",
   "رئيسة وزراء اسرائيل"
  ],
  role:"رئيسة وزراء إسرائيل أثناء الحرب",
  keywords:[
   "اسرائيل",
   "رئيسة الوزراء",
   "القيادة الاسرائيلية"
  ],
  summary:
   "كانت جولدا مائير رئيسة وزراء إسرائيل أثناء حرب أكتوبر 1973.",
  related:["war_1973","israel"]
 },

 sharon:{
  id:"sharon",
  name:"أرييل شارون",
  aliases:[
   "ارييل شارون",
   "شارون",
   "ارئيل شارون"
  ],
  role:"قائد عسكري إسرائيلي على جبهة سيناء",
  keywords:[
   "شارون",
   "سيناء",
   "الثغرة",
   "العبور غرب القناة"
  ],
  summary:
   "كان أرييل شارون أحد القادة العسكريين الإسرائيليين البارزين على جبهة سيناء، وارتبط بعمليات العبور غرب قناة السويس خلال مرحلة الثغرة.",
  related:["gap","deversoir"]
 }

};

const KNOWLEDGE = [

 {
  id:"background_1967",
  title:"خلفية ما قبل حرب أكتوبر",
  category:"background",
  date:"1967–1973",
  aliases:[
   "ما قبل الحرب",
   "قبل اكتوبر",
   "خلفية الحرب",
   "سبب الحرب",
   "ليه حصلت الحرب"
  ],
  keywords:[
   "1967",
   "سيناء",
   "حرب يونيو",
   "حرب الاستنزاف",
   "استعادة الارض"
  ],
  people:["sadat","shazly"],
  locations:["سيناء","قناة السويس"],
  summary:
   "بدأت الخلفية المباشرة لحرب أكتوبر بعد حرب يونيو 1967 واحتلال سيناء، ثم جاءت حرب الاستنزاف وإعادة بناء القوات المصرية والتخطيط لعملية عسكرية لاستعادة المبادرة.",
  body:
   "بعد حرب يونيو 1967 فقدت مصر شبه جزيرة سيناء. خلال السنوات التالية اندلعت حرب الاستنزاف، وتزامنت معها عملية إعادة بناء القوات المسلحة المصرية وتطوير القدرات والخطط اللازمة لعبور قناة السويس ومواجهة التحصينات الإسرائيلية.",
  related:["attrition","planning","war_1973"]
 },

 {
  id:"attrition",
  title:"حرب الاستنزاف",
  category:"background",
  date:"1969–1970",
  aliases:[
   "حرب الاستنزاف",
   "الاستنزاف",
   "قبل حرب اكتوبر"
  ],
  keywords:[
   "قناة السويس",
   "مدفعية",
   "طيران",
   "مواجهات",
   "1969",
   "1970"
  ],
  people:["sadat"],
  locations:["قناة السويس"],
  summary:
   "كانت حرب الاستنزاف مرحلة من الصراع العسكري بين مصر وإسرائيل قبل حرب أكتوبر، وشهدت مواجهات جوية ومدفعية وعمليات على جبهة القناة.",
  body:
   "هدفت حرب الاستنزاف إلى الضغط العسكري على القوات الإسرائيلية واستنزاف قدراتها، كما شكلت مرحلة مهمة في إعادة بناء الخبرة القتالية المصرية وتطوير منظومة الدفاع الجوي.",
  related:["planning","background_1967"]
 },

 {
  id:"planning",
  title:"التخطيط لحرب أكتوبر",
  category:"planning",
  aliases:[
   "خطة الحرب",
   "التخطيط للحرب",
   "خطة اكتوبر",
   "ازاي خططوا للحرب",
   "كيف تم التخطيط"
  ],
  keywords:[
   "خطة",
   "تخطيط",
   "عبور",
   "قناة السويس",
   "خط بارليف",
   "القوات المسلحة"
  ],
  people:["sadat","ahmed_ismail","shazly"],
  locations:["قناة السويس","سيناء"],
  summary:
   "اعتمد التخطيط المصري على عبور قناة السويس وتثبيت رؤوس جسور شرقها والتعامل مع التحصينات الإسرائيلية، مع استخدام القوات الجوية والمدفعية والدفاع الجوي ضمن منظومة مشتركة.",
  body:
   "ركزت الخطة المصرية على تحقيق أهداف عسكرية محددة شرق القناة، وبدأت بالتمهيد الجوي والمدفعي ثم عبور المشاة وإنشاء المعابر والكباري وتثبيت القوات في رؤوس الجسور.",
  related:["crossing","bar_lev","october_6"]
 },

 {
  id:"war_1973",
  title:"حرب أكتوبر 1973",
  category:"war",
  date:"6–26 أكتوبر 1973",
  aliases:[
   "حرب اكتوبر",
   "حرب 73",
   "اكتوبر 73",
   "حرب العاشر من رمضان",
   "حرب يوم الغفران",
   "حرب يوم كيبور"
  ],
  keywords:[
   "مصر",
   "اسرائيل",
   "سيناء",
   "قناة السويس",
   "6 اكتوبر",
   "1973"
  ],
  people:["sadat","ahmed_ismail","shazly","mubarak","golda","sharon"],
  locations:["سيناء","قناة السويس","السويس","اسماعيلية"],
  summary:
   "بدأت حرب أكتوبر في 6 أكتوبر 1973 بهجوم مصري سوري متزامن ضد القوات الإسرائيلية في سيناء والجولان.",
  body:
   "على الجبهة المصرية بدأت العمليات بعبور قناة السويس تحت غطاء جوي ومدفعي، ثم تطورت العمليات خلال الأسابيع التالية إلى معارك على جانبي القناة وانتهت بمرحلة وقف إطلاق النار والتفاوض.",
  related:[
   "october_6",
   "crossing",
   "october_7_9",
   "october_10_13",
   "october_14",
   "gap",
   "ceasefire",
   "suez",
   "aftermath"
 ]
 },

 {
  id:"october_6",
  title:"6 أكتوبر 1973",
  category:"event",
  date:"6 أكتوبر 1973",
  aliases:[
   "يوم 6 اكتوبر",
   "يوم اكتوبر",
   "اول يوم في الحرب",
   "بداية الحرب",
   "الهجوم يوم 6",
   "يوم العبور"
  ],
  keywords:[
   "الضربة الجوية",
   "التمهيد المدفعي",
   "العبور",
   "قناة السويس",
   "المشاة",
   "الكباري"
  ],
  people:["sadat","ahmed_ismail","mubarak","shazly"],
  locations:["قناة السويس","سيناء"],
  summary:
   "في 6 أكتوبر 1973 بدأت العمليات المصرية ضد القوات الإسرائيلية شرق قناة السويس، وتبع التمهيد الجوي والمدفعي عبور القوات وإنشاء المعابر ورؤوس الجسور.",
  body:
   "بدأت القوات المصرية الهجوم في توقيت واحد على امتداد الجبهة. شاركت القوات الجوية والمدفعية في التمهيد، ثم عبرت وحدات المشاة القناة، وبدأ المهندسون العسكريون في إنشاء المعابر والكباري والتعامل مع الساتر الترابي.",
  related:["crossing","bar_lev","air_force","engineers"]
 },

 {
  id:"crossing",
  title:"عبور قناة السويس",
  category:"operation",
  date:"6 أكتوبر 1973",
  aliases:[
   "العبور",
   "عبور القناة",
   "عبور قناة السويس",
   "عدوا القناة ازاي",
   "ازاي حصل العبور"
  ],
  keywords:[
   "قناة السويس",
   "مشاة",
   "كباري",
   "معابر",
   "مهندسين",
   "رؤوس الجسور"
  ],
  people:["ahmed_ismail","shazly"],
  locations:["قناة السويس"],
  summary:
   "عبرت وحدات المشاة المصرية قناة السويس وأنشأت القوات الهندسية المعابر والكباري، ثم توسعت رؤوس الجسور على الضفة الشرقية.",
  body:
   "كان عبور القناة من أهم عناصر الخطة المصرية. بعد التمهيد النيراني بدأت القوات بالعبور، ثم عملت وحدات المهندسين على فتح الممرات وإقامة المعابر اللازمة لنقل القوات والمعدات.",
  related:["october_6","bar_lev","engineers"]
 },

 {
  id:"bar_lev",
  title:"خط بارليف",
  category:"fortifications",
  aliases:[
   "بارليف",
   "خط بارليف",
   "تحصينات بارليف",
   "تحصينات القناة"
  ],
  keywords:[
   "تحصينات",
   "ساتر ترابي",
   "قناة السويس",
   "نقاط قوية"
  ],
  locations:["قناة السويس","سيناء"],
  summary:
   "كان خط بارليف منظومة من التحصينات الإسرائيلية على الضفة الشرقية لقناة السويس.",
  body:
   "واجهت القوات المصرية منظومة من المواقع والتحصينات على طول القناة. كان التعامل معها جزءًا من عملية العبور، وشاركت وحدات المهندسين في فتح الممرات والتعامل مع الساتر الترابي.",
  related:["crossing","october_6"]
 },

 {
  id:"october_7_9",
  title:"7–9 أكتوبر",
  category:"event",
  date:"7–9 أكتوبر 1973",
  aliases:[
   "بعد العبور",
   "اول ايام الحرب",
   "7 اكتوبر",
   "8 اكتوبر",
   "9 اكتوبر"
  ],
  keywords:[
   "رؤوس الجسور",
   "تعزيزات",
   "هجمات اسرائيلية",
   "القناة"
  ],
  summary:
   "ركزت القوات المصرية في الأيام الأولى على تثبيت وتوسيع رؤوس الجسور شرق القناة، بينما أعادت إسرائيل تنظيم قواتها وبدأت محاولات استعادة المبادرة.",
  body:
   "استمرت القوات المصرية في تدعيم المواقع شرق القناة ونقل المعدات والقوات عبر المعابر، بينما شهدت الجبهة ردودًا إسرائيلية ومحاولات لوقف التقدم المصري.",
  related:["crossing","war_1973"]
 },

 {
  id:"october_10_13",
  title:"10–13 أكتوبر",
  category:"event",
  date:"10–13 أكتوبر 1973",
  aliases:[
   "10 اكتوبر",
   "11 اكتوبر",
   "12 اكتوبر",
   "13 اكتوبر",
   "منتصف الحرب"
  ],
  keywords:[
   "مدرعات",
   "طيران",
   "مدفعية",
   "سيناء"
  ],
  summary:
   "شهدت الفترة بين 10 و13 أكتوبر استمرار العمليات الجوية والبرية والمدفعية وتطورات متبادلة على جبهة سيناء.",
  body:
   "استمرت القوات المصرية والإسرائيلية في تنفيذ عمليات هجومية ودفاعية، وأصبحت المعارك أكثر اعتمادًا على تحركات المدرعات والقوات الجوية والمدفعية.",
  related:["war_1973","october_14"]
 },

 {
  id:"october_14",
  title:"الهجوم المصري في 14 أكتوبر",
  category:"battle",
  date:"14 أكتوبر 1973",
  aliases:[
   "14 اكتوبر",
   "هجوم 14 اكتوبر",
   "معركة المدرعات",
   "معارك 14 اكتوبر"
  ],
  keywords:[
   "مدرعات",
   "دبابات",
   "هجوم مصري",
   "سيناء"
  ],
  summary:
   "في 14 أكتوبر نفذت القوات المصرية هجومًا شرق القناة، وشهدت المنطقة معارك مدرعة كبيرة.",
  body:
   "جاء الهجوم في سياق محاولة تطوير الموقف شرق القناة. واجهت القوات المصرية مقاومة إسرائيلية قوية، وأصبحت المعارك المدرعة عنصرًا أساسيًا في هذا اليوم.",
  related:["gap","war_1973"]
 },

 {
  id:"gap",
  title:"الثغرة",
  category:"operation",
  date:"15–17 أكتوبر 1973",
  aliases:[
   "الثغرة",
   "ثغرة الدفرسوار",
   "الدفرسوار",
   "عبور اسرائيل للقناة",
   "العبور غرب القناة",
   "حصلت امتى الثغرة",
   "الثغرة حصلت امتى"
  ],
  keywords:[
   "دفرسوار",
   "القناة",
   "غرب القناة",
   "شارون",
   "عبور اسرائيلي"
  ],
  people:["sharon","shazly","ahmed_ismail"],
  locations:["الدفرسوار","قناة السويس"],
  summary:
   "في منتصف أكتوبر تمكنت قوات إسرائيلية من العبور إلى غرب قناة السويس في منطقة الدفرسوار، وبدأت مرحلة عسكرية جديدة عُرفت بالثغرة.",
  body:
   "ارتبطت الثغرة بعبور قوات إسرائيلية غرب القناة عبر منطقة الدفرسوار، ثم توسعت العمليات غرب القناة. أدى ذلك إلى تغير الموقف العملياتي وظهور تهديدات للقوات المصرية في غرب القناة ولخطوط الاتصال.",
  related:["deversoir","october_14","ceasefire"]
 },

 {
  id:"deversoir",
  title:"الدفرسوار",
  category:"location",
  aliases:[
   "الدفرسوار",
   "منطقة الدفرسوار",
   "دفرسوار"
  ],
  keywords:[
   "الثغرة",
   "عبور غرب القناة",
   "القناة"
  ],
  locations:["الدفرسوار","قناة السويس"],
  summary:
   "الدفرسوار منطقة على قناة السويس ارتبط اسمها بعمليات العبور الإسرائيلي إلى غرب القناة خلال حرب أكتوبر.",
  body:
   "أصبحت منطقة الدفرسوار محورًا مهمًا في العمليات خلال النصف الثاني من الحرب بسبب عبور القوات الإسرائيلية غرب القناة.",
  related:["gap"]
 },

 {
  id:"ceasefire",
  title:"وقف إطلاق النار",
  category:"event",
  date:"22–26 أكتوبر 1973",
  aliases:[
   "وقف اطلاق النار",
   "الهدنة",
   "قرار 338",
   "22 اكتوبر",
   "24 اكتوبر",
   "26 اكتوبر"
  ],
  keywords:[
   "مجلس الامن",
   "338",
   "وقف النار",
   "الامم المتحدة"
  ],
  summary:
   "صدر قرار مجلس الأمن رقم 338 في 22 أكتوبر داعيًا إلى وقف إطلاق النار، واستمرت التطورات العسكرية والسياسية حتى تثبيت الوضع في أواخر الشهر.",
  body:
   "دخلت الحرب مرحلة وقف إطلاق النار والاتصالات الدولية في 22 أكتوبر. واستمرت بعض العمليات والتوترات على الأرض قبل الوصول إلى ترتيبات أكثر استقرارًا.",
  related:["suez","aftermath"]
 },

 {
  id:"suez",
  title:"معركة السويس",
  category:"battle",
  date:"24 أكتوبر 1973",
  aliases:[
   "معركة السويس",
   "السويس",
   "24 اكتوبر",
   "قتال السويس"
  ],
  keywords:[
   "مدينة السويس",
   "قتال",
   "24 اكتوبر",
   "القناة"
  ],
  locations:["السويس"],
  summary:
   "شهدت مدينة السويس قتالًا خلال مرحلة نهاية الحرب، وأصبحت المعركة جزءًا بارزًا من أحداث أواخر أكتوبر.",
  body:
   "ارتبطت التطورات في السويس بمرحلة العمليات التي أعقبت قرارات وقف إطلاق النار، وشهدت المدينة قتالًا وتطورات ميدانية قبل استقرار الموقف.",
  related:["ceasefire","aftermath"]
 },

 {
  id:"air_force",
  title:"القوات الجوية المصرية",
  category:"force",
  aliases:[
   "القوات الجوية",
   "سلاح الجو",
   "الطيران المصري",
   "قائد القوات الجوية",
   "الضربة الجوية"
  ],
  keywords:[
   "مبارك",
   "طيران",
   "طائرات",
   "ضربة جوية"
  ],
  people:["mubarak"],
  summary:
   "شاركت القوات الجوية المصرية في العمليات الافتتاحية لحرب أكتوبر وفي عمليات الإسناد خلال الحرب.",
  body:
   "كان للقوات الجوية دور في التمهيد والعمليات الجوية مع بداية الحرب، ضمن منظومة مشتركة مع المدفعية والقوات البرية والدفاع الجوي.",
  related:["october_6","mubarak"]
 },

 {
  id:"engineers",
  title:"المهندسون العسكريون والعبور",
  category:"force",
  aliases:[
   "المهندسين",
   "المهندسون العسكريون",
   "كباري العبور",
   "فتح الساتر الترابي"
  ],
  keywords:[
   "كوبري",
   "كباري",
   "ساتر ترابي",
   "ممرات",
   "معابر"
  ],
  summary:
   "لعبت وحدات المهندسين العسكريين دورًا أساسيًا في فتح الممرات وإنشاء المعابر والكباري اللازمة لعبور القوات والمعدات.",
  body:
   "بعد بدء عبور القوات، كان استمرار نقل الجنود والمعدات يتطلب إنشاء معابر ثابتة ومتحركة والتعامل مع العوائق الهندسية على الضفة الشرقية للقناة.",
  related:["crossing","bar_lev"]
 },

 {
  id:"aftermath",
  title:"ما بعد حرب أكتوبر",
  category:"aftermath",
  date:"1973 وما بعده",
  aliases:[
   "بعد الحرب",
   "نتيجة الحرب",
   "ماذا حدث بعد الحرب",
   "ما بعد اكتوبر",
   "نتائج اكتوبر"
  ],
  keywords:[
   "فصل القوات",
   "المفاوضات",
   "السلام",
   "سيناء",
   "سياسة"
  ],
  people:["sadat"],
  summary:
   "أدت حرب أكتوبر إلى تحولات عسكرية وسياسية كبيرة، وتبعتها اتفاقات فصل القوات ثم مسار سياسي انتهى لاحقًا باتفاقية السلام المصرية الإسرائيلية.",
  body:
   "بعد انتهاء العمليات العسكرية دخلت مصر وإسرائيل في ترتيبات لفصل القوات، ثم تطور المسار السياسي والدبلوماسي في السنوات التالية. كان للحرب أثر كبير في إعادة تشكيل الموقف السياسي حول قضية سيناء والصراع العربي الإسرائيلي.",
  related:["war_1973","ceasefire"]
 },

 {
  id:"israel",
  title:"القيادة الإسرائيلية",
  category:"people",
  aliases:[
   "اسرائيل",
   "القيادة الاسرائيلية",
   "قادة اسرائيل"
  ],
  people:["golda","sharon"],
  summary:
   "شملت القيادة الإسرائيلية السياسية والعسكرية أثناء الحرب رئيسة الوزراء جولدا مائير وقادة عسكريين على الجبهة، من بينهم أرييل شارون.",
  related:["war_1973","gap"]
 }

];

function normalize(text){

 if(text===null||text===undefined)return "";

 return String(text)
  .toLowerCase()
  .normalize("NFKC")
  .replace(/[ًٌٍَُِّْـ]/g,"")
  .replace(/[أإآٱ]/g,"ا")
  .replace(/ى/g,"ي")
  .replace(/ؤ/g,"و")
  .replace(/ئ/g,"ي")
  .replace(/ة/g,"ه")
  .replace(/[٠-٩]/g,d=>String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
  .replace(/[^\p{L}\p{N}\s]/gu," ")
  .replace(/\s+/g," ")
  .trim();

}

function tokens(text){
 return [...new Set(normalize(text).split(" ").filter(x=>x.length>1))];
}

function includesAny(text,arr){
 const n=normalize(text);
 return arr.some(x=>n.includes(normalize(x)));
}

function detectIntent(query){

 const q=normalize(query);

 if(includesAny(q,[
  "صوره","صور","صورة","لقطه","هاتلي صوره","وريني صوره"
 ])) return "media";

 if(includesAny(q,[
  "خريطه","خرايط","خريطة","خرائط","فين على الخريطة"
 ])) return "map";

 if(includesAny(q,[
  "مين","من هو","من هي","الشخص","الرئيس","القائد"
 ])) return "person";

 if(includesAny(q,[
  "امتي","متي","متى","تاريخ","يوم"
 ])) return "date";

 if(includesAny(q,[
  "فين","اين","أين","مكان"
 ])) return "location";

 if(includesAny(q,[
  "ليه","لماذا","ازاي","كيف","سبب","السبب"
 ])) return "reason";

 if(includesAny(q,[
  "ايه اللي حصل","ماذا حدث","ايه حصل","احكي","احكيلي","القصة"
 ])) return "event";

 if(includesAny(q,[
  "بيعمل ايه","كان بيعمل ايه","دوره","وظيفته","مسؤول عن"
 ])) return "role";

 return "general";
}

function scoreEntry(entry,query,intent){

 const q=normalize(query);
 const ts=tokens(query);

 let score=0;

 const title=normalize(entry.title);
 const aliases=(entry.aliases||[]).map(normalize);
 const keywords=(entry.keywords||[]).map(normalize);
 const body=normalize(
  [
   entry.summary||"",
   entry.body||"",
   ...(entry.locations||[]),
   ...(entry.people||[])
  ].join(" ")
 );

 if(title===q)score+=100;
 if(title.includes(q)&&q.length>3)score+=55;

 aliases.forEach(alias=>{
  if(alias===q)score+=90;
  else if(q.includes(alias)&&alias.length>3)score+=55;
  else if(alias.includes(q)&&q.length>3)score+=35;
 });

 keywords.forEach(k=>{
  if(q.includes(k))score+=18;
 });

 ts.forEach(t=>{
  if(title.includes(t))score+=16;
  if(body.includes(t))score+=5;
 });

 if(intent==="person" && entry.category==="people")score+=25;
 if(intent==="event" && ["event","battle","operation"].includes(entry.category))score+=22;
 if(intent==="date" && entry.date)score+=16;
 if(intent==="location" && entry.locations?.length)score+=15;
 if(intent==="role" && entry.people?.length)score+=20;
 if(intent==="map" && entry.category==="location")score+=12;

 return score;
}

function search(query,options={}){

 const intent=detectIntent(query);

 const results=KNOWLEDGE
  .map(entry=>({
   entry,
   score:scoreEntry(entry,query,intent)
  }))
  .filter(x=>x.score>0)
  .sort((a,b)=>b.score-a.score);

 return {
  intent,
  results:results.slice(0,options.limit||8)
 };

}

function findPerson(query){

 const q=normalize(query);

 let best=null;
 let score=0;

 Object.values(PEOPLE).forEach(person=>{

  const values=[
   person.name,
   ...(person.aliases||[]),
   ...(person.keywords||[])
  ];

  values.forEach(value=>{

   const n=normalize(value);

   let s=0;

   if(q===n)s=100;
   else if(q.includes(n)&&n.length>2)s=70;
   else if(n.includes(q)&&q.length>2)s=40;

   if(s>score){
    score=s;
    best=person;
   }

  });

 });

 return best;
}

function getEntry(id){
 return KNOWLEDGE.find(x=>x.id===id)||null;
}

function getMedia(ids){

 if(!ids)return MEDIA;

 const arr=Array.isArray(ids)?ids:[ids];

 return MEDIA.filter(media=>
  arr.includes(media.id) ||
  arr.some(id=>normalize(media.title).includes(normalize(id)))
 );

}

function mediaForEntries(entries){

 const ids=[];

 entries.forEach(entry=>{

  const text=normalize([
   entry.title,
   ...(entry.aliases||[]),
   ...(entry.keywords||[])
  ].join(" "));

  MEDIA.forEach(media=>{

   const mt=normalize(
    [media.title,...(media.tags||[])].join(" ")
   );

   if(
    mt.split(" ").some(t=>t.length>2&&text.includes(t))
   ){
    ids.push(media.id);
   }

  });

 });

 return getMedia([...new Set(ids)]);

}

function suggestions(query,intent){

 const q=normalize(query);

 if(q.includes("سادات")||q.includes("السادات")){
  return [
   "السادات كان بيعمل ايه وقت الحرب؟",
   "امتى بدأت حرب اكتوبر؟",
   "ايه علاقة السادات بقرار الحرب؟"
  ];
 }

 if(q.includes("ثغره")||q.includes("دفرسوار")){
  return [
   "الثغرة حصلت امتى؟",
   "ايه اللي حصل في الدفرسوار؟",
   "مين كان من القادة المرتبطين بالثغرة؟"
  ];
 }

 if(q.includes("مبارك")||q.includes("جويه")||q.includes("جو")){
  return [
   "مبارك كان دوره ايه في الحرب؟",
   "ايه دور القوات الجوية؟",
   "ايه اللي حصل يوم 6 اكتوبر؟"
  ];
 }

 if(intent==="map"){
  return [
   "هاتلي خريطة جبهة سيناء",
   "فين قناة السويس في الحرب؟",
   "ايه منطقة الدفرسوار؟"
  ];
 }

 return [
  "مين كان رئيس مصر وقت الحرب؟",
  "إيه اللي حصل يوم 6 أكتوبر؟",
  "الثغرة حصلت إمتى وليه؟",
  "هاتلي خريطة حرب أكتوبر"
 ];
}

function answerFromPerson(person,intent){

 if(!person)return null;

 if(intent==="role"){
  return `${person.name} كان ${person.role}.\n\n${person.summary}`;
 }

 return `${person.name}\n\n${person.role}.\n\n${person.summary}`;
}

function answerFromEntry(entry,intent){

 let answer=entry.summary||entry.body||"";

 if(intent==="date"&&entry.date){
  answer=`التاريخ: ${entry.date}\n\n${answer}`;
 }

 if(intent==="reason"){
  answer=`السياق والسبب:\n\n${entry.body||entry.summary}`;
 }

 if(intent==="event"){
  answer=`${entry.title}\n\n${entry.body||entry.summary}`;
 }

 if(intent==="location"&&entry.locations?.length){
  answer=`المكان المرتبط بالحدث: ${entry.locations.join("، ")}.\n\n${entry.summary}`;
 }

 return answer;
}

function smartAsk(query,context={}){

 const original=String(query||"").trim();

 if(!original){
  return {
   answer:"اكتب سؤالك عن حرب أكتوبر وسأبحث داخل المعرفة المحلية.",
   confidence:0,
   entries:[],
   media:[],
   suggestions:suggestions("", "general"),
   intent:"general"
  };
 }

 const intent=detectIntent(original);

 /*
  سياق الصفحة:
  إذا كان المستخدم يسأل سؤالًا غامضًا مثل:
  "الصورة واحد في طب اسمه ايه؟"
  يمكن للواجهة إرسال entityId أو selectedMediaId.
 */

 if(context.entityId){

  const person=PEOPLE[context.entityId];

  if(person){

   return {
    answer:answerFromPerson(person,intent),
    confidence:.97,
    entries:person.related.map(getEntry).filter(Boolean),
    media:MEDIA.filter(m=>
      normalize(m.title).includes(normalize(person.name)) ||
      (m.tags||[]).some(t=>normalize(person.name).includes(normalize(t)))
    ),
    suggestions:suggestions(original,intent),
    intent
   };

  }

 }

 const person=findPerson(original);

 if(person && (intent==="person"||intent==="role"||original.length<45)){

  return {
   answer:answerFromPerson(person,intent),
   confidence:.96,
   entries:person.related.map(getEntry).filter(Boolean),
   media:MEDIA.filter(m=>
    (m.tags||[]).some(t=>
     normalize(t).includes(normalize(person.name).split(" ")[0])
    )
   ),
   suggestions:suggestions(original,intent),
   intent
  };

 }

 const result=search(original,{limit:6});

 if(!result.results.length){

  return {
   answer:
    "لم أجد داخل قاعدة المعرفة المحلية معلومة كافية للإجابة عن هذا السؤال بدقة. لن أخترع إجابة.\n\nجرّب السؤال باسم شخصية أو حدث أو تاريخ، مثل: «مين السادات؟» أو «الثغرة حصلت إمتى؟».",
   confidence:0,
   entries:[],
   media:[],
   suggestions:suggestions(original,intent),
   intent
  };

 }

 const top=result.results[0];

 const confidence=Math.min(
  .95,
  Math.max(.42,top.score/100)
 );

 const entries=result.results.map(x=>x.entry);

 let answer=answerFromEntry(top.entry,intent);

 if(result.results.length>1 && top.score<55){

  const extra=result.results
   .slice(1,3)
   .map(x=>`• ${x.entry.title}: ${x.entry.summary}`)
   .join("\n");

  answer+=`\n\nموضوعات مرتبطة:\n${extra}`;

 }

 let media=[];

 if(intent==="media"||intent==="map"){
  media=mediaForEntries(entries);

  if(intent==="map"){
   const maps=MEDIA.filter(m=>m.type==="map");
   media=[...maps,...media];
  }

 }

 return {
  answer,
  confidence,
  entries,
  media:[...new Map(media.map(m=>[m.id,m])).values()],
  suggestions:suggestions(original,intent),
  intent
 };

}

function ask(query,context){
 return smartAsk(query,context);
}

function getPerson(id){
 return PEOPLE[id]||null;
}

function stats(){

 return {
  entries:KNOWLEDGE.length,
  people:Object.keys(PEOPLE).length,
  media:MEDIA.length,
  categories:[...new Set(KNOWLEDGE.map(x=>x.category))].length,
  aliases:KNOWLEDGE.reduce(
   (n,x)=>n+(x.aliases?.length||0),0
  )
 };

}

window.OCTOBER_AI=Object.freeze({
 ask,
 smartAsk,
 search,
 getEntry,
 getPerson,
 getMedia,
 suggest:suggestions,
 stats,
 normalize,
 detectIntent
});

})();
