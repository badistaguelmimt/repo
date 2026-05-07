export class PaiementService {
    constructor(data){
        this.Id = data.Id;
        this.IdReservation = data.IdReservation;
        this.Montant = data.Montant;
        this.Statut = data.Statut;
        this.stripe_payment_intent_id = data.stripe_payment_intent_id;
        this.connectedAccountId = data.connectedAccountId;
        this.applicationFeeAmount = data.applicationFeeAmount;
    }
}