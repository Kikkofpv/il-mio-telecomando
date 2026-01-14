import React, { memo, useState, useRef } from 'react';
import { DisplayUnit, PinMapping } from '../types';
// Fixed: Added Palette to the lucide-react imports
import { RefreshCw, X, Check, Maximize2, Minimize2, Power, Palette } from 'lucide-react';

interface DisplayGridProps {
  displays: DisplayUnit[];
  onToggle: (id: number) => void;
  onValueChange: (id: number, newValue: string) => void;
  onSecondaryValueChange: (id: number, newValue: string) => void;
  onToggleAlternating: (id: number) => void;
  onColorChange: (id: number, color: string) => void;
  alternatingFrame: boolean;
  pinMapping: PinMapping;
}

const COLOR_DEFS: Record<string, { hex: string, shadow: string }> = {
  red:    { hex: '#ef4444', shadow: '0 0 12px rgba(239, 68, 68, 0.6)' },
  green:  { hex: '#22c55e', shadow: '0 0 12px rgba(34, 197, 94, 0.6)' },
  blue:   { hex: '#3b82f6', shadow: '0 0 12px rgba(59, 130, 246, 0.6)' },
  yellow: { hex: '#eab308', shadow: '0 0 12px rgba(234, 179, 8, 0.6)' },
  purple: { hex: '#a855f7', shadow: '0 0 12px rgba(168, 85, 247, 0.6)' },
  cyan:   { hex: '#06b6d4', shadow: '0 0 12px rgba(6, 182, 212, 0.6)' },
  white:  { hex: '#f8fafc', shadow: '0 0 12px rgba(248, 250, 252, 0.6)' },
};

const SEGMENTS: Record<string, number[]> = {
  '0': [0, 1, 2, 3, 4, 5], '1': [1, 2], '2': [0, 1, 6, 4, 3], '3': [0, 1, 6, 2, 3], '4': [5, 6, 1, 2],
  '5': [0, 5, 6, 2, 3], '6': [0, 5, 6, 4, 2, 3], '7': [0, 1, 2], '8': [0, 1, 2, 3, 4, 5, 6], '9': [0, 1, 2, 3, 5, 6],
  'F': [0, 5, 6, 4], ' ': []
};

const Digit = ({ char, color, isOn }: any) => {
  const active = SEGMENTS[char] || [];
  const Seg = ({ id, cls }: any) => (
    <div className={`absolute rounded-full transition-all duration-300 ${cls}`} 
         style={{ 
           backgroundColor: isOn && active.includes(id) ? color.hex : '#1e293b',
           boxShadow: isOn && active.includes(id) ? color.shadow : 'none',
           opacity: isOn && active.includes(id) ? 1 : 0.2
         }} />
  );
  return (
    <div className="relative w-12 h-20 shrink-0">
      <Seg id={0} cls="top-0 left-1 right-1 h-1.5" />
      <Seg id={6} cls="top-[calc(50%-0.75px)] left-1 right-1 h-1.5" />
      <Seg id={3} cls="bottom-0 left-1 right-1 h-1.5" />
      <Seg id={5} cls="top-1 left-0 w-1.5 h-[calc(50%-1.5px)]" />
      <Seg id={1} cls="top-1 right-0 w-1.5 h-[calc(50%-1.5px)]" />
      <Seg id={4} cls="bottom-1 left-0 w-1.5 h-[calc(50%-1.5px)]" />
      <Seg id={2} cls="bottom-1 right-0 w-1.5 h-[calc(50%-1.5px)]" />
    </div>
  );
};

