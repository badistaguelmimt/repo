export class Race {
    constructor(data){
        this.Id = data.Id;
        this.Nom = data.Nom;
        this.Description = data.Description;
        this.Origine = data.Origine;
        this.EsperanceVie = data.EsperanceVie;
        this.Maintenance = data.Maintenance;
        this.TailleMoyenne = data.TailleMoyenne;
        this.PoidsMoyen = data.PoidsMoyen;
        this.Couleurs = data.Couleurs;
        this.Classification = data.Classification;
        this.Pelage = data.Pelage;
        this.TaillePelageMoyen = data.TaillePelageMoyen;
        this.Habitat = data.Habitat;
        this.Inteligence = data.Inteligence;
        this.Imunite = data.Imunite;
        this.Alergies = data.Alergies;
        this.Espece = data.Espece;
    }
}