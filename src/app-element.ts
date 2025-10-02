import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import Item_Element from "./item/item-element";
import schedule from "./modules/schedule";
import stylesModule from './app.css?inline'
@customElement('app-element')
export class appElement extends LitElement {
  static styles = css`${unsafeCSS(stylesModule)}`;

  @state()
  items = [];

  @query('#fileInput')
  private fileInput!: HTMLInputElement;

  @query('#panelLoading')
  private panelLoading!: HTMLDivElement

  @query('#panelLoaded')
  private panelLoaded!: HTMLDivElement

  onChangeInput(){
    this.panelLoading.setAttribute('open', '');
    this.panelLoaded.removeAttribute('open');
    const files = this.fileInput.files;
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload =(e)=> eventReaderFile(e, this);
    reader.readAsArrayBuffer(file);
    async function eventReaderFile(e, This) {
      const typedarray = new Uint8Array(e.target.result);
      const horarioEstudiante = await schedule(typedarray, true);
      localStorage.setItem("horarioEstudiante", JSON.stringify(horarioEstudiante));
      await new Promise(e=>setInterval(e, 500))
      This.panelLoading.removeAttribute('open');
      This.panelLoaded.setAttribute('open', '');
      await new Promise(e=>setInterval(e, 500))
      This.panelLoaded.removeAttribute('open');
      This.items = getNowH();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.items = getNowH() 
  }

  updateCalendar(){this.fileInput.click();}

  render() {
    return html`
     <div class="app">
      <div class="content">
        <div class="header">
          <img width='50px' src="/public/iconUTS.jpg" alt="">
          <span>:Boock</span>
        </div>
        <div class="listaMaterias">
          ${this.items.map((item) => Item_Element(
            item.materia,
            item.grupo,
            item.salon,
            item.inicio,
            item.fin
          ))}
        </div>
      </div>
      <div class="downBar">
        <div class="intoBar">
            <div @click=${this.updateCalendar} class='icon'>
              <img src="/public/calendario-mensual (1).png" alt="">
              <input 
                type="file" 
                id="fileInput" 
                accept="application/pdf" 
                @change=${this.onChangeInput}
              />
            </div>
        </div>
      </div>
    </div>

    <div id='panelLoading' class='loading'>
      <div class='panel'>
        <img src="/public/search.gif" alt="">
        <span>Analizando Archivo...</span>
      </div>
    </div>

    <div id='panelLoaded' class='loaded'>
      <div class='panel'>
        <img src="/public/check.gif" alt="">
        <br>
        <br>
        <span>Calendario Analizado!!</span>
      </div>
    </div>
    
    `
  }
}

// function test_Materia(horaInicio) {
//   const inicio = new Date()
//   inicio.setHours(horaInicio, 30, 0)
//   const fin = new Date()
//   fin.setHours(inicio.getHours() + 3, 30, 0)
//   return {
//     materia: 'Materia test',
//     grupo: 'X123',
//     salon: '123 A',
//     inicio: inicio,
//     fin: fin
//   }
// }

function getNowH(){
  let horarioEstudiante = JSON.parse(localStorage.getItem("horarioEstudiante"));
  const hoy = new Date();
  const nombreDia = hoy.toLocaleDateString("es-ES", { weekday: "long" });
  const filterNow = [];
  for (const element of horarioEstudiante) {
    const horarioHoy = element.horario[nombreDia]
    if (!horarioHoy) continue;
    filterNow.push({
      materia: element.materia,
      grupo: element.Grupo,
      salon: horarioHoy.Salon,
      inicio: horarioHoy.Rango.hourStart,
      fin: horarioHoy.Rango.hourEnd
    })
  }
  return filterNow
}