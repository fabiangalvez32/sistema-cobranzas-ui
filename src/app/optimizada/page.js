"use client";
import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════
   DATOS SIMULADOS
   ═══════════════════════════════════════════════ */
const DEBTORS = [
  {
    id: 1,
    razonSocial: "INVERSIONES Y PROCESOS MITAPADE SAC",
    ruc: "20613271379",
    segmento: "Empresa",
    estado: "ACTIVO",
    contactoPrincipal: "908863068",
    deudaTotal: 14092.84,
    diasMora: 15,
    saludDeuda: 65, // Porcentaje de probabilidad de cobro
    insight: "El cliente suele responder a las 4:00 PM. Alta probabilidad de contacto efectivo vía WhatsApp el día de hoy.",
    gestiones: [
      { fecha: "30/05", resultado: "No contesta", observacion: "Se llamó al contacto principal, no hubo respuesta." },
      { fecha: "25/05", resultado: "Promesa de pago", observacion: "El cliente indicó que pagaría antes del vencimiento." },
    ],
  },
  {
    id: 2,
    razonSocial: "COMERCIAL ANDINA DEL SUR EIRL",
    ruc: "20487563921",
    segmento: "Empresa",
    estado: "ACTIVO",
    contactoPrincipal: "956741238",
    deudaTotal: 5200.00,
    diasMora: 45,
    saludDeuda: 30, // Baja probabilidad por días de mora
    insight: "Cliente en alto riesgo. Las últimas 3 llamadas fueron enviadas al buzón. Se sugiere notificar a legal o enviar carta notarial.",
    gestiones: [
      { fecha: "28/05", resultado: "Buzón de voz", observacion: "Directo a buzón." },
    ],
  },
];

