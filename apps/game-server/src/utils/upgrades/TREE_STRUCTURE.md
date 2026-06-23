# Upgrade Tree Structure Diagrams

## Launch Site Upgrade Tree

### Engine Type Branch
```
Chemical Engine (Lab 1)
    ↓
Ion Engine (Lab 3)
    ↓
Nuclear Engine (Lab 6)
    ↓
Plasma Engine (Lab 10)
```

**Key Stats:**
- **Chemical**: 5% launch success, 100kg payload
- **Ion**: +10% fuel efficiency vs Chemical
- **Nuclear**: +20% fuel efficiency, +25% thrust
- **Plasma**: +35% fuel efficiency, +50% thrust

### Engine Count Branch
```
(Requires Chemical Engine)
      ↓
Dual Engine Setup (Lab 2)
      ↓
Triple Engine Setup (Lab 4)
      ↓
Quad Engine Setup (Lab 6)
```

**Key Stats:**
- **Dual**: +100 thrust, +5% success
- **Triple**: +200 thrust, +300kg, +7% success
- **Quad**: +400 thrust, +600kg, +10% success

### Reusability Branch
```
(Requires Chemical Engine at Lab 5)
           ↓
Rocket Recovery Tech (Lab 5, Tech 2)
           ↓ (requires reusability tech)
Enhanced Recovery (Lab 8)
           ↓
Advanced Recovery (Lab 10, Tech 4)
```

**Key Stats:**
- **Basic**: 50% recovery chance (unlocks Return/Landing phases!)
- **Enhanced**: +25% recovery improvement
- **Advanced**: +40% recovery improvement

### Landing System Branch (Reusability-Dependent)
```
(Requires Recovery Tech)
       ↓
Landing System (Lab 6)
       ↓
Precision Landing (Lab 8)
       ↓
Autonomous Landing (Lab 10, Tech 3)
```

**Key Stats:**
- **Basic**: Enables landing phase, +5% success
- **Precision**: +15% fuel efficiency for landing
- **Autonomous**: +25% fuel efficiency, +15% recovery

### Efficiency Branch (Independent)
```
Fuel Optimization (Lab 3)        Reliability Systems (Lab 5)
       ↓
Payload Optimization (Lab 4)
```

**Key Stats:**
- **Fuel**: +5% efficiency, -3% phase time
- **Payload**: +200kg capacity, +3% success
- **Reliability**: +15% launch success (stackable)

---

## Factory Upgrade Tree

### Production Speed Branch
```
Production Optimization I (Lab 2)
           ↓
Production Optimization II (Lab 4)
           ↓
Production Optimization III (Lab 6)
```

**Key Stats:**
- **I**: +5% build speed
- **II**: +10% build speed
- **III**: +15% build speed

### Expansion/Capacity Branch
```
Expansion Module I (Lab 3)
       ↓
Expansion Module II (Lab 5)
       ↓
Mega Factory (Lab 8)
```

**Key Stats:**
- **I**: +1 pad
- **II**: +2 pads
- **III**: +3 pads

### Resource Efficiency Branch
```
Resource Optimization I (Lab 2)
           ↓
Resource Optimization II (Lab 4)
           ↓
Advanced Manufacturing (Lab 7)
```

**Key Stats:**
- **I**: -5% resource costs
- **II**: -10% resource costs
- **III**: -15% resource costs

### Quality Branch
```
Quality Control I (Lab 3)
       ↓
Quality Control II (Lab 5)
       ↓
Precision Manufacturing (Lab 8)
```

**Key Stats:**
- **I**: +5% launch success
- **II**: +10% launch success
- **III**: +15% launch success

### Automation Branch (requires Production II)
```
Production Optimization II
           ↓
Automated Assembly I (Lab 5)
           ↓
Full Automation (Lab 9)
```

**Key Stats:**
- **I**: +8% build speed
- **II**: +12% build speed

---

## Complete Launch Site Dependency Graph

```
┌─ Chemical Engine (Lab 1) [ROOT]
│  ├─ Ion Engine (Lab 3)
│  │  └─ Nuclear Engine (Lab 6)
│  │     └─ Plasma Engine (Lab 10)
│  │
│  ├─ Engine Count: 2→3→4 (Lab 2→4→6)
│  │
│  ├─ Recovery Tech (Lab 5) ─┐
│  │  ├─ Enhanced (Lab 8)     │
│  │  │  └─ Advanced (Lab 10) │
│  │  │                        │
│  │  └─ Landing System ───────┘
│  │     ├─ Precision (Lab 8)
│  │     └─ Autonomous (Lab 10)
│  │
│  └─ Efficiency ─ Fuel (Lab 3)
│                  └─ Payload (Lab 4)
│
└─ Reliability Systems (Lab 5) [INDEPENDENT]
```

