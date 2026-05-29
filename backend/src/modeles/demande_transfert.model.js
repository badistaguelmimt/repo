export class DemandeTransfert {
    constructor(data){
        this.Id = data.Id;
        this.IdAnimal = data.IdAnimal;
        this.IdRefugeDepart = data.IdRefugeDepart;
        this.IdRefugeCible = data.IdRefugeCible;
        this.Statut = data.Statut;
        this.CommentaireDepart = data.CommentaireDepart;
        this.CommentaireRetour = data.CommentaireRetour;
        this.DateDemande = data.DateDemande;
        this.DateRetours = data.DateRetours;
    }
}
