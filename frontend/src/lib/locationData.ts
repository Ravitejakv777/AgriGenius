// Cascading Location Hierarchy: Country -> State -> District -> Village / Mandal
// All entries are verified strictly per district (no cross-district leakage)
// All dropdowns return options strictly in ascending alphabetical order (A-Z)

export interface LocationDataStructure {
  [country: string]: {
    [state: string]: {
      [district: string]: string[];
    };
  };
}

export const LOCATION_DATA: LocationDataStructure = {
  "India": {
    "Andhra Pradesh": {
      "Alluri Sitharama Raju": [
        "Addateegala", "Ananthagiri", "Araku Valley", "Chintapalle", "Chintoor",
        "Devipatnam", "Dumbriguda", "G. Madugula", "G.K. Veedhi", "Gangavaram",
        "Hukumpeta", "Koonavaram", "Koyyuru", "Maredumilli", "Munchingi Puttu",
        "Paderu", "Pedabayalu", "Rajavommangi", "Rampachodavaram", "Vararamachandrapuram",
        "Yetapaka"
      ],
      "Anakapalli": [
        "Achutapuram", "Anakapalli", "Butchayyapeta", "Cheedikada", "Chodavaram",
        "Devarapalle", "Golugonda", "K.Kotapadu", "Kasimkota", "Kotauratla",
        "Madugula", "Makavarapalem", "Munagapaka", "Nakkapalle", "Narsipatnam",
        "Parawada", "Payakaraopeta", "Rambilli", "Ravikamatham", "Rolugunta",
        "S.Rayavaram", "Yelamanchili"
      ],
      "Ananthapuramu": [
        "Anantapur Rural", "Anantapur Urban", "Atmakur", "Beluguppa", "Bommanahal",
        "Brahmasamudram", "Bukkarayasamudram", "D.Hirehal", "Garladinne", "Gooty",
        "Gummagatta", "Kalyandurg", "Kambadur", "Kanekal", "Kudair",
        "Kundurpi", "Narpala", "Pamidi", "Peddapappur", "Peddavadugur",
        "Putlur", "Rayadurg", "Settur", "Singanamala", "Tadpatri",
        "Uravakonda", "Vajrakarur", "Vidapanakal", "Yadiki"
      ],
      "Annamayya": [
        "B.Kothakota", "Chinnamandem", "Galiveedu", "Gurramkonda", "Kalakada",
        "Kalikiri", "Kurabalakota", "Madanapalle", "Mulakalacheruvu", "Nandalur",
        "Nimmanapalle", "Pedda Thippasamudram", "Peddamandyam", "Penagalur", "Pileru",
        "Pullampeta", "Punganur Rural", "Rajampet", "Ramasamudram", "Rayachoti",
        "Sambepalli", "T.Sundupalle", "Thamballapalle", "Valmikipuram", "Veeraballi",
        "Vontimitta"
      ],
      "Bapatla": [
        "Addanki", "Amruthalur", "Ballikurava", "Bapatla", "Bhattiprolu",
        "Cherukupalle", "Chinaganjam", "Inkollu", "J.Panguluru", "Karamchedu",
        "Kollur", "Korisapadu", "Martur", "Nagaram", "Nizampatnam",
        "Parchur", "Repalle", "Santhamaguluru", "Tsundur", "Vetapalem",
        "Yeddanapudi"
      ],
      "Chittoor": [
        "Bangarupalem", "Chittoor Rural", "Chittoor Urban", "Chowdepalle", "Gangadhara Nellore",
        "Gudipala", "Irala", "Karvetinagar", "Nagari", "Nindra",
        "Palamaner", "Palasamudram", "Peddapanjani", "Penumuru", "Pulicherla",
        "Puthalapattu", "Rallabudugur", "Rompicherla", "Sadum", "Santhipuram",
        "Somala", "Srirangarajapuram", "Thavanampalle", "Vedurukuppam", "Venkatagirikota",
        "Vijayapuram", "Yadamari"
      ],
      "Dr. B.R. Ambedkar Konaseema": [
        "Ainavilli", "Alamuru", "Allavaram", "Amalapuram", "Ambajipeta",
        "Atreyapuram", "I. Polavaram", "Katrenikona", "Kothapeta", "Malikipuram",
        "Mamidikuduru", "Mandapeta", "Mummidivaram", "P.Gannavaram", "Ramachandrapuram",
        "Ravulapalem", "Rayavaram", "Razole", "Sakhinetipalle", "Uppalaguptam"
      ],
      "East Godavari": [
        "Anaparthi", "Biccavolu", "Chagallu", "Devarapalle", "Gokavaram",
        "Gopalapuram", "Kadiam", "Korukonda", "Kovvur", "Nallajerla",
        "Nidadavole", "Peravali", "Rajahmundry Rural", "Rajahmundry Urban", "Rajanagaram",
        "Rangampeta", "Seethanagaram", "Tallapudi", "Undrajavaram"
      ],
      "Eluru": [
        "Agiripalli", "Bapulapadu", "Bhimadole", "Buttayagudem", "Chatrai",
        "Chintalapudi", "Denduluru", "Dharmajigudem", "Dwaraka Tirumala", "Eluru Rural",
        "Eluru Urban", "Jangareddygudem", "Jeelugu Milli", "Kalidindi", "Kamavarapukota",
        "Koyyalagudem", "Kukunoor", "Lingapalem", "Mandavalli", "Mudinepalli",
        "Musunuru", "Nidamarru", "Nuzvid", "Pedapadu", "Pedavegi",
        "Polavaram", "T.Narasapuram", "Unguturu", "Velairpadu"
      ],
      "Guntur": [
        "Amaravati", "Atchampet", "Chebrolu", "Duggirala", "Guntur East",
        "Guntur Rural", "Guntur West", "Kakumanu", "Kollipara", "Krosuru",
        "Mangalagiri", "Medikonduru", "Pedakakani", "Pedakurapadu", "Pedanandipadu",
        "Phirangipuram", "Ponnur", "Prathipadu", "Tadepalle", "Tadikonda",
        "Tenali", "Thullur", "Vatticherukuru"
      ],
      "Kakinada": [
        "Gollaprolu", "Jaggampeta", "Kajuluru", "Kakinada Rural", "Kakinada Urban",
        "Karapa", "Kirlampudi", "Kotananduru", "Peddapuram", "Pithapuram",
        "Prathipadu", "Routhulapudi", "Samalkot", "Sankhavaram", "Thallarevu",
        "Thondangi", "Tuni", "U.Kothapalle", "Yeleswaram"
      ],
      "Krishna": [
        "Avanigadda", "Bantumilli", "Challapalli", "Ghantasala", "Gudivada",
        "Gudlavalleru", "Koduru", "Kruthivennu", "Machilipatnam", "Mopidevi",
        "Movva", "Nagayalanka", "Nandivada", "Pamarru", "Pedana",
        "Pedaparupudi"
      ],
      "Kurnool": [
        "Adoni", "Alur", "Aspari", "C.Belagal", "Devanakonda",
        "Gonegandla", "Gudur", "Halaharvi", "Holagunda", "Kallur",
        "Kodumur", "Kowthalam", "Krishnagiri", "Kurnool Rural", "Kurnool Urban",
        "Mantralayam", "Nandavaram", "Orvakal", "Pattikonda", "Pedda Kadubur",
        "Tuggali", "Veldurthi", "Yemmiganur"
      ],
      "Nandyal": [
        "Allagadda", "Atmakur", "Banaganapalle", "Bandi Atmakur", "Bethamcherla",
        "Chagalamarri", "Dhone", "Dornipadu", "Gadivemula", "Gospadu",
        "Jupadu Banglow", "Kolimigundla", "Koilkuntla", "Kothapalle", "Mahanandi",
        "Midthur", "Nandikotkur", "Nandyal Rural", "Nandyal Urban", "Owk",
        "Pagidyala", "Pamulapadu", "Peapally", "Rudravaram", "Sanjamala",
        "Sirvella", "Srisailam", "Uyyalawada", "Velgodu"
      ],
      "NTR": [
        "A.Konduru", "Chandarlapadu", "G.Konduru", "Gampalagudem", "Gannavaram",
        "Ibrahimpatnam", "Jaggayyapeta", "Kanchikacherla", "Mylavaram", "Nandigama",
        "Penuganchiprolu", "Reddigudem", "Tiruvuru", "Vatsavai", "Veerullapadu",
        "Vijayawada Central", "Vijayawada East", "Vijayawada North", "Vijayawada Rural", "Vijayawada West",
        "Vuyyuru"
      ],
      "Palnadu": [
        "Bellamkonda", "Bollapalle", "Chilakaluripet", "Dachepalle", "Durgi",
        "Edlapadu", "Gurazala", "Ipur", "Karempudi", "Macherla",
        "Machavaram", "Muppalla", "Nadendla", "Narasaraopet", "Nekarikallu",
        "Piduguralla", "Rajupalem", "Rentachintala", "Rompicherla", "Sattenapalle",
        "Savalyapuram", "Veldurthi", "Vinukonda"
      ],
      "Parvathipuram Manyam": [
        "Balajipeta", "Bhamini", "Garugubilli", "Gummalakshmipuram", "Jiyyammavalasa",
        "Komarada", "Kurupam", "Makkuva", "Pachipenta", "Palakonda",
        "Parvathipuram", "Salur", "Seethampeta", "Seethanagaram", "Veeraghattam"
      ],
      "Prakasam": [
        "Bestavaripeta", "Chandra Sekhara Puram", "Chirala", "Cumbum", "Darsi",
        "Donakonda", "Giddalur", "Hanumanthuni Padu", "Kanigiri", "Komarolu",
        "Konakanamitla", "Kothapatnam", "Kurichedu", "Maddipadu", "Markapur",
        "Marripudi", "Mundlamuru", "Naguluppalapadu", "Ongole", "Podili",
        "Ponnaluru", "Racherla", "Santhanuthalapadu", "Singarayakonda", "Tarlupadu",
        "Tripuranthakam", "Veligandla", "Yerragondapalem"
      ],
      "Sri Potti Sriramulu Nellore": [
        "Allur", "Ananthasagaram", "Anumasamudrampeta", "Atmakur", "Bogole",
        "Buchireddypalem", "Chejerla", "Dagadarthi", "Duttalur", "Indukurpet",
        "Jaladanki", "Kaligiri", "Kaluvoya", "Kavali", "Kodavalur",
        "Kondapuram", "Kovur", "Manubolu", "Marripadu", "Muthukur",
        "Nellore Rural", "Nellore Urban", "Podalakur", "Rapur", "Sangam",
        "Seetharamapuram", "Thotapalligudur", "Udayagiri", "Varikuntapadu", "Venkatachalam",
        "Vidavalur", "Vinjamur"
      ],
      "Sri Sathya Sai": [
        "Agali", "Amadagur", "Amarapuram", "Bathalapalle", "Bukkapatnam",
        "Chennekothapalle", "Chilamathur", "Dharmavaram", "Gandlapenta", "Gorantla",
        "Gudibanda", "Hindupur", "Kadiri", "Kanaganapalle", "Kothacheruvu",
        "Lepakshi", "Madakasira", "Mudigubba", "Nallacheruvu", "Nallamada",
        "Nambulapulakunta", "O.D.Cheruvu", "Penukonda", "Puttaparthi", "Ramagiri",
        "Roddam", "Rolla", "Somandepalle", "Talupula", "Tanakal"
      ],
      "Srikakulam": [
        "Amadalavalasa", "Burja", "Etcherla", "Ganguvarisigadam", "Gara",
        "Hiramandalam", "Ichchapuram", "Jalumuru", "Kanchili", "Kaviti",
        "Kotabommali", "Kothuru", "Lakshminarsupeta", "Mandasa", "Meliaputti",
        "Narasannapeta", "Palasa", "Polaki", "Ponduru", "Ranasthalam",
        "Santhabommali", "Saravakota", "Sarubujjili", "Sompeta", "Srikakulam",
        "Tekkali", "Vajrapukotturu"
      ],
      "Tirupati": [
        "Balayapalli", "Chandragiri", "Chittamur", "Dakkili", "Doravarisatram",
        "Gudur", "Kota", "Naidupeta", "Narayanavanam", "Ozili",
        "Pakala", "Pellakur", "Pitchatur", "Puttur", "Renigunta",
        "Satyavedu", "Srikalahasti", "Sullurpeta", "Tada", "Thottambedu",
        "Tirupati Rural", "Tirupati Urban", "Vadamalapeta", "Vakadu", "Varadaiahpalem",
        "Venkatagiri", "Yerpedu"
      ],
      "Visakhapatnam": [
        "Anandapuram", "Bheemunipatnam", "Gajuwaka", "Gopalapatnam", "Maharanipeta",
        "Mulagada", "Padmanabham", "Pedagantyada", "Pendurthi", "Seethammadhara",
        "Visakhapatnam Rural", "Visakhapatnam Urban"
      ],
      "Vizianagaram": [
        "Badangi", "Bhogapuram", "Bondapalle", "Cheepurupalli", "Dattirajeru",
        "Denkada", "Gajapathinagaram", "Garividi", "Gurla", "Jami",
        "Kothavalasa", "L.Kota", "Mentada", "Merakamudidam", "Nellimarla",
        "Pusapatirega", "Rajam", "Regidi Amadalavalasa", "Santhakaviti", "Srungavarapukota",
        "Vangara", "Vepada", "Vizianagaram"
      ],
      "West Godavari": [
        "Achanta", "Akividu", "Attili", "Bhimavaram", "Iragavaram",
        "Kalla", "Mogalthur", "Palacole", "Palakoderu", "Pentapadu",
        "Penugonda", "Penumantra", "Peravali", "Poduru", "Tadepalligudem",
        "Tanuku", "Undi", "Veeravasaram", "Yelamanchili"
      ],
      "YSR Kadapa": [
        "Atlur", "B.Kodur", "B.Matam", "Badvel", "Chakrayapet",
        "Chapadu", "Chennur", "Chinthakommadinne", "Duvvur", "Gopavaram",
        "Jammalamadugu", "Kadapa", "Kalasapadu", "Kamalapuram", "Khajipet",
        "Kondapuram", "Lingala", "Muddanur", "Mydukur", "Mylavaram",
        "Peddamudium", "Proddatur", "Pulivendula", "S.Mydukur", "Simhadripuram",
        "Thondur", "Vallur", "Veerapunayunipalle", "Vempalli", "Vemula",
        "Yerraguntla"
      ]
    },
    "Telangana": {
      "Adilabad": ["Adilabad Rural", "Adilabad Urban", "Bazarhathnoor", "Bela", "Boath", "Gudihatnoor", "Ichoda", "Indervelly", "Jainath", "Mavala", "Narnoor", "Talamadugu", "Tamsi", "Utnoor"],
      "Bhadradri Kothagudem": ["Aswapuram", "Aswaraopeta", "Bhadrachalam", "Burgampahad", "Chandrugonda", "Cherla", "Chunchupally", "Dammapeta", "Dummugudem", "Gundala", "Julurpad", "Karakagudem", "Kothagudem", "Laxmidevipally", "Manuguru", "Palwancha", "Pinapaka", "Sujathanagar", "Tekulapally", "Yellandu"],
      "Hanamkonda": ["Atmakur", "Bheemadevarpalli", "Damera", "Dharmasagar", "Elkaturthy", "Hanamkonda", "Hasanparthy", "Inavolu", "Kamalapur", "Kazipet", "Nadikuda", "Parkal", "Shayampet", "Velair"],
      "Hyderabad": ["Amberpet", "Asifnagar", "Bahadurpura", "Bandlaguda", "Charminar", "Golconda", "Himayatnagar", "Khairatabad", "Marredpally", "Musheerabad", "Nampally", "Saidabad", "Secunderabad", "Shaikpet", "Tirumalagiri"],
      "Jagtial": ["Beerpur", "Buggaram", "Dharmapuri", "Gollapally", "Ibrahimpatnam", "Jagtial Rural", "Jagtial Urban", "Kathlapur", "Kodimial", "Korutla", "Mallapur", "Mallial", "Medipally", "Metpally", "Pegadapally", "Raikal", "Sarangapur", "Velgatoor"],
      "Jangaon": ["Bachannapet", "Devaruppula", "Ghanpur Station", "Jangaon", "Lingalaghanpur", "Narmetta", "Palakurthy", "Raghunathpally", "Tarigoppula", "Zaffergadh"],
      "Jayashankar Bhupalpally": ["Bhupalpally", "Chityal", "Ghanpur", "Kataram", "Khammampalle", "Kodem", "Mahadevpur", "Malharrao", "Mogullapally", "Palimela", "Regonda", "Tekumatla"],
      "Jogulamba Gadwal": ["Alampur", "Dharoor", "Gadwal", "Ghattu", "Ieeja", "Itikyal", "Kaloor Timmanadoddi", "Maldakal", "Manopad", "Rajoli", "Undavelly", "Waddepally"],
      "Kamareddy": ["Banswada", "Bhiknoor", "Bibipet", "Bichkunda", "Birkoor", "Domakonda", "Gandhari", "Jukkal", "Kamareddy", "Machareddy", "Madnoor", "Nasrullabad", "Nizamsagar", "Pitlam", "Rajampet", "Sadashivanagar", "Tadwai", "Yellareddy"],
      "Karimnagar": ["Chigurumamidi", "Choppadandi", "Gangadhara", "Ganneruvaram", "Huzurabad", "Jammikunta", "Karimnagar Rural", "Karimnagar Urban", "Kothapally", "Manakondur", "Ramadugu", "Shankarapatnam", "Thimmapur", "Veenavanka"],
      "Khammam": ["Bonakal", "Chintakani", "Enkoor", "Kallur", "Kamepally", "Khammam Rural", "Khammam Urban", "Konijerla", "Kusumanchi", "Madhira", "Mudigonda", "Nelakondapalli", "Penuballi", "Raghunathapalem", "Sathupalli", "Singareni", "Tallada", "Thirumalayapalem", "Wyra", "Yerrupalem"],
      "Kumuram Bheem Asifabad": ["Asifabad", "Bejjur", "Chintamanepally", "Dahegaon", "Jainoor", "Kagaznagar", "Kerameri", "Kouthala", "Lingapur", "Penchikalpet", "Rebbena", "Sirpur T", "Tiryani", "Wankdi"],
      "Mahabubabad": ["Bayyaram", "Danthalapalle", "Dornakal", "Garla", "Gudur", "Kesamudram", "Kothaguda", "Kuravi", "Mahabubabad", "Maripeda", "Narsimhulapet", "Nellikudur", "Peddavangara", "Seerole"],
      "Mahabubnagar": ["Balanagar", "Bhoothpur", "C.C.Kunta", "Devarkadra", "Gandeed", "Hanwada", "Jadcherla", "Koilkonda", "Mahabubnagar Rural", "Mahabubnagar Urban", "Midjil", "Moosapet", "Nawabpet", "Rajapur"],
      "Mancherial": ["Bellampally", "Bheemaram", "Chennur", "Dandepally", "Hajipur", "Jannaram", "Jaipur", "Kannepally", "Kotapally", "Luxettipet", "Mancherial", "Mandamarri", "Nennal", "Naspur", "Tandur", "Vemanpally"],
      "Medak": ["Alladurg", "Chegunta", "Havelighanpur", "Kowdipalle", "Kulcharam", "Medak", "Narsapur", "Nizampet", "Papannapet", "Ramayampet", "Regode", "Shankarampet A", "Shankarampet R", "Shivampet", "Tekmal", "Tupran", "Yeldurthy"],
      "Medchal-Malkajgiri": ["Alwal", "Bachupally", "Dundigal Gandimaisamma", "Ghatkesar", "Kapra", "Keesara", "Kukatpally", "Malkajgiri", "Medchal", "Medipally", "Muduchintalpally", "Quthbullapur", "Shamirpet"],
      "Mulugu": ["Eturunagaram", "Govindaraopet", "Kannaiguda", "Mangapet", "Mulugu", "Tadvai", "Venkatapur", "Venkatapuram", "Wazeed"],
      "Nagarkurnool": ["Achampet", "Amrabad", "Bijinapally", "Charakonda", "Kalwakurthy", "Kollapur", "Lingal", "Nagarkurnool", "Padara", "Peddakothapally", "Telkapally", "Thimmajipet", "Uppununthala", "Urkonda", "Vangoor"],
      "Nalgonda": ["Chandur", "Chityal", "Damaracherla", "Devarakonda", "Gundlapally", "Gurrampode", "Haliya", "Kangal", "Kattangur", "Kethepally", "Madugulapally", "Miryalaguda", "Munugode", "Nakrekal", "Nalgonda", "Narketpally", "Nidamanoor", "Pedda Adiserlapally", "Peddavoora", "Sali Gouraram", "Thipparthy", "Tirumalagiri Sagar", "Vemulapally"],
      "Narayanpet": ["Damaragidda", "Dhanwada", "Kosgi", "Krishna", "Maddur", "Maganoor", "Makthal", "Marikal", "Narayanpet", "Utkoor"],
      "Nirmal": ["Basar", "Bhainsa", "Dilawarpur", "Kaddampeddur", "Khanapur", "Kubeer", "Kuntala", "Laxmanchanda", "Mamda", "Mudhole", "Narsapur G", "Nirmal Rural", "Nirmal Urban", "Pembi", "Sarangapur", "Soan", "Tanur"],
      "Nizamabad": ["Armoor", "Balkonda", "Bheemgal", "Bodhan", "Chandur", "Dharpally", "Dichpally", "Jakranpally", "Kotgiri", "Makloor", "Mendora", "Mopka", "Morthad", "Mupkal", "Nandipet", "Navipet", "Nizamabad North", "Nizamabad Rural", "Nizamabad South", "Renjal", "Rudrur", "Sirikonda", "Varni", "Velpur", "Yedapally"],
      "Peddapalli": ["Anthergaon", "Dharmaram", "Eligaid", "Julapalle", "Kamanpur", "Manthani", "Mutharam Manthani", "Odela", "Palakurthy", "Peddapalli", "Ramagundam", "Sulthanabad"],
      "Rajanna Sircilla": ["Boinpally", "Chandurthi", "Ellanthakunta", "Gambhiraopet", "Illanthakunta", "Konaraopet", "Mustabad", "Rudrangi", "Sircilla", "Thangallapally", "Veernapally", "Yellareddypet"],
      "Rangareddy": ["Abdullapurmet", "Amangal", "Chevella", "Farooqnagar", "Gandipet", "Hayathnagar", "Ibrahimpatnam", "Kadthal", "Kandukur", "Keshampet", "Kondurg", "Kothur", "Madgul", "Maheshwaram", "Manchal", "Moinabad", "Nandigama", "Rajendranagar", "Saroornagar", "Serilingampally", "Shabad", "Shadnagar", "Shamshabad", "Talakondapalle", "Yacharam"],
      "Sangareddy": ["Ameenpur", "Andole", "Gummadidala", "Hathnoora", "Jharasangam", "Kandi", "Kangti", "Kohir", "Kondapur", "Manoor", "Mogudampally", "Munipally", "Nagalgidda", "Narayankhed", "Nyalkal", "Patancheru", "Pulkal", "Ramchandrapuram", "Sadasivpet", "Sangareddy", "Sirgapoor", "Vatpally", "Zaheerabad"],
      "Siddipet": ["Bejjanki", "Cheriyal", "Chinnakodur", "Dhoolmitta", "Doultabad", "Dubbak", "Gajwel", "Husnabad", "Jagdevpur", "Koheda", "Komuravelli", "Kondapak", "Maddur", "Markook", "Mulug", "Nangnoor", "Raipole", "Siddipet Rural", "Siddipet Urban", "Thoguta", "Wargal"],
      "Suryapet": ["Ananthagiri", "Atmakur S", "Chilkur", "Chivvemla", "Garidepally", "Huzurnagar", "Jaggayyagudem", "Kodad", "Maddirala", "Mattampally", "Mella Chervu", "Mothey", "Munagala", "Nadigudem", "Nagaram", "Neredcherla", "Penpahad", "Suryapet", "Thirumalagiri", "Thungathurthy"],
      "Vikarabad": ["Bantwaram", "Basheerabad", "Chowdapur", "Dharur", "Doma", "Doulathabad", "Kodangal", "Kotepally", "Kulkacherla", "Marpalle", "Mominpet", "Nawabpet", "Pargi", "Pudur", "Tandur", "Vikarabad", "Yalal"],
      "Wanaparthy": ["Amarchinta", "Atmakur", "Chinnambavi", "Ghanpur", "Gopalpeta", "Kothakota", "Madnapoor", "Pangal", "Pebbair", "Revally", "Srirangapur", "Veepangandla", "Wanaparthy"],
      "Warangal": ["Chennaraopet", "Duggondi", "Geesugonda", "Khanapur", "Narsampet", "Nekkonda", "Parvathagiri", "Rayaparthy", "Sangem", "Wardhannapet", "Warangal"],
      "Yadadri Bhuvanagiri": ["Alair", "Atmakur M", "Bhadradri", "Bhongir", "Bommalaramaram", "Choutuppal", "Gundala", "Matur", "Mothkur", "Narayanpur", "Pochampally", "Rajapet", "Ramannapet", "Turkapally", "Valigonda", "Yadagirigutta"]
    },
    "Maharashtra": {
      "Ahmednagar": ["Akole", "Jamkhed", "Karjat", "Kopargaon", "Nagar", "Nevasa", "Parner", "Pathardi", "Rahata", "Rahuri", "Sangamner", "Shevgaon", "Shrigonda", "Shrirampur"],
      "Amravati": ["Achalpur", "Amravati", "Anjangaon Surji", "Bhatkuli", "Chandur Bazar", "Chandur Railway", "Chikhaldara", "Daryapur", "Dhamangaon Railway", "Dharni", "Morshi", "Nandgaon Khandeshwar", "Teosa", "Warud"],
      "Chhatrapati Sambhaji Nagar": ["Chhatrapati Sambhaji Nagar", "Gangapur", "Kannad", "Khuldabad", "Paithan", "Phulambri", "Sillod", "Soegaon", "Vaijapur"],
      "Kolhapur": ["Ajara", "Bavda", "Bhudargad", "Chandgad", "Gadhinglaj", "Hatkanangle", "Kagal", "Karveer", "Panhala", "Radhanagari", "Shahuwadi", "Shirol"],
      "Nagpur": ["Bhiwapur", "Hingna", "Kalameshwar", "Kamptee", "Katol", "Kuhi", "Mouda", "Nagpur Rural", "Nagpur Urban", "Narkhed", "Parseoni", "Ramtek", "Saoner", "Umred"],
      "Nashik": ["Baglan (Satana)", "Chandwad", "Deola", "Dindori", "Igatpuri", "Kalwan", "Malegaon", "Nandgaon", "Nashik", "Niphad", "Peint", "Sinnar", "Surgana", "Trimbakeshwar", "Yeola"],
      "Pune": ["Ambegaon", "Baramati", "Bhor", "Daund", "Haveli", "Indapur", "Junnar", "Khed", "Maval", "Mulshi", "Pune City", "Purandar", "Shirur", "Velhe"],
      "Solapur": ["Akkalkot", "Barshi", "Karmala", "Madha", "Malshiras", "Mangalwedha", "Mohol", "Pandharpur", "Sangole", "Solapur North", "Solapur South"]
    },
    "Punjab": {
      "Amritsar": ["Ajnala", "Amritsar-I", "Amritsar-II", "Attari", "Chogawan", "Harsha Chhina", "Jandiala Guru", "Majitha", "Rayya", "Tarsikka", "Verka"],
      "Bathinda": ["Bathinda", "Bhagta Bhai Ka", "Goniana", "Maur", "Nathana", "Rampura Phul", "Sangat", "Talwandi Sabo"],
      "Firozpur": ["Firozpur", "Ghal Khurd", "Guruharsahai", "Makhu", "Mamdot", "Zira"],
      "Jalandhar": ["Adampur", "Bhogpur", "Goraya", "Jalandhar East", "Jalandhar West", "Kartarpur", "Nakodar", "Nurmahal", "Phillaur", "Shahkot"],
      "Ludhiana": ["Dehlon", "Doraha", "Jagraon", "Khanna", "Ludhiana East", "Ludhiana West", "Machhiwara", "Pakhowal", "Payal", "Raikot", "Samrala", "Sidhwan Bet", "Sudhar"],
      "Patiala": ["Bhunerheri", "Ghanaur", "Nabha", "Patiala", "Patran", "Rajpura", "Samana", "Sanaur"],
      "Sangrur": ["Bhawanigarh", "Dhuri", "Dirba", "Lehra", "Moonak", "Sangrur", "Sherpur", "Sunam"]
    },
    "Haryana": {
      "Ambala": ["Ambala Cantt", "Ambala City", "Barara", "Naraingarh", "Saha", "Shahzadpur"],
      "Hisar": ["Adampur", "Agroha", "Barwala", "Bass", "Hansi", "Hisar", "Narnaund", "Uklana"],
      "Karnal": ["Assandh", "Gharaunda", "Indri", "Karnal", "Kunjpura", "Nilokheri", "Nissing", "Taraori"],
      "Kurukshetra": ["Babain", "Ismailabad", "Ladwa", "Pehowa", "Shahbad", "Thanesar"],
      "Rohtak": ["Kalanaur", "Lakhan Majra", "Meham", "Rohtak", "Sampla"],
      "Sirsa": ["Baragudha", "Chopta", "Dabwali", "Ellenabad", "Kalanwali", "Odhan", "Rania", "Sirsa"]
    },
    "Karnataka": {
      "Ballari": ["Ballari", "Hagaribommanahalli", "Hosapete", "Kampli", "Kudligi", "Kurugodu", "Sanduru", "Siruguppa"],
      "Belagavi": ["Athani", "Bailhongal", "Belagavi", "Chikkodi", "Gokak", "Hukkeri", "Kagawad", "Khanapur", "Kittur", "Mudalagi", "Nippani", "Raibag", "Ramdurg", "Savadatti"],
      "Bengaluru Rural": ["Devanahalli", "Doddaballapura", "Hosakote", "Nelamangala"],
      "Dharwad": ["Alnavar", "Annigeri", "Dharwad", "Hubballi Rural", "Hubballi Urban", "Kalghatgi", "Kundgol", "Navalgund"],
      "Mysuru": ["H.D. Kote", "Hunsur", "K.R. Nagar", "Mysuru", "Nanjangud", "Piriyapatna", "Saligrama", "Saragur", "T. Narasipura"],
      "Shivamogga": ["Bhadravati", "Hosanagara", "Sagara", "Shikaripura", "Shivamogga", "Soraba", "Tirthahalli"],
      "Vijayapura": ["Babaleshwar", "Basavana Bagewadi", "Chadchan", "Devar Hippargi", "Indi", "Kolhar", "Muddebihal", "Nalatwad", "Sindagi", "Talikote", "Tikota", "Vijayapura"]
    },
    "Tamil Nadu": {
      "Coimbatore": ["Anaimalai", "Annur", "Coimbatore North", "Coimbatore South", "Kinathukadavu", "Madukkarai", "Mettupalayam", "Perur", "Pollachi", "Sulur", "Valparai"],
      "Erode": ["Anthiyur", "Bhavani", "Erode", "Gobichettipalayam", "Kodumudi", "Modakkurichi", "Nambiyur", "Perundurai", "Sathyamangalam", "Thalavadi"],
      "Madurai": ["Alanganallur", "Kallikudi", "Madurai East", "Madurai North", "Madurai South", "Madurai West", "Melur", "Peraiyur", "Thirumangalam", "Thirupparankundram", "Usilampatti", "Vadipatti"],
      "Salem": ["Attur", "Edappadi", "Gangavalli", "Kadaiyampatti", "Mettur", "Omalur", "Pethanaickenpalayam", "Salem", "Salem South", "Salem West", "Sankari", "Valapady", "Yercaud"],
      "Thanjavur": ["Budalur", "Kumbakonam", "Orathanadu", "Papanasam", "Pattukkottai", "Peravurani", "Thanjavur", "Thiruvaiyaru", "Thiruvidaimarudur"],
      "Tiruchirappalli": ["Lalgudi", "Manachanallur", "Manapparai", "Marungapuri", "Musiri", "Srirangam", "Thottiyam", "Thuraiyur", "Tiruchirappalli East", "Tiruchirappalli West"]
    },
    "Uttar Pradesh": {
      "Agra": ["Achhnera", "Agra", "Bah", "Bichpuri", "Etmadpur", "Fatehabad", "Fatehpur Sikri", "Kheragarh", "Kiraoli"],
      "Kanpur Nagar": ["Bilhaur", "Bidhnu", "Chaubepur", "Ghatampur", "Kalyanpur", "Kanpur", "Sarsaul", "Shivrajpur"],
      "Lucknow": ["Bakshi Ka Talab", "Gosainganj", "Kakori", "Lucknow", "Malihabad", "Mohanlalganj", "Sarojini Nagar"],
      "Meerut": ["Daurala", "Hastinapur", "Janani", "Machhra", "Mawana", "Meerut", "Parikshitgarh", "Sardhana"],
      "Prayagraj": ["Bara", "Handia", "Karchana", "Koraon", "Meja", "Phulpur", "Prayagraj", "Shankargarh", "Soraon"],
      "Varanasi": ["Araziline", "Baragaon", "Cholapur", "Kashi Vidyapeeth", "Pindra", "Rohaniya", "Sewapuri", "Varanasi"]
    },
    "Madhya Pradesh": {
      "Bhopal": ["Berasia", "Huzur", "Kolar", "Phanda"],
      "Gwalior": ["Bhitarwar", "Chinour", "Dabra", "Ghatigaon", "Gwalior", "Morar"],
      "Indore": ["Depalpur", "Hatod", "Indore", "Mhow (Dr. Ambedkar Nagar)", "Sanwer"],
      "Jabalpur": ["Jabalpur", "Kundam", "Majholi", "Panagar", "Patan", "Shahpura", "Sihora"],
      "Ujjain": ["Barnagar", "Ghatiya", "Khachrod", "Mahidpur", "Nagda", "Tarana", "Ujjain"]
    },
    "Gujarat": {
      "Ahmedabad": ["Bavla", "Daskroi", "Detroj-Rampura", "Dhandhuka", "Dholera", "Dholka", "Mandal", "Sanand", "Viramgam"],
      "Rajkot": ["Dhoraji", "Gondal", "Jamkandorna", "Jasdan", "Jetpur", "Kotda Sangani", "Lodhika", "Paddhari", "Rajkot", "Upleta", "Vinchhiya"],
      "Surat": ["Bardoli", "Choryasi", "Kamrej", "Mahuva", "Mandvi", "Mangrol", "Olpad", "Palsana", "Surat City", "Umarpada"],
      "Vadodara": ["Dabhoi", "Desar", "Karjan", "Padra", "Savli", "Sinor", "Vadodara Rural", "Waghodia"]
    },
    "Rajasthan": {
      "Jaipur": ["Amer", "Bassi", "Chaksu", "Chomu", "Jamwa Ramgarh", "Kotputli", "Phulera (Sambhar)", "Sanganer"],
      "Jodhpur": ["Balesar", "Baori", "Bhopalgarh", "Bilara", "Luni", "Osian", "Phalodi", "Shergarh"],
      "Kota": ["Chechat", "Digod", "Itawa", "Ladpura", "Pipalda", "Ramganj Mandi", "Sangod"],
      "Udaipur": ["Gogunda", "Jhadol", "Kherwara", "Kotra", "Mavli", "Salumbar", "Sarada", "Vallabhnagar"]
    },
    "West Bengal": {
      "Hooghly": ["Arambagh", "Chandannagar", "Chinsurah", "Dhaniakhali", "Pandua", "Polba-Dadpur", "Singur", "Tarakeswar"],
      "Murshidabad": ["Beldanga", "Berhampore", "Domkal", "Hariharpara", "Jangipur", "Jiaganj", "Kandi", "Lalbagh"],
      "Purba Bardhaman": ["Bhatar", "Galsi", "Jamalpur", "Kalna", "Katwa", "Memari", "Monteswar", "Purbasthali"]
    },
    "Bihar": {
      "Gaya": ["Barachatti", "Belaganj", "Bodh Gaya", "Fatehpur", "Manpur", "Sherghati", "Tekari", "Wazirganj"],
      "Muzaffarpur": ["Kanti", "Kurhani", "Minapur", "Motipur", "Paroo", "Sahebganj", "Sakra", "Saraiya"],
      "Patna": ["Bakhtiarpur", "Barh", "Bikram", "Danapur", "Fatwah", "Masaurhi", "Mokama", "Phulwari Sharif"]
    },
    "Kerala": {
      "Idukki": ["Adimali", "Devikulam", "Kattappana", "Nedumkandam", "Peerumade", "Thodupuzha", "Udumbanchola"],
      "Palakkad": ["Alathur", "Chittur", "Kollengode", "Kuzhalmannam", "Mannarkkad", "Ottapalam", "Pattambi"],
      "Wayanad": ["Kalpetta", "Mananthavady", "Meenangadi", "Panamaram", "Sulthan Bathery", "Vythiri"]
    },
    "Odisha": {
      "Bargarh": ["Attabira", "Bhatli", "Bheden", "Bijepur", "Gaisilet", "Jharbandh", "Padampur", "Sohela"],
      "Cuttack": ["Athagarh", "Badamba", "Banki", "Baramba", "Nischintakoili", "Salepur", "Tangi-Choudwar"],
      "Puri": ["Brahmagiri", "Delanga", "Gop", "Kakatpur", "Kanas", "Krushnaprasad", "Nimapada", "Pipili"]
    }
  },
  "Australia": {
    "New South Wales": {
      "Central West": ["Bathurst Rural", "Cowra", "Dubbo Rural", "Forbes", "Orange Rural", "Parkes"],
      "New England": ["Armidale", "Glen Innes", "Guyra", "Inverell", "Tamworth Rural"],
      "Riverina": ["Coleambally", "Griffith", "Hay", "Jerilderie", "Leeton", "Narrandera"]
    },
    "Queensland": {
      "Darling Downs": ["Dalby", "Goondiwindi", "Pittsworth", "Stanthorpe", "Toowoomba Rural", "Warwick"],
      "Wide Bay": ["Bundaberg Rural", "Childers", "Gayndah", "Gympie Rural", "Maryborough"]
    },
    "Victoria": {
      "Goulburn Valley": ["Cobram", "Kyabram", "Mooroopna", "Numurkah", "Shepparton", "Tatura"],
      "Mallee": ["Mildura Rural", "Ouyen", "Red Cliffs", "Robinvale", "Swan Hill"]
    }
  },
  "Canada": {
    "Ontario": {
      "Niagara": ["Lincoln", "Niagara-on-the-Lake", "Pelham", "West Lincoln"],
      "Oxford": ["Ingersoll", "Norwich", "Tillsonburg", "Woodstock Rural", "Zorra"],
      "Simcoe": ["Bradford West Gwillimbury", "Clearview", "Innisfil", "New Tecumseth"]
    },
    "Saskatchewan": {
      "Battleford": ["Meadow Lake", "North Battleford", "Unity", "Wilkie"],
      "Swift Current": ["Gull Lake", "Herbert", "Maple Creek", "Shaunavon"],
      "Yorkton": ["Canora", "Esterhazy", "Kamsack", "Melville"]
    }
  },
  "United Kingdom": {
    "England": {
      "Lincolnshire": ["Alford", "Boston Rural", "Horncastle", "Louth", "Sleaford", "Spalding"],
      "Norfolk": ["Aylsham", "Dereham", "Diss", "Fakenham", "Swaffham", "Wymondham"],
      "Yorkshire": ["Driffield", "Malton", "Northallerton", "Pickering", "Ripon", "Thirsk"]
    }
  },
  "United States": {
    "California": {
      "Fresno": ["Clovis Rural", "Fresno Rural", "Kerman", "Kingsburg", "Reedley", "Sanger", "Selma"],
      "Imperial": ["Brawley", "Calexico", "El Centro", "Holtville", "Imperial Rural", "Westmorland"],
      "Kern": ["Arvin", "Bakersfield Rural", "Delano", "McFarland", "Shafter", "Wasco"],
      "Monterey": ["Gonzales", "Greenfield", "King City", "Salinas Valley", "Soledad"],
      "Tulare": ["Dinuba", "Exeter", "Lindsay", "Porterville", "Tulare City Rural", "Visalia Rural"]
    },
    "Iowa": {
      "Linn": ["Alburnett", "Center Point", "Central City", "Marion Rural", "Mount Vernon"],
      "Polk": ["Altoona", "Ankeny Rural", "Bondurant", "Grimes", "Polk City"],
      "Story": ["Ames Rural", "Huxley", "Maxwell", "Nevada", "Story City"]
    },
    "Texas": {
      "Cameron": ["Brownsville Rural", "Harlingen", "La Feria", "Rio Hondo", "San Benito"],
      "Hidalgo": ["Edinburg Rural", "McAllen Rural", "Mission Rural", "Pharr", "Weslaco"],
      "Lubbock": ["Idalou", "New Deal", "Shallowater", "Slaton", "Wolfforth"]
    }
  }
};

