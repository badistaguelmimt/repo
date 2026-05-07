export class Avis {
    constructor(data){
        this.Id = data.Id;
        this.IdUtilisateur = data.IdUtilisateur;
        this.IdProduit = data.IdProduit;
        this.IdSousCommande = data.IdSousCommande;
        this.Note = data.Note;
        this.Commentaire = data.Commentaire;
    }
}