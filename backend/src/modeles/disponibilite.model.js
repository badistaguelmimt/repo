export class Disponibilite {
    constructor(data){
        this.Id = data.Id;
        this.IdProfil = data.IdProfil;
        this.DateDebut = data.DateDebut;
        this.DateFin = data.DateFin;
        this.Recurrence = data.Recurrence;
        this.Frequence = data.Frequence;
        this.Disponibilite = data.Disponibilite;
        this.RecurrenceFin = data.RecurrenceFin ?? null;
    }
}