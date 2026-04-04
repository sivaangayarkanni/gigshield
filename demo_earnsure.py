from nicegui import ui
import asyncio
import random

# CONFIG: UI Styling and Assets
BG_IMAGE = 'assets/bg.png'

# DESIGN SYSTEM (Tailwind + Custom CSS)
CSS = """
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #030712; color: #F9FAFB; }
    .glass-card { background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(24px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); padding: 2rem; }
    .text-gradient { background: linear-gradient(135deg, #F97316 0%, #06B6D4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .glow-orange { box-shadow: 0 0 40px rgba(249, 115, 22, 0.15); }
"""

# --- STATE ---
class EarnSureState:
    def __init__(self):
        self.workers_covered = 14240
        self.total_payouts = 3200000
        self.aqi = 142
        self.risk_score = 72
        self.scan_status = "System Idle"
        self.scanning = False

state = EarnSureState()

# --- ACTIONS ---
async def start_ai_scan():
    state.scanning = True
    state.scan_status = "Initializing Neural Network..."
    ui.notify("AI Scan Started", type='info')
    await asyncio.sleep(1)
    state.scan_status = "Scanning Local Grid..."
    await asyncio.sleep(1.5)
    state.scan_status = "Analyzing Causality Nodes..."
    await asyncio.sleep(2)
    state.scan_status = "Fraud Check Complete: CLEAR"
    ui.notify("Security Alert: System Nominal", type='positive')
    await asyncio.sleep(3)
    state.scan_status = "System Idle"
    state.scanning = False

def update_sim():
    state.aqi += random.randint(-5, 5)
    state.aqi = max(50, min(500, state.aqi))
    state.workers_covered += random.randint(0, 2)
    ui.update()

# --- UI LAYOUT ---

@ui.page('/')
def main_page():
    # GOOGLE FONTS & STYLES (Inside page function)
    ui.add_head_html('<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">')
    ui.add_head_html(f'<style>{CSS}</style>')
    
    # Full Screen Background

    ui.image(BG_IMAGE).classes('fixed top-0 left-0 w-full h-full object-cover opacity-30 z-[-1]')
    
    with ui.column().classes('w-full max-w-[1400px] mx-auto p-12 gap-12'):
        # HEADER
        with ui.row().classes('w-full justify-between items-end'):
            with ui.column():
                ui.label('EarnSure').classes('text-6xl font-black tracking-tighter text-gradient leading-tight')
                ui.label('LOGISTICS INTELLIGENCE • CAUSALITY ENGINE v5.0').classes('text-[10px] font-black text-slate-500 tracking-[0.4em] uppercase opacity-60')
            
            with ui.row().classes('gap-8 items-center bg-slate-900/40 p-4 px-8 rounded-full border border-white/5 backdrop-blur-xl'):
                ui.label('SYSTEM STATUS').classes('text-[10px] font-black text-slate-500 uppercase tracking-widest')
                ui.badge('● NOMINAL', color='emerald-500').classes('font-black text-[10px] py-1 px-3 shadow-[0_0_15px_rgba(16,185,129,0.3)]')

        # CORE DASHBOARD
        with ui.row().classes('w-full gap-12'):
            # STATS GRID
            with ui.column().classes('flex-1 gap-10'):
                with ui.row().classes('w-full gap-10'):
                    with ui.column().classes('glass-card flex-1'):
                        ui.label('NETWORK REACH').classes('text-[11px] font-black text-slate-500 tracking-widest uppercase mb-4')
                        ui.label().bind_text_from(state, 'workers_covered', lambda x: f'{x:,}').classes('text-5xl font-black leading-none tracking-tighter')
                        ui.label('ACTIVE GIG OPERATORS').classes('text-[9px] font-black text-orange-500 tracking-widest mt-4 uppercase')
                    
                    with ui.column().classes('glass-card flex-1'):
                        ui.label('INSTANT PAYOUTS').classes('text-[11px] font-black text-slate-500 tracking-widest uppercase mb-4')
                        ui.label().bind_text_from(state, 'total_payouts', lambda x: f'₹{(x/100000):.1f}L').classes('text-5xl font-black leading-none tracking-tighter text-emerald-400')
                        ui.label('SETTLED VIA UPI-CORE').classes('text-[9px] font-black text-emerald-500/50 tracking-widest mt-4 uppercase')

                # AI ACTION AREA
                with ui.column().classes('glass-card w-full border-orange-500/20 glow-orange'):
                    with ui.row().classes('w-full justify-between items-center mb-8'):
                        ui.label('AI CAUSALITY ENGINE').classes('text-2xl font-black tracking-tight')
                        ui.button('INITIATE BROADCAST', on_click=start_ai_scan).classes('bg-white text-slate-950 font-black px-10 py-4 rounded-full hover:scale-105 transition-all text-xs tracking-widest uppercase').bind_enabled_from(state, 'scanning', backward=lambda x: not x)
                    
                    ui.label().bind_text_from(state, 'scan_status').classes('text-sm font-mono text-orange-500/80 mb-6 italic')
                    with ui.row().classes('w-full h-1 bg-white/5 rounded-full overflow-hidden'):
                         ui.row().classes('h-full bg-orange-500').bind_visibility_from(state, 'scanning').style('animation: shimmer 1.5s infinite linear; width: 100%')

            # RIGHT PANEL: TELEMETRY
            with ui.column().classes('w-[400px] gap-8'):
                with ui.column().classes('glass-card w-full bg-slate-950/60'):
                    ui.label('REAL-TIME TELEMETRY').classes('text-[11px] font-black text-slate-500 tracking-widest uppercase mb-8')
                    
                    # AQI SENSOR
                    with ui.row().classes('w-full justify-between items-center mb-6'):
                        ui.label('ATMOSPHERIC AQI').classes('text-[10px] font-black text-slate-400 uppercase tracking-tighter')
                        ui.label().bind_text_from(state, 'aqi').classes('text-2xl font-black')
                    
                    # SENSOR SNAPSHOT
                    with ui.column().classes('bg-slate-900/50 p-6 rounded-3xl border border-white/5 w-full'):
                        ui.label('SENSOR NODE: DL-NCR-04').classes('text-[9px] font-black text-slate-600 uppercase mb-4')
                        ui.label('PARAMETRIC TRIGGER: ACTIVE').classes('text-[11px] font-black text-orange-500 tracking-widest uppercase')
                
                with ui.column().classes('glass-card w-full bg-orange-500/10 border-orange-500/20'):
                     ui.label('RISK ALERT').classes('text-[11px] font-black text-orange-500 tracking-widest uppercase mb-4')
                     ui.label('STORM DETECTION: 14%').classes('text-md font-black text-white')
                     ui.label('Broadcast scheduled in T-42s').classes('text-[10px] font-bold text-slate-500 uppercase mt-2')

    # Simulation Timer
    ui.timer(3.0, update_sim)

# --- RUN ENGINE ---
ui.run(title='EarnSure AI Demo', port=8080, dark=True)
