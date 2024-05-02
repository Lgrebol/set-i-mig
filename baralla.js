  import Carta from './carta.js';

  export default class Baralla {
    constructor() {
      this.cartes = [];
      this.palos = ['bastos', 'oros', 'espadas', 'copas'];
      this.valors = ['01', '02', '03', '04', '05', '06', '07', '10', '11', '12'];
    }
  
    generarBaralla() {
      for (let palo of this.palos) {
        for (let valor of this.valors) {
          const imatge = `img/${valor}-${palo}.png`;
          this.cartes.push(new Carta(valor, palo, imatge));
        }
      }
    }
  
    barrejar() {
      for (let i = this.cartes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.cartes[i], this.cartes[j]] = [this.cartes[j], this.cartes[i]];
      }
    }
  
    repartirCarta() {
      return this.cartes.pop();
    }
  }
  