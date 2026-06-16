import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Tracker() {
  const { progress, actions, user, fetchHistory, fetchCompletedActions } = useStore();

  useEffect(() => {
    fetchHistory();
    fetchCompletedActions();
  }, [fetchHistory, fetchCompletedActions]);

  const handleExportBadges = () => {
    if (!user || !user.badges || user.badges.length === 0) {
      alert("NO_UNLOCKED_BADGES_TO_EXPORT");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user.badges, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `badges_${user.uid.slice(0, 8)}_manifest.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadLog = (log) => {
    const reportText = `==================================================
CARBON CONFLICT ENVIRONMENT LABORATORY TELEMETRY
==================================================
SNAPSHOT TIMESTAMP: ${new Date(log.calculatedAt).toLocaleString()}
NODE REFERENCE ID : SNAP_${log.calculatedAt.slice(-6)}
OPERATOR NODE ID  : ${user?.uid || 'UNKNOWN'}
--------------------------------------------------

1. INPUT METRICS SYNCED:
------------------------
TRANSPORT VECTORS:
  - Vehicle Matrix   : ${log.inputs.transport?.vehicleType || 'N/A'}
  - Weekly Commute   : ${log.inputs.transport?.weeklyKm || 0} km
  - Transit Ratio    : ${log.inputs.transport?.transitPercent || 0}%
  - Aero Flights/Yr  : ${log.inputs.transport?.flightsPerYear || 0}
NUTRITION VARIABLES:
  - Protein Base     : ${log.inputs.food?.dietType || 'N/A'}
  - Waste Coefficient: ${log.inputs.food?.wasteLevel || 'N/A'}
  - Local Sourcing % : ${log.inputs.food?.localFoodPercent || 0}%
RESIDENTIAL CORE:
  - Power Draw (kWh) : ${log.inputs.home?.monthlyKwh || 0}
  - LPG Cylinders    : ${log.inputs.home?.lpgCylindersPerMonth || 0}
  - Habitation SqM   : ${log.inputs.home?.homeSizeSqm || 0}
CONSUMPTION OUTFLOWS:
  - Material Spend   : INR ${log.inputs.lifestyle?.monthlyClothingSpend || 0}
  - Screen Uptime    : ${log.inputs.lifestyle?.screenHoursPerDay || 0} hours/day
  - Recycle Status   : ${log.inputs.lifestyle?.recyclingHabits || 'N/A'}

2. CALCULATED ATTENUATION RESULTS:
----------------------------------
EMISSIONS BREAKDOWN (kg CO2e/year):
  - Transport        : ${log.results.breakdown?.transport || 0} kg
  - Nutrition        : ${log.results.breakdown?.food || 0} kg
  - Home Energy      : ${log.results.breakdown?.home || 0} kg
  - Lifestyle        : ${log.results.breakdown?.lifestyle || 0} kg
  TOTAL ANNUAL DECAY : ${log.results.total || 0} kg CO2e
  METRIC TONS CO2e   : ${(log.results.total / 1000).toFixed(2)} TONS

PERFORMANCE COEFFICIENTS:
  - Green Score      : ${log.results.greenScore} / 1000
  - Security Clearance: ${log.results.level?.toUpperCase()}
  - Peer Compliance  : ${Math.round(log.results.percentileRank)}% (regional average: 2.0T)

==================================================
STATUS: ENCRYPTED // TELEMETRY DOWNLOAD COMPLETE
==================================================`;

    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(reportText);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `telemetry_snapshot_${log.calculatedAt.slice(0, 10)}.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Formatted chart data: map logs from progress
  const chartData = progress && progress.length > 0 
    ? [...progress].reverse().map(log => ({
        date: new Date(log.calculatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        emissions: parseFloat((log.results.total / 1000).toFixed(2))
      }))
    : [
        { date: 'Initial', emissions: 4.2 },
        { date: 'Phase 1', emissions: 3.8 }
      ];

  // Calculate projected annual savings
  const totalAnnualSavings = actions
    ? actions.reduce((sum, item) => sum + (item.savingKgPerYear || 0), 0)
    : 0;

  const fp = progress && progress.length > 0 ? progress[0].results : {
    breakdown: { transport: 1470, food: 1050, home: 1260, lifestyle: 420 },
    total: 4200,
    totalTons: 4.2
  };

  const total = fp.total || 1;
  const breakdown = fp.breakdown || {};
  const tPct = (breakdown.transport || 0) / total;
  const fPct = (breakdown.food || 0) / total;
  const hPct = (breakdown.home || 0) / total;
  const lPct = (breakdown.lifestyle || 0) / total;

  const circ = 534; // 2 * PI * 85
  const tDash = tPct * circ;
  const fDash = fPct * circ;
  const hDash = hPct * circ;
  const lDash = lPct * circ;

  const greenScore = user?.greenScore || 500;
  const level = user?.level || 'eco-warrior';
  const treesEq = Math.round(totalAnnualSavings / 21); // ~21kg CO2 per tree per year
  const nodesEq = Math.round(totalAnnualSavings / 5);

  const completed = actions || [];
  const latestActions = [...completed].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)).slice(0, 4);

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-black relative min-h-screen grid-line">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/10 animate-[scan_8s_linear_infinite] pointer-events-none z-10"></div>
      
      <div className="max-w-[1400px] mx-auto space-y-6 pb-20 relative z-20">
        
        {/* Main Title / Protocol Header */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline pb-6">
          <div>
            <div className="flex items-center gap-2 text-[10px] tracking-widest text-primary/60 mb-2">
              <span>ROOT</span>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span>ANALYTICS</span>
              <span className="material-symbols-outlined text-[10px]">chevron_right</span>
              <span className="text-primary">MISSION_PROGRESS</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-primary terminal-glow uppercase">EMISSION REDUCTION PROTOCOL</h1>
            <p className="text-primary/60 text-[10px] md:text-xs mt-2 max-w-3xl uppercase tracking-wider">
              Strategic deployment of carbon mitigation vectors. Global environmental impact telemetry streaming in real-time.
            </p>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-[10px] text-primary/60 mb-1">DATA_INTEGRITY_CHECK</div>
            <div className="flex gap-1 justify-end">
              <div className="h-1 w-8 bg-primary"></div>
              <div className="h-1 w-8 bg-primary"></div>
              <div className="h-1 w-8 bg-primary"></div>
              <div className="h-1 w-8 bg-primary/30"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          
          {/* Telemetry Vector Analysis (Main Chart) */}
          <div className="col-span-12 lg:col-span-8 border border-outline bg-surface p-6 shadow-[inset_0_0_15px_rgba(0,255,65,0.05),0_0_10px_rgba(0,255,65,0.05)] relative">
            <div className="absolute -top-[1px] -left-[1px] w-2.5 h-2.5 border-t-2 border-l-2 border-primary"></div>
            <div className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b-2 border-r-2 border-primary"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div>
                <h3 className="text-lg font-bold tracking-tight mb-1 flex items-center gap-2 text-primary">
                  <span className="w-2 h-2 bg-primary"></span>
                  TELEMETRY: VECTOR ANALYSIS
                </h3>
                <p className="text-[10px] text-primary/60 uppercase">Net CO2e attenuation index [Dynamic cycle]</p>
              </div>
              <div className="flex gap-2 text-[10px]">
                <button className="px-3 py-1 bg-primary text-black font-bold border border-primary">ALL_TIME</button>
              </div>
            </div>
            
            <div className="h-[340px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="#003B00" strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#00FF41" 
                    tick={{ fill: '#00FF41', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    tickMargin={10}
                  />
                  <YAxis 
                    stroke="#00FF41" 
                    tick={{ fill: '#00FF41', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    domain={['auto', 'auto']}
                    tickMargin={10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#050505',
                      border: '1px solid #00FF41',
                      color: '#00FF41',
                      fontFamily: 'JetBrains Mono',
                      fontSize: 12
                    }}
                    itemStyle={{ color: '#00FF41' }}
                    labelStyle={{ color: '#FFB100', fontWeight: 'bold' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="emissions" 
                    stroke="#00FF41" 
                    strokeWidth={2}
                    activeDot={{ r: 6, fill: '#00FF41' }} 
                    dot={{ stroke: '#00FF41', strokeWidth: 2, r: 4, fill: '#050505' }}
                    style={{ filter: 'drop-shadow(0 0 4px #00FF41)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Footprint Decomposition (Donut) */}
          <div className="col-span-12 lg:col-span-4 border border-outline bg-surface p-6 shadow-[inset_0_0_15px_rgba(0,255,65,0.05),0_0_10px_rgba(0,255,65,0.05)] relative flex flex-col">
            <div className="absolute -top-[1px] -left-[1px] w-2.5 h-2.5 border-t-2 border-l-2 border-primary"></div>
            <div className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b-2 border-r-2 border-primary"></div>
            
            <h3 className="text-lg font-bold tracking-tight mb-1 flex items-center gap-2 text-primary">
              <span className="w-2 h-2 bg-primary"></span>
              SEGMENT_DECOMP
            </h3>
            <p className="text-[10px] text-primary/60 uppercase mb-10">Footprint categorization [Latest Aggregate]</p>
            
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto mb-10 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" fill="transparent" r="85" stroke="#003B00" strokeWidth="12"></circle>
                <circle cx="50%" cy="50%" fill="transparent" r="85" stroke="#00FF41" strokeDasharray={`${tDash} ${circ}`} strokeWidth="12" style={{ transition: 'stroke-dasharray 1s ease-in-out' }}></circle>
                <circle cx="50%" cy="50%" fill="transparent" r="85" stroke="#00cc33" strokeDasharray={`${fDash} ${circ}`} strokeDashoffset={-tDash} strokeWidth="12" style={{ transition: 'all 1s ease-in-out' }}></circle>
                <circle cx="50%" cy="50%" fill="transparent" r="85" stroke="#009926" strokeDasharray={`${hDash} ${circ}`} strokeDashoffset={-(tDash + fDash)} strokeWidth="12" style={{ transition: 'all 1s ease-in-out' }}></circle>
                <circle cx="50%" cy="50%" fill="transparent" r="85" stroke="#006619" strokeDasharray={`${lDash} ${circ}`} strokeDashoffset={-(tDash + fDash + hDash)} strokeWidth="12" style={{ transition: 'all 1s ease-in-out' }}></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-primary terminal-glow leading-none">{fp.totalTons.toFixed(1)}</span>
                <span className="text-[9px] text-primary/60 uppercase tracking-[0.2em] font-bold mt-1">METRIC_TONS</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-y-3 mt-auto w-full">
              <div className="flex items-center justify-between text-[11px] border-b border-primary/20 pb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary"></span>
                  <span className="uppercase tracking-wider text-primary">LOGISTICS</span>
                </div>
                <span className="font-bold text-primary">{(tPct * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between text-[11px] border-b border-primary/20 pb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#00cc33]"></span>
                  <span className="uppercase tracking-wider text-primary">BIO_RESOURCES</span>
                </div>
                <span className="font-bold text-primary">{(fPct * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between text-[11px] border-b border-primary/20 pb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#009926]"></span>
                  <span className="uppercase tracking-wider text-primary">HABITAT_CORE</span>
                </div>
                <span className="font-bold text-primary">{(hPct * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#006619]"></span>
                  <span className="uppercase tracking-wider text-primary">LIFESTYLE_OP</span>
                </div>
                <span className="font-bold text-primary">{(lPct * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Impact Conversion Metrics */}
          <div className="col-span-12 md:col-span-6 lg:col-span-4 border border-outline bg-black p-6 shadow-[inset_0_0_15px_rgba(0,255,65,0.05),0_0_10px_rgba(0,255,65,0.05)] relative overflow-hidden group">
            <div className="absolute -top-[1px] -left-[1px] w-2.5 h-2.5 border-t-2 border-l-2 border-primary"></div>
            <div className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b-2 border-r-2 border-primary"></div>
            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-6xl text-primary">forest</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 bg-primary text-black text-[9px] font-bold">BIO_CONVERSION</span>
                <span className="text-[9px] text-primary/60">ID: ARBOR_52</span>
              </div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-primary/60 mb-1">Tree Matrix Equivalent</h4>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-5xl md:text-6xl font-black text-primary leading-none terminal-glow">{treesEq}</span>
                <span className="text-lg font-bold uppercase text-primary">UNITS</span>
              </div>
              <div className="text-[10px] md:text-[11px] leading-relaxed uppercase opacity-80 border-l border-primary/50 pl-3 text-primary/80">
                Biomass sequestration capacity equivalent to {treesEq} mature forestry units over 120 months.
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-4 border border-outline bg-black p-6 shadow-[inset_0_0_15px_rgba(0,255,65,0.05),0_0_10px_rgba(0,255,65,0.05)] relative overflow-hidden group">
            <div className="absolute -top-[1px] -left-[1px] w-2.5 h-2.5 border-t-2 border-l-2 border-primary"></div>
            <div className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b-2 border-r-2 border-primary"></div>
            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:scale-110 transition-transform duration-500">
              <span className="material-symbols-outlined text-6xl text-primary">electric_bolt</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 bg-primary text-black text-[9px] font-bold">ENERGY_FLUX</span>
                <span className="text-[9px] text-primary/60">ID: WATT_128</span>
              </div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-primary/60 mb-1">Grid Load Offset</h4>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-5xl md:text-6xl font-black text-primary leading-none terminal-glow">{nodesEq}</span>
                <span className="text-lg font-bold uppercase text-primary">NODES</span>
              </div>
              <div className="text-[10px] md:text-[11px] leading-relaxed uppercase opacity-80 border-l border-primary/50 pl-3 text-primary/80">
                Mitigated load equivalent to {nodesEq} high-efficiency LED nodes active 24/7/30.
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 border border-primary bg-primary/5 p-6 shadow-[inset_0_0_15px_rgba(0,255,65,0.05),0_0_10px_rgba(0,255,65,0.05)] relative flex flex-col justify-center">
            <div className="absolute -top-[1px] -left-[1px] w-2.5 h-2.5 border-t-2 border-l-2 border-primary"></div>
            <div className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b-2 border-r-2 border-primary"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary text-black flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-3xl font-bold">shield</span>
              </div>
              <div>
                <div className="text-[10px] text-primary uppercase font-bold tracking-tighter">Current_Rank:</div>
                <div className="text-lg md:text-xl font-black terminal-glow uppercase tracking-widest text-primary">{level}</div>
              </div>
            </div>
            <div className="text-[10px] md:text-[11px] uppercase tracking-tight mb-4 text-center text-primary/80">
              Collect <span className="text-primary font-bold">{Math.max(0, 1000 - greenScore)} XP</span> to unlock <span className="text-white border-b border-white">NEXT_TIER</span>.
            </div>
            <div className="w-full bg-primary/20 h-4 border border-primary/50 relative mb-2">
              <div className="bg-primary h-full shadow-[0_0_8px_#00FF41] transition-all duration-1000" style={{ width: `${Math.min(100, greenScore / 10)}%` }}></div>
              <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-black mix-blend-difference uppercase">Progress_{Math.min(100, greenScore / 10).toFixed(0)}%</div>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase text-primary/60">
              <span>{greenScore}_XP</span>
              <span>1,000_XP</span>
            </div>
          </div>

          {/* Milestone Extraction (Key Achievements) */}
          <div className="col-span-12 lg:col-span-7 border border-outline bg-surface p-6 shadow-[inset_0_0_15px_rgba(0,255,65,0.05),0_0_10px_rgba(0,255,65,0.05)] relative">
            <div className="absolute -top-[1px] -left-[1px] w-2.5 h-2.5 border-t-2 border-l-2 border-primary"></div>
            <div className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b-2 border-r-2 border-primary"></div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-primary/30 gap-4">
              <h3 className="text-lg font-bold tracking-tight uppercase flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-primary">token</span>
                MILESTONE EXTRACTION
              </h3>
              <button onClick={handleExportBadges} className="text-[10px] border border-primary text-primary px-3 py-1 hover:bg-primary hover:text-black transition-all uppercase font-bold">EXPORT_BADGE_ARRAY</button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {latestActions.map((action, i) => (
                <div key={action.id || i} className="border border-primary/50 p-4 hover:bg-primary/5 transition-all group cursor-crosshair">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 border border-primary flex items-center justify-center bg-primary/10 shrink-0">
                      <span className="material-symbols-outlined text-primary">
                        {action.category === 'transport' ? 'pedal_bike' : (action.category === 'food' ? 'eco' : (action.category === 'home' ? 'solar_power' : 'recycling'))}
                      </span>
                    </div>
                    <div className="text-[10px] md:text-[12px] font-bold terminal-glow uppercase tracking-wider text-primary truncate" title={action.title}>
                      {action.title}
                    </div>
                  </div>
                  <div className="text-[9px] md:text-[10px] text-primary/60 uppercase mb-3 line-clamp-2 h-7">{action.notes || `Protocol completed yielding ${action.savingKgPerYear}kg offset.`}</div>
                  <span className="inline-block px-2 py-0.5 border border-primary bg-primary text-black text-[9px] font-bold uppercase tracking-tighter">STATUS: VERIFIED</span>
                </div>
              ))}
              
              {latestActions.length === 0 && (
                <div className="col-span-1 sm:col-span-2 border border-primary/20 p-8 text-center text-primary/40 uppercase bg-black/40">
                  NO MILESTONES EXTRACTED. INITIATE PROTOCOLS TO POPULATE ARRAY.
                </div>
              )}
            </div>
          </div>

          {/* Terminal Report Feed */}
          <div className="col-span-12 lg:col-span-5 border border-outline bg-surface p-6 shadow-[inset_0_0_15px_rgba(0,255,65,0.05),0_0_10px_rgba(0,255,65,0.05)] relative flex flex-col">
            <div className="absolute -top-[1px] -left-[1px] w-2.5 h-2.5 border-t-2 border-l-2 border-primary"></div>
            <div className="absolute -bottom-[1px] -right-[1px] w-2.5 h-2.5 border-b-2 border-r-2 border-primary"></div>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-primary/30">
              <h3 className="text-lg font-bold tracking-tight uppercase flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-primary">list_alt</span>
                DATA_LOG_MANIFEST
              </h3>
              <div className="flex gap-2 items-center">
                <span className="w-2 h-2 bg-red-600 animate-pulse rounded-full"></span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-red-600">LIVE_FEED</span>
              </div>
            </div>
            
            <div className="space-y-4 overflow-y-auto flex-1 pr-2 max-h-[340px]">
              {progress.length > 0 ? progress.map((log, i) => (
                <div key={log.calculatedAt} onClick={() => handleDownloadLog(log)} className={`p-3 border-l-4 cursor-pointer group flex items-start justify-between transition-colors ${i === 0 ? 'border-primary bg-primary/5 hover:bg-primary/10' : 'border-primary/40 bg-black/40 hover:bg-primary/5'}`}>
                  <div className="font-mono text-[10px] md:text-[11px] space-y-1 uppercase">
                    <div className={`flex gap-2 font-bold ${i === 0 ? 'text-primary' : 'text-primary/60'}`}>
                      <span>[{new Date(log.calculatedAt).toLocaleDateString()}]</span>
                      <span>REP_ID: SNAP_{log.calculatedAt.slice(-6)}</span>
                    </div>
                    <div className="text-white opacity-90">Telemetry snapshot: {(log.results.totalTons).toFixed(2)}T CO2e recorded.</div>
                    <div className="text-[9px] text-primary/60 flex gap-4">
                      <span>SIZE: {(Math.random() * 2 + 0.5).toFixed(1)}MB</span>
                      <span>MIME: APPLICATION/PDF</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-sm text-primary group-hover:animate-bounce">download</span>
                </div>
              )) : (
                <div className="text-center text-primary/40 py-6 uppercase text-[10px]">NO TELEMETRY LOGS GENERATED.</div>
              )}
              
              <div className="text-[9px] text-center uppercase tracking-widest text-primary/40 py-4 mt-auto">
                -- END OF DATA STREAM --
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
