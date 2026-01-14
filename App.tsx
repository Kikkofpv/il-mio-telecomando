
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Trash2, 
  Settings, 
  Cpu, 
  Grid3X3, 
  Sparkles,
  Wifi,
  Palette,
  Lightbulb,
  FolderOpen
} from 'lucide-react';
import DisplayGrid from './components/DisplayGrid';
import HardwareGuide from './components/HardwareGuide';
import { generatePattern } from './services/geminiService';
import { DisplayUnit, TabView, HardwareConfig, PinMapping } from './types';

const TOTAL_DISPLAYS = 200;

const DEFAULT_MAPPING: PinMapping = {
    digit1: [0, 1, 2, 3, 4, 5, 6], 
    digit2: [7, 8, 9, 10, 11, 12, 13]
};

const createInitialDisplays = () => Array.from({ length: TOTAL_DISPLAYS }, (_, i) => ({
  id: i + 1,
  value: "00",
  secondaryValue: "00",
  isAlternating: false,
  isOn: false,
  color: 'red'
}));

const PALETTE_COLORS = ['red', 'green', 'blue', 'yellow', 'purple', 'cyan', 'white'];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabView>(TabView.CONTROLLER);
  const [displays, setDisplays] = useState<DisplayUnit[]>(createInitialDisplays());
  const [selectedColor, setSelectedColor] = useState('red');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [alternatingFrame, setAlternatingFrame] = useState(false);
  
  const [hardwareConfig, setHardwareConfig] = useState<HardwareConfig>({
    ipAddress: '192.168.4.1',
    totalDisplays: TOTAL_DISPLAYS,
    pinMapping: DEFAULT_MAPPING
  });

  // Ciclo alternanza per i display in modalità "ALT"
  useEffect(() => {
    const timer = setInterval(() => setAlternatingFrame(v => !v), 1200);
    return () => clearInterval(timer);
  }, []);

  // Persistenza Dati
  useEffect(() => {
    const saved = localStorage.getItem('matrix_v2_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === TOTAL_DISPLAYS) setDisplays(parsed);
      } catch(e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('matrix_v2_state', JSON.stringify(displays));
  }, [displays]);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1000);
  };

  const updateDisplay = useCallback((id: number, updates: Partial<DisplayUnit>) => {
    setDisplays(current => current.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const toggleDisplay = useCallback((id: number) => {
    setDisplays(current => current.map(d => 
      d.id === id ? { ...d, isOn: !d.isOn, color: d.isOn ? d.color : selectedColor } : d
    ));
  }, [selectedColor]);

  const handleAiAction = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const result = await generatePattern(aiPrompt, displays);
      setDisplays(result);
      setAiPrompt('');
    } catch (e) {
      alert("Errore AI. Controlla la connessione.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#020617] text-slate-100 overflow-hidden font-sans">
      {/* Header Mobile-First */}
      <header className="px-4 py-4 bg-[#0f172a] border-b border-white/5 flex justify-between items-center shrink-0 safe-top">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Grid3X3 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-tighter leading-none italic">Matrix<span className="text-blue-500">Radar</span></h1>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Dual-Digit Bus System</p>
          </div>
        </div>
        <button onClick={handleSync} className="flex items-center gap-2 bg-green-600/10 border border-green-500/20 text-green-500 px-4 py-2 rounded-full text-[10px] font-black uppercase active:scale-95 transition-all">
          <Wifi size={14} className={isSyncing ? 'animate-pulse' : ''} />
          {isSyncing ? 'Sync...' : 'Online'}
        </button>
      </header>

      {/* Area Principale */}
      <main className="flex-1 overflow-hidden relative flex flex-col min-h-0">
        {activeTab === TabView.CONTROLLER && (
          <div className="flex flex-col h-full">
            {/* Toolbar AI e Colore */}
            <div className="p-3 bg-[#0f172a]/50 border-b border-white/5 space-y-3 shrink-0">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Sparkles className="absolute left-3 top-2.5 text-purple-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Esempio: 'Scrivi 88 ovunque'..." 
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-purple-500 transition-colors"
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                  />
                </div>
                <button onClick={handleAiAction} disabled={isAiLoading} className="bg-purple-600 hover:bg-purple-500 px-5 rounded-xl text-[10px] font-black uppercase disabled:opacity-30">
                  {isAiLoading ? '...' : 'AI'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {PALETTE_COLORS.map(c => (
                    <button 
                      key={c} 
                      onClick={() => setSelectedColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all shrink-0 ${selectedColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-40'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button onClick={() => { if(confirm("Reset?")) setDisplays(createInitialDisplays()) }} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 active:scale-90">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Griglia Matrice */}
            <div className="flex-1 min-h-0 relative">
              <DisplayGrid 
                displays={displays}
                onToggle={toggleDisplay}
                onValueChange={(id, v) => updateDisplay(id, { value: v.toUpperCase() })}
                onSecondaryValueChange={(id, v) => updateDisplay(id, { secondaryValue: v.toUpperCase() })}
                onToggleAlternating={(id) => {
                  const d = displays.find(x => x.id === id);
                  if (d) updateDisplay(id, { isAlternating: !d.isAlternating });
                }}
                onColorChange={(id, c) => updateDisplay(id, { color: c })}
                alternatingFrame={alternatingFrame}
                pinMapping={hardwareConfig.pinMapping}
              />
            </div>
          </div>
        )}

        {activeTab === TabView.HARDWARE_GUIDE && <div className="h-full overflow-y-auto"><HardwareGuide /></div>}
        
        {activeTab === TabView.SETTINGS && (
          <div className="p-6 space-y-6 overflow-y-auto h-full">
            <h2 className="text-xl font-black uppercase tracking-tighter text-blue-500 italic">Network Config</h2>
            <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-2 tracking-widest">Indirizzo IP ESP32</label>
                <input 
                  type="text" 
                  value={hardwareConfig.ipAddress} 
                  onChange={e => setHardwareConfig({...hardwareConfig, ipAddress: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-mono outline-none focus:border-blue-500"
                />
              </div>
              <p className="text-[10px] text-slate-500 italic leading-relaxed">
                Assicurati che lo smartphone sia connesso alla rete WiFi generata dall'ESP32 o alla stessa rete locale del dispositivo.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Navigazione Tab */}
      <nav className="bg-[#0f172a] border-t border-white/5 flex justify-around p-2 pb-8 shrink-0 z-50 safe-bottom">
        {[
          { id: TabView.CONTROLLER, icon: Grid3X3, label: 'Griglia' },
          { id: TabView.HARDWARE_GUIDE, icon: Cpu, label: 'Wiring' },
          { id: TabView.SETTINGS, icon: Settings, label: 'Setup' }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center py-2 px-6 transition-all ${activeTab === tab.id ? 'text-blue-500' : 'text-slate-600'}`}
          >
            <tab.icon size={22} className={activeTab === tab.id ? 'scale-110 drop-shadow-[0_0_10px_rgba(37,99,235,0.3)]' : ''} />
            <span className="text-[8px] font-black uppercase tracking-widest mt-2">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
