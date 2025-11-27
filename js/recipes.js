/* ===============================================
   EGGS & KEGS - Recipes & Menu Items
   =============================================== */

const RECIPES = {
    // === BREAKFAST FOODS ===
    scrambled_eggs: {
        id: 'scrambled_eggs',
        name: 'Scrambled Eggs',
        icon: '🍳',
        category: 'food',
        station: 'stove',
        cookTime: 3000,
        price: 8,
        unlocked: true,
        description: 'Fluffy scrambled eggs, cooked to perfection'
    },
    sunny_side_up: {
        id: 'sunny_side_up',
        name: 'Sunny Side Up',
        icon: '🌞',
        category: 'food',
        station: 'stove',
        cookTime: 4000,
        price: 10,
        unlocked: true,
        description: 'Classic sunny side up eggs'
    },
    bacon: {
        id: 'bacon',
        name: 'Crispy Bacon',
        icon: '🥓',
        category: 'food',
        station: 'griddle',
        cookTime: 4000,
        price: 7,
        unlocked: true,
        description: 'Perfectly crispy bacon strips'
    },
    pancakes: {
        id: 'pancakes',
        name: 'Pancakes',
        icon: '🥞',
        category: 'food',
        station: 'griddle',
        cookTime: 5000,
        price: 12,
        unlocked: true,
        description: 'Fluffy buttermilk pancakes'
    },
    waffles: {
        id: 'waffles',
        name: 'Belgian Waffles',
        icon: '🧇',
        category: 'food',
        station: 'waffle_iron',
        cookTime: 6000,
        price: 14,
        unlocked: false,
        unlockCost: 50,
        description: 'Crispy Belgian waffles with deep pockets'
    },
    french_toast: {
        id: 'french_toast',
        name: 'French Toast',
        icon: '🍯',
        category: 'food',
        station: 'griddle',
        cookTime: 5000,
        price: 11,
        unlocked: false,
        unlockCost: 40,
        description: 'Golden brown French toast with honey'
    },
    omelette: {
        id: 'omelette',
        name: 'Cheese Omelette',
        icon: '🧀',
        category: 'food',
        station: 'stove',
        cookTime: 6000,
        price: 15,
        unlocked: false,
        unlockCost: 60,
        description: 'Fluffy omelette with melted cheese'
    },
    hash_browns: {
        id: 'hash_browns',
        name: 'Hash Browns',
        icon: '🥔',
        category: 'food',
        station: 'griddle',
        cookTime: 5000,
        price: 6,
        unlocked: false,
        unlockCost: 30,
        description: 'Crispy shredded potato hash browns'
    },
    eggs_benedict: {
        id: 'eggs_benedict',
        name: 'Eggs Benedict',
        icon: '🥚',
        category: 'food',
        station: 'stove',
        cookTime: 8000,
        price: 18,
        unlocked: false,
        unlockCost: 100,
        description: 'Poached eggs with hollandaise on English muffin'
    },
    breakfast_burrito: {
        id: 'breakfast_burrito',
        name: 'Breakfast Burrito',
        icon: '🌯',
        category: 'food',
        station: 'griddle',
        cookTime: 7000,
        price: 16,
        unlocked: false,
        unlockCost: 80,
        description: 'Eggs, cheese, and bacon wrapped in a tortilla'
    },
    avocado_toast: {
        id: 'avocado_toast',
        name: 'Avocado Toast',
        icon: '🥑',
        category: 'food',
        station: 'prep',
        cookTime: 3000,
        price: 13,
        unlocked: false,
        unlockCost: 45,
        description: 'Smashed avocado on artisan toast'
    },
    toast: {
        id: 'toast',
        name: 'Buttered Toast',
        icon: '🍞',
        category: 'food',
        station: 'prep',
        cookTime: 2000,
        price: 4,
        unlocked: true,
        description: 'Crispy toast with butter'
    },
    sausage: {
        id: 'sausage',
        name: 'Breakfast Sausage',
        icon: '🌭',
        category: 'food',
        station: 'griddle',
        cookTime: 4500,
        price: 8,
        unlocked: true,
        description: 'Savory breakfast sausage links'
    },
    fruit_bowl: {
        id: 'fruit_bowl',
        name: 'Fresh Fruit Bowl',
        icon: '🍇',
        category: 'food',
        station: 'prep',
        cookTime: 2500,
        price: 9,
        unlocked: false,
        unlockCost: 35,
        description: 'Assorted fresh seasonal fruits'
    },
    croissant: {
        id: 'croissant',
        name: 'Butter Croissant',
        icon: '🥐',
        category: 'food',
        station: 'prep',
        cookTime: 2000,
        price: 6,
        unlocked: false,
        unlockCost: 25,
        description: 'Flaky, buttery French croissant'
    },
    
    // === DRINKS - NON-ALCOHOLIC ===
    coffee: {
        id: 'coffee',
        name: 'Coffee',
        icon: '☕',
        category: 'drink',
        station: 'coffee_machine',
        cookTime: 2000,
        price: 4,
        unlocked: true,
        description: 'Fresh brewed coffee'
    },
    orange_juice: {
        id: 'orange_juice',
        name: 'Fresh OJ',
        icon: '🍊',
        category: 'drink',
        station: 'juice_bar',
        cookTime: 2000,
        price: 5,
        unlocked: true,
        description: 'Freshly squeezed orange juice'
    },
    latte: {
        id: 'latte',
        name: 'Latte',
        icon: '🥛',
        category: 'drink',
        station: 'coffee_machine',
        cookTime: 3000,
        price: 6,
        unlocked: false,
        unlockCost: 35,
        description: 'Espresso with steamed milk'
    },
    hot_chocolate: {
        id: 'hot_chocolate',
        name: 'Hot Chocolate',
        icon: '🍫',
        category: 'drink',
        station: 'coffee_machine',
        cookTime: 2500,
        price: 5,
        unlocked: false,
        unlockCost: 25,
        description: 'Rich and creamy hot chocolate'
    },
    smoothie: {
        id: 'smoothie',
        name: 'Berry Smoothie',
        icon: '🫐',
        category: 'drink',
        station: 'juice_bar',
        cookTime: 3000,
        price: 8,
        unlocked: false,
        unlockCost: 50,
        description: 'Blended berry smoothie'
    },
    tea: {
        id: 'tea',
        name: 'Hot Tea',
        icon: '🫖',
        category: 'drink',
        station: 'coffee_machine',
        cookTime: 2000,
        price: 4,
        unlocked: true,
        description: 'Soothing hot tea'
    },
    apple_juice: {
        id: 'apple_juice',
        name: 'Apple Juice',
        icon: '🍎',
        category: 'drink',
        station: 'juice_bar',
        cookTime: 2000,
        price: 5,
        unlocked: false,
        unlockCost: 30,
        description: 'Fresh pressed apple juice'
    },
    milk: {
        id: 'milk',
        name: 'Glass of Milk',
        icon: '🥛',
        category: 'drink',
        station: 'juice_bar',
        cookTime: 1000,
        price: 3,
        unlocked: true,
        description: 'Cold fresh milk'
    },
    
    // === DRINKS - ALCOHOLIC ===
    mimosa: {
        id: 'mimosa',
        name: 'Mimosa',
        icon: '🥂',
        category: 'alcohol',
        station: 'bar',
        cookTime: 2000,
        price: 10,
        unlocked: true,
        description: 'Champagne and orange juice'
    },
    bloody_mary: {
        id: 'bloody_mary',
        name: 'Bloody Mary',
        icon: '🍅',
        category: 'alcohol',
        station: 'bar',
        cookTime: 3000,
        price: 12,
        unlocked: false,
        unlockCost: 55,
        description: 'Spicy tomato vodka cocktail'
    },
    irish_coffee: {
        id: 'irish_coffee',
        name: 'Irish Coffee',
        icon: '☘️',
        category: 'alcohol',
        station: 'bar',
        cookTime: 3500,
        price: 11,
        unlocked: false,
        unlockCost: 45,
        description: 'Coffee with Irish whiskey and cream'
    },
    beer: {
        id: 'beer',
        name: 'Draft Beer',
        icon: '🍺',
        category: 'alcohol',
        station: 'bar',
        cookTime: 1500,
        price: 7,
        unlocked: true,
        description: 'Cold draft beer from the keg'
    },
    bellini: {
        id: 'bellini',
        name: 'Bellini',
        icon: '🍑',
        category: 'alcohol',
        station: 'bar',
        cookTime: 2500,
        price: 11,
        unlocked: false,
        unlockCost: 60,
        description: 'Prosecco with peach purée'
    },
    screwdriver: {
        id: 'screwdriver',
        name: 'Screwdriver',
        icon: '🍸',
        category: 'alcohol',
        station: 'bar',
        cookTime: 2000,
        price: 9,
        unlocked: false,
        unlockCost: 40,
        description: 'Vodka and orange juice'
    },
    champagne: {
        id: 'champagne',
        name: 'Champagne',
        icon: '🍾',
        category: 'alcohol',
        station: 'bar',
        cookTime: 1500,
        price: 15,
        unlocked: false,
        unlockCost: 70,
        description: 'Bubbly celebration champagne'
    },
    white_wine: {
        id: 'white_wine',
        name: 'White Wine',
        icon: '🍷',
        category: 'alcohol',
        station: 'bar',
        cookTime: 1500,
        price: 10,
        unlocked: false,
        unlockCost: 50,
        description: 'Crisp white wine'
    },
    margarita: {
        id: 'margarita',
        name: 'Breakfast Margarita',
        icon: '🍹',
        category: 'alcohol',
        station: 'bar',
        cookTime: 3000,
        price: 13,
        unlocked: false,
        unlockCost: 65,
        description: 'Tequila sunrise with a twist'
    }
};

