import { db, connectDB } from '../config/db.js'

await connectDB()

// ── Nouvelles races à insérer ─────────────────────────────────────────────────
// Format : [Nom, Description, Origine, EsperanceVie, Maintenance, TailleMoyenne, PoidsMoyen,
//           Couleurs, Classification, Pelage, TaillePelageMoyen, Habitat, Inteligence, Imunite, Alergies, Espece]

const newRaces = [
  // ── CHIENS (Espece=1) ──────────────────────────────────────────────────────
  [
    'Bouledogue Français',
    "Le Bouledogue Français est un chien compact, affectueux et facile à vivre. Très adapté à la vie en appartement, il est calme mais espiègle. Excellent compagnon pour les personnes seules comme pour les familles, il n'a pratiquement pas besoin d'exercice intensif.",
    'France', '10-12 ans', 'Faible',
    30, 12,
    'Fauve, Bringé, Blanc et bringé', 'Chien de compagnie',
    1, 'Court et lisse',
    'Appartement', 'Modérée',
    'Bonne', 'Problèmes respiratoires (brachycéphale), Allergie cutanée',
    1
  ],
  [
    'Husky Sibérien',
    "Le Husky Sibérien est une race de traîneau aux origines arctiques, reconnaissable à ses yeux bleus perçants et son pelage épais. Énergique, indépendant et très sociable, il a besoin de beaucoup d'exercice et d'espace. Il est très attaché à son groupe.",
    'Sibérie (Russie)', '12-15 ans', 'Élevée',
    58, 27,
    'Noir et blanc, Gris et blanc, Rouge et blanc, Blanc pur', 'Chien nordique',
    1, 'Double épaisse (sous-poil + poil de garde)',
    'Maison avec grand jardin', 'Élevée',
    'Excellente', "Dysplasie de la hanche, Problèmes oculaires",
    1
  ],
  [
    'Caniche',
    "Le Caniche est l'une des races les plus intelligentes et les plus élégantes. Il existe en 4 tailles (toy, nain, moyen, grand). Très attaché à son maître, il est aussi hypoallergénique grâce à son pelage bouclé qui ne perd presque pas de poils.",
    'France / Allemagne', '12-15 ans', 'Élevée',
    45, 8,
    'Blanc, Noir, Abricot, Gris argenté, Brun', 'Chien rapporteur',
    1, 'Bouclé et dense',
    'Appartement ou maison', 'Très élevée',
    'Bonne', 'Dysplasie de la hanche, Problèmes oculaires',
    1
  ],
  [
    'Chihuahua',
    "Le Chihuahua est la plus petite race de chien au monde, mais aussi l'une des plus courageuses. Intrépide et très attaché à son maître, il peut être possessif et méfiant envers les étrangers. Malgré sa petite taille, il a un caractère bien trempé.",
    'Mexique', '12-20 ans', 'Faible',
    20, 2.5,
    'Toutes couleurs : fauve, noir, blanc, tricolore...', 'Chien de compagnie',
    1, 'Court ou mi-long',
    'Appartement', 'Élevée',
    'Bonne', "Hypoglycémie, Problèmes dentaires, Luxation de la rotule",
    1
  ],
  [
    'Beagle',
    "Le Beagle est un chien de chasse à l'odorat exceptionnel, curieux et joyeux. Très sociable avec les humains et les autres animaux, il est malheureusement aussi un grand fugueur. Il a besoin d'exercice quotidien et de stimulation olfactive pour s'épanouir.",
    'Angleterre', '12-15 ans', 'Modérée',
    38, 12,
    'Tricolore (noir, blanc, fauve), Bicolore', 'Chien courant',
    1, 'Court et dense',
    'Maison avec jardin', 'Modérée',
    'Bonne', 'Obésité, Epilepsie, Otites',
    1
  ],
  [
    'Shih Tzu',
    "Le Shih Tzu est un petit chien originaire de Chine impériale, élevé pour être compagnon de la royauté. Affectueux, joyeux et peu sportif, il est idéal en appartement. Son pelage luxuriant nécessite un entretien régulier mais il ne perd pas de poils.",
    'Tibet / Chine', '10-18 ans', 'Élevée',
    27, 6,
    'Or et blanc, Noir et blanc, Gris et blanc', 'Chien de compagnie',
    1, 'Long et soyeux',
    'Appartement', 'Modérée',
    'Bonne', "Problèmes respiratoires, Problèmes oculaires",
    1
  ],
  [
    'Border Collie',
    "Considéré comme le chien le plus intelligent au monde, le Border Collie est un berger infatigable qui a besoin d'une activité intense quotidienne. Loyal et obéissant, il excelle dans tous les sports canins. Il ne convient pas aux personnes sédentaires.",
    'Angleterre / Écosse', '12-15 ans', 'Modérée',
    53, 20,
    'Noir et blanc, Brun et blanc, Bleu merle', 'Chien de berger',
    1, 'Mi-long, épais',
    'Maison avec grand jardin', 'Très élevée',
    'Bonne', 'Collie Eye Anomaly (CEA), Epilepsie',
    1
  ],
  [
    'Rottweiler',
    "Le Rottweiler est un chien de garde et de travail puissant, courageux et loyal envers sa famille. Bien socialisé, il est calme et confiant. Il nécessite une éducation ferme et bienveillante dès le plus jeune âge pour canaliser sa force et son caractère.",
    'Allemagne', '9-10 ans', 'Modérée',
    67, 50,
    'Noir et feu', 'Chien de travail',
    1, 'Court et dur',
    'Maison avec jardin', 'Élevée',
    'Bonne', 'Dysplasie de la hanche, Cardiomyopathie',
    1
  ],
  [
    'Dalmatien',
    "Le Dalmatien est immédiatement reconnaissable à ses taches noires sur fond blanc. Énergique et endurant, il était autrefois chien de carrosse. Très joueur et affectueux avec les enfants, il a besoin de beaucoup d'exercice et de stimulation mentale.",
    'Croatie', '11-13 ans', 'Modérée',
    58, 28,
    'Blanc avec taches noires ou marron', 'Chien de compagnie',
    1, 'Court et brillant',
    'Maison avec jardin', 'Modérée',
    'Bonne', 'Surdité congénitale, Urolithiase',
    1
  ],
  [
    'Dobermann',
    "Le Dobermann est un chien de garde et de défense élégant et musclé. Très intelligent, loyal et courageux, il est aussi très affectueux avec sa famille. Il a besoin d'une éducation cohérente, d'exercice régulier et de présence humaine pour s'épanouir.",
    'Allemagne', '10-13 ans', 'Faible',
    70, 40,
    'Noir et feu, Brun et feu, Bleu et feu', 'Chien de travail',
    1, 'Court, lisse et brillant',
    'Maison avec jardin', 'Très élevée',
    'Bonne', 'Cardiomyopathie dilatée, Maladie de von Willebrand',
    1
  ],
  [
    'Cavalier King Charles',
    "Le Cavalier King Charles Spaniel est l'un des chiens de compagnie les plus doux et affectueux. Adorant les câlins et la présence humaine, il est idéal pour les familles, les personnes âgées ou les appartements. Il s'entend avec tous les animaux.",
    'Royaume-Uni', '9-15 ans', 'Modérée',
    33, 7,
    'Blenheim (fauve et blanc), Tricolore, Noir et feu, Ruby', 'Chien de compagnie',
    1, 'Mi-long, soyeux',
    'Appartement ou maison', 'Modérée',
    'Moyenne', 'Syndrome de Chiari-Malformation, Régurgitation mitrale',
    1
  ],
  [
    'Teckel',
    "Le Teckel, aussi appelé Dachshund, est reconnaissable à son corps allongé et ses pattes courtes. Curieux, courageux et têtu, il a été élevé pour chasser les blaireaux. Malgré sa petite taille, c'est un chasseur né avec beaucoup de personnalité.",
    'Allemagne', '12-16 ans', 'Faible à modérée',
    22, 8,
    'Fauve, Noir et feu, Chocolat et feu, Bringé', 'Chien courant',
    1, 'Court, mi-long ou à poil dur',
    'Appartement ou maison', 'Modérée',
    'Bonne', "Problèmes intervertébraux (IVDD), Obésité",
    1
  ],

  // ── CHATS (Espece=2) ───────────────────────────────────────────────────────
  [
    'Persan',
    "Le Persan est la quintessence du chat calme et aristocratique. Avec son visage aplati caractéristique et son pelage somptueux, il est un véritable bijou de la maison. Peu actif, il préfère les moments de calme et les câlins à une activité intense.",
    'Iran (Perse)', '12-17 ans', 'Très élevée',
    28, 5,
    'Blanc, Noir, Bleu, Argenté, Orange, Bicolore', 'Chat à poil long',
    1, 'Très long, épais et soyeux',
    'Appartement calme', 'Modérée',
    'Moyenne', 'Problèmes rénaux (PKD), Problèmes respiratoires',
    2
  ],
  [
    'Sacré de Birmanie',
    "Le Sacré de Birmanie, aussi appelé Birman, est un chat élégant aux yeux bleus saphir et aux pattes aux extrémités blanches (les gants). Doux, affectueux et joueur, il est moins bruyant que le Siamois mais tout aussi attaché à son maître.",
    'Birmanie / France', '12-16 ans', 'Modérée',
    32, 6,
    'Seal point, Bleu point, Chocolat, Lilas, Rouge', 'Chat à poil semi-long',
    1, 'Semi-long, soyeux, sans sous-poil',
    'Appartement ou maison', 'Modérée',
    'Bonne', 'Cardiomyopathie hypertrophique, Maladie rénale',
    2
  ],
  [
    'Abyssin',
    "L'Abyssin est un chat fin, élégant et d'une curiosité insatiable. Très actif et joueur, il est souvent décrit comme le chat le plus dynamique. Il a besoin de stimulation permanente et d'espace pour s'épanouir. Sa robe tigrée évoque le chat sauvage.",
    'Éthiopie', '9-15 ans', 'Faible',
    30, 4,
    'Fauve (ticked tabby), Roux, Bleu, Lilas', 'Chat oriental',
    1, 'Court, brillant et serré',
    'Maison avec accès extérieur', 'Très élevée',
    'Bonne', 'Amyloïdose rénale, Luxation du cristallin',
    2
  ],
  [
    'Ragdoll',
    "Le Ragdoll est un géant doux et placide, célèbre pour son comportement de poupée de chiffon (il se détend complètement dans les bras). Très affectueux et peu indépendant, il suit son maître partout. Idéal pour les familles, il ne sort pas.",
    'États-Unis', '12-17 ans', 'Modérée',
    40, 9,
    'Colorpoint, Mitted, Bicolor — en seal, bleu, chocolat, lilas, flamme', 'Chat à poil semi-long',
    1, 'Semi-long, soyeux et peu emmêlant',
    'Appartement (chat intérieur)', 'Modérée',
    'Bonne', 'Cardiomyopathie hypertrophique, Maladie rénale polykystique',
    2
  ],
  [
    'Sphynx',
    "Le Sphynx est le chat sans poils le plus connu. Malgré son apparence surprenante, c'est un animal extrêmement affectueux, joueur et chaleureux. Sa peau nue dégage de la chaleur et il raffole des câlins. Il vit exclusivement en appartement.",
    'Canada', '8-14 ans', 'Élevée (soin de la peau)',
    35, 5,
    'Toutes couleurs visibles sur la peau : noir, blanc, fauve, tigré', 'Chat à poil court (sans poils)',
    0, 'Sans poils, peau ridée',
    'Appartement (chat intérieur)', 'Élevée',
    'Moyenne', 'Cardiomyopathie hypertrophique, Problèmes cutanés',
    2
  ],
  [
    'British Shorthair',
    "Le British Shorthair est un chat robuste, calme et réservé. Très équilibré et peu démonstratif, il exprime son affection à sa façon, sans être pot-de-colle. Son pelage dense et son visage rond lui donnent une allure d'ours en peluche très appréciée.",
    'Grande-Bretagne', '12-20 ans', 'Faible',
    34, 7,
    'Bleu (le plus typique), Noir, Blanc, Crème, Tabby, Bicolore', 'Chat à poil court',
    1, 'Court, dense et plush',
    'Appartement ou maison', 'Modérée',
    'Bonne', 'Cardiomyopathie hypertrophique, PKD',
    2
  ],
  [
    'Scottish Fold',
    "Le Scottish Fold est célèbre pour ses oreilles repliées vers l'avant qui lui donnent une expression de chouette. Calme, affectueux et adaptable, il est excellent en appartement. Sa mutation génétique nécessite une attention particulière à sa santé.",
    'Écosse', '11-14 ans', 'Modérée',
    30, 5,
    'Toutes couleurs : blanc, noir, gris, tabby, bicolore', 'Chat à poil court',
    1, 'Court, épais et souple',
    'Appartement', 'Modérée',
    'Fragile', 'Ostéochondrodysplasie (problèmes osseux liés au gène fold)',
    2
  ],

  // ── LAPINS (Espece=3) ──────────────────────────────────────────────────────
  [
    'Nain de Hollande',
    "Le Lapin Nain de Hollande est l'une des plus petites races de lapins domestiques. Compact, vif et curieux, il est très populaire comme animal de compagnie. Malgré sa petite taille, il a beaucoup de caractère et a besoin d'espace pour s'exercer.",
    'Pays-Bas', '7-10 ans', 'Modérée',
    20, 1.5,
    'Blanc aux yeux rouges, Bleu, Noir, Fauve, Gris', 'Lapin domestique',
    1, 'Court et doux',
    'Intérieur avec espace de jeu', 'Modérée',
    'Moyenne', 'Malocclusion dentaire, GI Stasis',
    3
  ],
  [
    'Rex',
    "Le Lapin Rex est reconnaissable à son pelage court, dense et d'un velouté incomparable. Calme, affectueux et curieux, il est considéré comme l'un des lapins les plus doux à la fois au niveau du caractère et du toucher. Excellent avec les enfants.",
    'France', '5-6 ans', 'Faible',
    40, 4,
    'Noir, Castor, Bleu, Chinchilla, Fauve, Blanc', 'Lapin domestique',
    1, 'Court et velours (3cm max)',
    'Intérieur ou extérieur sécurisé', 'Modérée',
    'Bonne', 'Spondylose, Problèmes urinaires',
    3
  ],
  [
    'Angora Anglais',
    "Le Lapin Angora Anglais est réputé pour son pelage exceptionnel, long, soyeux et particulièrement abondant qui recouvre même son visage. Calme et affectueux, il nécessite un entretien intensif de son pelage pour éviter les boules de poils.",
    'Turquie / Angleterre', '7-12 ans', 'Très élevée',
    30, 2.5,
    'Blanc, Noir, Bleu, Chocolat, Fauve', 'Lapin de compagnie',
    1, 'Très long et soyeux (10-15 cm)',
    'Intérieur exclusivement', 'Modérée',
    'Fragile', 'Boules de poils (trichobézoard), Problèmes dentaires',
    3
  ],

  // ── HAMSTERS (Espece=4) ────────────────────────────────────────────────────
  [
    'Hamster Doré',
    "Le Hamster Doré (ou Hamster de Syrie) est le hamster de compagnie le plus populaire. Solitaire et territorial, il doit vivre seul. Nocturne de nature, il est actif la nuit et a besoin d'une grande roue pour courir. Très doux si bien apprivoisé.",
    'Syrie', '2-3 ans', 'Modérée',
    15, 0.15,
    'Doré, Fauve, Blanc, Noir, Crème, Pie', 'Rongeur domestique',
    1, 'Court ou long selon la variété',
    'Cage spacieuse en intérieur', 'Modérée',
    'Fragile', 'Abcès de joue, Tumeurs, Diabète',
    4
  ],
  [
    'Hamster Russe Nain',
    "Le Hamster Russe Nain est l'un des plus petits hamsters domestiques. Contrairement au Doré, il peut cohabiter avec ses congénères si introduit jeune. Très rapide et vif, il est davantage fait pour l'observation que les câlins, mais reste très populaire.",
    'Russie / Kazakhstan', '1.5-2 ans', 'Modérée',
    10, 0.05,
    'Gris ardoise avec ligne dorsale sombre, Blanc, Sapphire', 'Rongeur domestique',
    1, 'Court et doux',
    'Cage spacieuse en intérieur', 'Faible',
    'Fragile', 'Diabète (très fréquent), Tumeurs',
    4
  ]
]

// Insert all new races
let insertedCount = 0
for (const r of newRaces) {
  try {
    await db.query(
      `INSERT INTO race (Nom, Description, Origine, EsperanceVie, Maintenance,
        TailleMoyenne, PoidsMoyen, Couleurs, Classification, Pelage,
        TaillePelageMoyen, Habitat, Inteligence, Imunite, Alergies, Espece)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      r
    )
    console.log('Inserted:', r[0])
    insertedCount++
  } catch (e) {
    // Skip if already exists (duplicate Nom)
    if (e.code === 'ER_DUP_ENTRY' || e.message?.includes('Duplicate')) {
      console.log('Skipped (already exists):', r[0])
    } else {
      console.error('Error inserting', r[0], ':', e.message)
    }
  }
}

console.log(`\nDone! ${insertedCount} races inserted.`)
process.exit()
