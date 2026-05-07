export class Reservation {
    constructor(data){
        this.Id = data.Id;
        this.IdUtilisateur = data.IdUtilisateur;
        this.IdProfil = data.IdProfil;
        this.IdAnimal = data.IdAnimal;
        this.IdAnnonce = data.IdAnnonce;
        this.TypeService = data.TypeService;
        this.DateDebut = data.DateDebut;
        this.DateFin = data.DateFin;
        this.Statut = data.Statut;
        this.PrixFinal = data.PrixFinal;
        this.Notes = data.Notes;
    }
}