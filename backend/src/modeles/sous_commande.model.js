export class SousCommande {
    constructor(data){
        this.Id = data.Id;
        this.IdCommande = data.IdCommande;
        this.IdRefuge = data.IdRefuge;
        this.Statut = data.Statut;
        this.Total_prix = data.Total_prix;
        this.stripe_transfer_id = data.stripe_transfer_id;
        this.platformFee = data.platformFee;
    }
}