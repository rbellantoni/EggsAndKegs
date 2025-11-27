/* ===============================================
   EGGS & KEGS - Game Entities
   =============================================== */

// Customer class
class Customer {
    constructor(id, type, tableId, gameState) {
        const customerType = CUSTOMER_TYPES.find(ct => ct.type === type) || CUSTOMER_TYPES[0];
        
        this.id = id;
        this.type = type;
        this.tableId = tableId;
        this.sprite = customerType.sprites[Math.floor(Math.random() * customerType.sprites.length)];
        this.name = this.generateName();
        this.state = 'entering'; // entering, waiting_to_order, ordered, eating, leaving, angry
        this.order = [];
        this.receivedItems = [];
        this.patience = customerType.patience * (1 + (gameState.bonuses?.patience || 0));
        this.maxPatience = this.patience;
        this.tipMultiplier = customerType.tipMultiplier * (1 + (gameState.bonuses?.tip || 0));
        this.orderSize = customerType.orderSize;
        this.preferences = customerType.preferences || null;
        this.satisfactionModifier = 0;
        this.position = { x: 0, y: 0 };
        this.targetPosition = { x: 0, y: 0 };
        this.animationFrame = 0;
    }
    
    generateName() {
        const firstNames = [
            'Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn',
            'Avery', 'Jamie', 'Drew', 'Cameron', 'Blake', 'Charlie', 'Frankie'
        ];
        return firstNames[Math.floor(Math.random() * firstNames.length)];
    }
    
    generateOrder(gameState) {
        const availableRecipes = Object.values(RECIPES).filter(r => {
            if (!r.unlocked && !(gameState.unlockedRecipes || []).includes(r.id)) return false;
            const station = STATIONS[r.station];
            if (!station.unlocked && !(gameState.unlockedStations || []).includes(station.id)) return false;
            return true;
        });
        
        if (availableRecipes.length === 0) return;
        
        const orderCount = Math.floor(Math.random() * (this.orderSize[1] - this.orderSize[0] + 1)) + this.orderSize[0];
        
        for (let i = 0; i < orderCount; i++) {
            let recipe;
            
            // Prefer preferences if available
            if (this.preferences && Math.random() < 0.7) {
                const preferredRecipes = availableRecipes.filter(r => this.preferences.includes(r.id));
                if (preferredRecipes.length > 0) {
                    recipe = preferredRecipes[Math.floor(Math.random() * preferredRecipes.length)];
                }
            }
            
            if (!recipe) {
                recipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
            }
            
            this.order.push({
                recipeId: recipe.id,
                fulfilled: false
            });
        }
    }
    
    receiveItem(recipeId) {
        const orderItem = this.order.find(o => o.recipeId === recipeId && !o.fulfilled);
        if (orderItem) {
            orderItem.fulfilled = true;
            this.receivedItems.push(recipeId);
            
            // Check if order is complete
            if (this.order.every(o => o.fulfilled)) {
                this.state = 'eating';
                setTimeout(() => {
                    if (this.state === 'eating') {
                        this.state = 'leaving';
                    }
                }, 3000);
            }
            return true;
        }
        return false;
    }
    
    calculateTip() {
        const patienceRatio = this.patience / this.maxPatience;
        let baseTip = 0;
        
        this.order.forEach(item => {
            const recipe = RECIPES[item.recipeId];
            if (recipe) {
                baseTip += recipe.price * 0.2; // 20% base tip
            }
        });
        
        // Modify tip based on patience remaining
        const tipModifier = 0.5 + (patienceRatio * 1.0); // 50% to 150% of base tip
        
        return Math.floor(baseTip * tipModifier * this.tipMultiplier);
    }
    
    calculateBill() {
        let total = 0;
        this.order.forEach(item => {
            const recipe = RECIPES[item.recipeId];
            if (recipe && item.fulfilled) {
                total += recipe.price;
            }
        });
        return total;
    }
    
