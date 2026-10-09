import React from 'react';
import { Redirect } from 'expo-router';

// Acceso temporal al área de personal durante el armado de la interfaz.
// Cuando se conecte auth, reemplazar por una redirección según sesión/rol.
export default function Index() { return <Redirect href="/inicio" />; }
