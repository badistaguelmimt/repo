export class Produit {
    constructor(data){
        this.Id = data.Id;
        this.IdRefuge = data.IdRefuge;
        this.Nom = data.Nom;
        this.Prix = data.Prix;
        this.Stock = data.Stock;
        this.Categorie = data.Categorie;
        this.Reduction = data.Reduction;
        this.Disponibilite = data.Disponibilite;
    }
}