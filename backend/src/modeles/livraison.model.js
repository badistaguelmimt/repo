export class Livraison {
    constructor(data){
        this.Id = data.Id;
        this.IdSousCommande = data.IdSousCommande;
        this.Addresse = data.Addresse;
        this.Statut = data.Statut;
        this.TrackingNumber = data.TrackingNumber;
        this.Transporteur = data.Transporteur;
    }
}