export default function OptimizadaPage() {
  const [currentDebtorIndex, setCurrentDebtorIndex] = useState(0);
  const [resultado, setResultado] = useState("");
  const [observacion, setObservacion] = useState("");
  const [showDetalles, setShowDetalles] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Nuevos estados "WOW Factor"
  const [isDark, setIsDark] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [nuevasGestiones, setNuevasGestiones] = useState({});
  
  const obsRef = useRef(null);
  const debtor = DEBTORS[currentDebtorIndex];
  const history = [...(nuevasGestiones[debtor.id] || []), ...debtor.gestiones];

  // Atajos de teclado
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Enter" && e.target.tagName === "TEXTAREA" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        grabarGestion();
      }
      if (e.ctrlKey && e.key === "ArrowRight") {
        e.preventDefault();
        if (currentDebtorIndex < DEBTORS.length - 1) setCurrentDebtorIndex(p => p + 1);
      }
      if (e.ctrlKey && e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentDebtorIndex > 0) setCurrentDebtorIndex(p => p - 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const grabarGestion = () => {
    if (!resultado) {
      setToast({ msg: "Selecciona un resultado rápido primero", type: "error" });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    
    // WOW Factor: Animación de recompensa si es resultado positivo
    if (resultado === "Promesa de pago" || resultado === "Contactado") {
      setIsCelebrating(true);
      setTimeout(() => setIsCelebrating(false), 2500);
    }

    const date = new Date();
    const nuevaGestion = {
      fecha: date.toLocaleDateString("es-PE", { day: '2-digit', month: '2-digit' }),
      resultado: resultado,
      observacion: observacion || "Sin observación adicional."
    };

    setNuevasGestiones(prev => ({
      ...prev,
      [debtor.id]: [nuevaGestion, ...(prev[debtor.id] || [])]
    }));

    setToast({ msg: "✓ Gestión grabada exitosamente", type: "success" });
    setTimeout(() => setToast(null), 3000);
    setResultado("");
    setObservacion("");
  };

  const resultadoRapido = (res) => {
    setResultado(res);
    setTimeout(() => obsRef.current?.focus(), 100);
  };

  const fmt = (n) => `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Clases dinámicas según el tema
  const bgMain = isDark ? "bg-[#0f172a]" : "bg-gray-50";
  const textMain = isDark ? "text-gray-100" : "text-gray-800";
  const bgCard = isDark ? "bg-[#1e293b] border-gray-700" : "bg-white border-gray-200";
  const textMuted = isDark ? "text-gray-400" : "text-gray-500";
  const headerBg = isDark ? "bg-[#1e293b] border-gray-800" : "bg-white border-gray-200";

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-500 ${bgMain} ${textMain}`}>
      
      {/* ══ SIDEBAR MINIMALISTA ══ */}
      <aside className={`w-16 flex flex-col items-center py-4 gap-4 flex-shrink-0 transition-colors ${isDark ? "bg-[#020617]" : "bg-[#1a2332]"}`}>
        <div className="w-10 h-10 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/40 flex items-center justify-center text-white font-bold">$</div>
        <button className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition">👥</button>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* ── TOP BAR (Con Dark Mode Toggle) ── */}
        <header className={`h-16 border-b flex items-center justify-between px-6 flex-shrink-0 transition-colors ${headerBg}`}>
          <div>
            <h1 className="text-xl font-bold">{debtor.razonSocial}</h1>
            <div className="flex items-center gap-3 text-sm mt-0.5">
              <span className={`${isDark ? "text-blue-400" : "text-blue-600"} font-bold flex items-center gap-1`}>
                📞 {debtor.contactoPrincipal}
              </span>
              <span className={textMuted}>|</span>
              <span className={textMuted}>RUC: {debtor.ruc}</span>
              <button onClick={() => setShowDetalles(true)} className={`text-xs hover:underline ml-2 ${isDark ? "text-blue-400" : "text-blue-500"}`}>
                Ver más detalles...
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* WOW Factor: Dark Mode Toggle */}
            <button 
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-full transition-all ${isDark ? "bg-indigo-900 text-yellow-300 hover:bg-indigo-800" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              title="Cambiar tema"
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>

            <span className={`text-sm ${textMuted}`}>{currentDebtorIndex + 1} de {DEBTORS.length}</span>
            <div className="flex gap-1">
              <button onClick={() => currentDebtorIndex > 0 && setCurrentDebtorIndex(p => p - 1)} className={`p-2 rounded-lg transition-colors ${isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"}`}>←</button>
              <button onClick={() => currentDebtorIndex < DEBTORS.length - 1 && setCurrentDebtorIndex(p => p + 1)} className={`p-2 rounded-lg transition-colors ${isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"}`}>→</button>
            </div>
          </div>
        </header>

        {/* ── 2-COLUMN LAYOUT ── */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full max-w-7xl mx-auto">
            
            {/* ══ COLUMNA IZQUIERDA: Contexto Vital ══ */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* WOW Factor: Sugerencia de Inteligencia Artificial */}
              <div className={`rounded-2xl p-5 shadow-sm border transition-all animate-fade-in ${isDark ? 'bg-indigo-900/20 border-indigo-500/30' : 'bg-indigo-50/50 border-indigo-100'}`}>
                 <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-lg flex-shrink-0 animate-pulse">
                      ✨
                    </div>
                    <div>
                      <h3 className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-indigo-400' : 'text-indigo-800'}`}>
                        Insight de IA Predictiva
                      </h3>
                      <p className={`text-sm leading-relaxed ${isDark ? 'text-indigo-100' : 'text-indigo-900'}`}>
                        {debtor.insight}
                      </p>
                    </div>
                 </div>
              </div>

              {/* Tarjetas de Resumen con Salud de Deuda */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`rounded-2xl border p-6 shadow-sm flex flex-col justify-center transition-colors ${bgCard} ${isDark ? "border-red-900/50" : "border-red-100"}`}>
                  <p className={`text-xs uppercase tracking-wide mb-1 font-bold ${textMuted}`}>Deuda a Cobrar</p>
                  <p className="text-3xl font-bold text-red-500 mb-3">{fmt(debtor.deudaTotal)}</p>
                  
                  {/* WOW Factor: Barra de Salud */}
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-wider">
                      <span className={textMuted}>Probabilidad Recaudo</span>
                      <span className={debtor.saludDeuda > 50 ? "text-green-500" : "text-red-500"}>{debtor.saludDeuda}%</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
                      <div 
                        className={`h-full transition-all duration-1000 ${debtor.saludDeuda > 50 ? "bg-gradient-to-r from-green-400 to-green-500" : "bg-gradient-to-r from-red-400 to-red-500"}`} 
                        style={{ width: `${debtor.saludDeuda}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className={`rounded-2xl border p-6 shadow-sm flex flex-col justify-center transition-colors ${bgCard} ${isDark ? "border-orange-900/50" : "border-orange-100"}`}>
                  <p className={`text-xs uppercase tracking-wide mb-1 font-bold ${textMuted}`}>Días de Mora</p>
                  <p className={`text-4xl font-bold ${debtor.diasMora > 30 ? "text-red-500" : "text-orange-500"}`}>{debtor.diasMora}</p>
                </div>
              </div>

              {/* Historial Limpio */}
              <div className={`rounded-2xl border p-6 shadow-sm flex-1 overflow-hidden flex flex-col transition-colors ${bgCard}`}>
                <h3 className="text-base font-bold mb-4">Contexto de llamadas previas</h3>
                <div className="space-y-3 overflow-y-auto pr-2">
                  {history.map((g, i) => (
                    <div key={i} className={`flex gap-4 p-4 rounded-xl border transition-colors ${isDark ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-100"}`}>
                      <div className={`text-xs font-bold whitespace-nowrap mt-0.5 ${textMuted}`}>{g.fecha}</div>
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700"}`}>
                          {g.resultado}
                        </span>
                        <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>{g.observacion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ══ COLUMNA DERECHA: Zona de Acción Enfocada ══ */}
            <div className="lg:col-span-5 h-full relative">
              <div className={`rounded-2xl border p-6 shadow-xl h-full flex flex-col transition-all duration-300 ${bgCard} ${isDark ? "border-blue-500/30 shadow-blue-900/20" : "border-blue-100 shadow-blue-500/5"}`}>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-blue-500 rounded-full"></span> Registrar Gestión
                </h3>

                {/* Resultados Rápidos */}
                <div className="mb-6">
                  <label className={`text-[10px] font-bold mb-3 block uppercase tracking-wider ${textMuted}`}>¿Qué pasó en la llamada?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Promesa de pago", icon: "🤝", lightTheme: "bg-green-50 border-green-200 text-green-700 ring-green-400", darkTheme: "bg-green-900/20 border-green-700/50 text-green-400 ring-green-500" },
                      { label: "No contesta", icon: "📵", lightTheme: "bg-orange-50 border-orange-200 text-orange-700 ring-orange-400", darkTheme: "bg-orange-900/20 border-orange-700/50 text-orange-400 ring-orange-500" },
                      { label: "Buzón de voz", icon: "📪", lightTheme: "bg-yellow-50 border-yellow-200 text-yellow-700 ring-yellow-400", darkTheme: "bg-yellow-900/20 border-yellow-700/50 text-yellow-400 ring-yellow-500" },
                      { label: "Equivocado", icon: "❌", lightTheme: "bg-red-50 border-red-200 text-red-700 ring-red-400", darkTheme: "bg-red-900/20 border-red-700/50 text-red-400 ring-red-500" },
                    ].map(btn => {
                      const isSelected = resultado === btn.label;
                      const activeClass = isDark ? btn.darkTheme : btn.lightTheme;
                      const defaultClass = isDark ? "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50";
                      
                      return (
                        <button 
                          key={btn.label} 
                          onClick={() => resultadoRapido(btn.label)}
                          className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200
                            ${isSelected ? `${activeClass} ring-2 ring-offset-2 scale-[1.02] ${isDark ? 'ring-offset-[#1e293b]' : 'ring-offset-white'}` : defaultClass}`}
                        >
                          <span className="text-2xl">{btn.icon}</span>
                          <span className="text-xs font-bold">{btn.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Textarea */}
                <div className="flex-1 flex flex-col mb-6">
                  <label className={`text-[10px] font-bold mb-2 block uppercase tracking-wider ${textMuted}`}>Notas de la llamada</label>
                  <textarea 
                    ref={obsRef}
                    value={observacion}
                    onChange={e => setObservacion(e.target.value)}
                    placeholder="Ej. El cliente se comprometió a pagar el viernes por la tarde..."
                    className={`w-full flex-1 p-4 rounded-xl border outline-none resize-none transition-all text-sm leading-relaxed
                      ${isDark 
                        ? "bg-gray-900 border-gray-700 focus:bg-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-200 placeholder-gray-600" 
                        : "bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 placeholder-gray-400"
                      }`}
                  />
                </div>

                {/* Botón Principal con estado de celebración */}
                <button 
                  onClick={grabarGestion}
                  disabled={isCelebrating}
                  className={`w-full py-4 rounded-xl font-bold text-base shadow-lg transition-all flex justify-center items-center gap-2 relative overflow-hidden
                    ${isCelebrating 
                      ? "bg-green-500 text-white shadow-green-500/50 scale-105" 
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30 active:scale-95"
                    }`}
                >
                  {isCelebrating ? (
                    <>
                      <span className="animate-bounce">🎉</span> ¡Excelente Trabajo!
                      {/* Efecto visual de destello */}
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </>
                  ) : (
                    "✓ Guardar Gestión"
                  )}
                </button>
                <p className={`text-center text-xs mt-4 font-medium ${textMuted}`}>
                  Atajo: <kbd className={`px-2 py-1 rounded border font-mono ${isDark ? "bg-gray-800 border-gray-700" : "bg-gray-100 border-gray-200"}`}>Ctrl + Enter</kbd>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modal Divulgación Progresiva */}
      {showDetalles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowDetalles(false)}>
          <div className={`rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in transition-colors ${bgCard}`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Detalles Secundarios</h3>
              <button onClick={() => setShowDetalles(false)} className={`${textMuted} hover:text-gray-900 dark:hover:text-white text-xl`}>×</button>
            </div>
            
            <div className={`border rounded-xl p-4 mb-5 ${isDark ? "bg-blue-900/20 border-blue-500/30" : "bg-blue-50 border-blue-100"}`}>
              <p className={`text-sm flex gap-2 ${isDark ? "text-blue-200" : "text-blue-800"}`}>
                <span>🧠</span> 
                <span><strong>Principio UX (Progressive Disclosure):</strong> Ocultamos estos datos porque el agente rara vez los necesita para hacer la llamada. Mantenemos la pantalla principal libre de distracciones.</span>
              </p>
            </div>

            <div className="space-y-3 text-sm">
              <div className={`flex justify-between border-b pb-2 ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                <span className={textMuted}>Representante Legal</span>
                <span className="font-medium">Carlos Mendoza</span>
              </div>
              <div className={`flex justify-between border-b pb-2 ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                <span className={textMuted}>Dirección</span>
                <span className="font-medium text-right">Plaza de la República 1480<br/>Lima, Perú</span>
              </div>
              <div className={`flex justify-between border-b pb-2 ${isDark ? "border-gray-700" : "border-gray-100"}`}>
                <span className={textMuted}>Otros Contactos</span>
                <span className="font-medium">905454381<br/>933996723</span>
              </div>
            </div>
            
            <button onClick={() => setShowDetalles(false)} className={`mt-6 w-full py-3 rounded-xl font-bold transition-colors ${isDark ? "bg-gray-800 hover:bg-gray-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}>
              Volver a la llamada
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-right">
          <div className={`px-6 py-4 rounded-xl shadow-xl font-bold flex items-center gap-3 ${toast.type === "error" ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}
