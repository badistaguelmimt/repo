export class Conversation {
    constructor(data){
        this.Id = data.Id;
        this.Type = data.Type;
        this.CreatedAt = data.CreatedAt;
        this.CreatedBy = data.CreatedBy;
    }
}