    update(deltaTime) {
        // Update patience
        if (this.state === 'waiting_to_order' || this.state === 'ordered') {
            this.patience -= deltaTime;
            
            if (this.patience <= 0) {
                this.state = 'angry';
            }
        }
        
        // Move towards target
        const dx = this.targetPosition.x - this.position.x;
        const dy = this.targetPosition.y - this.position.y;
        const speed = 3;
        
        if (Math.abs(dx) > 1) {
            this.position.x += Math.sign(dx) * Math.min(speed, Math.abs(dx));
        }
        if (Math.abs(dy) > 1) {
            this.position.y += Math.sign(dy) * Math.min(speed, Math.abs(dy));
        }
        
        // Animation
        this.animationFrame = (this.animationFrame + deltaTime * 0.005) % 4;
    }
    
    getPatienceColor() {
        const ratio = this.patience / this.maxPatience;
        if (ratio > 0.6) return '#4CAF50';
        if (ratio > 0.3) return '#FF9800';
        return '#E53935';
    }
    
    getOrderDisplay() {
        return this.order.map(item => {
            const recipe = RECIPES[item.recipeId];
            return {
                icon: recipe ? recipe.icon : '❓',
                name: recipe ? recipe.name : 'Unknown',
                fulfilled: item.fulfilled
            };
        });
    }
}

// Table class
class Table {
    constructor(id, x, y, seats) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.seats = seats;
        this.width = 70 + (seats * 10);
        this.height = 50;
        this.customer = null;
    }
    
    isOccupied() {
        return this.customer !== null;
    }
    
    seatCustomer(customer) {
        this.customer = customer;
        customer.tableId = this.id;
        customer.targetPosition = { x: this.x + this.width / 2, y: this.y + 30 };
    }
    
    clearTable() {
        this.customer = null;
    }
}

// Cooking Station class
class CookingStation {
    constructor(stationData) {
        this.id = stationData.id;
        this.name = stationData.name;
        this.icon = stationData.icon;
        this.x = stationData.x;
        this.y = stationData.y;
        this.width = stationData.width;
        this.height = stationData.height;
        this.unlocked = stationData.unlocked;
        this.unlockCost = stationData.unlockCost || 0;
        
        this.currentRecipe = null;
        this.cookProgress = 0;
        this.cookTime = 0;
        this.speedBonus = 0;
        this.isReady = false;
        this.readyItem = null;
        
        // Queue system for multiple items
        this.queue = [];
        this.maxQueueSize = 5;
    }
    
    addToQueue(recipe, speedBonus = 0) {
        // If nothing is cooking and nothing is ready, start immediately
        if (!this.currentRecipe && !this.isReady) {
            this.currentRecipe = recipe;
            this.cookTime = recipe.cookTime * (1 - speedBonus);
            this.speedBonus = speedBonus;
            this.cookProgress = 0;
            return true;
        }
        
        // Otherwise add to queue if there's room
        if (this.queue.length < this.maxQueueSize) {
            this.queue.push({ recipe, speedBonus });
            return true;
        }
        
        return false; // Queue is full
    }
    
    // Legacy method for compatibility
    startCooking(recipe, speedBonus = 0) {
        return this.addToQueue(recipe, speedBonus);
    }
    
    update(deltaTime) {
        // Progress current cooking
        if (this.currentRecipe && !this.isReady) {
            this.cookProgress += deltaTime;
            
            if (this.cookProgress >= this.cookTime) {
                this.isReady = true;
                this.readyItem = this.currentRecipe;
                this.currentRecipe = null;
            }
        }
        
        // If ready item was collected and there's something in queue, start next
        if (!this.currentRecipe && !this.isReady && this.queue.length > 0) {
            const nextItem = this.queue.shift();
            this.currentRecipe = nextItem.recipe;
            this.cookTime = nextItem.recipe.cookTime * (1 - nextItem.speedBonus);
            this.speedBonus = nextItem.speedBonus;
            this.cookProgress = 0;
        }
    }
    
    collectItem() {
        if (this.isReady && this.readyItem) {
            const item = this.readyItem;
            this.readyItem = null;
            this.isReady = false;
            this.cookProgress = 0;
            return item;
        }
        return null;
    }
    
