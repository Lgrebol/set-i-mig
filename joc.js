import Baralla from './baralla.js';
import Jugador from './jugador.js';

export default class Joc {
  constructor() {
    this.baralla = new Baralla();
    this.jugadors = [];
    this.tornJugador = 0;
    this.dinersDisponibles = 100;
    this.apostaActual = 0;
    this.jocAcabat = false; // Variable per controlar si el joc ha acabat

    this.apostesRealitzadesEl = document.getElementById('apostes-realitzades');
    this.nouJocBtn = document.getElementById('nouJoc-btn');

    // Afegir event listener al botó de Nou Joc
    this.nouJocBtn.addEventListener('click', () => this.reiniciarPartida());
  }

  afegirJugador(jugador) {
    this.jugadors.push(jugador);
  }

  iniciar() {
    // Restablir el joc
    this.baralla.generarBaralla();
    this.baralla.barrejar();

    document.querySelectorAll('.cartes-revers').forEach(revers => revers.style.display = 'none');

    this.mostrarDinersDisponibles();
    this.mostrarApostaActual();

    this.apostaActual = 0;
    this.apostesRealitzadesEl.innerHTML = '';
    document.getElementById('guanyador').textContent = '';

    // Repartir una carta a cada jugador
    this.jugadors.forEach(jugador => {
      jugador.cartes = []; // Reiniciar les cartes del jugador
      jugador.agafarCarta(this.baralla.repartirCarta());
    });

    this.actualitzarInterfície();

    this.mostrarBotons();

    // Afegir event listener al botó de Nova Carta
    document.getElementById('nou-btn').addEventListener('click', () => {
      // Només cridar novaCarta() si el joc no ha acabat i és el torn del jugador
      if (!this.jocAcabat && this.tornJugador === 0) {
        this.novaCarta();
      }
    });

    document.getElementById('plantar-btn').addEventListener('click', () => this.plantar());
}


  novaCarta() {
    const jugador = this.jugadors[this.tornJugador];
    jugador.agafarCarta(this.baralla.repartirCarta());
    this.actualitzarInterfície();

    // Si el jugador actual supera 7.5, el joc finalitza
    const puntuacio = this.calcularPuntuacio(jugador);
    if (puntuacio > 7.5) {
      this.finalitzarJoc();
    } else if (this.tornJugador === 1) {
      // Torn de la banca
      const puntuacioBanca = this.calcularPuntuacio(this.jugadors[1]);
      if (puntuacioBanca < puntuacio || puntuacioBanca < 5) {
        // Si la puntuació de la banca és inferior a la del jugador o inferior a 5, la banca demana una altra carta automàticament
        jugador.agafarCarta(this.baralla.repartirCarta()); // Afegeix una nova carta per a la banca
        this.actualitzarInterfície();
        this.novaCarta(); // Llavors crida de nou novaCarta() per al jugador actual
      } else {
        // Si la puntuació de la banca és igual o superior a la del jugador i no és inferior a 5, la banca s'atura
        this.finalitzarJoc();
      }
    }
  }

  plantar() {
    const jugador = this.jugadors[this.tornJugador];
    this.tornJugador = 1; // Canviar al torn de la banca
    this.actualitzarInterfície();

    // Torn de la banca
    const puntuacioBanca = this.calcularPuntuacio(this.jugadors[1]);
    const puntuacioJugador = this.calcularPuntuacio(this.jugadors[0]);

    if (puntuacioBanca < puntuacioJugador || puntuacioBanca < 5) {
      // Si la puntuació de la banca és inferior a la del jugador o inferior a 5, la banca demana una altra carta automàticament
      this.novaCarta();
    } else {
      // Si la puntuació de la banca és igual o superior a la del jugador i no és inferior a 5, la banca s'atura
      this.finalitzarJoc();
    }
  }

  calcularPuntuacio(jugador) {
    // Calcular la suma dels valors de les cartes
    return jugador.cartes.reduce((total, carta) => total + jugador.valorCarta(carta), 0);
  }

  finalitzarJoc() {
    const guanyador = this.determinarGuanyador();
    if (guanyador) {
      document.getElementById('guanyador').textContent = `El guanyador és ${guanyador.nom}`;
      // Actualitzar els diners disponibles si hi ha un guanyador
      this.dinersDisponibles += this.apostaActual; // Duplicar l'aposta guanyada
      this.mostrarDinersDisponibles();
    } else {
      document.getElementById('guanyador').textContent = 'No hi ha guanyador.';
    }
    // Ocultar els botons en finalitzar el joc
    document.getElementById('nou-btn').style.display = 'none';
    document.getElementById('plantar-btn').style.display = 'none';
    // Mostrar el botó "Nou Joc"
    this.nouJocBtn.style.display = 'inline-block';
    // Indicar que el joc ha acabat
    this.jocAcabat = true;
  }

