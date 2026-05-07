export class AvisService {
    constructor(data){
        this.Id = data.Id;
        this.IdReservation = data.IdReservation;
        this.IdUtilisateur = data.IdUtilisateur;
        this.Note = data.Note;
        this.DateAvis = data.DateAvis;
        this.TypeAvis = data.TypeAvis;
    }
}