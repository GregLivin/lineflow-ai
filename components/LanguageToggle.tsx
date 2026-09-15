'use client';

import { useEffect, useState } from 'react';

export type LineFlowLanguage = 'en' | 'es';

export const translations = {
  en: {
    productionSystem: 'Production Operations System', signIn: 'Sign In', signOut: 'Sign Out', backHome: 'Back to Home',
    username: 'Username', password: 'Password', enterUsername: 'Enter role username', invalidLogin: 'Invalid demo username or password.', wrongRole: 'This account does not have access to the selected role.',
    welcome: 'Welcome', dashboard: 'LineFlow AI Dashboard', yourAccess: 'Your Access', open: 'Open', close: 'Close',
    materialRequests: 'Material Requests', inventory: 'Inventory', yard: 'Yard & Reconditioning', productionGoals: 'Production Goals', productionPlan: 'Production Plan',
    requestMaterial: 'Request Material', trackRequests: 'Track Requests', assignedRequests: 'Assigned Requests', partChecklist: 'Part Checklist', liveInventory: 'Live Inventory',
    incomingModels: 'Incoming Models', completedModels: 'Completed Models', productionSchedule: 'Production Schedule', liveStatus: 'Live Status', readOnly: 'Read Only',
    partsStock: 'Parts & Stock', liveProgress: 'Live Progress', boomLifts: 'Boom Lifts', createRequest: 'Create Request', pickDeliver: 'Pick & Deliver',
    loading: 'Loading LineFlow AI...', demoUsernames: 'Demo usernames:', demoPassword: 'Demo password for all accounts:',
    homeMeta: 'Production Visibility · Material Flow · Inventory · Delivery',
    loginCopy: 'Enter a role-based demo username and the shared password to continue.',
  },
  es: {
    productionSystem: 'Sistema de Operaciones de Producción', signIn: 'Iniciar Sesión', signOut: 'Cerrar Sesión', backHome: 'Volver al Inicio',
    username: 'Usuario', password: 'Contraseña', enterUsername: 'Ingrese el usuario del rol', invalidLogin: 'Usuario o contraseña de demostración no válidos.', wrongRole: 'Esta cuenta no tiene acceso al rol seleccionado.',
    welcome: 'Bienvenido', dashboard: 'Panel de LineFlow AI', yourAccess: 'Tu Acceso', open: 'Abrir', close: 'Cerrar',
    materialRequests: 'Solicitudes de Material', inventory: 'Inventario', yard: 'Patio y Reacondicionamiento', productionGoals: 'Metas de Producción', productionPlan: 'Plan de Producción',
    requestMaterial: 'Solicitar Material', trackRequests: 'Rastrear Solicitudes', assignedRequests: 'Solicitudes Asignadas', partChecklist: 'Lista de Piezas', liveInventory: 'Inventario en Vivo',
    incomingModels: 'Modelos Entrantes', completedModels: 'Modelos Completados', productionSchedule: 'Programa de Producción', liveStatus: 'Estado en Vivo', readOnly: 'Solo Lectura',
    partsStock: 'Piezas e Inventario', liveProgress: 'Progreso en Vivo', boomLifts: 'Plataformas de Brazo', createRequest: 'Crear Solicitud', pickDeliver: 'Recoger y Entregar',
    loading: 'Cargando LineFlow AI...', demoUsernames: 'Usuarios de demostración:', demoPassword: 'Contraseña de demostración para todas las cuentas:',
    homeMeta: 'Visibilidad de Producción · Flujo de Material · Inventario · Entrega',
    loginCopy: 'Ingrese un usuario de demostración basado en su rol y la contraseña compartida para continuar.',
  },
} as const;

export function getLanguage(): LineFlowLanguage {
  if (typeof window === 'undefined') return 'en';
  return localStorage.getItem('lineflowLanguage') === 'es' ? 'es' : 'en';
}

export default function LanguageToggle({ onChange }: { onChange?: (language: LineFlowLanguage) => void }) {
  const [language, setLanguage] = useState<LineFlowLanguage>('en');
  useEffect(() => setLanguage(getLanguage()), []);
  function choose(next: LineFlowLanguage) {
    setLanguage(next); localStorage.setItem('lineflowLanguage', next); document.documentElement.lang = next; onChange?.(next);
    window.dispatchEvent(new CustomEvent('lineflow-language-change', { detail: next }));
  }
  return <div className="languageToggle" role="group" aria-label="Language / Idioma"><span aria-hidden="true">🌐</span><button type="button" className={language==='en'?'languageChoice activeLanguage':''} onClick={()=>choose('en')}>English</button><span className="languageDivider">|</span><button type="button" className={language==='es'?'languageChoice activeLanguage':''} onClick={()=>choose('es')}>Español</button></div>;
}
