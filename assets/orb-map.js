const ORB_MAP = {
    "traits": ["Red", "Floating", "Black", "Metal", "Angel", "Alien", "Zombie", "Relic", "Aku"],
    "types": ["Attack", "Defense", "Massive Damage", "Resistant", "Tough Vs."],
    "encoded_types": ["Attack", "Defense", "Massive_Damage", "Resistant", "Strong"],
    "type_mults": {
        "atk": {
            "Attack": [1, 2, 3, 4, 5],
            "Massive_Damage": [0.1, 0.2, 0.3, 0.4, 0.5],
            "Strong": [0.06, 0.12, 0.18, 0.24, 0.3],
            "Colossus_Slayer": [0.05, 0.1, 0.25, 0.4, 0.6],
            "SoL_Buff": [0.05, 0.1, 0.2, 0.3, 0.5]
        },
        "def": {
            "Defense": [1.04, 1.08, 1.12, 1.16, 1.2],
            "Resistant": [1.05, 1.1, 1.15, 1.2, 1.25],
            "Strong": [1.02, 1.04, 1.06, 1.08, 1.1],
            "Colossus_Slayer": [1.05, 1.1, 1.15, 1.2, 1.3],
            "SoL_Buff": [1.05, 1.1, 1.2, 1.3, 1.5]
        }
    },
    "ranks": ["D", "C", "B", "A", "S"],
    "abilities": ["Death Mini-Surge", "Resist Wave", "Cash Back", "Resist Knockback", "Stories of Legend Buff", "Colossus Slayer", "Cat Cannon Charge", "Resistant To Toxic", "Dodge Attack", "Resist Slow", "Resist Curse", "Uncanny Legends Buff", "Single Surge Counter", "Berserker", "Shortened Cooldown", "Resist Freeze", "Resist Weaken"]
};
export default ORB_MAP;