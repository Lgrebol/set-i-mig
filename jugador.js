export default class Jugador {
  constructor(nom) {
    this.nom = nom;
    this.cartes = [];
    this.punts = 0;
  }

  agafarCarta(carta) {
    this.cartes.push(carta);
    this.actualitzarPunts();
  }

  actualitzarPunts() {
    this.punts = this.cartes.reduce((total, carta) => total + this.valorCarta(carta), 0);
  }

  valorCarta(carta) {
    switch (carta.valor) {
      case '10':
      case '11':
      case '12':
        return 0.5;
      default:
        return parseFloat(carta.valor.replace(',', '.'));
    }
  }
  
}