  determinarGuanyador() {
    let guanyador = null;
    let puntuacioMaxima = -1;

    for (let jugador of this.jugadors) {
      const puntuacio = this.calcularPuntuacio(jugador);
      // Si el jugador no supera 7.5 i té més puntuació que la màxima fins ara, es converteix en el nou guanyador
      if (puntuacio <= 7.5 && puntuacio > puntuacioMaxima) {
        puntuacioMaxima = puntuacio;
        guanyador = jugador;
      }
    }

    if (guanyador) {
      // Restar l'aposta a les monedes disponibles si hi ha un guanyador
      this.dinersDisponibles -= this.apostaActual;
      this.mostrarDinersDisponibles();
    }

    return guanyador;
  }

  actualitzarInterfície() {
    this.jugadors.forEach((jugador, index) => {
      const cartesEl = document.getElementById(`jugador${index + 1}-cartes`);
      const puntsEl = document.getElementById(`jugador${index + 1}-punts`);

      cartesEl.innerHTML = '';
      jugador.cartes.forEach(carta => {
        const cartaEl = document.createElement('img');
        cartaEl.src = carta.imatge; // Establim la font de la imatge com la URL de la imatge de la carta
        cartaEl.alt = `${carta.valor} de ${carta.palo}`; // Utilitzem el valor i el pal de la carta com a text alternatiu
        cartesEl.appendChild(cartaEl);
      });

      puntsEl.textContent = `Punts: ${this.calcularPuntuacio(jugador)}`;
    });
  }

  mostrarBotons() {
    document.getElementById('iniciar-btn').style.display = 'none';
    document.getElementById('nou-btn').style.display = 'inline-block';
    document.getElementById('plantar-btn').style.display = 'inline-block';
  }

  // Mostra els diners disponibles
  mostrarDinersDisponibles() {
    document.getElementById('diners-restants').textContent = this.dinersDisponibles;
  }

  // Mostra l'aposta actual
  mostrarApostaActual() {
    document.getElementById('aposta-actual').textContent = this.apostaActual;
  }

  // Mètode per realitzar una aposta
  ferAposta(cantidad) {
    // Comprovar si l'usuari té prou diners per apostar
    if (cantidad <= this.dinersDisponibles) {
      // Restar l'aposta de les monedes disponibles
      this.dinersDisponibles -= cantidad;
      // Sumar l'aposta a l'aposta actual
      this.apostaActual += cantidad;
      // Mostrar les actualitzacions a la interfície
      this.mostrarDinersDisponibles();
      this.mostrarApostaActual();
      // Registrar l'aposta realitzada al panell d'apostes
      this.registrarAposta(cantidad);
    } else {
      // Si l'usuari no té prou diners, mostrar un missatge d'error
      alert('No tens suficients diners per realitzar aquesta aposta.');
    }
  }

  // Mètode per registrar una aposta al panell d'apostes realitzades
  registrarAposta(cantidad) {
    const apostesEl = document.getElementById('apostes-realitzades');
    const novaAposta = document.createElement('li');
    novaAposta.textContent = `Aposta: ${cantidad}`;
    apostesEl.appendChild(novaAposta);
  }

  reiniciarPartida() {
    // Reinicia les cartes, els jugadors i la baralla
    this.baralla.generarBaralla();
    this.baralla.barrejar();
    this.jugadors.forEach(jugador => {
      jugador.cartes = []; // Elimina les cartes del jugador
      jugador.agafarCarta(this.baralla.repartirCarta()); // Rep una nova carta per a cada jugador
    });
    // Reinicia el torn del jugador
    this.tornJugador = 0;
    // Amaga el botó "Nou Joc"
    this.nouJocBtn.style.display = 'none';
    // Demana a l'usuari que faci una nova aposta
    const cantidad = parseInt(prompt('Quina quantitat vols apostar?'));
    if (!isNaN(cantidad) && cantidad > 0) {
      this.ferAposta(cantidad);
      this.iniciar();
    } else {
      alert('Si us plau, introdueix una quantitat vàlida per apostar.');
    }
    // Indicar que el joc ha començat
    this.jocAcabat = false;
}
}

const joc = new Joc();
const jugador1 = new Jugador('Jugador');
const jugador2 = new Jugador('Banca');

joc.afegirJugador(jugador1);
joc.afegirJugador(jugador2);

document.getElementById('iniciar-btn').addEventListener('click', () => {
  const cantidad = parseInt(prompt('Quina quantitat vols apostar?'));
  if (!isNaN(cantidad) && cantidad > 0) {
    joc.ferAposta(cantidad);
    joc.iniciar();
  } else {
    alert('Si us plau, introdueix una quantitat vàlida per apostar.');
  }
});
