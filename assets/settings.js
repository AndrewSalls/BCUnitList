const SETTINGS = {
    "version": "2.0",
    "gameVersion": "14.4",
    "unitCount": 810,
    "skipImages": [339, 729, 732, 734, 739, 755, 761, 764, 770, 775, 782, 800, 802],
    "chapters": {
        "eoc": {
            "name": "Empire of Cats",
            "treasureNames": ["Energy Drink", "Giant Safe", "Relativity Clock", "Philosopher's Stone", "Smart Material Wall", "Super Register", "Legendary Cat Shield", "Legendary Cat Sword", "Energy Core", "Turbo Machine", "Management Bible"],
            "treasurePartCount": [7, 4, 5, 7, 3, 3, 3, 7, 6, 1, 2],
            "numberChapters": 3
        },
        "itf": {
            "name": "Into the Future",
            "treasureNames": ["Aqua Crystal", "Plasma Crystal", "Ancient Tablet", "Mysterious Force", "Cosmic Energy", "Void Fruit", "Blood Fruit", "Sky Fruit", "Heaven's Fruit", "Time Machine", "Future Tech"],
            "treasurePartCount": [8, 8, 3, 1, 5, 4, 4, 4, 4, 5, 2],
            "numberChapters": 3
        },
        "cotc": {
            "name": "Cats of the Cosmos",
            "treasureNames": ["Stellar Garnet", "Phoebe Beryl", "Lunar Citrine", "Ganymede Topaz", "Callisto Amethyst", "Titanium Fruit", "Antimatter Fruit", "Enigma Fruit", "Dark Matter", "Neutrino", "Mystery Mask"],
            "treasurePartCount": [5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 3],
            "numberChapters": 3
        },
    },
    "ototo": {
        "cannon": 30,
        "base": 20,
        "style": 20,
        "names": ["Default", "Slow Beam", "Iron Wall", "Thunderbolt", "Waterblast", "Holy Blast", "Breakerblast", "Curseblast"]
    },
    "abilities": {
        "abilityNames": ["Cat Cannon Power", "Cat Cannon Range", "Cat Cannon Charge", "Worker Cat Rate", "Worker Cat Wallet", "Base Defense", "Research", "Accounting", "Study", "Cat Energy"],
        "levelCaps": [20, 10, 20, 20, 20, 20, 20, 20, 20, 20],
        "plusLevelCaps": [10, 0, 10, 10, 10, 10, 10, 10, 10, 10],
        "costs": {
            "CGSxpAmt": 2000,
            "xpAmt": [
                [0,500,1000,1500,2000,2500,3000,3500,4000,4500,500,100,2000,4000,5000,6000,7000,8000,9000, 10000],
                [0,1000,2000,3000,4000,5000,6000,7000,8000,9000,1000,2000,4000,8000,10000,12000,14000,16000,18000, 20000],
                [0,1000,2000,4000,8000,12000,16000,20000,24000,28000,1000,2000,4000,8000,16000,24000,32000,40000,48000,56000]
            ],
            "costTypes": [2, 0, 0, 1, 1, 1, 1, 1, 1, 1]
        }
    },
    "categoryTypes": ["collabs", "event_units", "gacha_non_uber", "gacha_seasonal", "gacha_uber", "other", "seasonal_events", "small_collabs", "story_units"],
    "traits": ["Red", "Floating", "Black", "Metal", "Angel", "Alien", "Zombie", "Relic", "Aku", "Traitless"],
    "targettingAbilities": ["Omnistrike", "Long_Distance", "Multi_Hit"],
    "statGrowth": {
        "rarity": {
            "N": [60],
            "EX": [60],
            "RR": [70, 90],
            "SR": [60, 80],
            "UR": [60, 80],
            "LR": [60, 80]
        },
        "unique": {
            "25": [30],
            "91": [20],
            "92": [20],
            "93": [20],
            "94": [20],
            "95": [20],
            "96": [20],
            "97": [20],
            "98": [20],
            "99": [20]
        },
        "P2W": {
            "558": [[20, 0.2], [30, 0.6], [40, 1.2], [50, 1.8]],
            "735": [[20, 0.2], [30, 1.2], [40, 1], [50, 0.8]],
            "784": [[20, 0.2], [30, 0.8], [40, 0.4], [50, 0.8]]
        }
    },
    "traitEffectMult": {
        "atk": {
            "Strong": [1.5, 0.3],
            "Massive_Damage": [3, 1],
            "Insane_Damage": [5, 6],
            "Colossus_Slayer": [1.6, 0],
            "Behemoth_Slayer": [2.5, 0],
            "Sage_Slayer": [1.2, 0]
        },
        "def": {
            "Strong": [2, 0.5],
            "Resistant": [4, 5],
            "Insane_Resistance": [6, 7],
            "Colossus_Slayer": [1.3, 0],
            "Behemoth_Slayer": [1.4, 0],
            "Sage_Slayer": [2, 0]
        },
        "trait": {
            "Black": ["Void Fruit", "itf"],
            "Red": ["Blood Fruit", "itf"],
            "Floating": ["Sky Fruit", "itf"],
            "Angel": ["Heaven's Fruit", "itf"],
            "Metal": ["Titanium Fruit", "cotc"],
            "Zombie": ["Antimatter Fruit", "cotc"],
            "Alien": ["Enigma Fruit", "cotc"]
        }
    }
};
export default SETTINGS;