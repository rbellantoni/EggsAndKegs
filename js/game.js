/* ===============================================
   EGGS & KEGS - Main Game Engine
   =============================================== */

// Polyfill for roundRect (for older browsers)
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (typeof r === 'number') {
            r = { tl: r, tr: r, br: r, bl: r };
        } else if (typeof r === 'object') {
            r = { tl: r[0] || 0, tr: r[1] || r[0] || 0, br: r[2] || r[0] || 0, bl: r[3] || r[1] || r[0] || 0 };
        } else {
            r = { tl: 0, tr: 0, br: 0, bl: 0 };
        }
        this.beginPath();
        this.moveTo(x + r.tl, y);
        this.lineTo(x + w - r.tr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r.tr);
        this.lineTo(x + w, y + h - r.br);
        this.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
        this.lineTo(x + r.bl, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r.bl);
        this.lineTo(x, y + r.tl);
        this.quadraticCurveTo(x, y, x + r.tl, y);
        this.closePath();
        return this;
    };
}

class Game {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.state = {
            money: 50,
            day: 1,
            reputation: 1,
            timeRemaining: 300000, // 5 minutes per day
            isPaused: false,
            isRunning: false,
            unlockedRecipes: [],
            unlockedStations: [],
            ownedUpgrades: [],
            bonuses: {
                tip: 0,
                patience: 0,
                speed: 0,
                customers: 0,
                seating: 0
            }
        };
        
        // Day stats
        this.dayStats = {
            customersServed: 0,
            ordersCompleted: 0,
            tipsEarned: 0,
            totalEarnings: 0
        };
        
        // Entities
        this.tables = [];
        this.stations = {};
        this.customers = [];
        this.particles = [];
        this.waitingCustomers = [];
        
        // Systems
        this.orderManager = new OrderManager();
        this.soundManager = new SoundManager();
        
        // Held item
        this.heldItem = null;
        
        // Trash can
        this.trashCan = {
            x: 50,
            y: 120,
            width: 70,
            height: 80
        };
        
        // UI elements
        this.screens = {
            title: document.getElementById('title-screen'),
            tutorial: document.getElementById('tutorial-screen'),
            game: document.getElementById('game-screen'),
            dayEnd: document.getElementById('day-end-screen'),
            shop: document.getElementById('shop-screen'),
            pause: document.getElementById('pause-screen')
        };
        
        // Timing
        this.lastTime = 0;
        this.customerSpawnTimer = 0;
        this.customerSpawnInterval = 8000;
        this.customerId = 0;
        
        // Mouse position
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupTables();
        this.setupStations();
        this.bindEvents();
        this.showScreen('title');
        
        // Start render loop (even on title screen for animations)
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    setupCanvas() {
        const resize = () => {
            const container = document.getElementById('game-screen');
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight - 70; // Account for HUD
        };
        
        resize();
        window.addEventListener('resize', resize);
    }
    
    setupTables() {
        const baseSeating = 4;
        const bonusSeating = this.state.bonuses.seating || 0;
        const totalTables = baseSeating + bonusSeating;
        
        this.tables = [];
        const startX = 100;
        const startY = this.canvas.height - 200;
        const spacing = 180;
        
        for (let i = 0; i < totalTables; i++) {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const table = new Table(
                i,
                startX + col * spacing,
                startY - row * 100,
                Math.floor(Math.random() * 2) + 2
            );
            this.tables.push(table);
        }
    }
    
    setupStations() {
        const canvasWidth = this.canvas.width;
        const stationY = 120;
        const stationCount = Object.keys(STATIONS).length;
        const spacing = Math.min(120, (canvasWidth - 200) / stationCount);
        const startX = (canvasWidth - (stationCount * spacing)) / 2;
        
        Object.keys(STATIONS).forEach((key, index) => {
            const stationData = { ...STATIONS[key] };
            stationData.x = startX + index * spacing;
            stationData.y = stationY;
            stationData.unlocked = stationData.unlocked || this.state.unlockedStations.includes(key);
            this.stations[key] = new CookingStation(stationData);
        });
    }
    
