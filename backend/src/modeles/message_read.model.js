export class MessageRead {
    constructor(data){
        this.Id = data.Id;
        this.IdMessage = data.IdMessage;
        this.IdUtilisateur = data.IdUtilisateur;
        this.ReadAt = data.ReadAt;
    }
}