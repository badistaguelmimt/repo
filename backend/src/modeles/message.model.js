export class Message {
    constructor(data){
        this.Id = data.Id;
        this.IdConversation = data.IdConversation;
        this.SenderId = data.SenderId;
        this.Contenu = data.Contenu;
        this.CreatedAt = data.CreatedAt;
    }
}