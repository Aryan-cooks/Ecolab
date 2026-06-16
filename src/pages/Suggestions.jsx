import React, { useState } from 'react';
import { useStore } from '../store/useStore';

export default function Suggestions() {
  const { suggestions, actions, completeAction, dismissSuggestion, addCustomSuggestion } = useStore();
  const [activeTab, setActiveTab] = useState('pending');

  // Manual action logger form states
  const [showLogForm, setShowLogForm] = useState(false);
  const [logTitle, setLogTitle] = useState('');
  const [logCategory, setLogCategory] = useState('transport');
  const [logSavings, setLogSavings] = useState(150);
  const [logDifficulty, setLogDifficulty] = useState('Easy');
  const [logNotes, setLogNotes] = useState('');

  const pending = suggestions ? suggestions.filter(s => s.status === 'pending') : [];
  const completed = actions || [];
  const dismissed = suggestions ? suggestions.filter(s => s.status === 'dismissed') : [];

  const handleExecute = async (item) => {
    await completeAction(item.id, {
      title: item.title,
      category: item.category,
      savingKgPerYear: item.savingKgPerYear,
      difficulty: item.difficulty,
      source: item.source || 'ai_suggestion',
      notes: item.notes || item.description || null
    });
  };

  const handleDismiss = (id) => {
    dismissSuggestion(id);
  };

  const handleManualLog = async (e) => {
    e.preventDefault();
    if (!logTitle) return;

    await addCustomSuggestion({
      title: logTitle,
      category: logCategory,
      savingKgPerYear: parseInt(logSavings) || 0,
      difficulty: logDifficulty,
      description: logNotes || 'manually logged custom protocol.',
      notes: logNotes || null
    });

    // Reset
    setLogTitle('');
    setLogNotes('');
    setShowLogForm(false);
  };

  return (
    <main className="p-4 md:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neon-green/30 pb-4 gap-4">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-neon-green terminal-glow break-words">[ NEUTRALIZATION_PROTOCOLS ]</h2>
            <p className="text-[10px] text-neon-amber mt-1">Manage Carbon Offset Tasks // Node-AR992</p>
          </div>
          <button
            onClick={() => setShowLogForm(!showLogForm)}
            className="border-2 border-neon-amber text-neon-amber hover:bg-neon-amber hover:text-black font-bold py-2 px-4 text-xs transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">add_box</span>
            LOG_CUSTOM_PROTOCOL
          </button>
        </div>

        {/* Manual logger modal/panel */}
        {showLogForm && (
          <div className="border-2 border-neon-amber p-6 bg-surface animate-fade-in">
            <h3 className="text-xs font-bold text-neon-amber mb-4 uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">post_add</span>
              MANUAL_OFFSET_EMULATION_FORM
            </h3>
            
            <form onSubmit={handleManualLog} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-neon-green/60">Action Title</label>
                  <input
                    type="text"
                    required
                    value={logTitle}
                    onChange={(e) => setLogTitle(e.target.value)}
                    className="w-full text-sm py-2 px-3 focus:outline-none"
                    placeholder="e.g. Setup smart LED power grid"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-neon-green/60">Sub-Sector Category</label>
                  <select
                    value={logCategory}
                    onChange={(e) => setLogCategory(e.target.value)}
                    className="w-full text-sm py-2 px-3 focus:outline-none"
                  >
                    <option value="transport">Transport</option>
                    <option value="food">Food & Diet</option>
                    <option value="home">Home Energy</option>
                    <option value="lifestyle">Lifestyle</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-neon-green/60">Estimated Savings (kg CO2e/year)</label>
                  <input
                    type="number"
                    min="0"
                    value={logSavings}
                    onChange={(e) => setLogSavings(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-sm py-2 px-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase text-neon-green/60">Difficulty Index</label>
                  <select
                    value={logDifficulty}
                    onChange={(e) => setLogDifficulty(e.target.value)}
                    className="w-full text-sm py-2 px-3 focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase text-neon-green/60">Description / Execution Notes (Optional)</label>
                <textarea
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full text-sm py-2 px-3 focus:outline-none h-16 resize-none"
                  placeholder="e.g. Swapped out five old 60W bulbs with 9W LEDs..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 border-2 border-neon-amber bg-neon-amber text-black hover:bg-black hover:text-neon-amber py-2 font-bold uppercase transition-colors"
                >
                  COMMIT_LOG_ENTRY
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="flex-1 border border-neon-green/40 text-neon-green py-2 font-bold uppercase hover:bg-matrix-dim/30 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex flex-col sm:flex-row border-2 border-neon-green bg-black">
          {[
            { id: 'pending', name: `PENDING_RECS (${pending.length})` },
            { id: 'active', name: `COMPLETED_PLANS (${completed.length})` },
            { id: 'dismissed', name: `DECOMMISSIONED (${dismissed.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-[10px] md:text-xs font-bold uppercase border-r border-neon-green/30 last:border-0 ${
                activeTab === tab.id
                  ? 'bg-neon-green text-black'
                  : 'text-neon-green hover:bg-matrix-dim'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Suggestions Grid */}
        <div className="space-y-4">
          
          {/* Pending Suggestions */}
          {activeTab === 'pending' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {pending.length > 0 ? (
                pending.map((item) => (
                  <div key={item.id} className={`border-2 p-5 bg-surface flex flex-col justify-between ${
                    item.difficulty === 'Hard' ? 'border-neon-red' : (item.difficulty === 'Medium' ? 'border-neon-amber' : 'border-neon-green')
                  }`}>
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="material-symbols-outlined text-neon-green">
                          {item.category === 'transport' ? 'directions_car' : (item.category === 'food' ? 'restaurant' : (item.category === 'home' ? 'bolt' : 'shopping_bag'))}
                        </span>
                        <span className={`border px-2 py-0.5 text-[8px] font-bold ${
                          item.difficulty === 'Hard' ? 'border-neon-red text-neon-red' : (item.difficulty === 'Medium' ? 'border-neon-amber text-neon-amber' : 'border-neon-green text-neon-green')
                        }`}>
                          {item.difficulty.toUpperCase()} // {item.timeToImplement.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold mb-2 uppercase">{item.title}</h4>
                      <p className="text-[10px] opacity-75 mb-6 min-h-[40px] leading-relaxed lowercase">
                        {item.description}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-4 text-neon-amber text-[9px] font-bold">
                        <span className="material-symbols-outlined text-xs">keyboard_double_arrow_down</span>
                        <span>REDUCTION_EST: -{item.savingKgPerYear}KG/YR</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleExecute(item)}
                          className={`border py-1.5 text-[9px] font-bold hover:bg-black transition-colors ${
                            item.difficulty === 'Hard' ? 'border-neon-red text-neon-red hover:text-white' : (item.difficulty === 'Medium' ? 'border-neon-amber text-neon-amber hover:text-white' : 'border-neon-green text-neon-green hover:text-white')
                          }`}
                        >
                          EXECUTE
                        </button>
                        <button
                          onClick={() => handleDismiss(item.id)}
                          className="border border-neon-green/30 py-1.5 text-[9px] font-bold text-neon-green/50 hover:text-neon-red hover:border-neon-red transition-all"
                        >
                          ABORT
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 border border-dashed border-neon-green/30 p-8 text-center text-neon-green/60">
                  NO PENDING AI RECOMMENDATIONS. RE-CALCULATE PROFILE METRICS FOR NEW PROTOCOLS.
                </div>
              )}
            </div>
          )}

          {/* Completed / Active actions */}
          {activeTab === 'active' && (
            <div className="space-y-3">
              {completed.length > 0 ? (
                completed.map((item) => (
                  <div key={item.actionId} className="border border-neon-green/40 p-4 bg-surface flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-neon-green text-sm">
                          {item.category === 'transport' ? 'directions_car' : (item.category === 'food' ? 'restaurant' : (item.category === 'home' ? 'bolt' : 'shopping_bag'))}
                        </span>
                        <h4 className="text-xs font-bold uppercase">{item.title}</h4>
                        <span className="text-[7px] border border-neon-green text-neon-green px-1 font-bold">
                          {item.source.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[9px] text-neon-green/60 lowercase italic">
                        logged at: {new Date(item.completedAt).toLocaleString()}
                        {item.notes && ` // Note: ${item.notes}`}
                      </p>
                    </div>
                    
                    <div className="text-right w-full sm:w-auto">
                      <div className="text-neon-amber text-xs font-bold">-{item.savingKgPerYear} kg CO2e/yr</div>
                      <div className="text-[8px] opacity-50 uppercase mt-0.5">EST_ANNUAL_SAVINGS</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="border border-dashed border-neon-green/30 p-8 text-center text-neon-green/60">
                  NO ACTIVE PLANS COMPLETED. SELECT AND EXECUTE PROTOCOLS FROM REC TABS.
                </div>
              )}
            </div>
          )}

          {/* Dismissed Suggestions */}
          {activeTab === 'dismissed' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {dismissed.length > 0 ? (
                dismissed.map((item) => (
                  <div key={item.id} className="border border-neon-green/20 p-5 bg-surface flex flex-col justify-between opacity-55 hover:opacity-100 transition-opacity">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="material-symbols-outlined text-neon-green/60">
                          {item.category === 'transport' ? 'directions_car' : (item.category === 'food' ? 'restaurant' : (item.category === 'home' ? 'bolt' : 'shopping_bag'))}
                        </span>
                        <span className="border border-neon-green/30 px-2 py-0.5 text-[8px] font-bold">
                          {item.difficulty.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold mb-2 uppercase">{item.title}</h4>
                      <p className="text-[10px] opacity-75 mb-6 min-h-[40px] leading-relaxed lowercase">
                        {item.description}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-4 text-neon-amber/60 text-[9px] font-bold">
                        <span className="material-symbols-outlined text-xs">keyboard_double_arrow_down</span>
                        <span>REDUCTION_EST: -{item.savingKgPerYear}KG/YR</span>
                      </div>

                      <button
                        onClick={() => handleExecute(item)}
                        className="w-full border border-neon-green py-1.5 text-[9px] font-bold hover:bg-neon-green hover:text-black transition-colors"
                      >
                        RE-INITIALIZE
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 border border-dashed border-neon-green/30 p-8 text-center text-neon-green/60">
                  NO DECOMMISSIONED PROTOCOLS.
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </main>
  );
}
