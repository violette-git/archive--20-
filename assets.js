/**
 * DigDeep Game - Assets
 * Handles generation of SVG icons and visual elements
 */

const Assets = {
    /**
     * Get resource icon as SVG
     * @param {string} resourceType - Type of resource (dirt, stone, etc.)
     * @returns {string} SVG icon for the resource
     */
    getResourceIcon: function(resourceType) {
        switch (resourceType) {
            case 'dirt':
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <rect x="2" y="2" width="20" height="20" rx="2" fill="#8B4513" />
                    <circle cx="7" cy="7" r="1" fill="#5D2906" />
                    <circle cx="12" cy="10" r="1.5" fill="#5D2906" />
                    <circle cx="17" cy="15" r="1" fill="#5D2906" />
                    <circle cx="8" cy="18" r="1.2" fill="#5D2906" />
                    <circle cx="18" cy="6" r="1.3" fill="#5D2906" />
                </svg>`;
                
            case 'stone':
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="#808080" />
                    <polygon points="12,2 22,7 12,12 2,7" fill="#A0A0A0" />
                    <polygon points="12,12 22,7 22,17 12,22" fill="#606060" />
                    <polygon points="12,12 2,7 2,17 12,22" fill="#707070" />
                </svg>`;
                
            case 'copper':
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <circle cx="12" cy="12" r="10" fill="#B87333" />
                    <circle cx="12" cy="12" r="8" fill="#B87333" stroke="#D08B46" stroke-width="0.5" />
                    <path d="M8,12 Q12,6 16,12 Q12,18 8,12" fill="#D08B46" />
                </svg>`;
                
            case 'iron':
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <rect x="2" y="2" width="20" height="20" rx="1" fill="#a19d94" />
                    <line x1="2" y1="2" x2="22" y2="22" stroke="#878580" stroke-width="1" />
                    <line x1="22" y1="2" x2="2" y2="22" stroke="#878580" stroke-width="1" />
                    <rect x="6" y="6" width="12" height="12" rx="1" fill="#b8b5ad" />
                </svg>`;
                
            case 'gold':
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <circle cx="12" cy="12" r="10" fill="#FFD700" />
                    <circle cx="12" cy="12" r="8" fill="#FFD700" stroke="#FFF0A0" stroke-width="1" />
                    <polygon points="12,5 14,10 19,10 15,13 17,18 12,15 7,18 9,13 5,10 10,10" fill="#FFF0A0" />
                </svg>`;
                
            case 'diamond':
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <polygon points="12,2 20,8 12,22 4,8" fill="#b9f2ff" />
                    <polygon points="12,2 20,8 4,8" fill="#e0ffff" />
                    <polygon points="12,22 20,8 16,8" fill="#77d4e0" />
                    <polygon points="12,22 4,8 8,8" fill="#a0e6f0" />
                </svg>`;
                
            case 'emerald':
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <polygon points="12,2 20,7 20,17 12,22 4,17 4,7" fill="#50C878" />
                    <polygon points="12,2 20,7 12,12 4,7" fill="#70E898" />
                    <polygon points="12,12 20,7 20,17 12,22" fill="#30A858" />
                    <polygon points="12,12 4,7 4,17 12,22" fill="#40B868" />
                </svg>`;
                
            case 'ruby':
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <polygon points="12,2 20,7 20,17 12,22 4,17 4,7" fill="#E0115F" />
                    <polygon points="12,2 20,7 12,12 4,7" fill="#FF3377" />
                    <polygon points="12,12 20,7 20,17 12,22" fill="#C00040" />
                    <polygon points="12,12 4,7 4,17 12,22" fill="#D01050" />
                </svg>`;
                
            case 'sapphire':
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <polygon points="12,2 20,7 20,17 12,22 4,17 4,7" fill="#0F52BA" />
                    <polygon points="12,2 20,7 12,12 4,7" fill="#2F72DA" />
                    <polygon points="12,12 20,7 20,17 12,22" fill="#0032AA" />
                    <polygon points="12,12 4,7 4,17 12,22" fill="#0042BA" />
                </svg>`;
                
            default:
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <circle cx="12" cy="12" r="10" fill="#CCC" />
                </svg>`;
        }
    },
    
    /**
     * Get tool icon as SVG
     * @param {string} toolType - Type of tool (shovel, pickaxe, etc.)
     * @param {number} level - Tool level for visual enhancement
     * @returns {string} SVG icon for the tool
     */
    getToolIcon: function(toolType, level = 1) {
        // Calculate color enhancement based on level
        const enhancementColor = this.getLevelColor(level);
        
        switch (toolType) {
            case 'shovel':
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <rect x="11" y="3" width="2" height="14" fill="#8B4513" />
                    <path d="M8,16 L16,16 L12,22 Z" fill="#A0A0A0" stroke="${enhancementColor}" stroke-width="${Math.min(level, 3)}" />
                    <rect x="10" y="2" width="4" height="2" rx="1" fill="#A0A0A0" />
                </svg>`;
                
            case 'pickaxe':
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <rect x="11" y="6" width="2" height="14" fill="#8B4513" />
                    <path d="M4,6 L12,12 L20,6" fill="none" stroke="#A0A0A0" stroke-width="2" />
                    <path d="M4,6 L12,12 L20,6" fill="none" stroke="${enhancementColor}" stroke-width="${Math.min(level, 3)}" />
                </svg>`;
                
            case 'drill':
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <rect x="8" y="10" width="8" height="10" rx="1" fill="#606060" />
                    <path d="M12,2 L16,10 L8,10 Z" fill="#A0A0A0" stroke="${enhancementColor}" stroke-width="${Math.min(level, 3)}" />
                    <circle cx="12" cy="15" r="2" fill="#404040" />
                </svg>`;
                
            case 'excavator':
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <rect x="2" y="18" width="20" height="4" rx="1" fill="#606060" />
                    <rect x="4" y="14" width="4" height="4" fill="#404040" />
                    <rect x="16" y="14" width="4" height="4" fill="#404040" />
                    <path d="M6,14 L6,6 L18,6 L18,14" fill="none" stroke="#A0A0A0" stroke-width="2" />
                    <path d="M10,6 L14,2 L18,6" fill="none" stroke="${enhancementColor}" stroke-width="${Math.min(level, 3)}" />
                </svg>`;
                
            default:
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <circle cx="12" cy="12" r="10" fill="#CCC" />
                </svg>`;
        }
    },
    
    /**
     * Get consumable icon as SVG
     * @param {string} consumableType - Type of consumable
     * @returns {string} SVG icon for the consumable
     */
    getConsumableIcon: function(consumableType) {
        switch (consumableType) {
            case 'dynamite':
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <rect x="8" y="6" width="8" height="14" rx="4" fill="#FF3333" />
                    <line x1="12" y1="6" x2="12" y2="2" stroke="#000" stroke-width="1" />
                    <circle cx="12" cy="2" r="1" fill="#FF0" />
                    <text x="12" y="15" font-size="8" text-anchor="middle" fill="#FFF">TNT</text>
                </svg>`;
                
            case 'coffee':
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <path d="M5,8 L19,8 L17,20 L7,20 Z" fill="#8B4513" />
                    <path d="M7,8 L17,8 L16,18 L8,18 Z" fill="#A52A2A" />
                    <path d="M19,8 C21,8 21,11 19,11 L19,8" fill="#8B4513" />
                    <path d="M9,4 C9,4 12,3 15,4 L14,8 L10,8 Z" fill="#FFF" />
                </svg>`;
                
            case 'map':
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <path d="M4,4 L20,4 L20,20 L4,20 Z" fill="#D2B48C" />
                    <path d="M6,6 L18,6 L18,18 L6,18 Z" fill="#F5DEB3" />
                    <path d="M8,8 C8,8 10,12 12,12 C14,12 16,8 16,8" fill="none" stroke="#8B4513" stroke-width="1" />
                    <circle cx="16" cy="8" r="1" fill="#FF0000" />
                    <circle cx="8" cy="8" r="1" fill="#0000FF" />
                </svg>`;
                
            default:
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <circle cx="12" cy="12" r="10" fill="#CCC" />
                </svg>`;
        }
    },
    
    /**
     * Get special item icon as SVG
     * @param {string} itemType - Type of special item
     * @returns {string} SVG icon for the special item
     */
    getSpecialIcon: function(itemType) {
        switch (itemType) {
            case 'autoDigger':
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <circle cx="12" cy="12" r="10" fill="#404040" stroke="#606060" stroke-width="1" />
                    <circle cx="12" cy="12" r="8" fill="#505050" />
                    <path d="M8,12 L16,12 M12,8 L12,16" stroke="#A0A0A0" stroke-width="2" />
                    <circle cx="12" cy="12" r="2" fill="#707070" />
                </svg>`;
                
            case 'gemDetector':
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <rect x="4" y="4" width="16" height="12" rx="2" fill="#404040" />
                    <rect x="6" y="6" width="12" height="8" rx="1" fill="#202020" />
                    <circle cx="12" cy="10" r="4" fill="#303030" />
                    <circle cx="12" cy="10" r="3" fill="#50C878" opacity="0.7" />
                    <rect x="10" y="16" width="4" height="4" fill="#404040" />
                </svg>`;
                
            case 'luckyCharm':
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <circle cx="12" cy="12" r="10" fill="#FFD700" opacity="0.7" />
                    <path d="M12,2 L14,8 L20,8 L15,12 L17,18 L12,14 L7,18 L9,12 L4,8 L10,8 Z" fill="#FFD700" />
                </svg>`;
                
            default:
                return `<svg viewBox="0 0 24 24" width="100%" height="100%">
                    <circle cx="12" cy="12" r="10" fill="#CCC" />
                </svg>`;
        }
    },
    
    /**
     * Get color based on level for visual enhancement
     * @param {number} level - Level value
     * @returns {string} Color hex code
     */
    getLevelColor: function(level) {
        if (level <= 1) return '#C0C0C0';
        if (level <= 3) return '#FFA500';
        if (level <= 5) return '#FF4500';
        if (level <= 10) return '#9932CC';
        return '#FF00FF';
    },
    
    /**
     * Create resource gain animation
     * @param {string} resourceType - Type of resource
     * @param {number} amount - Amount gained
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    createResourceGainAnimation: function(resourceType, amount, x, y) {
        const gainElement = document.createElement('div');
        gainElement.className = `resource-gain resource-${resourceType}`;
        gainElement.textContent = `+${amount}`;
        gainElement.style.left = `${x}px`;
        gainElement.style.top = `${y}px`;
        
        document.body.appendChild(gainElement);
        
        // Remove gain element after animation completes
        setTimeout(() => {
            gainElement.remove();
        }, 1500);
    },
    
    /**
     * Create ripple effect
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    createRippleEffect: function(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        
        document.body.appendChild(ripple);
        
        // Remove ripple after animation completes
        setTimeout(() => {
            ripple.remove();
        }, 600);
    },
    
    /**
     * Create card purchase animation
     * @param {HTMLElement} card - Card element
     */
    createCardPurchaseAnimation: function(card) {
        card.classList.add('purchase-success');
        setTimeout(() => {
            card.classList.remove('purchase-success');
        }, 1000);
    },
    
    /**
     * Create card use animation
     * @param {HTMLElement} card - Card element
     */
    createCardUseAnimation: function(card) {
        card.classList.add('card-used');
        setTimeout(() => {
            card.classList.remove('card-used');
        }, 500);
    }
};