---

## Launch Phases by Configuration

### Non-Reusable Rocket (Default)
```
┌──────────────────────────────────┐
│ Ignition → Ascending → Orbit Inj │
└──────────────────────────────────┘
```

### Reusable Rocket (with Recovery + Landing Tech)
```
┌─────────────────────────────────────────────────────┐
│ Ignition → Ascending → Orbit Inj → Return → Landing │
└─────────────────────────────────────────────────────┘
         (Core)                    (Reusability)
```

**Unlock Requirements:**
- **Return phase**: Requires "Rocket Recovery Technology"
- **Landing phase**: Requires "Landing System" (which requires Recovery Tech)

---

## Lab Level Progression Timeline

### Early Game (Lab 1-2)
- Chemical Engine ✓
- Fuel Optimization ✓
- Dual Engines ✓
- Production Optimization I ✓

### Mid Game (Lab 3-5)
- Ion Engine ✓
- Payload Optimization ✓
- Reliability Systems ✓
- Recovery Technology ✓
- Landing System ✓
- Expansion Modules I-II ✓
- Quality Control I-II ✓

### Late Game (Lab 6-8)
- Nuclear Engine ✓
- Triple Engines ✓
- Enhanced Recovery ✓
- Precision Landing ✓
- Quad Engines ✓
- Full expansion ✓
- Quality Control III ✓

### End Game (Lab 9-10)
- Plasma Engine ✓
- Advanced Recovery ✓
- Autonomous Landing ✓
- Full Automation ✓

---

## Bonus Stacking Example

### Scenario: Fully Upgraded Launch Site

**Selected Upgrades:**
- Chemical Engine (level 1)
- Ion Engine (level 1)
- Triple Engines (level 1)
- Recovery Tech (level 1)
- Precision Landing (level 1)
- Fuel Optimization (level 3)
- Reliability Systems (level 3)

**Launch Success Bonuses:**
- Chemical: +5%
- Ion: +8%
- Triple: +7%
- Landing: +8%
- Reliability x3: +45% (15% × 3)
- **Total: +73% (capped at 100%)**

**Fuel Efficiency Bonuses:**
- Ion: +10%
- Fuel Opt x3: +15% (5% × 3)
- Precision Landing: +15%
- **Total: +40% fuel efficiency**

**Payload Bonuses:**
- Chemical: 100kg
- Ion: +150kg
- Triple: +300kg
- Payload Opt: +200kg
- **Total: 750kg capacity**

---

## Design Patterns

### Linear Progression
```
Level I → Level II → Level III
  ↑         ↑          ↑
  └─────────┴──────────┘
  Progressive difficulty increase
```

### Branching Progression
```
               Root
              /    \
          Branch A  Branch B
           / | \    / | \
         L1 L2 L3  L1 L2 L3
```

### Optional Systems
```
Base System (Core)
     ↓
Optional Tech A
     ↓
Advanced Feature (Requires Optional A)
```

Example: Recovery → Landing is optional but unlocks new gameplay phases.

---

## Cost Curve Example

### Chemical Engine
- Level 1: 500 titanium, 200 energy, 1000 credits (1 hour)
- Level 2: 550 titanium, 220 energy, 1100 credits (1.15 hours)
- Level 3: 605 titanium, 242 energy, 1210 credits (1.32 hours)

### Ion Engine (Multiplier ×2.5 vs Chemical)
- Level 1: 1200 titanium, 500 energy, 3500 credits (2 hours)
- Level 2: 1320 titanium, 550 energy, 3850 credits (2.3 hours)
- Level 3: 1452 titanium, 605 energy, 4235 credits (2.65 hours)

**Cost increases with:**
1. Progression level (diminishing returns)
2. Technology tier (linear multiplier)

---

## Recommendation Path for New Players

1. **Start**: Chemical Engine
2. **Next**: Fuel Optimization (easy, independent)
3. **Build**: Dual Engines (requires chemicals)
4. **Upgrade**: Ion Engine (requires lab 3)
5. **Branch**:
   - Path A: Keep upgrading engines (Ion → Nuclear)
   - Path B: Explore Recovery (requires lab 5)
6. **Optional**: Landing System (unlock new phases)

This ensures players get early bonuses while opening up optional paths for advanced players.
