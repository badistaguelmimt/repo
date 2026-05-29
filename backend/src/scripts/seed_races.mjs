import { db, connectDB } from '../config/db.js'

await connectDB()

const races = [
  {
    Id: 1, Nom: 'Labrador',
    Description: "Le Labrador Retriever est l'une des races les plus populaires au monde. Chien doux, enthousiaste et facile à dresser, il est aussi bien compagnon de famille que chien guide ou de secours. Jovial et adaptable, il s'entend avec tout le monde.",
    Origine: 'Canada', EsperanceVie: '10-12 ans', Maintenance: 'Modérée',
    TailleMoyenne: 57, PoidsMoyen: 30,
    Couleurs: 'Noir, Chocolat, Fauve', Classification: 'Chien rapporteur',
    Pelage: 1, TaillePelageMoyen: 'Court et dense',
    Habitat: 'Maison avec jardin', Inteligence: 'Très élevée',
    Imunite: 'Bonne', Alergies: 'Dysplasie de la hanche'
  },
  {
    Id: 2, Nom: 'Berger Allemand',
    Description: "Le Berger Allemand est une race polyvalente, courageuse et loyale. Chien de travail par excellence, il est utilisé dans la police, l'armée et comme chien guide. Protecteur naturel, il est aussi un excellent compagnon de famille.",
    Origine: 'Allemagne', EsperanceVie: '9-13 ans', Maintenance: 'Élevée',
    TailleMoyenne: 62, PoidsMoyen: 35,
    Couleurs: 'Noir et feu, Sable, Noir', Classification: 'Chien de berger',
    Pelage: 1, TaillePelageMoyen: 'Mi-long et épais',
    Habitat: 'Maison avec jardin', Inteligence: 'Très élevée',
    Imunite: 'Bonne', Alergies: 'Dysplasie de la hanche, Myélopathie dégénérative'
  },
  {
    Id: 3, Nom: 'Golden',
    Description: "Le Golden Retriever est réputé pour sa douceur et sa gentillesse sans égales. Chien de famille par excellence, il fait preuve d'une patience remarquable avec les enfants. Très sociable, il s'entend avec tout le monde.",
    Origine: 'Écosse', EsperanceVie: '10-12 ans', Maintenance: 'Modérée',
    TailleMoyenne: 56, PoidsMoyen: 32,
    Couleurs: 'Or, Crème, Doré', Classification: 'Chien rapporteur',
    Pelage: 1, TaillePelageMoyen: 'Long et soyeux',
    Habitat: 'Maison avec jardin', Inteligence: 'Très élevée',
    Imunite: 'Bonne', Alergies: 'Dysplasie de la hanche, Cancer'
  },
  {
    Id: 4, Nom: 'Siamois',
    Description: "Le chat Siamois est l'une des races les plus anciennes et reconnaissables du monde. Très vocal et expressif, il n'hésite pas à communiquer avec son maître. Affectueux et curieux, il déteste la solitude et a besoin de compagnie.",
    Origine: 'Thaïlande', EsperanceVie: '12-15 ans', Maintenance: 'Faible',
    TailleMoyenne: 30, PoidsMoyen: 4,
    Couleurs: 'Crème avec extrémités foncées (seal, chocolat, bleu, lilac)', Classification: 'Chat oriental',
    Pelage: 1, TaillePelageMoyen: 'Court et fin',
    Habitat: 'Appartement ou maison', Inteligence: 'Très élevée',
    Imunite: 'Bonne', Alergies: 'Problèmes respiratoires, Maladie rénale'
  },
  {
    Id: 5, Nom: 'Bengal',
    Description: "Le chat Bengal est le résultat d'un croisement entre un chat domestique et un chat léopard asiatique. Il conserve un pelage sauvage et tacheté spectaculaire. Très actif et joueur, il a besoin de stimulation et d'espace.",
    Origine: 'États-Unis', EsperanceVie: '10-16 ans', Maintenance: 'Modérée',
    TailleMoyenne: 35, PoidsMoyen: 6,
    Couleurs: 'Brun tacheté, Marbre, Silver', Classification: 'Chat hybride',
    Pelage: 1, TaillePelageMoyen: 'Court, dense et lustré',
    Habitat: 'Maison avec espace', Inteligence: 'Très élevée',
    Imunite: 'Excellente', Alergies: 'Cardiomyopathie hypertrophique'
  },
  {
    Id: 6, Nom: 'Main Coon',
    Description: "Le Maine Coon est l'une des plus grandes races de chats domestiques. Surnommé le chien des chats pour son comportement sociable et joueur, il est doux, affectueux et s'adapte très bien à la vie en famille.",
    Origine: 'États-Unis (Maine)', EsperanceVie: '12-15 ans', Maintenance: 'Élevée',
    TailleMoyenne: 40, PoidsMoyen: 8,
    Couleurs: 'Toutes couleurs possibles', Classification: 'Chat semi-longhaired',
    Pelage: 1, TaillePelageMoyen: 'Semi-long et luxuriant',
    Habitat: 'Maison ou appartement spacieux', Inteligence: 'Élevée',
    Imunite: 'Bonne', Alergies: 'Cardiomyopathie hypertrophique, Dysplasie de la hanche'
  },
  {
    Id: 7, Nom: 'Bélier',
    Description: "Le lapin Bélier est reconnaissable à ses grandes oreilles tombantes caractéristiques. Particulièrement calme et affectueux, il est idéal comme animal de compagnie pour les familles avec enfants. Sa douceur naturelle en fait un compagnon agréable.",
    Origine: 'France', EsperanceVie: '8-12 ans', Maintenance: 'Modérée',
    TailleMoyenne: 25, PoidsMoyen: 4,
    Couleurs: 'Noir, Blanc, Gris, Fauve, Tricolore', Classification: 'Lapin domestique',
    Pelage: 1, TaillePelageMoyen: 'Court à mi-long',
    Habitat: 'Intérieur avec espace de jeu', Inteligence: 'Modérée',
    Imunite: 'Moyenne', Alergies: 'Malocclusion dentaire, Problèmes digestifs'
  },
  {
    Id: 8, Nom: 'Russe',
    Description: "Le Bleu Russe est un chat élégant et distingué, reconnu pour son pelage bleu-argent et ses yeux vert émeraude. Réservé avec les étrangers mais très attaché à son maître, il est calme, propre et s'adapte parfaitement à la vie en appartement.",
    Origine: 'Russie', EsperanceVie: '15-20 ans', Maintenance: 'Faible',
    TailleMoyenne: 28, PoidsMoyen: 4,
    Couleurs: 'Bleu-argent uniforme', Classification: 'Chat à poil court',
    Pelage: 1, TaillePelageMoyen: 'Court, dense et soyeux',
    Habitat: 'Appartement', Inteligence: 'Élevée',
    Imunite: 'Excellente', Alergies: 'Peu de problèmes de santé connus'
  }
]

for (const r of races) {
  await db.query(
    `UPDATE race SET
      Description=?, Origine=?, EsperanceVie=?, Maintenance=?,
      TailleMoyenne=?, PoidsMoyen=?, Couleurs=?, Classification=?,
      Pelage=?, TaillePelageMoyen=?, Habitat=?, Inteligence=?, Imunite=?, Alergies=?
    WHERE Id=?`,
    [r.Description, r.Origine, r.EsperanceVie, r.Maintenance,
     r.TailleMoyenne, r.PoidsMoyen, r.Couleurs, r.Classification,
     r.Pelage, r.TaillePelageMoyen, r.Habitat, r.Inteligence, r.Imunite, r.Alergies,
     r.Id]
  )
  console.log('Updated:', r.Nom)
}

console.log('All races updated successfully!')
process.exit()
