import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  X,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  Droplets,
  Sprout,
  Volume2,
  VolumeX,
  Languages
} from 'lucide-react';

export interface CardData {
  id: number;
  crop: string;
  hindiCrop: string;
  topic: string;
  hindiTopic: string;
  query: string;
  advisory: string;
  coverImage: string;
}

export interface CropEconomics {
  duration: string;
  season: string;
  budget: string;
  profit: string;
  yield: string;
  waterNeed: string;
}

export const CROP_ECONOMICS_MAP: Record<string, CropEconomics> = {
  'Wheat': {
    duration: '120 - 135 Days',
    season: 'Rabi (Oct - Apr)',
    budget: '₹22,000 - ₹26,000 / ac',
    profit: '₹32,000 - ₹45,000 / ac',
    yield: '20 - 25 Qtl / acre',
    waterNeed: '4 - 6 Irrigations (CRI Critical)'
  },
  'Wheat CRI': {
    duration: '120 - 135 Days',
    season: 'Rabi (Oct - Apr)',
    budget: '₹22,000 - ₹26,000 / ac',
    profit: '₹32,000 - ₹45,000 / ac',
    yield: '20 - 25 Qtl / acre',
    waterNeed: '4 - 6 Irrigations (CRI Critical)'
  },
  'Paddy': {
    duration: '115 - 145 Days',
    season: 'Kharif (Jun - Nov)',
    budget: '₹25,000 - ₹30,000 / ac',
    profit: '₹35,000 - ₹50,000 / ac',
    yield: '22 - 28 Qtl / acre',
    waterNeed: '10 - 12 Irrigations / Moist'
  },
  'Sugarcane': {
    duration: '330 - 360 Days',
    season: 'Year-Round (Spring/Autumn)',
    budget: '₹45,000 - ₹55,000 / ac',
    profit: '₹80,000 - ₹1,20,000 / ac',
    yield: '350 - 450 Qtl / acre',
    waterNeed: '18 - 24 Irrigations'
  },
  'Cotton': {
    duration: '150 - 180 Days',
    season: 'Kharif (May - Dec)',
    budget: '₹28,000 - ₹34,000 / ac',
    profit: '₹40,000 - ₹60,000 / ac',
    yield: '10 - 14 Qtl / acre',
    waterNeed: '4 - 6 Irrigations'
  },
  'Mustard': {
    duration: '105 - 120 Days',
    season: 'Rabi (Oct - Mar)',
    budget: '₹14,000 - ₹18,000 / ac',
    profit: '₹25,000 - ₹36,000 / ac',
    yield: '8 - 12 Qtl / acre',
    waterNeed: '2 - 3 Irrigations'
  },
  'Mango': {
    duration: 'Perennial Orchard',
    season: 'Summer Harvest (Apr - Jul)',
    budget: '₹30,000 - ₹40,000 / ac',
    profit: '₹90,000 - ₹1,60,000 / ac',
    yield: '50 - 80 Qtl / acre',
    waterNeed: 'Drip / Fortnightly in Bloom'
  },
  'Potato': {
    duration: '90 - 110 Days',
    season: 'Rabi (Oct - Feb)',
    budget: '₹38,000 - ₹46,000 / ac',
    profit: '₹50,000 - ₹80,000 / ac',
    yield: '100 - 140 Qtl / acre',
    waterNeed: '6 - 8 Light Irrigations'
  },
  'Chilli': {
    duration: '150 - 180 Days',
    season: 'Kharif & Summer',
    budget: '₹35,000 - ₹45,000 / ac',
    profit: '₹65,000 - ₹1,10,000 / ac',
    yield: '12 - 18 Qtl (Dry) / ac',
    waterNeed: '8 - 10 Irrigations'
  },
  'Gram': {
    duration: '110 - 130 Days',
    season: 'Rabi (Oct - Mar)',
    budget: '₹15,000 - ₹19,000 / ac',
    profit: '₹26,000 - ₹38,000 / ac',
    yield: '8 - 12 Qtl / acre',
    waterNeed: '1 - 2 Light Irrigations'
  },
  'Onion': {
    duration: '120 - 140 Days',
    season: 'Kharif / Late Kharif / Rabi',
    budget: '₹34,000 - ₹44,000 / ac',
    profit: '₹60,000 - ₹1,20,000 / ac',
    yield: '100 - 150 Qtl / acre',
    waterNeed: '8 - 10 Light Irrigations'
  },
  'Groundnut': {
    duration: '105 - 125 Days',
    season: 'Kharif & Zaid',
    budget: '₹20,000 - ₹25,000 / ac',
    profit: '₹30,000 - ₹45,000 / ac',
    yield: '10 - 15 Qtl / acre',
    waterNeed: '3 - 5 Irrigations (Pegging)'
  },
  'Soybean': {
    duration: '95 - 110 Days',
    season: 'Kharif (Jun - Oct)',
    budget: '₹16,000 - ₹20,000 / ac',
    profit: '₹24,000 - ₹36,000 / ac',
    yield: '10 - 14 Qtl / acre',
    waterNeed: 'Rainfed / 1-2 Supplemental'
  },
  'Tomato': {
    duration: '110 - 130 Days',
    season: 'Kharif / Rabi / Summer',
    budget: '₹32,000 - ₹42,000 / ac',
    profit: '₹60,000 - ₹1,10,000 / ac',
    yield: '150 - 220 Qtl / acre',
    waterNeed: 'Drip / 8 - 10 Irrigations'
  },
  'Banana': {
    duration: '300 - 360 Days',
    season: 'Year-Round (Planting Jun-Aug)',
    budget: '₹75,000 - ₹95,000 / ac',
    profit: '₹1,20,000 - ₹2,20,000 / ac',
    yield: '300 - 400 Qtl / acre',
    waterNeed: 'Drip / 25 - 30 Irrigations'
  },
  'Citrus': {
    duration: 'Perennial Orchard',
    season: 'Year-Round Production',
    budget: '₹28,000 - ₹36,000 / ac',
    profit: '₹80,000 - ₹1,40,000 / ac',
    yield: '40 - 60 Qtl / acre',
    waterNeed: 'Fortnightly Winter/Weekly Summer'
  },
  'Brinjal': {
    duration: '130 - 160 Days',
    season: 'All Seasons',
    budget: '₹30,000 - ₹38,000 / ac',
    profit: '₹55,000 - ₹95,000 / ac',
    yield: '120 - 180 Qtl / acre',
    waterNeed: '6 - 8 Irrigations'
  },
  'Maize': {
    duration: '90 - 110 Days',
    season: 'Kharif & Rabi',
    budget: '₹18,000 - ₹22,000 / ac',
    profit: '₹25,000 - ₹38,000 / ac',
    yield: '25 - 32 Qtl / acre',
    waterNeed: '4 - 5 Irrigations'
  },
  'Soil Health': {
    duration: 'Pre-Sowing Soil Care',
    season: 'All Crop Seasons',
    budget: '₹3,500 - ₹5,000 / ac',
    profit: '+15% to +25% Yield Boost',
    yield: 'Nutrient Optimization',
    waterNeed: 'Field moisture preservation'
  },
  'Crop Rotation': {
    duration: 'Multi-Season Rotation',
    season: 'Year-Round Planning',
    budget: '₹8,000 - ₹14,000 / ac',
    profit: '+20% to +35% Soil Health',
    yield: 'Sustainable High Yield',
    waterNeed: 'Moisture Retention'
  }
};

