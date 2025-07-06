const ORB_MAP = {
    "traits": ["Red", "Floating", "Black", "Metal", "Angel", "Alien", "Zombie", "Relic", "Aku"],
    "types": ["Attack", "Defense", "Massive Damage", "Resistant", "Tough Vs."],
    "encoded_types": ["Attack", "Defense", "Massive_Damage", "Resistant", "Strong"],
    "type_mults": {
        "atk": {
            "Attack": [1, 2, 3, 4, 5],
            "Massive_Damage": [1.1, 1.2, 1.3, 1.4, 1.5],
            "Strong": [1.06, 1.12, 1.18, 1.24, 1.3],
            "Colossus_Slayer": [1.05, 1.1, 1.25, 1.4, 1.6],
            "SoL_Buff": [1.05, 1.1, 1.2, 1.3, 1.5]
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
    "abilities": ["Death Mini-Surge", "Resist Wave", "Cash Back", "Resist Knockback", "Stories of Legend Buff", "Colossus Slayer"]
};
export default ORB_MAP;