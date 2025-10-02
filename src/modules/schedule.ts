import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';
GlobalWorkerOptions.workerSrc = '/public/pdfjs-dist/pdf.worker.min.mjs'
export default async function schedule(file, ifBuffet = false) {
  const loadingTask = ifBuffet ? getDocument({ data: file }) : getDocument(file);
  const pdf: PDFDocumentProxy = await loadingTask.promise;
  const pagePdf = await pdf.getPage(1);
  const textContent = await pagePdf.getTextContent();
  // ----------------------------------------------------
  const Days = [];
  const Materias = {};
  let Materia = null;
  let Grupo = null;
  const getObj = (it) => ({
    text: it.str,
    x: it.transform[4],
    y: it.transform[5],
    width: it.width,
    height: it.height
  })
  function validarFormato(cadena) {
    const regex = /^\d{2}:\d{2}-\d{2}:\d{2}$/;
    return regex.test(cadena);
  }
  function ifNum(str) {
    return !isNaN(Number(str));
  }
  const actionDay = (item) => Days.push(item)
  const DayKey = {
    Lunes: actionDay,
    Martes: actionDay,
    Miércoles: actionDay,
    Jueves: actionDay,
    Viernes: actionDay,
    Sábado: actionDay,
    Domingo: actionDay
  }
  textContent.items.forEach((item, index) => {
    const dataText = getObj(item);
    DayKey[dataText.text]?.(dataText);
    words(dataText, index)
  })
  function words(item, index) {
    if (item.text.includes('Grupo')) getMaterias(item, index);
    if (validarFormato(item.text)) getCalendar(item, index)
  }
  function getMaterias(item, index){
    let MateriaResultName = [];
    Grupo = item.text.split(":")[1];
    const backWordMateria = item.text.split("Grupo")[0]
    if (backWordMateria !='' ) MateriaResultName.push(backWordMateria)
    for (let i = index - 1; i > 0; i--) {
        const MaretiaName = getObj(textContent.items[i]).text
        const itemEndChar = MaretiaName[MaretiaName.length - 1];
        if (MaretiaName.length == 6 && ifNum(itemEndChar)) break
        MateriaResultName.push(MaretiaName.trim())
    }
    MateriaResultName.reverse(); 
    Materia = MateriaResultName.join(' ').replaceAll("  ", " ");
    Materias[Materia] = {Grupo}
  }
  function getCalendar(item, index){
    if (!Materias[Materia].horario) Materias[Materia].horario = {}
    let selectDay = null
    for (let i = 0; i < Days.length; i++) {
        const day = Days[i];
        if(item.x < day.x) {selectDay = day.text; break}
    }
    const plainRange = item.text.replace("-", ":");
    const fulldata = plainRange.split(":");
    const [h1, m1, h2, m2] = fulldata.map(Number);
    const hourStart = new Date()
    const hourEnd = new Date()
    hourStart.setHours(h1);
    hourStart.setMinutes(m1);
    hourStart.setSeconds(0);
    hourEnd.setHours(h2);
    hourEnd.setMinutes(m2);
    hourEnd.setSeconds(0)
    Materias[Materia].horario[selectDay.toLocaleLowerCase()] = {
      Rango:{hourStart, hourEnd},
      Salon: getObj(textContent.items[index + 2]).text
    }
  }
  const retorno = []
  for (const [key, value] of Object.entries(Materias)) {
    value['materia'] = key
    retorno.push(value)
  }
  return retorno
}