const DEFAULT_ECONOMICS: CropEconomics = {
  duration: '110 - 130 Days',
  season: 'Kharif & Rabi',
  budget: '₹20,000 - ₹28,000 / ac',
  profit: '₹30,000 - ₹48,000 / ac',
  yield: '15 - 22 Qtl / acre',
  waterNeed: '4 - 6 Irrigations'
};

export const ENGLISH_QUERY_MAP: Record<number, string> = {
  0: "What should be sprayed immediately when Yellow Rust symptoms appear on wheat?",
  1: "How to prevent and trap Stem Borer (Dead Heart) infestation in paddy field?",
  2: "What is the recommended fertilizer and urea ratio for the ratoon sugarcane crop?",
  3: "How can Pink Bollworm and sucking pests be controlled in cotton?",
  4: "What biological and chemical remedies control Aphid infestation in mustard?",
  5: "When and how should the critical Crown Root (CRI stage) irrigation be given in wheat?",
  6: "Which lure traps and spray schedule protect mangoes from Fruit Fly infestation?",
  7: "How to correct Zinc deficiency (Khaira disease) in the soil and standing crop?",
  8: "How to treat black ring spots and Early Blight disease on potato foliage?",
  9: "What is an effective cure for Leaf Curl complex and Thrips in chilli crop?",
  10: "How to prevent and manage Pod Borer caterpillars (Helicoverpa) in chickpea?",
  11: "What is the proper weed control schedule after transplanting onion?",
  12: "Which medicine should be sprayed for round dark spots (Tikka disease) on groundnut?",
  13: "How to protect soybean plants from Girdle Beetle and stem fly damage?",
  14: "How to quickly eliminate boring worms (Fruit Borer) in tomato field?",
  15: "What should be sprayed when banana leaves turn yellow and dry up from Sigatoka?",
  16: "How to stop raised rough scabs and Citrus Canker disease on fruits and leaves?",
  17: "How to prevent wilted shoots and fruit borer worms in eggplant/brinjal?",
  18: "What is the recommended pesticide dosage for Fall Armyworm in sweet corn/maize?",
  19: "How to manage stem rot and collar rot in ginger cultivation?",
  20: "What is the certified organic remedy for downy mildew in grape vineyards?",
  21: "How to cure powdery mildew on apple tree leaves and branches?",
  22: "When should earthing up and propping be done in turmeric crop?",
  23: "How to prevent damping off fungal disease in vegetable nursery seedlings?",
  24: "What is the recommended micronutrient foliar spray for black gram/urad?",
  25: "How to control shoot and berry borer infestation in coffee plantations?",
  26: "What is the best weed management for direct seeded pigeonpea/arhar?",
  27: "How to protect cardamom plants from thrips and capsule rot?",
  28: "What is the balanced NPK and sulphur dosage for hybrid sunflower?",
  29: "Which acaricide spray stops red spider mites on tea plantation foliage?",
  30: "How to save black pepper vines from quick wilt and Phytophthora root rot?",
  31: "Which biopesticide controls Diamondback Moth (DBM) caterpillars on cabbage?",
  32: "How to stop whitefly transmission of Yellow Vein Mosaic Virus in okra?",
  33: "How to improve soil health and crop yields through crop rotation and organic manure?"
};

export function getCropEconomics(cropName: string): CropEconomics {
  return CROP_ECONOMICS_MAP[cropName] || DEFAULT_ECONOMICS;
}

export function getCropEnglishQuery(card: CardData): string {
  if (ENGLISH_QUERY_MAP[card.id]) {
    return ENGLISH_QUERY_MAP[card.id];
  }
  return `How to manage and protect ${card.crop} from ${card.topic}?`;
}