    bindEvents() {
        // Title screen buttons
        document.getElementById('start-btn').addEventListener('click', () => {
            this.soundManager.init();
            this.soundManager.playClick();
            this.startGame();
        });
        
        document.getElementById('tutorial-btn').addEventListener('click', () => {
            this.soundManager.init();
            this.soundManager.playClick();
            this.showScreen('tutorial');
        });
        
        document.getElementById('back-to-title').addEventListener('click', () => {
            this.soundManager.playClick();
            this.showScreen('title');
        });
        
        // Game controls
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.soundManager.playClick();
            this.pauseGame();
        });
        
        document.getElementById('upgrade-btn').addEventListener('click', () => {
            this.soundManager.playClick();
            this.openShop();
        });
        
        // Pause menu
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.soundManager.playClick();
            this.resumeGame();
        });
        
        document.getElementById('quit-btn').addEventListener('click', () => {
            this.soundManager.playClick();
            this.quitToMenu();
        });
        
        // Day end
        document.getElementById('next-day-btn').addEventListener('click', () => {
            this.soundManager.playClick();
            this.startNextDay();
        });
        
        document.getElementById('shop-btn').addEventListener('click', () => {
            this.soundManager.playClick();
            this.openShop();
        });
        
        // Shop
        document.getElementById('close-shop-btn').addEventListener('click', () => {
            this.soundManager.playClick();
            this.closeShop();
        });
        
        document.querySelectorAll('.shop-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.soundManager.playClick();
                document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.renderShopItems(e.target.dataset.category);
            });
        });
        
        // Cooking modal
        document.querySelector('#cooking-modal .close-modal').addEventListener('click', () => {
            this.closeCookingModal();
        });
        
        // Canvas interactions
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Track mouse for held item
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            
            const heldItemEl = document.getElementById('held-item');
            if (this.heldItem) {
                heldItemEl.style.left = (e.clientX - 25) + 'px';
                heldItemEl.style.top = (e.clientY - 25) + 'px';
            }
        });
    }
    
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
        }
    }
    
    startGame() {
        this.state.isRunning = true;
        this.state.isPaused = false;
        this.state.timeRemaining = 300000;
        this.resetDayStats();
        this.customers = [];
        this.waitingCustomers = [];
        this.particles = [];
        this.orderManager = new OrderManager();
        this.heldItem = null;
        this.updateHeldItemDisplay();
        this.setupTables();
        this.setupStations();
        this.showScreen('game');
        this.lastTime = performance.now();
    }
    
    resetDayStats() {
        this.dayStats = {
            customersServed: 0,
            ordersCompleted: 0,
            tipsEarned: 0,
            totalEarnings: 0
        };
    }
    
    pauseGame() {
        if (!this.state.isRunning) return;
        this.state.isPaused = true;
        this.showScreen('pause');
    }
    
    resumeGame() {
        this.state.isPaused = false;
        this.showScreen('game');
        this.lastTime = performance.now();
    }
    
    quitToMenu() {
        this.state.isRunning = false;
        this.state.isPaused = false;
        this.showScreen('title');
    }
    
    endDay() {
        this.state.isRunning = false;
        
        // Calculate final stats
        this.dayStats.ordersCompleted = this.orderManager.completedOrders;
        
        // Update UI
        document.getElementById('customers-served').textContent = this.dayStats.customersServed;
        document.getElementById('orders-completed').textContent = this.dayStats.ordersCompleted;
        document.getElementById('tips-earned').textContent = '$' + this.dayStats.tipsEarned;
        document.getElementById('total-earnings').textContent = '$' + this.dayStats.totalEarnings;
        
        this.showScreen('dayEnd');
    }
    
    startNextDay() {
        this.state.day++;
        // Increase difficulty
        this.customerSpawnInterval = Math.max(4000, 8000 - (this.state.day * 300));
        this.startGame();
    }
    
    openShop() {
        this.state.isPaused = true;
        document.getElementById('shop-money-amount').textContent = this.state.money;
        this.renderShopItems('recipes');
        this.showScreen('shop');
    }
    
    closeShop() {
        if (this.screens.dayEnd.classList.contains('active')) {
            this.showScreen('dayEnd');
        } else {
            this.state.isPaused = false;
            this.showScreen('game');
            this.lastTime = performance.now();
        }
    }
    
    renderShopItems(category) {
        const container = document.getElementById('shop-items');
        container.innerHTML = '';
        
        let items = [];
        
        if (category === 'recipes') {
            items = Object.values(RECIPES).filter(r => !r.unlocked && r.unlockCost);
        } else if (category === 'stations') {
            items = Object.values(STATIONS).filter(s => !s.unlocked && s.unlockCost);
        } else if (category === 'decor') {
            items = UPGRADES.decor;
        }
        
        items.forEach(item => {
            const owned = this.state.unlockedRecipes.includes(item.id) ||
                         this.state.unlockedStations.includes(item.id) ||
                         this.state.ownedUpgrades.includes(item.id);
            
            const canAfford = this.state.money >= (item.unlockCost || item.price);
            
            const itemEl = document.createElement('div');
            itemEl.className = 'shop-item' + (owned ? ' owned' : '');
            
            itemEl.innerHTML = `
                <div class="shop-item-icon">${item.icon}</div>
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-desc">${item.description}</div>
                <div class="shop-item-price" style="${canAfford || owned ? '' : 'opacity: 0.5'}">
                    ${owned ? '✓ Owned' : `🪙 ${item.unlockCost || item.price}`}
                </div>
            `;
            
            if (!owned && canAfford) {
                itemEl.querySelector('.shop-item-price').addEventListener('click', () => {
                    this.purchaseItem(item, category);
                });
            }
            
            container.appendChild(itemEl);
        });
        
        if (items.length === 0) {
            container.innerHTML = '<p style="color: #8D6E63; text-align: center; grid-column: span 3;">Nothing available in this category!</p>';
        }
    }
    
    purchaseItem(item, category) {
        const cost = item.unlockCost || item.price;
        if (this.state.money < cost) return;
        
        this.state.money -= cost;
        this.soundManager.playCoin();
        
        if (category === 'recipes') {
            this.state.unlockedRecipes.push(item.id);
        } else if (category === 'stations') {
            this.state.unlockedStations.push(item.id);
            if (this.stations[item.id]) {
                this.stations[item.id].unlocked = true;
            }
        } else if (category === 'decor') {
            this.state.ownedUpgrades.push(item.id);
            // Apply upgrade effects
            if (item.effect === 'tipBonus') this.state.bonuses.tip += item.value;
            if (item.effect === 'patienceBonus') this.state.bonuses.patience += item.value;
            if (item.effect === 'speedBonus') this.state.bonuses.speed += item.value;
            if (item.effect === 'customerBonus') this.state.bonuses.customers += item.value;
            if (item.effect === 'seatingBonus') {
                this.state.bonuses.seating += item.value;
                this.setupTables();
            }
        }
        
        document.getElementById('shop-money-amount').textContent = this.state.money;
        this.renderShopItems(category);
        this.updateHUD();
    }
    
    handleCanvasClick(e) {
        if (!this.state.isRunning || this.state.isPaused) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check trash can click (only if holding an item)
        if (this.heldItem && this.isPointInRect(x, y, this.trashCan.x, this.trashCan.y, this.trashCan.width, this.trashCan.height)) {
            this.handleTrashClick();
            return;
        }
        
        // Check station clicks
        for (const station of Object.values(this.stations)) {
            if (this.isPointInRect(x, y, station.x, station.y, station.width, station.height)) {
                this.handleStationClick(station);
                return;
            }
        }
        
        // Check table/customer clicks
        for (const table of this.tables) {
            if (this.isPointInRect(x, y, table.x, table.y, table.width, table.height + 40)) {
                this.handleTableClick(table);
                return;
            }
        }
        
        // Check waiting area clicks
        if (y > this.canvas.height - 80 && this.waitingCustomers.length > 0) {
            this.handleWaitingAreaClick(x, y);
            return;
        }
    }
    
    handleTrashClick() {
        if (this.heldItem) {
            this.soundManager.playClick();
            this.addParticle(this.trashCan.x + this.trashCan.width/2, this.trashCan.y, '🗑️');
            this.heldItem = null;
            this.updateHeldItemDisplay();
        }
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Change cursor based on what we're hovering
        let cursor = 'default';
        
        // Trash can hover (only if holding item)
        if (this.heldItem && this.isPointInRect(x, y, this.trashCan.x, this.trashCan.y, this.trashCan.width, this.trashCan.height)) {
            cursor = 'pointer';
        }
        
        for (const station of Object.values(this.stations)) {
            if (this.isPointInRect(x, y, station.x, station.y, station.width, station.height)) {
                cursor = station.unlocked ? 'pointer' : 'not-allowed';
            }
        }
        
        for (const table of this.tables) {
            if (this.isPointInRect(x, y, table.x, table.y, table.width, table.height + 40)) {
                cursor = 'pointer';
            }
        }
        
        this.canvas.style.cursor = cursor;
    }
    
    handleStationClick(station) {
        if (!station.unlocked) {
            this.soundManager.playError();
            this.addParticle(station.x + station.width/2, station.y, '🔒');
            return;
        }
        
        // If station has ready item, pick it up
        if (station.isReady) {
            const item = station.collectItem();
            if (item) {
                this.heldItem = item;
                this.updateHeldItemDisplay();
                this.soundManager.playSuccess();
                this.addParticle(station.x + station.width/2, station.y, item.icon);
            }
            return;
        }
        
        // Open cooking modal (can add to queue even while cooking)
        this.openCookingModal(station);
    }
    
    handleTableClick(table) {
        // If we're holding an item, try to deliver it
        if (this.heldItem && table.customer) {
            const customer = table.customer;
            if (customer.state === 'ordered') {
                const accepted = customer.receiveItem(this.heldItem.id);
                if (accepted) {
                    this.soundManager.playSuccess();
                    this.orderManager.updateOrder(customer.id, this.heldItem.id);
                    this.addParticle(table.x + table.width/2, table.y, '✓');
                    this.heldItem = null;
                    this.updateHeldItemDisplay();
                    
                    // Check if order complete
                    if (customer.state === 'eating') {
                        const bill = customer.calculateBill();
                        const tip = customer.calculateTip();
                        this.state.money += bill + tip;
                        this.dayStats.tipsEarned += tip;
                        this.dayStats.totalEarnings += bill + tip;
                        this.dayStats.customersServed++;
                        this.soundManager.playCoin();
                        this.addParticle(table.x + table.width/2, table.y - 30, '💰');
                        this.updateHUD();
                    }
                } else {
                    this.soundManager.playError();
                    this.addParticle(table.x + table.width/2, table.y, '❌');
                }
            }
            return;
        }
        
        // If customer is waiting to order, take order
        if (table.customer && table.customer.state === 'waiting_to_order') {
            const customer = table.customer;
            customer.generateOrder(this.state);
            customer.state = 'ordered';
            this.orderManager.addOrder(customer);
            this.soundManager.playClick();
            this.addParticle(table.x + table.width/2, table.y, '📝');
            return;
        }
    }
    
    handleWaitingAreaClick(x, y) {
        if (this.waitingCustomers.length === 0) return;
        
        // Seat the first waiting customer at an empty table
        const emptyTable = this.tables.find(t => !t.isOccupied());
        if (emptyTable && this.waitingCustomers.length > 0) {
            const customer = this.waitingCustomers.shift();
            emptyTable.seatCustomer(customer);
            customer.state = 'waiting_to_order';
            this.customers.push(customer);
            this.soundManager.playClick();
        }
    }
    
    openCookingModal(station) {
        const modal = document.getElementById('cooking-modal');
        const stationName = document.getElementById('station-name');
        const recipeButtons = document.getElementById('recipe-buttons');
        const cookingProgress = document.getElementById('cooking-progress');
        
        // Store current station reference
        this.currentCookingStation = station;
        
        // Show queue status in title
        const queueCount = station.getTotalItemsCount();
        const queueText = queueCount > 0 ? ` (${queueCount} in queue)` : '';
        stationName.textContent = station.name + ' ' + station.icon + queueText;
        
        recipeButtons.innerHTML = '';
        cookingProgress.classList.add('hidden');
        
        const recipes = getUnlockedRecipesForStation(station.id, this.state);
        
        recipes.forEach(recipe => {
            const btn = document.createElement('button');
            btn.className = 'recipe-btn';
            btn.innerHTML = `
                <span class="recipe-icon">${recipe.icon}</span>
                <span class="recipe-name">${recipe.name}</span>
                <span class="recipe-time">${(recipe.cookTime / 1000).toFixed(1)}s</span>
            `;
            
            btn.addEventListener('click', () => {
                this.queueRecipe(station, recipe);
            });
            
            recipeButtons.appendChild(btn);
        });
        
        if (recipes.length === 0) {
            recipeButtons.innerHTML = '<p style="color: #8D6E63; text-align: center;">No recipes available for this station!</p>';
        }
        
        modal.classList.remove('hidden');
        this.state.isPaused = true;
    }
    
    closeCookingModal() {
        document.getElementById('cooking-modal').classList.add('hidden');
        this.currentCookingStation = null;
        this.state.isPaused = false;
        this.lastTime = performance.now();
    }
    
    queueRecipe(station, recipe) {
        if (station.addToQueue(recipe, this.state.bonuses.speed)) {
            this.soundManager.playCooking();
            
            // Show particle feedback
            this.addParticle(station.x + station.width/2, station.y, recipe.icon);
            
            // Auto-close the modal
            this.closeCookingModal();
        } else {
            // Queue is full
            this.soundManager.playError();
            this.addParticle(station.x + station.width/2, station.y, '❌');
        }
    }
    
    // Legacy method for compatibility
    startCooking(station, recipe) {
        this.queueRecipe(station, recipe);
    }
    
    updateHeldItemDisplay() {
        const heldItemEl = document.getElementById('held-item');
        const heldItemIcon = document.getElementById('held-item-icon');
        
        if (this.heldItem) {
            heldItemIcon.textContent = this.heldItem.icon;
            heldItemEl.classList.remove('hidden');
        } else {
            heldItemEl.classList.add('hidden');
        }
    }
    
    spawnCustomer() {
        const emptyTables = this.tables.filter(t => !t.isOccupied()).length;
        const maxWaiting = 3;
        
        if (this.waitingCustomers.length >= maxWaiting) return;
        if (emptyTables === 0 && this.waitingCustomers.length > 0) return;
        
        const typeIndex = Math.floor(Math.random() * CUSTOMER_TYPES.length);
        const customerType = CUSTOMER_TYPES[typeIndex];
        
        const customer = new Customer(
            this.customerId++,
            customerType.type,
            null,
            this.state
        );
        
        // Position in waiting area
        customer.position = {
            x: 50 + (this.waitingCustomers.length * 60),
            y: this.canvas.height - 50
        };
        customer.targetPosition = { ...customer.position };
        
        // If there's an empty table, seat immediately
        const emptyTable = this.tables.find(t => !t.isOccupied());
        if (emptyTable) {
            emptyTable.seatCustomer(customer);
            customer.state = 'waiting_to_order';
            this.customers.push(customer);
        } else {
            customer.state = 'waiting';
            this.waitingCustomers.push(customer);
        }
    }
    
    addParticle(x, y, emoji) {
        const velocity = {
            x: (Math.random() - 0.5) * 4,
            y: -3 - Math.random() * 2
        };
        this.particles.push(new Particle(x, y, emoji, velocity));
    }
    
    isPointInRect(px, py, rx, ry, rw, rh) {
        return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
    }
    
    updateHUD() {
        document.getElementById('money-amount').textContent = this.state.money;
        document.getElementById('day-number').textContent = this.state.day;
        
        const minutes = Math.floor(this.state.timeRemaining / 60000);
        const seconds = Math.floor((this.state.timeRemaining % 60000) / 1000);
        document.getElementById('time-remaining').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Update reputation stars
        const stars = document.querySelectorAll('#reputation-stars .star');
        stars.forEach((star, index) => {
            star.classList.toggle('filled', index < this.state.reputation);
        });
    }
    
    update(deltaTime) {
        if (!this.state.isRunning || this.state.isPaused) return;
        
        // Update time
        this.state.timeRemaining -= deltaTime;
        if (this.state.timeRemaining <= 0) {
            this.endDay();
            return;
        }
        
        // Spawn customers
        this.customerSpawnTimer += deltaTime;
        const spawnInterval = this.customerSpawnInterval - (this.state.bonuses.customers * 500);
        if (this.customerSpawnTimer >= spawnInterval) {
            this.spawnCustomer();
            this.customerSpawnTimer = 0;
        }
        
        // Update stations
        Object.values(this.stations).forEach(station => {
            station.update(deltaTime);
        });
        
        // Update customers
        this.customers.forEach(customer => {
            customer.update(deltaTime);
        });
        
        // Handle angry/leaving customers
        this.customers = this.customers.filter(customer => {
            if (customer.state === 'angry') {
                const table = this.tables.find(t => t.id === customer.tableId);
                if (table) table.clearTable();
                this.orderManager.removeOrder(customer.id);
                this.state.reputation = Math.max(1, this.state.reputation - 0.5);
                this.addParticle(customer.position.x, customer.position.y, '😠');
                return false;
            }
            if (customer.state === 'leaving') {
                const table = this.tables.find(t => t.id === customer.tableId);
                if (table) table.clearTable();
                this.state.reputation = Math.min(5, this.state.reputation + 0.1);
                return false;
            }
            return true;
        });
        
        // Update particles
        this.particles = this.particles.filter(p => {
            p.update();
            return !p.isDead();
        });
        
        // Update HUD
        this.updateHUD();
        
        // Update order queue display
        this.orderManager.render(document.getElementById('orders-list'));
    }
    
    render() {
        const ctx = this.ctx;
        
        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw kitchen area
        this.drawKitchenArea();
        
        // Draw trash can
        this.drawTrashCan();
        
        // Draw stations
        Object.values(this.stations).forEach(station => {
            this.drawStation(station);
        });
        
        // Draw tables
        this.tables.forEach(table => {
            this.drawTable(table);
        });
        
        // Draw waiting area
        this.drawWaitingArea();
        
        // Draw particles
        this.particles.forEach(p => p.render(ctx));
    }
    
    drawTrashCan() {
        const ctx = this.ctx;
        const { x, y, width, height } = this.trashCan;
        
        // Trash can shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(x + width/2, y + height + 3, width/2, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Trash can body
        const gradient = ctx.createLinearGradient(x, y, x + width, y);
        gradient.addColorStop(0, '#5D5D5D');
        gradient.addColorStop(0.5, '#808080');
        gradient.addColorStop(1, '#5D5D5D');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x + 5, y + 15, width - 10, height - 15, [0, 0, 8, 8]);
        ctx.fill();
        
        // Trash can lid
        ctx.fillStyle = '#707070';
        ctx.beginPath();
        ctx.roundRect(x, y, width, 18, [8, 8, 0, 0]);
        ctx.fill();
        
        // Lid handle
        ctx.fillStyle = '#505050';
        ctx.beginPath();
        ctx.roundRect(x + width/2 - 12, y + 3, 24, 8, 4);
        ctx.fill();
        
        // Trash icon
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillText('🗑️', x + width/2, y + height/2 + 8);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Label
        ctx.font = '11px Fredoka';
        ctx.fillStyle = '#FFF8E7';
        ctx.fillText('TRASH', x + width/2, y + height + 15);
        
        // Highlight if holding an item (show it's clickable)
        if (this.heldItem) {
            ctx.strokeStyle = '#FF6B6B';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.roundRect(x - 3, y - 3, width + 6, height + 6, 10);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }
    
    drawBackground() {
        const ctx = this.ctx;
        
        // Floor
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#5D4037');
        gradient.addColorStop(0.3, '#6D4C41');
        gradient.addColorStop(1, '#4E342E');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Floor planks
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 2;
        for (let y = 200; y < this.canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
        
        // Vertical plank lines
        for (let x = 0; x < this.canvas.width; x += 100) {
            for (let y = 200; y < this.canvas.height; y += 40) {
                const offset = (Math.floor(y / 40) % 2) * 50;
                ctx.beginPath();
                ctx.moveTo(x + offset, y);
                ctx.lineTo(x + offset, y + 40);
                ctx.stroke();
            }
        }
    }
    
    drawKitchenArea() {
        const ctx = this.ctx;
        const kitchenHeight = 180;
        
        // Kitchen counter background
        const gradient = ctx.createLinearGradient(0, 0, 0, kitchenHeight);
        gradient.addColorStop(0, '#8D6E63');
        gradient.addColorStop(1, '#6D4C41');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvas.width, kitchenHeight);
        
        // Counter edge
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(0, kitchenHeight - 10, this.canvas.width, 10);
        
        // Counter top shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, kitchenHeight - 12, this.canvas.width, 2);
        
        // Kitchen tiles pattern
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        for (let x = 0; x < this.canvas.width; x += 30) {
            for (let y = 0; y < kitchenHeight - 20; y += 30) {
                ctx.fillRect(x + 2, y + 2, 26, 26);
            }
        }
    }
    
    drawStation(station) {
        const ctx = this.ctx;
        const x = station.x;
        const y = station.y;
        const w = station.width;
        const h = station.height;
        
        // Station shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(x + w/2, y + h + 5, w/2, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Station base
        if (station.unlocked) {
            const gradient = ctx.createLinearGradient(x, y, x, y + h);
            gradient.addColorStop(0, '#BCAAA4');
            gradient.addColorStop(1, '#8D6E63');
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = '#666';
        }
        
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 10);
        ctx.fill();
        
        // Station border
        ctx.strokeStyle = station.unlocked ? '#5D4037' : '#444';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Station icon (with shadow for visibility) - BIGGER SIZE
        ctx.font = '42px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText(station.icon, x + w/2, y + h/2 - 8);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Station name
        ctx.font = '12px Fredoka';
        ctx.fillStyle = station.unlocked ? '#FFF8E7' : '#999';
        ctx.fillText(station.name, x + w/2, y + h - 10);
        
        // Lock icon for locked stations
        if (!station.unlocked) {
            ctx.font = '20px Arial';
            ctx.fillText('🔒', x + w/2, y + 15);
        }
        
        // Cooking progress indicator
        if (station.currentRecipe) {
            const progress = station.getProgressPercent();
            
            // Progress bar background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.roundRect(x + 5, y + h + 8, w - 10, 10, 5);
            ctx.fill();
            
            // Progress bar fill
            ctx.fillStyle = '#FFB923';
            ctx.beginPath();
            ctx.roundRect(x + 5, y + h + 8, (w - 10) * (progress / 100), 10, 5);
            ctx.fill();
            
            // Show what's cooking
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 2;
            ctx.fillText(station.currentRecipe.icon, x + w/2, y - 8);
            ctx.shadowBlur = 0;
        }
        
        // Queue indicators (show queued items as small icons)
        if (station.queue.length > 0) {
            const queueY = y - 25;
            const iconSize = 14;
            const spacing = 18;
            const startX = x + w/2 - ((station.queue.length - 1) * spacing) / 2;
            
            // Queue background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.beginPath();
            ctx.roundRect(startX - 12, queueY - 10, station.queue.length * spacing + 8, 22, 8);
            ctx.fill();
            
            // Queue label
            ctx.font = '10px Fredoka';
            ctx.fillStyle = '#FFF';
            ctx.textAlign = 'center';
            ctx.fillText('Q', startX - 18, queueY + 3);
            
            // Draw each queued item
            ctx.font = `${iconSize}px Arial`;
            station.queue.forEach((queuedItem, index) => {
                ctx.fillText(queuedItem.recipe.icon, startX + index * spacing, queueY + 4);
            });
        }
        
        // Ready indicator
        if (station.isReady) {
            // Show the ready item icon
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 3;
            ctx.fillText(station.readyItem.icon, x + w/2, y - 10);
            ctx.fillText('✨', x + w - 5, y + 10);
            ctx.shadowBlur = 0;
            
            // Pulsing glow
            const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
            ctx.shadowColor = '#4CAF50';
            ctx.shadowBlur = 20 * pulse;
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(x - 2, y - 2, w + 4, h + 4, 12);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }
    
    drawTable(table) {
        const ctx = this.ctx;
        const x = table.x;
        const y = table.y;
        const w = table.width;
        const h = table.height;
        
        // Table shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(x + w/2, y + h + 8, w/2 + 5, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Table top
        const gradient = ctx.createLinearGradient(x, y, x, y + h);
        gradient.addColorStop(0, '#D4A574');
        gradient.addColorStop(1, '#B8956E');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 8);
        ctx.fill();
        
        // Table edge
        ctx.strokeStyle = '#8D6E63';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Table cloth pattern
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.roundRect(x + 5, y + 5, w - 10, h - 10, 5);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw customer if seated
        if (table.customer) {
            this.drawCustomer(table.customer, x + w/2, y - 20);
        }
    }
    
    drawCustomer(customer, x, y) {
        const ctx = this.ctx;
        
        // Customer sprite (with shadow) - BIGGER SIZE
        ctx.font = '44px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fillText(customer.sprite, x, y);
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Order bubble background and items above head
        if (customer.state === 'ordered' && customer.order.length > 0) {
            const iconSize = 28;
            const iconSpacing = 32;
            const totalWidth = customer.order.length * iconSpacing;
            const startX = x - totalWidth / 2 + iconSpacing / 2;
            const bubbleY = y - 55;
            
            // Draw bubble background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.roundRect(x - totalWidth/2 - 8, bubbleY - 18, totalWidth + 16, 36, 10);
            ctx.fill();
            ctx.strokeStyle = '#8D6E63';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw bubble pointer
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.moveTo(x - 8, bubbleY + 18);
            ctx.lineTo(x, bubbleY + 28);
            ctx.lineTo(x + 8, bubbleY + 18);
            ctx.fill();
            
            // Draw all order items
            ctx.font = `${iconSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            
            customer.order.forEach((orderItem, index) => {
                const recipe = RECIPES[orderItem.recipeId];
                if (recipe) {
                    const itemX = startX + index * iconSpacing;
                    
                    if (orderItem.fulfilled) {
                        // Fulfilled items are faded with checkmark
                        ctx.globalAlpha = 0.4;
                        ctx.fillText(recipe.icon, itemX, bubbleY);
                        ctx.globalAlpha = 1;
                        ctx.font = '14px Arial';
                        ctx.fillText('✓', itemX + 10, bubbleY + 10);
                        ctx.font = `${iconSize}px Arial`;
                    } else {
                        // Unfulfilled items are bright
                        ctx.fillText(recipe.icon, itemX, bubbleY);
                    }
                }
            });
            
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
        
        // Patience bar (moved below the order bubble)
        if (customer.state === 'waiting_to_order' || customer.state === 'ordered') {
            const barWidth = 60;
            const barHeight = 8;
            const barX = x - barWidth/2;
            const barY = y - 90;
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.beginPath();
            ctx.roundRect(barX, barY, barWidth, barHeight, 4);
            ctx.fill();
            
            const patiencePercent = customer.patience / customer.maxPatience;
            ctx.fillStyle = customer.getPatienceColor();
            ctx.beginPath();
            ctx.roundRect(barX, barY, barWidth * patiencePercent, barHeight, 4);
            ctx.fill();
        }
        
        // Waiting to order indicator
        if (customer.state === 'waiting_to_order') {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.font = '28px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('❓', x, y - 50);
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
        
        // Eating indicator
        if (customer.state === 'eating') {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.font = '28px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('😋', x, y - 50);
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
    }
    
    drawWaitingArea() {
        const ctx = this.ctx;
        const areaY = this.canvas.height - 70;
        
        // Waiting area background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, areaY, this.canvas.width, 70);
        
        // Label
        ctx.font = '14px Fredoka';
        ctx.fillStyle = '#FFF8E7';
        ctx.textAlign = 'left';
        ctx.fillText('Waiting: ' + this.waitingCustomers.length, 10, areaY + 20);
        
        // Draw waiting customers (with shadow) - BIGGER SIZE
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        this.waitingCustomers.forEach((customer, index) => {
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(customer.sprite, 70 + index * 55, areaY + 45);
        });
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Click hint
        if (this.waitingCustomers.length > 0) {
            const emptyTable = this.tables.find(t => !t.isOccupied());
            if (emptyTable) {
                ctx.font = '12px Fredoka';
                ctx.fillStyle = '#FFB923';
                ctx.fillText('(Click to seat)', 10, areaY + 60);
            }
        }
    }
    
    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Cap deltaTime to prevent huge jumps
        const cappedDelta = Math.min(deltaTime, 100);
        
        this.update(cappedDelta);
        this.render();
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }
}

// Start the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});

