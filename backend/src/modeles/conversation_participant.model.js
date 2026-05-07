export class ConversationParticipant {
    constructor(data){
        this.Id = data.Id;
        this.IdConversation = data.IdConversation;
        this.IdUtilisateur = data.IdUtilisateur;
        this.Statut = data.Statut;
        this.Role = data.Role;
        this.JoinedAt = data.JoinedAt;
    }
}