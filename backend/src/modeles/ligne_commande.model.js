export class LigneCommande {
    constructor(data){
        this.Id = data.Id;
        this.IdSousCommande = data.IdSousCommande;
        this.IdProduit = data.IdProduit;
        this.Quantite = data.Quantite;
    }
}