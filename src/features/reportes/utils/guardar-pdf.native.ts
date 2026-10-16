import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

// Compatible con Android/iOS; requiere expo-file-system y expo-sharing.
export async function guardarPdf(nombre: string, base64: string): Promise<void> {
  const directorio = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!directorio) throw new Error('No se encontró un directorio para guardar el PDF.');
  const seguro = nombre.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const ruta = `${directorio}${seguro}`;
  await FileSystem.writeAsStringAsync(ruta, base64, { encoding: FileSystem.EncodingType.Base64 });
  if (!await Sharing.isAvailableAsync()) {
    throw new Error('El PDF se generó, pero este dispositivo no permite compartirlo.');
  }
  await Sharing.shareAsync(ruta, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Guardar o compartir reporte SCCVI' });
}
