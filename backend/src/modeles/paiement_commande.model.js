export class PaiementCommande {
    constructor(data){
        this.Id = data.Id;
        this.IdCommande = data.IdCommande;
        this.Montant = data.Montant;
        this.Statut = data.Statut;
        this.stripe_payment_intent_id = data.stripe_payment_intent_id;
        this.applicationFeeAmount = data.applicationFeeAmount;
    }
}