// Station definitions
const STATIONS = {
    stove: {
        id: 'stove',
        name: 'Stove',
        icon: '🔥',
        x: 150,
        y: 200,
        width: 80,
        height: 80,
        unlocked: true
    },
    griddle: {
        id: 'griddle',
        name: 'Griddle',
        icon: '🫓',
        x: 250,
        y: 200,
        width: 80,
        height: 80,
        unlocked: true
    },
    coffee_machine: {
        id: 'coffee_machine',
        name: 'Coffee',
        icon: '⚙️',
        x: 350,
        y: 200,
        width: 80,
        height: 80,
        unlocked: true
    },
    bar: {
        id: 'bar',
        name: 'Bar',
        icon: '🍻',
        x: 450,
        y: 200,
        width: 80,
        height: 80,
        unlocked: true
    },
    juice_bar: {
        id: 'juice_bar',
        name: 'Juice Bar',
        icon: '🧃',
        x: 550,
        y: 200,
        width: 80,
        height: 80,
        unlocked: false,
        unlockCost: 75
    },
    waffle_iron: {
        id: 'waffle_iron',
        name: 'Waffle Iron',
        icon: '🔲',
        x: 650,
        y: 200,
        width: 80,
        height: 80,
        unlocked: false,
        unlockCost: 100
    },
    prep: {
        id: 'prep',
        name: 'Prep Station',
        icon: '🔪',
        x: 750,
        y: 200,
        width: 80,
        height: 80,
        unlocked: true,
        unlockCost: 0
    }
};

