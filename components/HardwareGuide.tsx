
import React from 'react';
import { Cpu, Package, Zap, CircuitBoard, Search, Activity, Info, FileCode, Layers, Radio } from 'lucide-react';

const HardwareGuide: React.FC = () => {
  return (
    <div className="space-y-8 p-4 max-w-4xl mx-auto text-gray-300 pb-24">
      
      {/* HEADER SK6805 */}
      <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 p-6 rounded-2xl border border-purple-500/30 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Zap className="text-yellow-400" /> Sistema SK6805 (NeoPixel)
        </h2>
        <p className="text-gray-400 text-sm">
          La tua BOM indica l'uso di 14 LED <strong>SK6805-EC</strong>. Questo è un sistema a bus seriale: ogni modulo usa un solo filo di dati.
        </p>
      </div>

      {/* SCHEMA DI COLLEGAMENTO */}
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Radio className="text-blue-400" /> Collegamento Moduli
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                  <div className="p-4 bg-black/40 rounded-xl border border-gray-700">
                      <h4 className="text-xs font-black text-blue-400 uppercase mb-2">Pinout Connettore (CN1/CN2)</h4>
                      <ul className="text-xs space-y-2 text-gray-400">
                          <li className="flex justify-between"><span>Pin 1: VCC</span> <span className="text-red-500">+5V</span></li>
                          <li className="flex justify-between"><span>Pin 2: DATA</span> <span className="text-green-500">DIN / DOUT</span></li>
                          <li className="flex justify-between"><span>Pin 3: GND</span> <span className="text-gray-500">0V</span></li>
                      </ul>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                      I moduli vanno collegati in "Daisy Chain": l'uscita (DOUT) del primo modulo va all'ingresso (DIN) del secondo, e così via per tutti i 200 display.
                  </p>
              </div>
              <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl flex flex-col justify-center">
                  <h4 className="text-sm font-bold text-white mb-2 italic">Power Tip:</h4>
                  <p className="text-[11px] text-gray-300">
                      Con 200 moduli (2800 LED RGB), l'assorbimento di corrente può essere elevato. Inietta +5V ogni 20-30 moduli per evitare cadute di tensione e colori sbiaditi.
                  </p>
              </div>
          </div>
      </div>

      {/* CODICE ESP32 */}
      <div className="bg-gray-800 p-6 rounded-2xl border border-green-500/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileCode className="text-green-400" /> Firmware ESP32 (Arduino)
          </h3>
          <div className="bg-black rounded-xl p-4 overflow-x-auto border border-gray-900">
              <pre className="text-[10px] text-green-500 font-mono">
{`#include <Adafruit_NeoPixel.h>

#define PIN        13   // Pin collegato a CN1 DATA
#define NUM_MODS   200  // Numero di display
#define LEDS_PER   14   // 7 per cifra x 2
#define TOTAL_LEDS (NUM_MODS * LEDS_PER)

Adafruit_NeoPixel pixels(TOTAL_LEDS, PIN, NEO_GRB + NEO_KHZ800);

void setup() {
  pixels.begin();
  pixels.setBrightness(50); // Risparmio energetico
}

// L'app invia i dati via WiFi (UDP/HTTP)
// Qui processiamo il mapping segmenti -> LED Index
void updateDisplay(int modIdx, int val1, int val2, uint32_t color) {
  // Esempio mapping basato sul tuo sbroglio PCB
  int startLed = modIdx * LEDS_PER;
  // ... logica di accensione LED basata sui segmenti ...
  pixels.show();
}`}
              </pre>
          </div>
          <button className="mt-4 w-full bg-green-600/20 border border-green-500/40 text-green-400 py-3 rounded-xl text-xs font-bold hover:bg-green-600/30 transition-all">
              Scarica Sketch Completo (.ino)
          </button>
      </div>

      {/* ANALISI BOM */}
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Search className="text-orange-400" /> Analisi BOM Rilevata
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-4 p-3 bg-black/20 rounded-lg">
                  <div className="w-10 h-10 bg-orange-500/20 rounded flex items-center justify-center shrink-0">
                      <Layers size={20} className="text-orange-500" />
                  </div>
                  <div>
                      <h4 className="text-xs font-bold text-white uppercase">SK6805-EC (14x)</h4>
                      <p className="text-[10px] text-gray-500">LED RGB con driver integrato. Package 2424. Perfetti per alta densità.</p>
                  </div>
              </div>
              <div className="flex gap-4 p-3 bg-black/20 rounded-lg">
                  <div className="w-10 h-10 bg-blue-500/20 rounded flex items-center justify-center shrink-0">
                      <CircuitBoard size={20} className="text-blue-500" />
                  </div>
                  <div>
                      <h4 className="text-xs font-bold text-white uppercase">C0402 (100nF)</h4>
                      <p className="text-[10px] text-gray-500">Disaccoppiamento fondamentale per ogni LED per evitare flicker.</p>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default HardwareGuide;