export const OTHER_OPTION = "Other (specify below)";

/**
 * Returns all available countries strictly arranged in ascending alphabetical order (A-Z).
 */
export function getCountries(): string[] {
  return Object.keys(LOCATION_DATA).sort((a, b) => a.localeCompare(b));
}

/**
 * Returns all states/regions for a given country strictly arranged in ascending alphabetical order (A-Z).
 */
export function getStates(country: string): string[] {
  if (!country || !LOCATION_DATA[country]) return [];
  return Object.keys(LOCATION_DATA[country]).sort((a, b) => a.localeCompare(b));
}

/**
 * Returns all districts for a given state strictly arranged in ascending alphabetical order (A-Z).
 */
export function getDistricts(country: string, state: string): string[] {
  if (!country || !state || !LOCATION_DATA[country] || !LOCATION_DATA[country][state]) return [];
  return Object.keys(LOCATION_DATA[country][state]).sort((a, b) => a.localeCompare(b));
}

/**
 * Returns ONLY the villages/mandals strictly belonging to the specified district,
 * sorted in ascending alphabetical order (A-Z), with 'Other (specify below)' at the end.
 */
export function getVillages(country: string, state: string, district: string): string[] {
  if (
    !country ||
    !state ||
    !district ||
    !LOCATION_DATA[country] ||
    !LOCATION_DATA[country][state] ||
    !LOCATION_DATA[country][state][district]
  ) {
    return [OTHER_OPTION];
  }

  const rawList = LOCATION_DATA[country][state][district] || [];
  // Strict ascending alphabetical sort (A to Z)
  const sortedVillages = [...new Set(rawList)].sort((a, b) => a.localeCompare(b));
  return [...sortedVillages, OTHER_OPTION];
}

