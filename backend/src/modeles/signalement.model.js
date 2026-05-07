export class Signalement {
    constructor(data){
        this.Id = data.Id;
        this.IdUtilisateur = data.IdUtilisateur;
        this.TypeCible = data.TypeCible;
        this.IdCible = data.IdCible;
        this.Statut = data.Statut;
        this.Raison = data.Raison;
        this.DateSignalement = data.DateSignalement;
    }
}