import React from 'react';
import { ConsultaCarnetScreen } from '../features/carnet-publico/components/consulta-carnet-screen';

// Ruta pública: fuera de (staff) y de cualquier layout protegido por JWT.
export default function ConsultaCarnetPage() {
  return <ConsultaCarnetScreen />;
}
  