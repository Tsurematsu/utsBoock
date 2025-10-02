import { css, html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import stylesModule from "./item.css?inline"
import timeTools from '../modules/timeTools';
@customElement('item-element')
export class ItemElement extends LitElement {
    static styles = css`${unsafeCSS(stylesModule)}`;
    @property() materia = '';
    @property() grupo = '';
    @property() salon = '';
    @property() inicio = '';
    @property() fin = '';

    @state()
    time = { hours: 0, minutes: 0, seconds: 0, signo: 0 };

    #intervalId; // almacenamos el id del interval privado

    connectedCallback() {
        super.connectedCallback();
        this.startInterval();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.clearInterval();
    }

    updated(changedProps) {
        if (changedProps.has('inicio')) {
            // si cambió la hora de inicio, reiniciamos el intervalo
            this.clearInterval();
            this.startInterval();
        }
    }

    startInterval() {
        const inicioD = new Date(this.inicio)
        this.time = timeTools.diferenciaHoras(inicioD, new Date());
        this.#intervalId = setInterval(() => {
            this.time = timeTools.diferenciaHoras(inicioD, new Date());
        }, 1000);
    }

    clearInterval() {
        if (this.#intervalId) {
            clearInterval(this.#intervalId);
            this.#intervalId = null;
        }
    }

    getCleanSalon(item:String){
        const partes = item.split(" ");
        if (isNaN(Number(partes[0])) ) partes.shift();
        return partes.join(' ');
    }

    render() {
        return html`
      <!-- <div class='item ${this.time.signo > 0 ? '' : 'hidden'}'> -->
      <div class='item'>
        <div class='head'>
          <span class='materia'>${this.materia}</span>
          <span class='leftInfo'>${this.grupo}</span>
        </div>
        <div class='item1'>
          <div class='left'>
            <div class='rango'>
              <span class='init'>${timeTools.to12(this.inicio).toUpperCase()}</span>
              <span class='end'>${timeTools.to12(this.fin).toUpperCase()}</span>
            </div>
            <div class='time' style='background-color:${this.time.signo > 0? "#e3f7c0":"#f7c0c0"}'>
              <span>${String(this.time.hours).padStart(2, '0')} H</span>
              <span>${String(this.time.minutes).padStart(2, '0')} M</span>
              <span>${String(this.time.seconds).padStart(2, '0')} S</span>
            </div>
          </div>
          <div class='right'>
            <span>${this.getCleanSalon(this.salon)}</span>
          </div>
        </div>
      </div>
    `;
    }
}

export default function Item_Element(materia, grupo, salon = '', inicio = '', fin = '') {
    return html`
    <item-element
      materia=${materia}
      grupo=${grupo}
      salon=${salon}
      inicio=${inicio}
      fin=${fin}
    ></item-element>
  `;
}