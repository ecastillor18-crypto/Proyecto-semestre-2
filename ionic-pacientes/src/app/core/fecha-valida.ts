// Validación del calendario sin alterar las fechas ISO enviadas a Spring.
export function fechaISOValida(fecha: string): boolean {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  if (!partes) return false;
  const anio = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  const fechaUTC = new Date(Date.UTC(anio, mes - 1, dia));
  return fechaUTC.getUTCFullYear() === anio &&
    fechaUTC.getUTCMonth() + 1 === mes &&
    fechaUTC.getUTCDate() === dia;
}
