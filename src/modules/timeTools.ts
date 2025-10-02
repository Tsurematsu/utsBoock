export default new class timeTools {
    diferenciaHoras(fechaEvento, fechaActual) {
        const msEvento =
            fechaEvento.getHours() * 3600000 +
            fechaEvento.getMinutes() * 60000 +
            fechaEvento.getSeconds() * 1000;
        const msActual =
            fechaActual.getHours() * 3600000 +
            fechaActual.getMinutes() * 60000 +
            fechaActual.getSeconds() * 1000;
        let diff = msEvento - msActual;
        const sign = diff >= 0 ? 1 : -1;
        diff = Math.abs(diff);
        const hours = Math.floor(diff / 3600000);
        diff %= 3600000;
        const minutes = Math.floor(diff / 60000);
        diff %= 60000;
        const seconds = Math.floor(diff / 1000);
        return { hours, minutes, seconds, signo: sign };
    }
    to12(dateString) {
        return (new Date(dateString)).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        })
    }
}