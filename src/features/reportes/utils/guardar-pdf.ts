// Fallback para plataformas distintas de web/Android/iOS.
export async function guardarPdf(_nombre: string, _base64: string): Promise<void> {
  throw new Error('La descarga PDF no está soportada en esta plataforma.');
}