const Modal = ({ display, coord, onClose, onToggle, onValueChange, onSecondaryValueChange, onToggleAlternating, onColorChange, alternatingFrame }: any) => {
  if (!display) return null;
  const color = COLOR_DEFS[display.color] || COLOR_DEFS.red;
  const currentVal = display.isAlternating ? (alternatingFrame ? display.secondaryValue : display.value) : display.value;
  const valStr = (currentVal || " ").toUpperCase().padStart(2, ' ').slice(-2);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-[#0f172a] w-full max-w-sm rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 flex justify-between items-center shrink-0 border-b border-white/5">
          <div>
            <h2 className="text-3xl font-black italic text-white leading-none">{coord}</h2>
            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">Config Modulo</span>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-800 rounded-full text-slate-400 active:scale-90"><X size={20} /></button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          <div className="aspect-[4/3] bg-black/60 rounded-3xl flex items-center justify-center gap-6 border border-white/5 shadow-inner">
            <Digit char={valStr[0]} color={color} isOn={display.isOn} />
            <Digit char={valStr[1]} color={color} isOn={display.isOn} />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button onClick={() => onToggle(display.id)} className={`py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${display.isOn ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'bg-slate-800 text-slate-500'}`}>
              <Power size={14} /> {display.isOn ? 'Acceso' : 'Spento'}
            </button>
            <button onClick={() => onToggleAlternating(display.id)} className={`py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${display.isAlternating ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-800 text-slate-500'}`}>
              <RefreshCw size={14} className={display.isAlternating ? 'animate-spin-slow' : ''} /> Alternato
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Valore A</label>
              <input type="text" maxLength={2} value={display.value} onChange={e => onValueChange(display.id, e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl py-4 text-center text-2xl font-black text-white outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Valore B</label>
              <input type="text" maxLength={2} value={display.secondaryValue} disabled={!display.isAlternating} onChange={e => onSecondaryValueChange(display.id, e.target.value)} className={`w-full bg-black/40 border border-white/10 rounded-xl py-4 text-center text-2xl font-black outline-none ${display.isAlternating ? 'text-white focus:border-blue-500' : 'text-slate-700'}`} />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {Object.keys(COLOR_DEFS).map(c => (
              <button key={c} onClick={() => onColorChange(display.id, c)} className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center transition-all ${display.color === c ? 'ring-2 ring-white scale-110' : 'opacity-30'}`} style={{ backgroundColor: COLOR_DEFS[c].hex }}>
                {display.color === c && <Check size={16} className="text-black" />}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 bg-slate-900 border-t border-white/5">
          <button onClick={onClose} className="w-full bg-blue-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg active:scale-95 transition-transform">Conferma</button>
        </div>
      </div>
    </div>
  );
};

const DisplayGrid: React.FC<DisplayGridProps> = ({ displays, onToggle, onValueChange, onSecondaryValueChange, onToggleAlternating, onColorChange, alternatingFrame }) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isPaint, setIsPaint] = useState(false);

  const selectedDisplay = selectedId ? displays.find(d => d.id === selectedId) : null;
  const coord = selectedDisplay ? `${String.fromCharCode(65 + Math.floor((selectedDisplay.id-1)/20))}${(selectedId!-1)%20 + 1}` : '';
  const cellW = 58 * zoom;

  return (
    <div className="flex flex-col h-full select-none">
      {/* Controlli Griglia */}
      <div className="flex items-center justify-between p-2.5 bg-black/20 border-b border-white/5 backdrop-blur-sm shrink-0">
        <button onClick={() => setIsPaint(!isPaint)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-2 ${isPaint ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30' : 'bg-slate-800 text-slate-500'}`}>
          <Palette size={14} /> {isPaint ? 'Modalità Pennello' : 'Modalità Tocco'}
        </button>
        <div className="flex items-center gap-3">
          <Minimize2 size={12} className="text-slate-600" />
          <input type="range" min="0.6" max="2" step="0.1" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} className="w-24 accent-blue-500 h-1 bg-slate-800 rounded-full appearance-none" />
          <Maximize2 size={12} className="text-slate-600" />
        </div>
      </div>

      {/* Griglia Scrollabile */}
      <div className="flex-1 overflow-auto bg-[#020617] relative overscroll-contain">
        <div className="inline-grid grid-cols-[36px_repeat(20,minmax(0,1fr))] p-4 gap-1" style={{ width: 'max-content' }}>
          {/* Header Numeri */}
          <div className="h-9 sticky top-0 left-0 z-30 bg-[#020617]" />
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="h-9 flex items-center justify-center text-[10px] font-black text-slate-700 uppercase sticky top-0 z-20 bg-[#020617]" style={{ width: cellW }}>
              {i + 1}
            </div>
          ))}

          {/* Righe A-J */}
          {Array.from({ length: 10 }, (_, r) => (
            <React.Fragment key={r}>
              <div className="w-9 h-14 flex items-center justify-center text-[11px] font-black text-slate-700 sticky left-0 z-20 bg-[#020617]">
                {String.fromCharCode(65 + r)}
              </div>
              {Array.from({ length: 20 }, (_, c) => {
                const d = displays[r * 20 + c];
                const color = COLOR_DEFS[d.color] || COLOR_DEFS.red;
                const val = (d.isAlternating && d.isOn ? (alternatingFrame ? d.secondaryValue : d.value) : d.value) || " ";
                const valStr = val.toUpperCase().padStart(2, ' ').slice(-2);
                
                return (
                  <div 
                    key={d.id}
                    onPointerDown={() => isPaint ? onToggle(d.id) : setSelectedId(d.id)}
                    onPointerEnter={(e) => { if (isPaint && (e.buttons === 1)) onToggle(d.id); }}
                    className={`h-14 border border-white/5 rounded-lg flex items-center justify-center relative transition-all duration-200 ${d.isOn ? 'bg-slate-900 border-white/10' : 'bg-slate-950 opacity-40'}`}
                    style={{ width: cellW }}
                  >
                    <span 
                      className="font-mono font-black tracking-tighter" 
                      style={{ 
                        fontSize: cellW * 0.45, 
                        color: d.isOn ? color.hex : '#1e293b',
                        textShadow: d.isOn ? color.shadow : 'none'
                      }}
                    >
                      {valStr}
                    </span>
                    {d.isAlternating && d.isOn && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {selectedDisplay && (
        <Modal 
          display={selectedDisplay} coord={coord} onClose={() => setSelectedId(null)} 
          onToggle={onToggle} onValueChange={onValueChange} onSecondaryValueChange={onSecondaryValueChange}
          onToggleAlternating={onToggleAlternating} onColorChange={onColorChange} alternatingFrame={alternatingFrame}
        />
      )}
    </div>
  );
};

export default memo(DisplayGrid);