// Interactive crop example cards; answers are fetched through the live chat API.
export const AGRI_CARDS: CardData[] = [
  { 
    id: 0, 
    crop: 'Wheat', 
    hindiCrop: 'गेहूं', 
    topic: 'Yellow Rust Protocol', 
    hindiTopic: 'पीला रतुआ नियंत्रण', 
    query: 'गेहूं में पीला रतुआ (Yellow Rust) के लक्षण दिखने पर तुरंत क्या छिड़कें?', 
    advisory: 'Propiconazole 25% EC (Tilt) @ 1ml per litre of water (200ml in 200L water/acre) during morning hours.', 
    coverImage: '/crops/wheat.jpg', 
  },
  { 
    id: 1, 
    crop: 'Paddy', 
    hindiCrop: 'धान', 
    topic: 'Stem Borer Trapping', 
    hindiTopic: 'तना छेदक कीट जाल', 
    query: 'धान की फसल में तना छेदक (Stem Borer) का प्रकोप रोकने का उपाय?', 
    advisory: 'Install pheromone traps @ 5/ha; broadcast Cartap Hydrochloride 4G @ 10kg/acre in standing water.', 
    coverImage: '/crops/paddy.jpg', 
  },
  { 
    id: 2, 
    crop: 'Sugarcane', 
    hindiCrop: 'गन्ना', 
    topic: 'Ratoon Stubble Care', 
    hindiTopic: 'पेड़ी गन्ना खाद प्रबंधन', 
    query: 'गन्ने की पेड़ी (Ratoon) फसल में पहली खाद और यूरिया का सही अनुपात?', 
    advisory: 'Apply 25% extra Nitrogen (60kg N + 60kg P2O5/ha) directly along stubbles followed by immediate irrigation.', 
    coverImage: '/crops/sugarcane.jpg', 
  },
  { 
    id: 3, 
    crop: 'Cotton', 
    hindiCrop: 'कपास', 
    topic: 'Pink Bollworm Defense', 
    hindiTopic: 'गुलाबी सुंडी नियंत्रण', 
    query: 'कपास में गुलाबी सुंडी (Pink Bollworm) की रोकथाम कैसे करें?', 
    advisory: 'Install Gossyplure pheromone traps @ 8/acre; spray Profenofos 50% EC @ 2ml/L if ETL exceeds 8 moths/trap.', 
    coverImage: '/crops/cotton.jpg', 
  },
  { 
    id: 4, 
    crop: 'Mustard', 
    hindiCrop: 'सरसों', 
    topic: 'Aphid Bio-Control', 
    hindiTopic: 'माहू व सफेद मक्खी', 
    query: 'सरसों में माहू (Aphids) का प्रकोप रोकने का जैविक व रासायनिक समाधान?', 
    advisory: 'Yellow sticky cards @ 10/acre + spray Dimethoate 30% EC @ 1.5ml/L or Neem oil 10,000 ppm @ 3ml/L.', 
    coverImage: '/crops/mustard.jpg', 
  },
  { 
    id: 5, 
    crop: 'Wheat CRI', 
    hindiCrop: 'गेहूं (ताज मूल)', 
    topic: 'Crown Root Irrigation', 
    hindiTopic: 'प्रथम सिंचाई अवस्था', 
    query: 'गेहूं में पहली सिंचाई (CRI Stage) कितने दिनों में और कैसे करें?', 
    advisory: 'First irrigation at 20-25 days after sowing (CRI stage) along with first top-dress Urea @ 45kg/acre.', 
    coverImage: '/crops/wheat_cri.jpg', 
  },
  { 
    id: 6, 
    crop: 'Mango', 
    hindiCrop: 'आम', 
    topic: 'Fruit Fly Protection', 
    hindiTopic: 'फल मक्खी नियंत्रण', 
    query: 'आम में फल मक्खी (Fruit Fly) से बचाव के लिए कौन सा ट्रैप लगाएं?', 
    advisory: 'Install Methyl Eugenol lure traps @ 8 traps/acre 45 days prior to harvest; spray Malathion 50% EC @ 2ml/L.', 
    coverImage: '/crops/mango.jpg', 
  },
  { 
    id: 7, 
    crop: 'Soil Health', 
    hindiCrop: 'मृदा स्वास्थ्य', 
    topic: 'Zinc Micronutrients', 
    hindiTopic: 'जिंक पोषक तत्व', 
    query: 'खेत में जिंक की कमी (Khaira Disease) कैसे दूर करें?', 
    advisory: 'Foliar spray Zinc Sulphate 21% @ 5g + 2.5g slaked lime per litre of water at 15-day intervals.', 
    coverImage: '/crops/soil_health.jpg', 
  },
  { 
    id: 8, 
    crop: 'Potato', 
    hindiCrop: 'आलू', 
    topic: 'Early Blight Defense', 
    hindiTopic: 'अगेती झुलसा रोग', 
    query: 'आलू में पत्तियों पर काले छल्लेदार धब्बे (Early Blight) का उपचार?', 
    advisory: 'Spray Mancozeb 75% WP @ 2g/L or Chlorothalonil 75% WP @ 2g/L at initial symptom onset.', 
    coverImage: '/crops/potato.jpg', 
  },
  { 
    id: 9, 
    crop: 'Chilli', 
    hindiCrop: 'मिर्च', 
    topic: 'Leaf Curl Mites', 
    hindiTopic: 'पत्ती मरोड़ व थ्रिप्स', 
    query: 'मिर्च में पत्ती मरोड़ रोग (Murda Complex/Thrips) का प्रभावी उपचार?', 
    advisory: 'Spray Diafenthiuron 50% WP @ 1g/L or Fipronil 5% SC @ 1.5ml/L targeting leaf undersides.', 
    coverImage: '/crops/chilli.jpg', 
  },
  { 
    id: 10, 
    crop: 'Gram', 
    hindiCrop: 'चना', 
    topic: 'Pod Borer Management', 
    hindiTopic: 'फली छेदक इल्ली', 
    query: 'चने की फसल में इल्ली (Helicoverpa) की रोकथाम कैसे करें?', 
    advisory: 'Emamectin Benzoate 5% SG @ 80g/acre or install T-shaped bird perches @ 20/acre for bio-predation.', 
    coverImage: '/crops/gram.jpg', 
  },
  { 
    id: 11, 
    crop: 'Onion', 
    hindiCrop: 'प्याज', 
    topic: 'Weed Control Schedule', 
    hindiTopic: 'खरपतवार प्रबंधन', 
    query: 'प्याज की रोपाई के बाद खरपतवार नष्ट करने का सही तरीका?', 
    advisory: 'Spray Oxyfluorfen 23.5% EC @ 1.5ml/L at 15-20 days after transplanting in moist soil.', 
    coverImage: '/crops/onion.jpg', 
  },
  { 
    id: 12, 
    crop: 'Groundnut', 
    hindiCrop: 'मूंगफली', 
    topic: 'Tikka Disease Protocol', 
    hindiTopic: 'टिक्का पत्ती धब्बा', 
    query: 'मूंगफली की पत्तियों पर गोल काले धब्बे (Tikka Leaf Spot) की दवा?', 
    advisory: 'Spray Carbendazim 12% + Mancozeb 63% WP @ 2g/L or Hexaconazole 5% EC @ 2ml/L.', 
    coverImage: '/crops/groundnut.jpg', 
  },
  { 
    id: 13, 
    crop: 'Soybean', 
    hindiCrop: 'सोयाबीन', 
    topic: 'Girdle Beetle Defense', 
    hindiTopic: 'गर्डल बीटल नियंत्रण', 
    query: 'सोयाबीन में चक्र भृंग (Girdle Beetle) व तना मक्खी से फसल कैसे बचाएं?', 
    advisory: 'Spray Thiamethoxam 12.6% + Lambda Cyhalothrin 9.5% ZC @ 0.5ml/L at vegetative stage.', 
    coverImage: '/crops/soybean.jpg', 
  },
  { 
    id: 14, 
    crop: 'Tomato', 
    hindiCrop: 'टमाटर', 
    topic: 'Fruit Borer Larvae', 
    hindiTopic: 'फल छेदक सुंडी', 
    query: 'टमाटर में छेद करने वाली सुंडी (Fruit Borer) का तुरंत खात्मा?', 
    advisory: 'Spray Chlorantraniliprole 18.5% SC @ 0.3ml/L; remove and destroy infested bore fruits.', 
    coverImage: '/crops/tomato.jpg', 
  },
  { 
    id: 15, 
    crop: 'Banana', 
    hindiCrop: 'केला', 
    topic: 'Sigatoka Leaf Disease', 
    hindiTopic: 'सिगाटोका पत्ती रोग', 
    query: 'केले की पत्तियां पीली होकर सूख रही हैं (Sigatoka), क्या स्प्रे करें?', 
    advisory: 'Mineral oil @ 10ml + Propiconazole @ 1ml/L during cloudy or rainy weather conditions.', 
    coverImage: '/crops/banana.jpg', 
  },
  { 
    id: 16, 
    crop: 'Citrus', 
    hindiCrop: 'नींबू', 
    topic: 'Citrus Canker Control', 
    hindiTopic: 'सिट्रस कैंकर रोग', 
    query: 'नींबू के पत्तों और फलों पर उभरे हुए खुरदरे धब्बे (Canker) कैसे रोकें?', 
    advisory: 'Spray Streptocycline @ 1g in 10L water combined with Copper Oxychloride 50% WP @ 30g.', 
    coverImage: '/crops/citrus.jpg', 
  },
  { 
    id: 17, 
    crop: 'Brinjal', 
    hindiCrop: 'बैंगन', 
    topic: 'Shoot & Fruit Borer', 
    hindiTopic: 'तना व फल छेदक', 
    query: 'बैंगन में तना सूखना और फल में कीड़ा लगना कैसे रोकें?', 
    advisory: 'Clip wilted shoots; spray Spinosad 45% SC @ 0.4ml/L or Emamectin Benzoate 5% SG @ 0.4g/L.', 
    coverImage: '/crops/brinjal.jpg', 
  },
  { 
    id: 18, 
    crop: 'Maize', 
    hindiCrop: 'मक्का', 
    topic: 'Fall Armyworm Defense', 
    hindiTopic: 'फॉल आर्मीवॉर्म कीट', 
    query: 'मक्के की गोभ में फॉल आर्मीवॉर्म (Fall Armyworm) की रोकथाम?', 
    advisory: 'Apply Chlorantraniliprole 18.5% SC @ 0.4ml/L directly into central whorls in late evening.', 
    coverImage: '/crops/maize.jpg', 
  },
  { 
    id: 19, 
    crop: 'Guava', 
    hindiCrop: 'अमरूद', 
    topic: 'Wilt Drenching Solution', 
    hindiTopic: 'उकठा (विल्ट) रोग', 
    query: 'अमरूद के पेड़ अचानक सूखने लगें (Wilt Disease) तो क्या उपचार करें?', 
    advisory: 'Soil drenching around tree basin with Carbendazim 2g/L + incorporate Trichoderma viride with FYM.', 
    coverImage: '/crops/guava.jpg', 
  },
  { 
    id: 20, 
    crop: 'Green Pea', 
    hindiCrop: 'मटर', 
    topic: 'Powdery Mildew Care', 
    hindiTopic: 'सफेद चूर्ण (छाछिया)', 
    query: 'मटर की पत्तियों पर सफेद चूर्ण की परत दिखने पर कौन सी दवा डालें?', 
    advisory: 'Spray Wettable Sulphur 80% WP @ 3g/L or Dinocap 48% EC @ 1ml/L at first sign of white dust.', 
    coverImage: '/crops/pea.jpg', 
  },
  { 
    id: 21, 
    crop: 'Papaya', 
    hindiCrop: 'पपीता', 
    topic: 'Ringspot Virus Control', 
    hindiTopic: 'रिंगस्पॉट वायरस', 
    query: 'पपीते के पत्तों में मोजेक और विकृति (Ringspot) से बचाव?', 
    advisory: 'Vector aphid control with Imidacloprid 17.8% SL @ 0.5ml/L; rogue out infected plants immediately.', 
    coverImage: '/crops/papaya.jpg', 
  },
  { 
    id: 22, 
    crop: 'Apple', 
    hindiCrop: 'सेब', 
    topic: 'Apple Scab Protocol', 
    hindiTopic: 'सेब का स्केब रोग', 
    query: 'सेब की पत्तियों व फल पर काले चकत्ते (Apple Scab) का स्प्रे शेड्यूल?', 
    advisory: 'Dodine 65% WP @ 0.75g/L or Captan 50% WP @ 2.5g/L at petal fall and fruit development.', 
    coverImage: '/crops/apple.jpg', 
  },
  { 
    id: 23, 
    crop: 'Cumin', 
    hindiCrop: 'जीरा', 
    topic: 'Blight & Mildew Care', 
    hindiTopic: 'झुलसा व छाछिया', 
    query: 'जीरे में बादल छाने पर झुलसा (Blight) से फसल बचाने का उपाय?', 
    advisory: 'Mancozeb 75% WP @ 2.5g/L + Karathane @ 1ml/L prior to overcast weather as preventive spray.', 
    coverImage: '/crops/cumin.jpg', 
  },
  { 
    id: 24, 
    crop: 'Garlic', 
    hindiCrop: 'लहसुन', 
    topic: 'Purple Blotch Defense', 
    hindiTopic: 'बैंगनी धब्बा रोग', 
    query: 'लहसुन की पत्तियों पर बैंगनी-भूरे धब्बे (Purple Blotch) का इलाज?', 
    advisory: 'Tebuconazole 25.9% EC @ 1.5ml/L + agricultural sticker (adjuvant) @ 0.5ml/L on clear sunny day.', 
    coverImage: '/crops/garlic.jpg', 
  },
  { 
    id: 25, 
    crop: 'Turmeric', 
    hindiCrop: 'हल्दी', 
    topic: 'Rhizome Rot Care', 
    hindiTopic: 'कंद सड़न (राइजोम रोट)', 
    query: 'हल्दी में पौधे सूखने और कंद सड़ने की समस्या में क्या डालें?', 
    advisory: 'Drench soil with Metalaxyl 8% + Mancozeb 64% WP @ 2.5g/L; ensure water drainage from beds.', 
    coverImage: '/crops/turmeric.jpg', 
  },
  { 
    id: 26, 
    crop: 'Pomegranate', 
    hindiCrop: 'अनार', 
    topic: 'Bacterial Blight Oil Spot', 
    hindiTopic: 'तेलिया (ब्लैक स्पॉट) रोग', 
    query: 'अनार के फल पर काले तेलीय त्रिकोणीय धब्बे (Bacterial Blight) का उपचार?', 
    advisory: 'Streptocycline 0.5g/L + Copper Oxychloride @ 2.5g/L; prune and burn infected branches.', 
    coverImage: '/crops/pomegranate.jpg', 
  },
  { 
    id: 27, 
    crop: 'Ginger', 
    hindiCrop: 'अदरक', 
    topic: 'Soft Rot Protocol', 
    hindiTopic: 'नरम सड़न नियंत्रण', 
    query: 'अदरक के तने गलने और बदबू आने पर कौन सी दवा से ड्रेंचिंग करें?', 
    advisory: 'Soil drench with Copper Hydroxide 77% WP @ 2g/L or Trichoderma harzianum @ 10g/L water.', 
    coverImage: '/crops/ginger.jpg', 
  },
  { 
    id: 28, 
    crop: 'Coffee', 
    hindiCrop: 'कॉफी', 
    topic: 'Berry Borer Trapping', 
    hindiTopic: 'बेरी बोरर कीट', 
    query: 'कॉफी के दानों में बारीक छेद (Berry Borer) रोकने का जैविक तरीका?', 
    advisory: 'Install Broca traps with ethanol-methanol lure @ 20/ha; cleanly glean leftover berries from ground.', 
    coverImage: '/crops/coffee.jpg', 
  },
  { 
    id: 29, 
    crop: 'Tea', 
    hindiCrop: 'चाय', 
    topic: 'Red Spider Mite Control', 
    hindiTopic: 'लाल मकड़ी कीट', 
    query: 'चाय की पत्तियां तांबे जैसी लाल (Red Spider Mite) होने पर क्या छिड़कें?', 
    advisory: 'Spiromesifen 22.9% SC @ 1ml/L; spray thoroughly covering both upper and lower leaf surfaces.', 
    coverImage: '/crops/tea.jpg', 
  },
  { 
    id: 30, 
    crop: 'Black Pepper', 
    hindiCrop: 'काली मिर्च', 
    topic: 'Quick Wilt Protocol', 
    hindiTopic: 'शीघ्र मुरझान (क्विक विल्ट)', 
    query: 'काली मिर्च की बेल अचानक सूखने लगे (Phytophthora) तो क्या करें?', 
    advisory: 'Soil drench with Potassium Phosphonate 40% @ 3ml/L + apply 1% Bordeaux mixture on vines.', 
    coverImage: '/crops/black_pepper.jpg', 
  },
  { 
    id: 31, 
    crop: 'Cabbage', 
    hindiCrop: 'पत्तागोभी', 
    topic: 'Diamondback Moth (DBM)', 
    hindiTopic: 'डायमंडबैक मोथ इल्ली', 
    query: 'पत्तागोभी में जालीदार पत्तियां करने वाली इल्ली (DBM) की दवा?', 
    advisory: 'Spray Bacillus thuringiensis (Bt) @ 2g/L or Spinetoram 11.7% SC @ 1ml/L during evening hours.', 
    coverImage: '/crops/cabbage.jpg', 
  },
  { 
    id: 32, 
    crop: 'Okra', 
    hindiCrop: 'भिंडी', 
    topic: 'Yellow Vein Mosaic', 
    hindiTopic: 'पीला शिरा मोज़ेक वायरस', 
    query: 'भिंडी के पत्तों की नसें पीली पड़ना (YVMV) कैसे रोकें?', 
    advisory: 'Spray Acetamiprid 20% SP @ 0.5g/L or Dimethoate 30% EC @ 1.5ml/L to eliminate whitefly vector.', 
    coverImage: '/crops/okra.jpg', 
  },
  { 
    id: 33, 
    crop: 'Crop Rotation', 
    hindiCrop: 'फसल चक्र', 
    topic: 'Soil Health & Bio-Manure', 
    hindiTopic: 'मृदा स्वास्थ्य व पोषण', 
    query: 'खेत में फसल चक्र (Crop Rotation) और जैविक खाद के उपयोग से मिट्टी की उर्वरता कैसे बढ़ाएं?', 
    advisory: 'Rotate deep-rooted legumes with cereals, incorporate green manure (Dhaincha), and apply enriched compost with bio-fertilizers.', 
    coverImage: '/crops/kcc_master.jpg', 
  },
];