// Customer types with preferences
const CUSTOMER_TYPES = [
    {
        type: 'regular',
        name: 'Regular Joe',
        sprites: ['👨', '👩', '🧑'],
        patience: 60000,
        tipMultiplier: 1.0,
        orderSize: [1, 2]
    },
    {
        type: 'business',
        name: 'Business Person',
        sprites: ['👔', '👩‍💼', '🧑‍💼'],
        patience: 40000,
        tipMultiplier: 1.5,
        orderSize: [1, 2],
        preferences: ['coffee', 'latte', 'avocado_toast']
    },
    {
        type: 'brunch_crew',
        name: 'Brunch Crew',
        sprites: ['👯', '🕺', '💃'],
        patience: 80000,
        tipMultiplier: 1.3,
        orderSize: [2, 4],
        preferences: ['mimosa', 'bellini', 'eggs_benedict', 'waffles']
    },
    {
        type: 'hungover',
        name: 'Hungover Friend',
        sprites: ['😵', '🥴', '😩'],
        patience: 90000,
        tipMultiplier: 1.2,
        orderSize: [2, 3],
        preferences: ['bloody_mary', 'bacon', 'hash_browns', 'coffee']
    },
    {
        type: 'health_nut',
        name: 'Health Enthusiast',
        sprites: ['🏃', '🧘', '🚴'],
        patience: 50000,
        tipMultiplier: 1.1,
        orderSize: [1, 2],
        preferences: ['smoothie', 'avocado_toast', 'orange_juice']
    },
    {
        type: 'family',
        name: 'Family',
        sprites: ['👨‍👩‍👧', '👨‍👩‍👦', '👩‍👧‍👦'],
        patience: 70000,
        tipMultiplier: 0.9,
        orderSize: [3, 5],
        preferences: ['pancakes', 'waffles', 'hot_chocolate', 'scrambled_eggs']
    }
];

// Upgrades available in shop
const UPGRADES = {
    recipes: Object.values(RECIPES).filter(r => !r.unlocked),
    stations: Object.values(STATIONS).filter(s => !s.unlocked),
    decor: [
        {
            id: 'fancy_tables',
            name: 'Fancy Tables',
            icon: '🪑',
            price: 150,
            description: 'Attract higher-tipping customers',
            effect: 'tipBonus',
            value: 0.1
        },
        {
            id: 'jukebox',
            name: 'Jukebox',
            icon: '🎵',
            price: 200,
            description: 'Customers wait 10% longer',
            effect: 'patienceBonus',
            value: 0.1
        },
        {
            id: 'neon_sign',
            name: 'Neon Sign',
            icon: '✨',
            price: 250,
            description: 'More customers visit each day',
            effect: 'customerBonus',
            value: 2
        },
        {
            id: 'express_grill',
            name: 'Express Grill',
            icon: '⚡',
            price: 300,
            description: 'Cook 15% faster',
            effect: 'speedBonus',
            value: 0.15
        },
        {
            id: 'comfy_booths',
            name: 'Comfy Booths',
            icon: '🛋️',
            price: 175,
            description: 'Extra seating for more customers',
            effect: 'seatingBonus',
            value: 2
        }
    ]
};

// Get recipes available at a station
function getRecipesForStation(stationId) {
    return Object.values(RECIPES).filter(r => r.station === stationId);
}

// Get unlocked recipes for a station
function getUnlockedRecipesForStation(stationId, gameState) {
    return getRecipesForStation(stationId).filter(r => {
        if (r.unlocked) return true;
        return gameState.unlockedRecipes && gameState.unlockedRecipes.includes(r.id);
    });
}

