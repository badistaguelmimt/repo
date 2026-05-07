export class Animal{
    constructor(data){
        this.Id = data.Id;
        this.Nom = data.Nom;
        this.Prenom = data.Prenom;
        this.Age = data.Age;
        this.Genre = data.Genre;
        this.Poids = data.Poids;
        this.Taille = data.Taille;
        this.Couleur = data.Couleur;
        this.EtatSantee = data.EtatSantee;
        this.Sterilise = data.Sterilise;
        this.Temperament = data.Temperament;
        this.NiveauEnergetique = data.NiveauEnergetique;
        this.SociableEnfant = data.SociableEnfant;
        this.SociableAnimaux = data.SociableAnimaux;
        this.Statut = data.Statut;    //      <= bizzare
        this.Race = data.Race;
        this.Date_ajout = data.Date_ajout;
    }
}