export function FanWheelHero() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const cardElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const styleCacheRef = useRef<Map<number, string>>(new Map());

  // User interactive state: clicked card brings up clean 3-part explanation
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [modalLang, setModalLang] = useState<'both' | 'en' | 'hi'>('both');
  const [isSpeakingQuery, setIsSpeakingQuery] = useState(false);

  const handleSpeakQuery = (text: string, lang: 'hi-IN' | 'en-IN') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeakingQuery) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuery(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeakingQuery(false);
    utterance.onerror = () => setIsSpeakingQuery(false);
    setIsSpeakingQuery(true);
    window.speechSynthesis.speak(utterance);
  };

  // Animation Phase Refs (Deck Deal & Lift)
  const dealRef = useRef(0);
  const liftRef = useRef(0);
  const startTimeRef = useRef(0);
  const liftStartTimeRef = useRef(0);

  // Smooth Physics refs
  const targetAngleRef = useRef(0);
  const currentAngleRef = useRef(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const dragDistanceRef = useRef(0);

  // Preload local images for instant 0ms rendering
  useEffect(() => {
    AGRI_CARDS.slice(0, 12).forEach((card) => {
      const img = new Image();
      img.src = card.coverImage;
    });
  }, []);

  // MASTER HIGH-PERFORMANCE REQUEST-ANIMATION-FRAME LOOP
  // Phase 1: Majestic starting animation (deck dealt into fan over 3.2s, then lifted over 2.4s)
  // Phase 2: Buttery continuous slow rotation & interactive spinning
  useEffect(() => {
    startTimeRef.current = performance.now();
    let animId: number;
    let lastTime = performance.now();

    const masterLoop = (now: number) => {
      const dt = Math.min(0.04, (now - lastTime) / 1000);
      lastTime = now;

      // 1. Advance DEAL Phase (3200ms duration)
      if (dealRef.current < 1) {
        const elapsed = now - startTimeRef.current;
        dealRef.current = Math.min(1, elapsed / 3200);
      }

      // 2. Advance LIFT Phase (2400ms duration after deal completes)
      if (dealRef.current >= 1 && liftRef.current < 1) {
        if (!liftStartTimeRef.current) {
          liftStartTimeRef.current = now;
        }
        const liftElapsed = now - liftStartTimeRef.current;
        const rawT = Math.min(1, liftElapsed / 2400);

        // Smooth cubic-bezier ease
        const easedLift = rawT < 0.5 
          ? 4 * rawT * rawT * rawT 
          : 1 - Math.pow(-2 * rawT + 2, 3) / 2;

        liftRef.current = easedLift;
      }

      const dealVal = dealRef.current;
      const liftVal = liftRef.current;

      // Wheel Geometry: Fan into elevated turning Wheel with Mobile-Aware Responsive Geometry
      const winW = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const winH = typeof window !== 'undefined' ? window.innerHeight : 800;
      const isMobile = winW < 640;
      const isTablet = winW >= 640 && winW < 1024;

      const fanRadius = isMobile ? Math.min(340, winW * 0.88) : isTablet ? 450 : 560;
      const wheelRadius = isMobile ? Math.min(450, winW * 1.15) : isTablet ? 600 : 720;
      const radius = fanRadius + (wheelRadius - fanRadius) * liftVal;

      const fanPivotY = isMobile ? Math.min(420, winH * 0.52) : isTablet ? 530 : 640;
      const wheelPivotY = isMobile ? Math.min(550, winH * 0.68) : isTablet ? 700 : 840;
      const pivotY = fanPivotY + (wheelPivotY - fanPivotY) * liftVal;

      const totalCards = AGRI_CARDS.length;
      const mobileScale = isMobile ? 0.72 : isTablet ? 0.88 : 1.0;
      const baseCardScale = (0.78 + 0.22 * dealVal) * (0.95 + 0.10 * liftVal) * mobileScale;

      // Smooth Rotation Physics
      if (!isDraggingRef.current) {
        velocityRef.current *= Math.exp(-dt * 3.0);
        targetAngleRef.current += velocityRef.current * dt;

        // Continuous slow rotation active once lift gets underway
        if (liftVal > 0.25 && !selectedCard) {
          targetAngleRef.current -= 3.0 * liftVal * dt;
        }

        currentAngleRef.current += (targetAngleRef.current - currentAngleRef.current) * (1 - Math.exp(-dt * 10));
      } else {
        currentAngleRef.current = targetAngleRef.current;
      }

      for (let i = 0; i < totalCards; i++) {
        const el = cardElementsRef.current[i];
        if (!el) continue;

        const homeAngle = i * (360 / totalCards);
        const homeAngleFromTop = Math.abs((((homeAngle % 360) + 540) % 360) - 180) / 180;

        // Symmetrical deal progress: top cards deal first, outward to sides
        const rawP = (dealVal - homeAngleFromTop * 0.55) / 0.45;
        const clampedP = Math.max(0, Math.min(1, rawP));
        const p = 1 - Math.pow(1 - clampedP, 3); // ease-out cubic

        const sweepAngle = (1 - p) * 45;
        const totalCardAngle = homeAngle + sweepAngle + currentAngleRef.current;

        const angleFromTop = (((totalCardAngle % 360) + 540) % 360) - 180;
        const absAngle = Math.abs(angleFromTop);

        // Visibility culling
        const isVisible = absAngle <= 104;
        if (!isVisible) {
          if (el.style.visibility !== 'hidden') el.style.visibility = 'hidden';
          continue;
        } else if (el.style.visibility !== 'visible') {
          el.style.visibility = 'visible';
        }

        const cardRadius = radius * (0.65 + 0.35 * p);
        const depth = -absAngle * 0.45;
        const flip = (1 - p) * 180;
        const cardScale = baseCardScale * (0.85 + 0.15 * p);

        // ONE TRANSFORM PER CARD:
        const transformStr = 
          `translate3d(0px, ${pivotY.toFixed(1)}px, ${depth.toFixed(1)}px) ` +
          `rotateZ(${totalCardAngle.toFixed(2)}deg) ` +
          `translate3d(0px, ${-cardRadius.toFixed(1)}px, 0px) ` +
          `rotateY(${flip.toFixed(1)}deg) ` +
          `scale(${cardScale.toFixed(3)})`;

        if (styleCacheRef.current.get(i) !== transformStr) {
          styleCacheRef.current.set(i, transformStr);
          el.style.transform = transformStr;
        }

        const newZIndex = `${Math.round(400 - absAngle * 2)}`;
        if (el.style.zIndex !== newZIndex) {
          el.style.zIndex = newZIndex;
        }
      }

      animId = requestAnimationFrame(masterLoop);
    };

    animId = requestAnimationFrame(masterLoop);
    return () => cancelAnimationFrame(animId);
  }, [selectedCard]);

  // Close inspection on Escape key and cancel active speech
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        setIsSpeakingQuery(false);
        setSelectedCard(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedCard && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuery(false);
    }
  }, [selectedCard]);

  // Smooth Pointer & Drag Interactions for the Wheel
  const onPointerDown = (e: React.PointerEvent) => {
    if (selectedCard) return;
    isDraggingRef.current = true;
    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = performance.now();
    velocityRef.current = 0;
    dragDistanceRef.current = 0;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || selectedCard) return;
    const now = performance.now();
    const dx = e.clientX - lastPointerXRef.current;
    const dt = Math.max(0.001, (now - lastPointerTimeRef.current) / 1000);

    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = now;
    dragDistanceRef.current += Math.abs(dx);

    // Apply rotation once intentional drag movement starts (> 4px)
    if (dragDistanceRef.current > 4) {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
      const sensitivity = isMobile ? 0.32 : 0.18;
      const angleDelta = dx * sensitivity;
      targetAngleRef.current += angleDelta;
      currentAngleRef.current = targetAngleRef.current;

      const instantVelocity = angleDelta / dt;
      velocityRef.current = velocityRef.current * 0.5 + instantVelocity * 0.5;
    }
  };

  const onPointerUp = () => {
    isDraggingRef.current = false;
    const now = performance.now();
    if (now - lastPointerTimeRef.current > 70) {
      velocityRef.current = 0;
    }
  };

  // Buttery-smooth wheel & trackpad gestures
  const onWheel = (e: React.WheelEvent) => {
    if (selectedCard) return;
    e.preventDefault();
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    targetAngleRef.current += -delta * 0.05;
    velocityRef.current += -delta * 0.25;
  };

  return (
    <div 
      ref={heroRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      style={{ touchAction: 'none' }}
      className="relative w-full h-full flex-1 flex flex-col justify-between items-center overflow-hidden select-none cursor-grab active:cursor-grabbing perspective-1200 bg-slate-50 dark:bg-[#070908] touch-none"
    >
      {/* Background Ambient Glow */}
      <div 
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-emerald-500/10 dark:hidden rounded-full blur-[130px] pointer-events-none"
      />

      {/* =========================================================================
          TOP HEADLINE: 100% VISIBLE ABOVE THE WHEEL
         ========================================================================= */}
      <div 
        ref={headerRef}
        className="relative z-40 max-w-4xl mx-auto text-center pt-3 sm:pt-7 px-4 pointer-events-auto"
      >
        <h1 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-1.5 sm:mb-2 drop-shadow-sm">
          The Grounded Wheel of <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 dark:from-white dark:via-neutral-200 dark:to-neutral-400">Farming AI.</span>
        </h1>

        <p className="text-[11px] sm:text-sm text-slate-600 dark:text-neutral-300 max-w-lg mx-auto font-medium leading-relaxed">
          Interactive knowledge wheel: spin or drag to explore &bull; click any card to inspect.
        </p>
      </div>

      {/* =========================================================================
          3D WHEEL SCENE: 34 CARDS (9:16)
         ========================================================================= */}
      <div 
        ref={sceneRef}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full flex-1 flex items-center justify-center transform-style-3d pointer-events-none mt-2 sm:mt-4"
      >
        {AGRI_CARDS.map((card, idx) => (
          <div
            key={card.id}
            ref={(el) => { cardElementsRef.current[idx] = el; }}
            onPointerDown={(e) => {
              (e.currentTarget as unknown as { _pt?: { x: number; y: number; time: number } })._pt = {
                x: e.clientX,
                y: e.clientY,
                time: performance.now()
              };
            }}
            onPointerUp={(e) => {
              const pt = (e.currentTarget as unknown as { _pt?: { x: number; y: number; time: number } })._pt;
              const dist = pt ? Math.hypot(e.clientX - pt.x, e.clientY - pt.y) : dragDistanceRef.current;
              const dt = pt ? performance.now() - pt.time : 0;
              // Clean click detection: movement under 18px within 600ms
              if (dist < 18 && dt < 600) {
                e.stopPropagation();
                isDraggingRef.current = false;
                velocityRef.current = 0;
                setSelectedCard(card);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              isDraggingRef.current = false;
              velocityRef.current = 0;
              setSelectedCard(card);
            }}
            className="absolute top-1/2 left-1/2 -ml-[75px] -mt-[130px] sm:-ml-[90px] sm:-mt-[155px] md:-ml-[105px] md:-mt-[180px] w-[150px] h-[260px] sm:w-[180px] sm:h-[310px] md:w-[210px] md:h-[360px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl cursor-pointer pointer-events-auto transform-style-3d will-change-transform"
            style={{
              aspectRatio: '9/16',
              visibility: 'hidden',
            }}
          >
            {/* FRONT FACE: Curated Authentic Local Photo & Crisp Matter */}
            <div 
              style={{ backfaceVisibility: 'hidden' }}
              className="absolute inset-0 w-full h-full bg-slate-950 rounded-3xl overflow-hidden border border-white/20 flex flex-col justify-between p-4 group"
            >
              {/* Local Instant Image */}
              <img 
                src={card.coverImage} 
                alt={`${card.crop} - ${card.topic}`}
                loading="eager"
                className="absolute inset-0 w-full h-full object-cover brightness-[0.7] group-hover:brightness-[0.88] transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />

              {/* Top Tag & Hindi Crop Badge */}
              <div className="relative z-10 flex items-center justify-between gap-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-black/75 text-emerald-400 dark:text-white border border-emerald-500/40 dark:border-white/30 backdrop-blur-md truncate max-w-[100px]">
                  {card.crop}
                </span>
                <span className="text-[10px] font-semibold text-white/95 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                  {card.hindiCrop}
                </span>
              </div>

              {/* Bottom Card Title & Quick Solution */}
              <div className="relative z-10">
                <div className="mb-1">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 dark:text-white font-bold block">
                    {card.hindiTopic}
                  </span>
                  <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                    {card.topic}
                  </h3>
                </div>

                <p className="text-[10px] text-neutral-200 leading-tight mb-2 line-clamp-2 font-medium">
                  {card.advisory}
                </p>

                <div className="pt-2 border-t border-white/20 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-neutral-300">
                    View Advisory
                  </span>
                  <div className="p-1 rounded-full bg-white/20 text-white group-hover:bg-white group-hover:text-black transition-colors">
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Horizon Fog Vignette */}
      <div 
        className="absolute bottom-0 inset-x-0 h-20 sm:h-24 z-30 pointer-events-none bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent dark:from-black dark:via-black/80 dark:to-transparent"
      />

      {/* =========================================================================
          CARD INSPECTION STAGE (DIM BACKGROUND & CARD COMES UP FROM THE DECK)
          Left: Farmer Inquiry • Center: Card Comes Up • Right: Scientific Advisory
          PORTAL TO document.body SO IT APPEARS FULLSCREEN WITH ZERO 3D/OVERFLOW CLIPPING
         ========================================================================= */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedCard && (() => {
            const econ = getCropEconomics(selectedCard.crop);
            const englishQuery = getCropEnglishQuery(selectedCard);

            return (
              <motion.div 
                key="inspection-overlay"
                role="dialog"
                aria-modal="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => {
                  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  }
                  setIsSpeakingQuery(false);
                  setSelectedCard(null);
                }}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl select-auto overflow-y-auto"
              >
                {/* Close Button */}
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                    setIsSpeakingQuery(false);
                    setSelectedCard(null);
                  }}
                  className="absolute top-4 sm:top-6 right-4 sm:right-6 text-neutral-400 hover:text-white p-2.5 rounded-full bg-neutral-900/90 border border-neutral-700/80 shadow-2xl cursor-pointer hover:scale-105 active:scale-95 transition-all z-30"
                  title="Close inspection"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* 3-Column Inspection Stage */}
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="relative max-w-6xl w-full flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-5 sm:gap-7 py-4 px-2 pointer-events-auto max-h-[88vh] overflow-y-auto lg:overflow-visible custom-scrollbar pb-24"
                >
                  {/* LEFT COLUMN: Multilingual Farmer Inquiry & Context */}
                  <motion.div 
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 240, delay: 0.06 }}
                    className="w-full lg:w-[340px] xl:w-[370px] shrink-0 space-y-3.5 text-left order-2 lg:order-1 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Row: Crop Badge + Language Switcher */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-bold font-sans">
                          <span>{selectedCard.crop}</span>
                          <span>&bull;</span>
                          <span>{selectedCard.hindiCrop}</span>
                        </div>

                        {/* Language Switcher: Both | English | हिन्दी */}
                        <div className="flex items-center bg-neutral-900/95 border border-neutral-700/80 rounded-xl p-0.5 text-[10px] font-semibold shadow-inner font-sans">
                          <Languages className="w-3.5 h-3.5 text-neutral-400 ml-1.5 mr-1 shrink-0" />
                          <button
                            type="button"
                            onClick={() => setModalLang('both')}
                            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                              modalLang === 'both' ? 'bg-white text-black font-bold shadow-sm' : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            Both
                          </button>
                          <button
                            type="button"
                            onClick={() => setModalLang('en')}
                            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                              modalLang === 'en' ? 'bg-white text-black font-bold shadow-sm' : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            English
                          </button>
                          <button
                            type="button"
                            onClick={() => setModalLang('hi')}
                            className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                              modalLang === 'hi' ? 'bg-white text-black font-bold shadow-sm' : 'text-neutral-400 hover:text-white'
                            }`}
                          >
                            हिन्दी
                          </button>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs font-bold tracking-normal text-neutral-400 block mb-1 font-sans">
                          {selectedCard.hindiTopic}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight font-sans">
                          {selectedCard.topic}
                        </h2>
                      </div>

                      {/* Clean Question Card */}
                      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 shadow-xl space-y-3 font-sans">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-neutral-400">
                            {modalLang === 'hi' ? 'किसान का सवाल' : modalLang === 'en' ? 'Farmer Question' : 'Question / सवाल'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSpeakQuery(modalLang === 'hi' ? selectedCard.query : englishQuery, modalLang === 'hi' ? 'hi-IN' : 'en-IN')}
                            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium transition-colors cursor-pointer"
                            title="Listen"
                          >
                            {isSpeakingQuery ? <VolumeX className="w-3.5 h-3.5 text-white animate-pulse" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
                            <span>{modalLang === 'hi' ? 'सुनें' : 'Listen'}</span>
                          </button>
                        </div>

                        {modalLang !== 'hi' && (
                          <p className="text-sm font-medium text-white leading-relaxed">
                            "{englishQuery}"
                          </p>
                        )}

                        {modalLang === 'both' && (
                          <div className="border-t border-neutral-800/80 pt-2" />
                        )}

                        {modalLang !== 'en' && (
                          <p className="text-sm font-medium text-neutral-300 leading-relaxed">
                            "{selectedCard.query}"
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* CENTER COLUMN: COMES UP FROM THE DECK! */}
                  <motion.div 
                    initial={{ opacity: 0, y: 340, scale: 0.72 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 340, scale: 0.72 }}
                    transition={{ type: 'spring', damping: 24, stiffness: 220, mass: 0.85 }}
                    className="w-[170px] sm:w-[200px] md:w-[230px] h-[280px] sm:h-[340px] md:h-[390px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black ring-1 ring-white/20 shrink-0 relative bg-slate-950 order-1 lg:order-2 group will-change-transform self-center"
                  >
                    <img 
                      src={selectedCard.coverImage} 
                      alt={selectedCard.topic} 
                      className="w-full h-full object-cover brightness-[0.88]" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20 p-5 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/80 text-white border border-white/30 backdrop-blur-md font-sans">
                          {selectedCard.crop}
                        </span>
                        <span className="text-xs font-semibold text-white/95 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10 font-sans">
                          {selectedCard.hindiCrop}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-neutral-300 block mb-1 font-sans">
                          {selectedCard.hindiTopic}
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-white leading-tight font-sans">
                          {selectedCard.topic}
                        </h3>
                      </div>
                    </div>
                  </motion.div>

                  {/* RIGHT COLUMN: Agronomy Remedy & Full Crop Economics Bento */}
                  <motion.div 
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ type: 'spring', damping: 28, stiffness: 240, delay: 0.1 }}
                    className="w-full lg:flex-1 max-w-md space-y-3.5 text-left order-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Solution Box */}
                      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 shadow-xl">
                        <span className="text-xs font-semibold text-neutral-400 block mb-1.5 font-sans">
                          Recommended Solution
                        </span>
                        <p className="text-xs sm:text-sm font-medium text-white leading-relaxed font-sans">
                          {selectedCard.advisory}
                        </p>
                      </div>

                      {/* Crop Economics & Cultivation Bento Grid */}
                      {econ && (
                        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3.5 shadow-xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-neutral-400 font-sans">
                              Crop Economics (Per Acre)
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 font-sans">
                            {/* Duration */}
                            <div className="bg-neutral-950/70 border border-neutral-800/90 rounded-xl p-2.5">
                              <div className="flex items-center space-x-1 text-neutral-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                                <Clock className="w-3 h-3 text-neutral-300 shrink-0" />
                                <span>Duration (समय)</span>
                              </div>
                              <p className="text-xs sm:text-sm font-bold text-white truncate" title={econ.duration}>{econ.duration}</p>
                            </div>

                            {/* Season */}
                            <div className="bg-neutral-950/70 border border-neutral-800/90 rounded-xl p-2.5">
                              <div className="flex items-center space-x-1 text-neutral-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                                <Calendar className="w-3 h-3 text-neutral-300 shrink-0" />
                                <span>Season (मौसम)</span>
                              </div>
                              <p className="text-xs sm:text-sm font-bold text-white truncate" title={econ.season}>{econ.season}</p>
                            </div>

                            {/* Budget */}
                            <div className="bg-neutral-950/70 border border-neutral-800/90 rounded-xl p-2.5">
                              <div className="flex items-center space-x-1 text-neutral-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                                <DollarSign className="w-3 h-3 text-neutral-300 shrink-0" />
                                <span>Budget (लागत / ac)</span>
                              </div>
                              <p className="text-xs sm:text-sm font-bold text-white truncate" title={econ.budget}>{econ.budget}</p>
                            </div>

                            {/* Profit */}
                            <div className="bg-neutral-950/70 border border-neutral-800/90 rounded-xl p-2.5">
                              <div className="flex items-center space-x-1 text-neutral-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                                <TrendingUp className="w-3 h-3 text-neutral-300 shrink-0" />
                                <span>Est. Profit (मुनाफा)</span>
                              </div>
                              <p className="text-xs sm:text-sm font-black text-white truncate" title={econ.profit}>{econ.profit}</p>
                            </div>

                            {/* Yield */}
                            <div className="bg-neutral-950/70 border border-neutral-800/90 rounded-xl p-2.5">
                              <div className="flex items-center space-x-1 text-neutral-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                                <Sprout className="w-3 h-3 text-neutral-300 shrink-0" />
                                <span>Expected Yield</span>
                              </div>
                              <p className="text-xs sm:text-sm font-bold text-white truncate" title={econ.yield}>{econ.yield}</p>
                            </div>

                            {/* Irrigation */}
                            <div className="bg-neutral-950/70 border border-neutral-800/90 rounded-xl p-2.5">
                              <div className="flex items-center space-x-1 text-neutral-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                                <Droplets className="w-3 h-3 text-neutral-300 shrink-0" />
                                <span>Water / Irrigation</span>
                              </div>
                              <p className="text-xs sm:text-sm font-bold text-white truncate" title={econ.waterNeed}>{econ.waterNeed}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                        }
                        setIsSpeakingQuery(false);
                        const initialQuery = englishQuery || selectedCard.query;
                        setSelectedCard(null);
                        navigate('/chat', { state: { initialQuery } });
                      }}
                      className="w-full py-3 px-5 rounded-2xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-wide flex items-center justify-center space-x-2 shadow-lg transition-all cursor-pointer"
                    >
                      <span>Ask About This Crop</span>
                      <ArrowRight className="w-4 h-4 text-black" />
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
}
