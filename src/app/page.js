"use client";
import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════
   DATOS SIMULADOS
   ═══════════════════════════════════════════════ */

const DEBTORS = [
  {
    id: 1,
    razonSocial: "INVERSIONES Y PROCESOS MITAPADE SAC",
    ruc: "20613271379",
    segmento: "Empresa",
    condicion: "Activo",
    situacion: "Activo",
    estado: "ACTIVO",
    contactos: ["908863068", "905454381", "933996723"],
    direcciones: [
      { nombre: "PLAZA REPÚBLICA", dir: "Plaza de la República N° 1480", distrito: "Lima" },
      { nombre: "PROCERES", dir: "Av. Próceres de la Independencia, Mz P Lt 12, Las Flores de Lima", distrito: "San Juan de Lurigancho" },
      { nombre: "SAN JUAN", dir: "Av. San Juan 098, San Juan de Miraflores", distrito: "San Juan de Miraflores" },
    ],
    deudaTotal: 14092.84,
    deudaVencida: 14092.84,
    diasMora: 15,
    totalGestiones: 23,
    deudaAsignada: 14092.84,
    pagos: 0.00,
    requisitos: 0.00,
    documentos: [
      { recibo: "9903-24197616", emision: "21/05/2025", vencimiento: "15/06/2026", deudaAsignada: 14092.84, pagos: 0.00, saldo: 14092.84 },
    ],
    gestiones: [
      { fecha: "30/05/2026", hora: "18:15", gestor: "Juan Pérez", resultado: "No contesta", observacion: "Se llamó al contacto principal, no contesta.", canal: "Teléfono" },
      { fecha: "25/05/2026", hora: "14:48", gestor: "Ana Torres", resultado: "Promesa de pago", observacion: "Cliente indica que pagará antes del vencimiento.", canal: "WhatsApp" },
      { fecha: "20/05/2026", hora: "11:26", gestor: "Luis Gómez", resultado: "No contesta", observacion: "Se envió recordatorio de deuda por email.", canal: "Email" },
    ],
  },
  {
    id: 2,
    razonSocial: "COMERCIAL ANDINA DEL SUR EIRL",
    ruc: "20487563921",
    segmento: "Empresa",
    condicion: "Activo",
    situacion: "Activo",
    estado: "ACTIVO",
    contactos: ["956741238", "914523687"],
    direcciones: [
      { nombre: "PRINCIPAL", dir: "Jr. Cusco 456, Cercado de Lima", distrito: "Lima" },
    ],
    deudaTotal: 8450.50,
    deudaVencida: 5200.00,
    diasMora: 8,
    totalGestiones: 12,
    deudaAsignada: 8450.50,
    pagos: 3250.50,
    requisitos: 0.00,
    documentos: [
      { recibo: "8801-35124789", emision: "10/04/2025", vencimiento: "10/06/2026", deudaAsignada: 8450.50, pagos: 3250.50, saldo: 5200.00 },
    ],
    gestiones: [
      { fecha: "28/05/2026", hora: "09:30", gestor: "Ana Torres", resultado: "Contactado", observacion: "Cliente confirmó pago parcial para esta semana.", canal: "Teléfono" },
    ],
  },
  {
    id: 3,
    razonSocial: "TRANSPORTES GARCÍA HERMANOS SA",
    ruc: "20198745632",
    segmento: "Empresa",
    condicion: "Activo",
    situacion: "Activo",
    estado: "EN MORA",
    contactos: ["987654321", "923456789", "945678123"],
    direcciones: [
      { nombre: "OFICINA CENTRAL", dir: "Av. Argentina 2850, Callao", distrito: "Callao" },
    ],
    deudaTotal: 32500.00,
    deudaVencida: 32500.00,
    diasMora: 45,
    totalGestiones: 38,
    deudaAsignada: 32500.00,
    pagos: 0.00,
    requisitos: 0.00,
    documentos: [
      { recibo: "7702-19283746", emision: "01/02/2025", vencimiento: "01/05/2026", deudaAsignada: 22000.00, pagos: 0.00, saldo: 22000.00 },
      { recibo: "7702-19283747", emision: "15/03/2025", vencimiento: "15/05/2026", deudaAsignada: 10500.00, pagos: 0.00, saldo: 10500.00 },
    ],
    gestiones: [
      { fecha: "29/05/2026", hora: "16:00", gestor: "Juan Pérez", resultado: "Buzón", observacion: "Buzón de voz, se dejó mensaje.", canal: "Teléfono" },
      { fecha: "22/05/2026", hora: "10:15", gestor: "Luis Gómez", resultado: "No existe", observacion: "Número no existe, actualizar datos.", canal: "Teléfono" },
    ],
  },
];

