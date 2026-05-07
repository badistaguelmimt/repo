// Modèle représentant un utilisateur de la plateforme.
// Mappe les colonnes PascalCase de la base de données vers un objet JavaScript structuré.
export class Utilisateur {
    constructor(data) {
        this.Id = data.Id;
        this.clerkId = data.clerkId;
        this.stripeCustomerId = data.stripeCustomerId;
        this.stripeAccountId = data.stripeAccountId;
        this.stripeAccountStatus = data.stripeAccountStatus;
        this.Nom = data.Nom;
        this.Prenom = data.Prenom;
        this.Addresse = data.Addresse;
        this.AddresseEmail = data.AddresseEmail;
        this.Wilaya = data.Wilaya;
        this.MotDePasse = data.MotDePasse;
        this.Photo = data.Photo;
        this.CreeLe = data.CreeLe;
        this.CreePar = data.CreePar;
        this.ModifieeLe = data.ModifieeLe;
        this.ModifieePar = data.ModifieePar;
    }
}