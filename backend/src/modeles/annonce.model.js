export class Annonce {
    constructor(data){
        this.Id = data.Id;
        this.IdUtilisateur = data.IdUtilisateur;
        this.IdAnimal = data.IdAnimal;
        this.TypeService = data.TypeService;
        this.DateDebut = data.DateDebut;
        this.DateFin = data.DateFin;
        this.PrixSouhaite = data.PrixSouhaite;
        this.Statut = data.Statut;
        this.Notes = data.Notes;
    }
}