    getProgressPercent() {
        if (!this.currentRecipe) return 0;
        return Math.min(100, (this.cookProgress / this.cookTime) * 100);
    }
    
    getQueueLength() {
        return this.queue.length;
    }
    
    getTotalItemsCount() {
        let count = 0;
        if (this.currentRecipe) count++;
        if (this.isReady) count++;
        count += this.queue.length;
        return count;
    }
}

// Order Queue Manager
class OrderManager {
    constructor() {
        this.orders = [];
        this.completedOrders = 0;
    }
    
    addOrder(customer) {
        const order = {
            id: Date.now(),
            customerId: customer.id,
            customerName: customer.name,
            customerSprite: customer.sprite,
            items: customer.order.map(o => ({
                recipeId: o.recipeId,
                fulfilled: o.fulfilled
            })),
            timestamp: Date.now()
        };
        this.orders.push(order);
        return order;
    }
    
    updateOrder(customerId, recipeId) {
        const order = this.orders.find(o => o.customerId === customerId);
        if (order) {
            const item = order.items.find(i => i.recipeId === recipeId && !i.fulfilled);
            if (item) {
                item.fulfilled = true;
            }
            
            // Remove order if complete
            if (order.items.every(i => i.fulfilled)) {
                this.orders = this.orders.filter(o => o.id !== order.id);
                this.completedOrders++;
            }
        }
    }
    
    removeOrder(customerId) {
        this.orders = this.orders.filter(o => o.customerId !== customerId);
    }
    
    render(container) {
        container.innerHTML = '';
        
        if (this.orders.length === 0) {
            container.innerHTML = '<p style="color: #8D6E63; text-align: center; font-size: 0.9rem;">No orders yet!</p>';
            return;
        }
        
        this.orders.forEach(order => {
            const card = document.createElement('div');
            card.className = 'order-card';
            
            const age = Date.now() - order.timestamp;
            if (age > 45000) card.classList.add('critical');
            else if (age > 25000) card.classList.add('urgent');
            
            const itemsHtml = order.items.map(item => {
                const recipe = RECIPES[item.recipeId];
                const style = item.fulfilled ? 'opacity: 0.4; text-decoration: line-through;' : '';
                return `<span style="${style}">${recipe ? recipe.icon : '❓'}</span>`;
            }).join(' ');
            
            card.innerHTML = `
                <div class="order-customer">${order.customerSprite} ${order.customerName}</div>
                <div class="order-items">${itemsHtml}</div>
            `;
            
            container.appendChild(card);
        });
    }
}

// Particle effect for feedback
class Particle {
    constructor(x, y, emoji, velocity = { x: 0, y: -2 }) {
        this.x = x;
        this.y = y;
        this.emoji = emoji;
        this.velocity = velocity;
        this.life = 1;
        this.decay = 0.02;
        this.size = 24;
    }
    
    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.y += 0.05; // Gravity
        this.life -= this.decay;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillText(this.emoji, this.x, this.y);
        ctx.restore();
    }
    
    isDead() {
        return this.life <= 0;
    }
}

// Sound Manager (uses Web Audio API for generated sounds)
class SoundManager {
    constructor() {
        this.enabled = true;
        this.audioContext = null;
        this.initialized = false;
    }
    
    init() {
        if (this.initialized) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.log('Web Audio not supported');
            this.enabled = false;
        }
    }
    
    playTone(frequency, duration, type = 'sine') {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playSuccess() {
        this.playTone(523, 0.1); // C5
        setTimeout(() => this.playTone(659, 0.1), 100); // E5
        setTimeout(() => this.playTone(784, 0.15), 200); // G5
    }
    
    playClick() {
        this.playTone(440, 0.05, 'square');
    }
    
    playError() {
        this.playTone(200, 0.2, 'sawtooth');
    }
    
    playCoin() {
        this.playTone(880, 0.08);
        setTimeout(() => this.playTone(1108, 0.12), 80);
    }
    
    playCooking() {
        this.playTone(330, 0.1, 'triangle');
    }
}

