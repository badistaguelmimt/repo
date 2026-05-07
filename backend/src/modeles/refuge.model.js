export class Refuge{
    constructor(data){
        this.Id = data.Id;
        this.Nom = data.Nom;
        this.Description = data.Description;
        this.Addresse = data.Addresse;
        this.AddresseGPS = data.AddresseGPS;
        this.Date_inscription = data.Date_inscription;
        this.Telephone = data.Telephone;
        this.stripeAccountId = data.stripeAccountId;
        this.stripeAccountStatus = data.stripeAccountStatus;
    }
}