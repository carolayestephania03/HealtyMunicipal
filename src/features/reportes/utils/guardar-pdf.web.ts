// Descarga usando el navegador sin exponer el JWT en la URL ni usar rutas públicas.
export async function guardarPdf(nombre: string, base64: string): Promise<void> {
  const binario = atob(base64);
  const partes: Uint8Array[] = [];
  for (let p = 0; p < binario.length; p += 32768) {
    const segmento = binario.slice(p, p + 32768);
    const bytes = new Uint8Array(segmento.length);
    for (let j = 0; j < segmento.length; j++) bytes[j] = segmento.charCodeAt(j);
    partes.push(bytes);
  }
  const archivo = new Blob(partes, { type: 'application/pdf' });
  const url = URL.createObjectURL(archivo);
  try {
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
  } finally {
    // Liberación diferida: el navegador debe alcanzar a iniciar la descarga.
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}
