// Modèle représentant une demande d'adoption.
// Mappe les colonnes PascalCase de la base de données vers un objet JavaScript structuré.
export class DemandeAdoption {
    constructor(data) {
        this.Id = data.Id;
        this.IdAnimal = data.IdAnimal;
        this.IdUtilisateur = data.IdUtilisateur;
        this.IdRefuge = data.IdRefuge;
        this.Statut = data.Statut;
        this.TypeLogement = data.TypeLogement;
        this.Jardin = data.Jardin;
        this.Animaux = data.Animaux;
        this.Enfants = data.Enfants;
        this.CommentaireDepart = data.CommentaireDepart;
        this.Disponibilite = data.Disponibilite;
        this.CommentaireRetour = data.CommentaireRetour;
        this.DateDemande = data.DateDemande;
        this.DateRetours = data.DateRetours;
    }
}