export interface ParsedLocation {
  country: string;
  state: string;
  district: string;
  village: string;
}

export function parseLocationString(place?: string): ParsedLocation {
  const result: ParsedLocation = {
    country: "India",
    state: "Andhra Pradesh",
    district: "Guntur",
    village: "Amaravati"
  };

  if (!place) return result;

  const parts = place.split(",").map(p => p.trim()).filter(Boolean);

  if (parts.length === 1) {
    // Might be state or country
    const foundState = findStateAcrossCountries(parts[0]);
    if (foundState) {
      result.country = foundState.country;
      result.state = foundState.state;
      const dists = getDistricts(result.country, result.state);
      result.district = dists[0] || "";
      const vills = getVillages(result.country, result.state, result.district);
      result.village = vills[0] || "";
      return result;
    }
  }

  // Check if last part matches a Country
  const countries = getCountries();
  const lastPart = parts[parts.length - 1];
  const matchedCountry = countries.find(c => c.toLowerCase() === lastPart?.toLowerCase());

  if (matchedCountry) {
    result.country = matchedCountry;
    parts.pop();
  } else {
    result.country = "India";
  }

  // Next is state
  if (parts.length > 0) {
    const states = getStates(result.country);
    const candidateState = parts[parts.length - 1];
    const matchedState = states.find(s => s.toLowerCase() === candidateState?.toLowerCase());
    if (matchedState) {
      result.state = matchedState;
      parts.pop();
    } else {
      result.state = states.includes("Andhra Pradesh") ? "Andhra Pradesh" : (states[0] || "");
    }
  } else {
    const states = getStates(result.country);
    result.state = states.includes("Andhra Pradesh") ? "Andhra Pradesh" : (states[0] || "");
  }

  // Next is district
  if (parts.length > 0) {
    const districts = getDistricts(result.country, result.state);
    const candidateDistrict = parts[parts.length - 1];
    const matchedDistrict = districts.find(d => d.toLowerCase() === candidateDistrict?.toLowerCase());
    if (matchedDistrict) {
      result.district = matchedDistrict;
      parts.pop();
    } else {
      result.district = districts.includes("Guntur") ? "Guntur" : (districts[0] || parts[parts.length - 1]);
      parts.pop();
    }
  } else {
    const dists = getDistricts(result.country, result.state);
    result.district = dists.includes("Guntur") ? "Guntur" : (dists[0] || "");
  }

  // Remaining parts are village / mandal
  if (parts.length > 0) {
    result.village = parts.join(", ");
  } else {
    const vills = getVillages(result.country, result.state, result.district);
    result.village = vills[0] || "";
  }

  return result;
}

function findStateAcrossCountries(stateName: string): { country: string; state: string } | null {
  const norm = stateName.toLowerCase();
  for (const country of getCountries()) {
    const states = getStates(country);
    const match = states.find(s => s.toLowerCase() === norm);
    if (match) return { country, state: match };
  }
  return null;
}

export function formatLocationString(
  country?: string,
  state?: string,
  district?: string,
  village?: string
): string {
  const parts: string[] = [];
  if (village && village.trim()) parts.push(village.trim());
  if (district && district.trim()) parts.push(district.trim());
  if (state && state.trim()) parts.push(state.trim());
  if (country && country.trim()) parts.push(country.trim());
  return parts.join(", ");
}