const RESULT_OPTIONS = [
  "Seleccione un resultado",
  "Contactado",
  "No contesta",
  "No existe",
  "Buzón",
  "Promesa de pago",
  "Compromiso de pago",
  "Negociación",
  "Rechazo de pago",
  "Número equivocado",
];

const CHANNEL_OPTIONS = [
  "Seleccione un canal",
  "Teléfono",
  "WhatsApp",
  "Email",
  "SMS",
  "Visita presencial",
  "Carta notarial",
];

const OPERATION_TYPES = [
  "1. Operación",
  "2. Seguimiento",
  "3. Compromiso",
  "4. Reclamo",
];

/* ═══════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════ */

export default function CobranzasPage() {
  // State
  const [currentDebtorIndex, setCurrentDebtorIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("resumen");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Form state — Gestión de Cobranza (Técnica: Defaults pre-seleccionados)
  const [tipoOperacion, setTipoOperacion] = useState("1. Operación");
  const [contactoSeleccionado, setContactoSeleccionado] = useState("");
  const [resultado, setResultado] = useState("Seleccione un resultado");
  const [canal, setCanal] = useState("Seleccione un canal");
  const [observacion, setObservacion] = useState("");
  const [gestiones, setGestiones] = useState({});

  // Refs
  const obsRef = useRef(null);

  const debtor = DEBTORS[currentDebtorIndex];
  const allGestiones = gestiones[debtor.id] ? [...debtor.gestiones, ...gestiones[debtor.id]] : debtor.gestiones;
  const totalGestiones = debtor.totalGestiones + (gestiones[debtor.id]?.length || 0);
  const saldoActual = debtor.deudaAsignada - debtor.pagos - debtor.requisitos;

  // ── Técnica: Defaults — Pre-seleccionar primer contacto al cambiar deudor ──
  useEffect(() => {
    if (debtor.contactos.length > 0) {
      setContactoSeleccionado(debtor.contactos[0]);
    }
    setResultado("Seleccione un resultado");
    setCanal("Seleccione un canal");
    setObservacion("");
  }, [currentDebtorIndex, debtor.contactos]);

  // ── Toast notification ──
  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Atajos de teclado (Técnica: Atajos Estratégicos + Enter para grabar) ──
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Enter" && e.target.tagName === "TEXTAREA") {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          grabarGestion();
        }
      }
      // Ctrl+→ siguiente deudor, Ctrl+← anterior
      if (e.ctrlKey && e.key === "ArrowRight") {
        e.preventDefault();
        navegarSiguiente();
      }
      if (e.ctrlKey && e.key === "ArrowLeft") {
        e.preventDefault();
        navegarAnterior();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  // ── Navegación entre deudores ──
  const navegarSiguiente = () => {
    if (currentDebtorIndex < DEBTORS.length - 1) {
      setCurrentDebtorIndex(prev => prev + 1);
    }
  };
  const navegarAnterior = () => {
    if (currentDebtorIndex > 0) {
      setCurrentDebtorIndex(prev => prev - 1);
    }
  };

  // ── Grabar gestión (Técnica: Retroalimentación directa) ──
  const grabarGestion = () => {
    if (resultado === "Seleccione un resultado") {
      showToast("Selecciona un resultado antes de grabar", "error");
      return;
    }
    if (canal === "Seleccione un canal") {
      showToast("Selecciona un canal de contacto", "error");
      return;
    }

    const nuevaGestion = {
      fecha: new Date().toLocaleDateString("es-PE"),
      hora: new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
      gestor: "Juan Pérez",
      resultado: resultado,
      observacion: observacion || "Sin observaciones",
      canal: canal,
    };

    setGestiones(prev => ({
      ...prev,
      [debtor.id]: [...(prev[debtor.id] || []), nuevaGestion],
    }));

    // Reset form (Técnica: Automatización — limpiar para próxima gestión)
    setResultado("Seleccione un resultado");
    setObservacion("");
    showToast("✓ Gestión grabada exitosamente");
  };

  // ── Resultado rápido (Técnica: Eliminar fricción — 1 clic) ──
  const resultadoRapido = (res, canalDefault) => {
    setResultado(res);
    if (canalDefault) setCanal(canalDefault);
    // Auto-focus en observación
    setTimeout(() => obsRef.current?.focus(), 100);
  };

  // ── Búsqueda (Técnica: Automatización — filtro inteligente) ──
  const searchResults = searchQuery.length > 1
    ? DEBTORS.filter(d =>
        d.razonSocial.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.ruc.includes(searchQuery)
      )
    : [];

  // ── Formato moneda ──
  const fmt = (n) => `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // ── Color de resultado ──
  const resultColor = (res) => {
    if (res === "Contactado" || res === "Compromiso de pago") return "text-green-600 bg-green-50";
    if (res === "Promesa de pago") return "text-blue-600 bg-blue-50";
    if (res === "No contesta" || res === "Buzón") return "text-orange-600 bg-orange-50";
    if (res === "No existe" || res === "Número equivocado") return "text-red-600 bg-red-50";
    return "text-gray-600 bg-gray-50";
  };

  const canalIcon = (c) => {
    if (c === "Teléfono") return "📞";
    if (c === "WhatsApp") return "💬";
    if (c === "Email") return "📧";
    if (c === "SMS") return "📱";
    if (c === "Visita presencial") return "🏢";
    return "📄";
  };

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */

  return (
    <div className="flex h-screen overflow-hidden bg-[#f1f5f9]">

      {/* ═══ SIDEBAR ═══ */}
      <aside className={`${sidebarCollapsed ? "w-16" : "w-[68px]"} bg-[#1a2332] flex flex-col items-center py-4 gap-1 flex-shrink-0 transition-all duration-300`}>
        {/* Logo */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-4 cursor-pointer shadow-lg shadow-blue-500/20">
          <span className="text-white font-bold text-lg">$</span>
        </div>

        {/* Nav items */}
        {[
          { icon: "🏠", label: "Inicio", active: true },
          { icon: "👥", label: "Deudores" },
          { icon: "📋", label: "Gestiones" },
          { icon: "💰", label: "Pagos" },
          { icon: "📊", label: "Reportes" },
          { icon: "📅", label: "Calendario" },
          { icon: "⚙️", label: "Config" },
        ].map((item, i) => (
          <button
            key={i}
            title={item.label}
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-all duration-200
              ${item.active
                ? "bg-blue-600 shadow-lg shadow-blue-600/30"
                : "hover:bg-white/10 opacity-60 hover:opacity-100"
              }`}
          >
            {item.icon}
          </button>
        ))}

        <div className="flex-1" />

        {/* Bottom nav */}
        <button title="Ayuda" className="w-11 h-11 rounded-xl flex items-center justify-center text-lg hover:bg-white/10 opacity-60 hover:opacity-100 transition-all">
          ❓
        </button>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── TOP BAR ── */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-5 gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </div>
          <h1 className="text-sm font-bold text-gray-800 hidden md:block">Gestión de Cobranzas</h1>

          {/* Search (Técnica: Automatización — búsqueda inteligente) */}
          <div className="relative flex-1 max-w-md ml-4">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-blue-400 focus-within:bg-white transition-all">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                placeholder="Buscar cuenta, documento o habilitado..."
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 w-full border-none outline-none"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              />
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-500 hidden sm:block">Q</kbd>
            </div>
            {/* Search results dropdown (Técnica: Relleno inteligente) */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 z-50 animate-scale-in overflow-hidden">
                {searchResults.map((d, i) => (
                  <button key={d.id} onClick={() => { setCurrentDebtorIndex(DEBTORS.indexOf(d)); setSearchQuery(""); setShowSearchResults(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0">
                    <p className="text-sm font-medium text-gray-800">{d.razonSocial}</p>
                    <p className="text-xs text-gray-500">RUC: {d.ruc} · Deuda: {fmt(d.deudaTotal)}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Notifications (Técnica: Activadores basados en hábitos) */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V5a2 2 0 10-4 0v.3C7.7 6.2 6 8.4 6 11v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="notification-dot" style={{ borderColor: "white" }} />
            </button>
            {/* User */}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold">JP</div>
              <div className="hidden md:block">
                <p className="text-xs font-semibold text-gray-800">Juan Pérez</p>
                <p className="text-[10px] text-gray-500">Cobrador</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── CLIENT HEADER ── */}
        <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-4 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-base font-bold text-gray-900 truncate">{debtor.razonSocial}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${debtor.estado === "ACTIVO" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                ● {debtor.estado}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">RUC: {debtor.ruc} · Segmento: {debtor.segmento}</p>
          </div>

          {/* Navigation (Técnica: Atajos — Ctrl+←/→) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={navegarAnterior} disabled={currentDebtorIndex === 0}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1">
              ← <span className="hidden sm:inline">Anterior</span>
            </button>
            <span className="text-xs text-gray-400 px-1">{currentDebtorIndex + 1}/{DEBTORS.length}</span>
            <button onClick={navegarSiguiente} disabled={currentDebtorIndex === DEBTORS.length - 1}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1">
              <span className="hidden sm:inline">Siguiente</span> →
            </button>
          </div>
        </div>

        {/* ── SUMMARY CARDS (Técnica: Retroalimentación — datos clave visibles) ── */}
        <div className="px-5 py-4 flex-shrink-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "DEUDA TOTAL", value: fmt(debtor.deudaTotal), icon: "💰", color: "text-blue-600", bg: "bg-blue-50", iconBg: "bg-blue-100" },
              { label: "DEUDA VENCIDA", value: fmt(debtor.deudaVencida), icon: "📦", color: "text-red-600", bg: "bg-red-50", iconBg: "bg-red-100" },
              { label: "DÍAS EN MORA", value: `${debtor.diasMora} días`, icon: "📅", color: debtor.diasMora > 30 ? "text-red-600" : debtor.diasMora > 15 ? "text-orange-600" : "text-yellow-600", bg: debtor.diasMora > 30 ? "bg-red-50" : "bg-orange-50", iconBg: debtor.diasMora > 30 ? "bg-red-100" : "bg-orange-100" },
              { label: "TOTAL GESTIONES", value: totalGestiones, icon: "📞", color: "text-green-600", bg: "bg-green-50", iconBg: "bg-green-100" },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center text-lg flex-shrink-0`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">{card.label}</p>
                  <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN 3-COLUMN LAYOUT ── */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-full">

            {/* ══ LEFT COLUMN — Datos del Deudor ══ */}
            <div className="lg:col-span-3 space-y-4">
              {/* Datos del Deudor */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-blue-500 rounded-full" /> Datos del Deudor
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Razón Social</p>
                    <p className="text-xs font-semibold text-gray-800 mt-0.5">{debtor.razonSocial}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">RUC</p>
                      <p className="text-xs font-medium text-gray-700 mt-0.5">{debtor.ruc}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Segmento</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">{debtor.segmento}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Condición</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">{debtor.condicion}</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Situación</p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">{debtor.situacion}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contactos */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-green-500 rounded-full" /> Contactos
                </h3>
                <div className="space-y-2">
                  {debtor.contactos.map((tel, i) => (
                    <div key={i} className="flex items-center gap-2 group">
                      <span className="text-sm">📱</span>
                      <span className="text-xs text-gray-700 font-medium">{tel}</span>
                      <button onClick={() => { setContactoSeleccionado(tel); showToast(`Contacto ${tel} seleccionado`); }}
                        className="ml-auto opacity-0 group-hover:opacity-100 text-[10px] text-blue-600 hover:text-blue-800 transition-all font-medium">
                        Usar
                      </button>
                    </div>
                  ))}
                </div>
                <button className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center gap-1">
                  + Agregar contacto
                </button>
              </div>

              {/* Direcciones */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-orange-500 rounded-full" /> Direcciones
                </h3>
                <div className="space-y-3">
                  {debtor.direcciones.map((dir, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">📍</span>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{dir.nombre}</p>
                        <p className="text-[11px] text-gray-500 leading-relaxed">{dir.dir}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center gap-1">
                  📍 Ver todos en mapa
                </button>
              </div>
            </div>

            {/* ══ CENTER COLUMN — Deuda, Documentos, Gestiones ══ */}
            <div className="lg:col-span-5 space-y-4">
              {/* Tabs (Técnica: Divulgación Progresiva — info organizada por tabs) */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200">
                  {[
                    { id: "resumen", label: "Resumen de Deuda" },
                    { id: "documentos", label: "Documentos" },
                    { id: "pagos", label: "Pagos" },
                    { id: "compromisos", label: "Compromisos" },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 px-3 py-3 text-xs font-medium transition-all relative
                        ${activeTab === tab.id ? "text-blue-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
                      {tab.label}
                      {activeTab === tab.id && (
                        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-5 animate-fade-in" key={activeTab}>
                  {activeTab === "resumen" && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-xs text-gray-600">Deuda Asignada</span>
                        <span className="text-sm font-bold text-gray-800">{fmt(debtor.deudaAsignada)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-xs text-gray-600">Pagos</span>
                        <span className="text-sm font-bold text-green-600">{fmt(debtor.pagos)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-xs text-gray-600">Requisitos</span>
                        <span className="text-sm font-bold text-gray-800">{fmt(debtor.requisitos)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 bg-blue-50 rounded-xl px-3 -mx-1">
                        <span className="text-xs font-bold text-blue-800">SALDO ACTUAL</span>
                        <span className="text-lg font-bold text-blue-700">{fmt(saldoActual)}</span>
                      </div>
                    </div>
                  )}

                  {activeTab === "documentos" && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 text-gray-500 font-medium">Recibo</th>
                            <th className="text-left py-2 text-gray-500 font-medium">Emisión</th>
                            <th className="text-left py-2 text-gray-500 font-medium">Vencimiento</th>
                            <th className="text-right py-2 text-gray-500 font-medium">Deuda</th>
                            <th className="text-right py-2 text-gray-500 font-medium">Pagos</th>
                            <th className="text-right py-2 text-gray-500 font-medium">Saldo</th>
                          </tr>
                        </thead>
                        <tbody className="table-hover">
                          {debtor.documentos.map((doc, i) => (
                            <tr key={i} className="border-b border-gray-50">
                              <td className="py-2.5 text-blue-600 font-medium">{doc.recibo}</td>
                              <td className="py-2.5 text-gray-600">{doc.emision}</td>
                              <td className="py-2.5 text-gray-600">{doc.vencimiento}</td>
                              <td className="py-2.5 text-right text-gray-800 font-medium">{fmt(doc.deudaAsignada)}</td>
                              <td className="py-2.5 text-right text-green-600">{fmt(doc.pagos)}</td>
                              <td className="py-2.5 text-right text-red-600 font-bold">{fmt(doc.saldo)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeTab === "pagos" && (
                    <div className="text-center py-8">
                      <span className="text-3xl mb-2 block">💳</span>
                      <p className="text-sm text-gray-500">No hay pagos registrados para esta cuenta</p>
                      <button className="mt-3 text-xs text-blue-600 font-medium hover:text-blue-800">Registrar pago manual</button>
                    </div>
                  )}

                  {activeTab === "compromisos" && (
                    <div className="text-center py-8">
                      <span className="text-3xl mb-2 block">🤝</span>
                      <p className="text-sm text-gray-500">No hay compromisos vigentes</p>
                      <button className="mt-3 text-xs text-blue-600 font-medium hover:text-blue-800">Crear compromiso de pago</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Documentos preview */}
              {activeTab === "resumen" && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-800">Documentos</h3>
                    <button onClick={() => setActiveTab("documentos")} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Ver todos</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-gray-500 font-medium">Recibo</th>
                          <th className="text-left py-2 text-gray-500 font-medium">Emisión</th>
                          <th className="text-right py-2 text-gray-500 font-medium">Deuda</th>
                          <th className="text-right py-2 text-gray-500 font-medium">Saldo</th>
                        </tr>
                      </thead>
                      <tbody className="table-hover">
                        {debtor.documentos.map((doc, i) => (
                          <tr key={i} className="border-b border-gray-50">
                            <td className="py-2 text-blue-600 font-medium">{doc.recibo}</td>
                            <td className="py-2 text-gray-600">{doc.emision}</td>
                            <td className="py-2 text-right text-gray-800">{fmt(doc.deudaAsignada)}</td>
                            <td className="py-2 text-right text-red-600 font-bold">{fmt(doc.saldo)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Últimas Gestiones */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-800">Últimas Gestiones</h3>
                  <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">Ver historial completo</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-gray-500 font-medium">Fecha</th>
                        <th className="text-left py-2 text-gray-500 font-medium">Hora</th>
                        <th className="text-left py-2 text-gray-500 font-medium">Gestor</th>
                        <th className="text-left py-2 text-gray-500 font-medium">Resultado</th>
                        <th className="text-left py-2 text-gray-500 font-medium">Observación</th>
                        <th className="text-left py-2 text-gray-500 font-medium">Canal</th>
                      </tr>
                    </thead>
                    <tbody className="table-hover">
                      {allGestiones.slice().reverse().slice(0, 5).map((g, i) => (
                        <tr key={i} className="border-b border-gray-50 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                          <td className="py-2.5 text-gray-600">{g.fecha}</td>
                          <td className="py-2.5 text-gray-600">{g.hora}</td>
                          <td className="py-2.5 text-gray-800 font-medium">{g.gestor}</td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${resultColor(g.resultado)}`}>{g.resultado}</span>
                          </td>
                          <td className="py-2.5 text-gray-500 max-w-[180px] truncate">{g.observacion}</td>
                          <td className="py-2.5 text-gray-500">{canalIcon(g.canal)} {g.canal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ══ RIGHT COLUMN — Gestión de Cobranza ══ */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-4">
                <h3 className="text-sm font-bold text-gray-800 mb-5 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-purple-500 rounded-full" /> Gestión de Cobranza
                </h3>

                <div className="space-y-4">
                  {/* Tipo de Operación (Técnica: Default pre-seleccionado) */}
                  <div>
                    <label className="text-[11px] text-gray-500 font-medium block mb-1">Tipo de Operación</label>
                    <select value={tipoOperacion} onChange={e => setTipoOperacion(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-700 bg-white transition-all">
                      {OPERATION_TYPES.map(op => <option key={op}>{op}</option>)}
                    </select>
                  </div>

                  {/* Contacto (Técnica: Default — primer contacto pre-seleccionado) */}
                  <div>
                    <label className="text-[11px] text-gray-500 font-medium block mb-1">Contacto</label>
                    <select value={contactoSeleccionado} onChange={e => setContactoSeleccionado(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-700 bg-white transition-all">
                      {debtor.contactos.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Resultado */}
                  <div>
                    <label className="text-[11px] text-gray-500 font-medium block mb-1">Resultado</label>
                    <select value={resultado} onChange={e => setResultado(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-all ${resultado === "Seleccione un resultado" ? "border-gray-300 text-gray-400" : "border-blue-300 text-gray-700 bg-blue-50/30"}`}>
                      {RESULT_OPTIONS.map(r => <option key={r}>{r}</option>)}
                    </select>
                  </div>

                  {/* Canal de Contacto */}
                  <div>
                    <label className="text-[11px] text-gray-500 font-medium block mb-1">Canal de Contacto</label>
                    <select value={canal} onChange={e => setCanal(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-all ${canal === "Seleccione un canal" ? "border-gray-300 text-gray-400" : "border-blue-300 text-gray-700 bg-blue-50/30"}`}>
                      {CHANNEL_OPTIONS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Resultados Rápidos (Técnica: Eliminar Fricción — 1 clic para resultado + canal) */}
                  <div>
                    <label className="text-[11px] text-gray-500 font-medium block mb-2">Resultados rápidos</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "Contactado", icon: "✅", color: "text-green-600 hover:bg-green-50 border-green-200", canal: "Teléfono" },
                        { label: "No contesta", icon: "📵", color: "text-orange-600 hover:bg-orange-50 border-orange-200", canal: "Teléfono" },
                        { label: "No existe", icon: "❌", color: "text-red-600 hover:bg-red-50 border-red-200", canal: "Teléfono" },
                        { label: "Buzón", icon: "📪", color: "text-yellow-600 hover:bg-yellow-50 border-yellow-200", canal: "Teléfono" },
                        { label: "WhatsApp", icon: "💬", color: "text-green-600 hover:bg-green-50 border-green-200", canal: "WhatsApp" },
                        { label: "Promesa pago", icon: "🤝", color: "text-blue-600 hover:bg-blue-50 border-blue-200", canal: "Teléfono" },
                      ].map(btn => (
                        <button key={btn.label} onClick={() => resultadoRapido(btn.label === "WhatsApp" ? "Contactado" : btn.label, btn.canal)}
                          className={`quick-result-btn flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-center ${btn.color} bg-white`}>
                          <span className="text-lg">{btn.icon}</span>
                          <span className="text-[10px] font-medium leading-tight">{btn.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Observación */}
                  <div>
                    <label className="text-[11px] text-gray-500 font-medium block mb-1">Observación</label>
                    <textarea ref={obsRef} value={observacion} onChange={e => setObservacion(e.target.value)}
                      placeholder="Ingrese la observación de la gestión..."
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-700 bg-white resize-none transition-all h-20"
                    />
                  </div>

                  {/* Action Buttons (Técnica: Activadores — CTAs prominentes) */}
                  <div className="space-y-2 pt-1">
                    <button onClick={grabarGestion}
                      className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-[0.98]">
                      ✓ Grabar Gestión
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="py-2.5 rounded-xl border border-green-300 text-green-700 text-xs font-semibold hover:bg-green-50 transition-all flex items-center justify-center gap-1">
                        🤝 Compromiso de Pago
                      </button>
                      <button className="py-2.5 rounded-xl border border-blue-300 text-blue-700 text-xs font-semibold hover:bg-blue-50 transition-all flex items-center justify-center gap-1">
                        📧 Enviar por Email
                      </button>
                    </div>
                  </div>

                  {/* Keyboard hint (Técnica: Pistas contextuales) */}
                  <p className="text-center text-[10px] text-gray-400 pt-1">
                    Presione <kbd className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-mono">Ctrl+Enter</kbd> para grabar la gestión
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ═══ TOAST ═══ */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 toast-enter">
          <div className={`px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 ${toast.type === "error" ? "bg-red-600 text-white" : "bg-white border border-gray-200 text-gray-800"}`}>
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}
