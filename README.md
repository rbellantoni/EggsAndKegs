# 🍳 Eggs & Kegs - A Breakfast Tavern Game 🍺

A cozy 2D tavern management game inspired by Ale and Tale Tavern, but themed around a breakfast restaurant that serves delicious morning food and drinks (including adult beverages for those who want a little extra kick with their brunch!)

## 🎮 How to Play

### Starting the Game
1. Open `index.html` in a modern web browser
2. Click "Open for Business!" to start your first day
3. Or click "How to Play" for a quick tutorial

### Gameplay Loop
1. **Greet Customers** - Customers will appear in the waiting area at the bottom. Click to seat them at empty tables.
2. **Take Orders** - Click on seated customers (showing ❓) to take their order.
3. **Cook Food** - Click on kitchen stations (stove, griddle, bar, etc.) to prepare menu items.
4. **Serve Orders** - Collect finished items and click on the customer to deliver their order.
5. **Earn Money** - Complete orders quickly for bigger tips!
6. **Upgrade** - Use your earnings to unlock new recipes, stations, and tavern upgrades.

### Kitchen Stations
- 🔥 **Stove** - Eggs, omelettes, eggs benedict
- 🍳 **Griddle** - Bacon, pancakes, french toast, hash browns
- ☕ **Coffee Machine** - Coffee, lattes, hot chocolate
- 🍺 **Bar** - Mimosas, bloody marys, beer, cocktails
- 🍊 **Juice Bar** (unlock) - Fresh OJ, smoothies
- 🧇 **Waffle Iron** (unlock) - Belgian waffles
- 🔪 **Prep Station** (unlock) - Avocado toast, quick items

### Customer Types
- 👨 **Regulars** - Standard patience and tips
- 👔 **Business People** - In a hurry, but tip well
- 👯 **Brunch Crew** - Love mimosas and fancy food
- 😵 **Hungover Friends** - Need bacon and bloody marys
- 🏃 **Health Nuts** - Prefer smoothies and light options
- 👨‍👩‍👧 **Families** - Big orders, moderate tips

### Tips for Success
- Keep an eye on customer patience bars (green → yellow → red)
- Prioritize urgent orders to prevent angry customers
- Upgrade your speed first for faster cooking
- Unlock the juice bar and waffle iron for more menu variety
- Happy customers boost your reputation = more customers!

## 🛠️ Running the Game

### Option 1: Direct File Opening
Simply open `index.html` in Chrome, Firefox, Edge, or Safari.

### Option 2: Local Server (Recommended)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (with npx)
npx serve

# Using PHP
php -S localhost:8000
```
Then open `http://localhost:8000` in your browser.

## 📁 Project Structure

```
EggsAndKegs/
├── index.html          # Main game HTML
├── css/
│   └── style.css       # Game styling and UI
├── js/
│   ├── recipes.js      # Menu items, stations, upgrades
│   ├── entities.js     # Customer, Table, Station classes
│   └── game.js         # Main game engine
└── README.md           # This file
```

## 🎨 Features

- **Cozy Breakfast Aesthetic** - Warm colors, hand-drawn feel
- **Dynamic Customer AI** - Different customer types with preferences
- **Cooking Mini-Games** - Real-time cooking with progress bars
- **Upgrade System** - Unlock recipes, stations, and decor
- **Day/Night Cycle** - Each day is a timed challenge
- **Reputation System** - Earn stars by keeping customers happy
- **Sound Effects** - Procedurally generated audio feedback

## 🍽️ Menu Items

### Breakfast Foods
- Scrambled Eggs, Sunny Side Up, Cheese Omelette
- Crispy Bacon, Hash Browns
- Pancakes, Belgian Waffles, French Toast
- Eggs Benedict, Breakfast Burrito, Avocado Toast

### Drinks
- Coffee, Latte, Hot Chocolate
- Fresh OJ, Berry Smoothie
- Mimosa, Bellini, Bloody Mary
- Irish Coffee, Screwdriver, Draft Beer

## 🔮 Future Ideas

- [ ] More customer types (critics, VIPs)
- [ ] Seasonal menu specials
- [ ] Multiplayer co-op mode
- [ ] Save/Load game progress
- [ ] Achievement system
- [ ] Custom tavern decorating
- [ ] Story mode with quests

## 📜 License

Made with 💛 for breakfast lovers everywhere. Free to play, modify, and share!

---

*"Life is too short for bad coffee and boring breakfasts!"* ☕🥓🍳

