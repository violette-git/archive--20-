/**
 * Assets.js - SVG definitions and rendering functions for Dig Deep game
 * Contains visual assets and animation functions for the digging-themed incremental game
 */

const GameAssets = (function() {
    // Color palette based on config.js and style.css
    const colors = {
        dirt: '#8B4513',
        stone: '#696969',
        gems: '#1E90FF',
        background: '#222',
        surface: '#3D2817',
        deepCave: '#4B0082',
        hazardWarning: '#FF4500',
        hazardDanger: '#FF0000',
        achievement: '#FFD700',
        buttonPrimary: '#4CAF50',
        buttonHover: '#45a049',
        textLight: '#FFFFFF',
        textDark: '#333333'
    };

    // SVG Namespace
    const svgNS = "http://www.w3.org/2000/svg";

    /**
     * Creates an SVG element with specified attributes
     * @param {string} type - SVG element type
     * @param {Object} attrs - Attributes to set on the element
     * @returns {SVGElement} - The created SVG element
     */
    function createSVGElement(type, attrs = {}) {
        const element = document.createElementNS(svgNS, type);
        for (const [key, value] of Object.entries(attrs)) {
            element.setAttribute(key, value);
        }
        return element;
    }

    /**
     * Creates a complete SVG with specified content and attributes
     * @param {number} width - SVG width
     * @param {number} height - SVG height
     * @param {Array} content - Array of SVG elements to include
     * @param {Object} attrs - Additional attributes for the SVG
     * @returns {SVGElement} - Complete SVG element
     */
    function createSVG(width, height, content = [], attrs = {}) {
        const svg = createSVGElement('svg', {
            width: width,
            height: height,
            viewBox: `0 0 ${width} ${height}`,
            xmlns: svgNS,
            ...attrs
        });
        
        content.forEach(element => svg.appendChild(element));
        return svg;
    }

    // ===== DIGGING AREA ASSETS =====

    /**
     * Creates a layered digging background based on current depth
     * @param {number} width - Width of the digging area
     * @param {number} height - Height of the digging area
     * @param {number} currentDepth - Current digging depth
     * @param {Object} layerInfo - Information about the current layer
     * @returns {SVGElement} - SVG representation of the digging area
     */
    function createDiggingSite(width, height, currentDepth, layerInfo) {
        // Create base SVG
        const digSite = createSVG(width, height, [], {
            class: 'digging-site'
        });
        
        // Add gradient background representing layers of earth
        const defs = createSVGElement('defs');
        const gradient = createSVGElement('linearGradient', {
            id: 'earthGradient',
            x1: '0%',
            y1: '0%',
            x2: '0%',
            y2: '100%'
        });
        
        // Add gradient stops based on depth
        const gradientStops = [
            { offset: '0%', color: layerInfo.color || colors.surface },
            { offset: '100%', color: getNextLayerColor(layerInfo) }
        ];
        
        gradientStops.forEach(stop => {
            const gradientStop = createSVGElement('stop', {
                offset: stop.offset,
                'stop-color': stop.color
            });
            gradient.appendChild(gradientStop);
        });
        
        defs.appendChild(gradient);
        digSite.appendChild(defs);
        
        // Create background rectangle with gradient
        const background = createSVGElement('rect', {
            width: '100%',
            height: '100%',
            fill: 'url(#earthGradient)'
        });
        digSite.appendChild(background);
        
        // Add texture pattern to represent soil/rock
        addEarthTexture(digSite, width, height, layerInfo);
        
        return digSite;
    }
    
    /**
     * Adds texture to the digging area based on the current layer
     * @param {SVGElement} parent - Parent SVG element
     * @param {number} width - Width of the area
     * @param {number} height - Height of the area
     * @param {Object} layerInfo - Information about the current layer
     */
    function addEarthTexture(parent, width, height, layerInfo) {
        // Create a group for texture elements
        const textureGroup = createSVGElement('g', {
            class: 'earth-texture'
        });
        
        // Different texture patterns based on layer type
        const layerType = layerInfo.name.toLowerCase();
        
        if (layerType.includes('dirt') || layerType.includes('soil')) {
            // Dirt texture - small irregular dots
            for (let i = 0; i < 100; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = 1 + Math.random() * 3;
                
                const dot = createSVGElement('circle', {
                    cx: x,
                    cy: y,
                    r: size,
                    fill: adjustColor(layerInfo.color, -20),
                    opacity: 0.5 + Math.random() * 0.5
                });
                
                textureGroup.appendChild(dot);
            }
        } else if (layerType.includes('stone') || layerType.includes('rock')) {
            // Stone texture - angular lines and cracks
            for (let i = 0; i < 30; i++) {
                const x1 = Math.random() * width;
                const y1 = Math.random() * height;
                const x2 = x1 + (Math.random() * 30 - 15);
                const y2 = y1 + (Math.random() * 30 - 15);
                
                const crack = createSVGElement('line', {
                    x1: x1,
                    y1: y1,
                    x2: x2,
                    y2: y2,
                    stroke: adjustColor(layerInfo.color, -30),
                    'stroke-width': 1 + Math.random(),
                    opacity: 0.3 + Math.random() * 0.4
                });
                
                textureGroup.appendChild(crack);
            }
        } else if (layerType.includes('crystal') || layerType.includes('gem')) {
            // Crystal/gem texture - sparkles and facets
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = 2 + Math.random() * 5;
                
                // Create a small star/sparkle
                const sparkle = createSVGElement('polygon', {
                    points: `${x},${y-size} ${x+size/4},${y-size/4} ${x+size},${y} ${x+size/4},${y+size/4} ${x},${y+size} ${x-size/4},${y+size/4} ${x-size},${y} ${x-size/4},${y-size/4}`,
                    fill: '#FFFFFF',
                    opacity: 0.1 + Math.random() * 0.3
                });
                
                textureGroup.appendChild(sparkle);
            }
        } else {
            // Default texture for other layers - subtle dots
            for (let i = 0; i < 80; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                
                const dot = createSVGElement('circle', {
                    cx: x,
                    cy: y,
                    r: 1,
                    fill: '#FFFFFF',
                    opacity: 0.1 + Math.random() * 0.2
                });
                
                textureGroup.appendChild(dot);
            }
        }
        
        parent.appendChild(textureGroup);
    }
    
    /**
     * Gets the color for the next layer based on current layer
     * @param {Object} currentLayer - Current layer information
     * @returns {string} - Color for the next layer
     */
    function getNextLayerColor(currentLayer) {
        // If we have next layer info, use it, otherwise darken current color
        if (currentLayer.nextLayer && currentLayer.nextLayer.color) {
            return currentLayer.nextLayer.color;
        }
        return adjustColor(currentLayer.color, -20); // Darken current color
    }
    
    /**
     * Adjusts a hex color by the specified amount
     * @param {string} color - Hex color to adjust
     * @param {number} amount - Amount to adjust (-255 to 255)
     * @returns {string} - Adjusted hex color
     */
    function adjustColor(color, amount) {
        let usePound = false;
        
        if (color[0] === "#") {
            color = color.slice(1);
            usePound = true;
        }
        
        const num = parseInt(color, 16);
        let r = (num >> 16) + amount;
        let g = ((num >> 8) & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;
        
        r = Math.max(Math.min(255, r), 0);
        g = Math.max(Math.min(255, g), 0);
        b = Math.max(Math.min(255, b), 0);
        
        return (usePound ? "#" : "") + (g | (r << 8) | (b << 16)).toString(16).padStart(6, '0');
    }

    // ===== TOOL ASSETS =====

    /**
     * Creates an SVG representation of a digging tool
     * @param {string} toolType - Type of tool (shovel, pickaxe, drill, etc.)
     * @param {number} level - Tool level
     * @param {number} size - Size of the SVG
     * @returns {SVGElement} - SVG representation of the tool
     */
    function createToolIcon(toolType, level = 1, size = 50) {
        const toolSVG = createSVG(size, size, [], {
            class: `tool-icon tool-${toolType}`
        });
        
        // Base colors for tools
        const baseColors = {
            shovel: { handle: '#8B4513', head: '#C0C0C0' },
            pickaxe: { handle: '#8B4513', head: '#A9A9A9' },
            drill: { body: '#696969', bit: '#C0C0C0' },
            dynamite: { body: '#FF0000', fuse: '#8B4513' },
            helper: { body: '#4682B4', hat: '#FFD700' }
        };
        
        // Enhance colors based on level
        const colors = enhanceColorsByLevel(baseColors[toolType] || baseColors.shovel, level);
        
        // Draw the appropriate tool based on type
        switch (toolType.toLowerCase()) {
            case 'shovel':
                drawShovel(toolSVG, size, colors, level);
                break;
            case 'pickaxe':
                drawPickaxe(toolSVG, size, colors, level);
                break;
            case 'drill':
                drawDrill(toolSVG, size, colors, level);
                break;
            case 'dynamite':
                drawDynamite(toolSVG, size, colors, level);
                break;
            case 'helper':
                drawHelper(toolSVG, size, colors, level);
                break;
            default:
                // Default generic tool
                drawGenericTool(toolSVG, size, colors, level);
        }
        
        // Add level indicator
        if (level > 1) {
            const levelBadge = createSVGElement('circle', {
                cx: size - 10,
                cy: 10,
                r: 8,
                fill: '#FFD700',
                stroke: '#000',
                'stroke-width': 1
            });
            toolSVG.appendChild(levelBadge);
            
            const levelText = createSVGElement('text', {
                x: size - 10,
                y: 13,
                'font-size': '10px',
                'text-anchor': 'middle',
                'font-weight': 'bold',
                fill: '#000'
            });
            levelText.textContent = level;
            toolSVG.appendChild(levelText);
        }
        
        return toolSVG;
    }
    
    /**
     * Enhances colors based on tool level
     * @param {Object} baseColors - Base colors for the tool
     * @param {number} level - Tool level
     * @returns {Object} - Enhanced colors
     */
    function enhanceColorsByLevel(baseColors, level) {
        const enhancedColors = {...baseColors};
        
        if (level >= 5) {
            // Gold-infused for high levels
            for (const key in enhancedColors) {
                enhancedColors[key] = blendColors(enhancedColors[key], '#FFD700', 0.3);
            }
        } else if (level >= 3) {
            // Slightly enhanced for medium levels
            for (const key in enhancedColors) {
                enhancedColors[key] = adjustColor(enhancedColors[key], 20);
            }
        }
        
        return enhancedColors;
    }
    
    /**
     * Blends two colors together
     * @param {string} color1 - First color (hex)
     * @param {string} color2 - Second color (hex)
     * @param {number} ratio - Blend ratio (0-1)
     * @returns {string} - Blended color
     */
    function blendColors(color1, color2, ratio) {
        // Convert hex to RGB
        const hex2rgb = (hex) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return [r, g, b];
        };
        
        // Convert RGB to hex
        const rgb2hex = (rgb) => {
            return "#" + rgb.map(x => {
                const hex = Math.round(x).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('');
        };
        
        const rgb1 = hex2rgb(color1);
        const rgb2 = hex2rgb(color2);
        
        // Blend the colors
        const blended = rgb1.map((channel, i) => {
            return channel * (1 - ratio) + rgb2[i] * ratio;
        });
        
        return rgb2hex(blended);
    }
    
    /**
     * Draws a shovel icon
     * @param {SVGElement} svg - SVG element to draw on
     * @param {number} size - Size of the SVG
     * @param {Object} colors - Colors for the shovel
     * @param {number} level - Tool level
     */
    function drawShovel(svg, size, colors, level) {
        // Handle
        const handle = createSVGElement('rect', {
            x: size * 0.4,
            y: size * 0.2,
            width: size * 0.2,
            height: size * 0.6,
            fill: colors.handle,
            rx: size * 0.05
        });
        
        // Shovel head
        const head = createSVGElement('path', {
            d: `M${size * 0.25} ${size * 0.2} 
                Q${size * 0.5} ${size * 0.05} ${size * 0.75} ${size * 0.2} 
                L${size * 0.6} ${size * 0.3} 
                Q${size * 0.5} ${size * 0.25} ${size * 0.4} ${size * 0.3} 
                Z`,
            fill: colors.head,
            stroke: '#000',
            'stroke-width': 1
        });
        
        svg.appendChild(handle);
        svg.appendChild(head);
        
        // Add embellishments for higher levels
        if (level >= 3) {
            const shine = createSVGElement('ellipse', {
                cx: size * 0.5,
                cy: size * 0.18,
                rx: size * 0.15,
                ry: size * 0.05,
                fill: 'white',
                opacity: 0.5
            });
            svg.appendChild(shine);
        }
    }
    
    /**
     * Draws a pickaxe icon
     * @param {SVGElement} svg - SVG element to draw on
     * @param {number} size - Size of the SVG
     * @param {Object} colors - Colors for the pickaxe
     * @param {number} level - Tool level
     */
    function drawPickaxe(svg, size, colors, level) {
        // Handle
        const handle = createSVGElement('rect', {
            x: size * 0.45,
            y: size * 0.25,
            width: size * 0.1,
            height: size * 0.65,
            fill: colors.handle,
            rx: size * 0.02
        });
        
        // Pickaxe head
        const head = createSVGElement('path', {
            d: `M${size * 0.15} ${size * 0.25} 
                L${size * 0.45} ${size * 0.35} 
                L${size * 0.55} ${size * 0.35} 
                L${size * 0.85} ${size * 0.25} 
                L${size * 0.75} ${size * 0.15} 
                L${size * 0.55} ${size * 0.25} 
                L${size * 0.45} ${size * 0.25} 
                L${size * 0.25} ${size * 0.15} 
                Z`,
            fill: colors.head,
            stroke: '#000',
            'stroke-width': 1
        });
        
        svg.appendChild(handle);
        svg.appendChild(head);
        
        // Add embellishments for higher levels
        if (level >= 3) {
            const shine = createSVGElement('path', {
                d: `M${size * 0.25} ${size * 0.18} 
                    L${size * 0.35} ${size * 0.22} 
                    L${size * 0.45} ${size * 0.25}`,
                stroke: 'white',
                'stroke-width': 1,
                fill: 'none',
                opacity: 0.6
            });
            svg.appendChild(shine);
            
            const shine2 = createSVGElement('path', {
                d: `M${size * 0.75} ${size * 0.18} 
                    L${size * 0.65} ${size * 0.22} 
                    L${size * 0.55} ${size * 0.25}`,
                stroke: 'white',
                'stroke-width': 1,
                fill: 'none',
                opacity: 0.6
            });
            svg.appendChild(shine2);
        }
    }
    
    /**
     * Draws a drill icon
     * @param {SVGElement} svg - SVG element to draw on
     * @param {number} size - Size of the SVG
     * @param {Object} colors - Colors for the drill
     * @param {number} level - Tool level
     */
    function drawDrill(svg, size, colors, level) {
        // Drill body
        const body = createSVGElement('path', {
            d: `M${size * 0.3} ${size * 0.7} 
                L${size * 0.3} ${size * 0.4} 
                Q${size * 0.3} ${size * 0.3} ${size * 0.4} ${size * 0.3} 
                L${size * 0.6} ${size * 0.3} 
                Q${size * 0.7} ${size * 0.3} ${size * 0.7} ${size * 0.4} 
                L${size * 0.7} ${size * 0.7} 
                Z`,
            fill: colors.body,
            stroke: '#000',
            'stroke-width': 1
        });
        
        // Drill bit
        const bit = createSVGElement('path', {
            d: `M${size * 0.4} ${size * 0.3} 
                L${size * 0.5} ${size * 0.1} 
                L${size * 0.6} ${size * 0.3} 
                Z`,
            fill: colors.bit,
            stroke: '#000',
            'stroke-width': 1
        });
        
        // Handle
        const handle = createSVGElement('rect', {
            x: size * 0.35,
            y: size * 0.7,
            width: size * 0.3,
            height: size * 0.15,
            fill: colors.body,
            rx: size * 0.05
        });
        
        svg.appendChild(body);
        svg.appendChild(bit);
        svg.appendChild(handle);
        
        // Add embellishments for higher levels
        if (level >= 3) {
            // Add drill ridges
            for (let i = 0; i < 3; i++) {
                const ridge = createSVGElement('line', {
                    x1: size * 0.5,
                    y1: size * 0.1 + (i * size * 0.05),
                    x2: size * (0.5 - 0.05 * (i + 1)),
                    y2: size * (0.3 - 0.02 * i),
                    stroke: '#000',
                    'stroke-width': 1
                });
                svg.appendChild(ridge);
                
                const ridge2 = createSVGElement('line', {
                    x1: size * 0.5,
                    y1: size * 0.1 + (i * size * 0.05),
                    x2: size * (0.5 + 0.05 * (i + 1)),
                    y2: size * (0.3 - 0.02 * i),
                    stroke: '#000',
                    'stroke-width': 1
                });
                svg.appendChild(ridge2);
            }
            
            // Add button
            const button = createSVGElement('circle', {
                cx: size * 0.5,
                cy: size * 0.75,
                r: size * 0.03,
                fill: 'red'
            });
            svg.appendChild(button);
        }
    }
    
    /**
     * Draws a dynamite icon
     * @param {SVGElement} svg - SVG element to draw on
     * @param {number} size - Size of the SVG
     * @param {Object} colors - Colors for the dynamite
     * @param {number} level - Tool level
     */
    function drawDynamite(svg, size, colors, level) {
        // Dynamite stick
        const stick = createSVGElement('rect', {
            x: size * 0.35,
            y: size * 0.3,
            width: size * 0.3,
            height: size * 0.5,
            fill: colors.body,
            rx: size * 0.05
        });
        
        // Fuse
        const fuse = createSVGElement('path', {
            d: `M${size * 0.5} ${size * 0.3} 
                Q${size * 0.55} ${size * 0.25} ${size * 0.6} ${size * 0.2} 
                Q${size * 0.65} ${size * 0.15} ${size * 0.7} ${size * 0.1}`,
            fill: 'none',
            stroke: colors.fuse,
            'stroke-width': size * 0.03
        });
        
        svg.appendChild(stick);
        svg.appendChild(fuse);
        
        // Add warning stripes
        for (let i = 0; i < 3; i++) {
            const stripe = createSVGElement('rect', {
                x: size * 0.35,
                y: size * (0.35 + i * 0.15),
                width: size * 0.3,
                height: size * 0.05,
                fill: '#000',
                opacity: 0.7
            });
            svg.appendChild(stripe);
        }
        
        // Add embellishments for higher levels
        if (level >= 3) {
            // Add spark/flame at the end of the fuse
            const spark = createSVGElement('circle', {
                cx: size * 0.7,
                cy: size * 0.1,
                r: size * 0.05,
                fill: 'yellow'
            });
            svg.appendChild(spark);
            
            const sparkInner = createSVGElement('circle', {
                cx: size * 0.7,
                cy: size * 0.1,
                r: size * 0.025,
                fill: 'orange'
            });
            svg.appendChild(sparkInner);
        }
    }
    
    /**
     * Draws a helper icon
     * @param {SVGElement} svg - SVG element to draw on
     * @param {number} size - Size of the SVG
     * @param {Object} colors - Colors for the helper
     * @param {number} level - Tool level
     */
    function drawHelper(svg, size, colors, level) {
        // Helper body
        const body = createSVGElement('circle', {
            cx: size * 0.5,
            cy: size * 0.55,
            r: size * 0.25,
            fill: colors.body
        });
        
        // Helper head
        const head = createSVGElement('circle', {
            cx: size * 0.5,
            cy: size * 0.35,
            r: size * 0.15,
            fill: '#FFE4C4'
        });
        
        // Helper hat
        const hat = createSVGElement('path', {
            d: `M${size * 0.3} ${size * 0.3} 
                L${size * 0.7} ${size * 0.3} 
                L${size * 0.5} ${size * 0.15} 
                Z`,
            fill: colors.hat,
            stroke: '#000',
            'stroke-width': 1
        });
        
        // Helper eyes
        const leftEye = createSVGElement('circle', {
            cx: size * 0.45,
            cy: size * 0.33,
            r: size * 0.03,
            fill: '#000'
        });
        
        const rightEye = createSVGElement('circle', {
            cx: size * 0.55,
            cy: size * 0.33,
            r: size * 0.03,
            fill: '#000'
        });
        
        // Helper smile
        const smile = createSVGElement('path', {
            d: `M${size * 0.43} ${size * 0.4} 
                Q${size * 0.5} ${size * 0.45} ${size * 0.57} ${size * 0.4}`,
            fill: 'none',
            stroke: '#000',
            'stroke-width': 1
        });
        
        svg.appendChild(body);
        svg.appendChild(head);
        svg.appendChild(hat);
        svg.appendChild(leftEye);
        svg.appendChild(rightEye);
        svg.appendChild(smile);
        
        // Add embellishments for higher levels
        if (level >= 3) {
            // Add tool in hand
            const tool = createSVGElement('path', {
                d: `M${size * 0.6} ${size * 0.6} 
                    L${size * 0.8} ${size * 0.7} 
                    L${size * 0.75} ${size * 0.75} 
                    L${size * 0.55} ${size * 0.65} 
                    Z`,
                fill: '#A9A9A9',
                stroke: '#000',
                'stroke-width': 1
            });
            svg.appendChild(tool);
            
            // Add hat emblem
            const emblem = createSVGElement('circle', {
                cx: size * 0.5,
                cy: size * 0.25,
                r: size * 0.03,
                fill: '#FF0000'
            });
            svg.appendChild(emblem);
        }
    }
    
    /**
     * Draws a generic tool icon
     * @param {SVGElement} svg - SVG element to draw on
     * @param {number} size - Size of the SVG
     * @param {Object} colors - Colors for the tool
     * @param {number} level - Tool level
     */
    function drawGenericTool(svg, size, colors, level) {
        // Simple tool shape
        const tool = createSVGElement('rect', {
            x: size * 0.3,
            y: size * 0.2,
            width: size * 0.4,
            height: size * 0.6,
            fill: colors.handle || '#8B4513',
            rx: size * 0.05
        });
        
        const head = createSVGElement('rect', {
            x: size * 0.2,
            y: size * 0.2,
            width: size * 0.6,
            height: size * 0.2,
            fill: colors.head || '#A9A9A9',
            rx: size * 0.05
        });
        
        svg.appendChild(tool);
        svg.appendChild(head);
    }

    // ===== RESOURCE ASSETS =====

    /**
     * Creates an SVG representation of a resource
     * @param {string} resourceType - Type of resource (dirt, stone, gems)
     * @param {number} size - Size of the SVG
     * @returns {SVGElement} - SVG representation of the resource
     */
    function createResourceIcon(resourceType, size = 40) {
        const resourceSVG = createSVG(size, size, [], {
            class: `resource-icon resource-${resourceType}`
        });
        
        switch (resourceType.toLowerCase()) {
            case 'dirt':
                drawDirtIcon(resourceSVG, size);
                break;
            case 'stone':
                drawStoneIcon(resourceSVG, size);
                break;
            case 'gems':
                drawGemsIcon(resourceSVG, size);
                break;
            default:
                drawGenericResourceIcon(resourceSVG, size, resourceType);
        }
        
        return resourceSVG;
    }
    
    /**
     * Draws a dirt resource icon
     * @param {SVGElement} svg - SVG element to draw on
     * @param {number} size - Size of the SVG
     */
    function drawDirtIcon(svg, size) {
        // Main dirt pile
        const dirtPile = createSVGElement('path', {
            d: `M${size * 0.1} ${size * 0.7} 
                Q${size * 0.2} ${size * 0.5} ${size * 0.3} ${size * 0.6} 
                Q${size * 0.4} ${size * 0.4} ${size * 0.5} ${size * 0.5} 
                Q${size * 0.6} ${size * 0.3} ${size * 0.7} ${size * 0.5} 
                Q${size * 0.8} ${size * 0.6} ${size * 0.9} ${size * 0.7} 
                Z`,
            fill: colors.dirt,
            stroke: '#000',
            'stroke-width': 1
        });
        
        svg.appendChild(dirtPile);
        
        // Add texture dots
        for (let i = 0; i < 10; i++) {
            const x = size * (0.2 + Math.random() * 0.6);
            const y = size * (0.5 + Math.random() * 0.15);
            
            const dot = createSVGElement('circle', {
                cx: x,
                cy: y,
                r: size * 0.02,
                fill: adjustColor(colors.dirt, -30),
                opacity: 0.7
            });
            
            svg.appendChild(dot);
        }
    }
    
    /**
     * Draws a stone resource icon
     * @param {SVGElement} svg - SVG element to draw on
     * @param {number} size - Size of the SVG
     */
    function drawStoneIcon(svg, size) {
        // Main stone shape
        const stone = createSVGElement('path', {
            d: `M${size * 0.3} ${size * 0.3} 
                L${size * 0.7} ${size * 0.3} 
                L${size * 0.8} ${size * 0.5} 
                L${size * 0.7} ${size * 0.7} 
                L${size * 0.3} ${size * 0.7} 
                L${size * 0.2} ${size * 0.5} 
                Z`,
            fill: colors.stone,
            stroke: '#000',
            'stroke-width': 1
        });
        
        svg.appendChild(stone);
        
        // Add texture lines
        const line1 = createSVGElement('line', {
            x1: size * 0.4,
            y1: size * 0.3,
            x2: size * 0.3,
            y2: size * 0.5,
            stroke: adjustColor(colors.stone, -30),
            'stroke-width': 1,
            opacity: 0.7
        });
        
        const line2 = createSVGElement('line', {
            x1: size * 0.6,
            y1: size * 0.3,
            x2: size * 0.7,
            y2: size * 0.5,
            stroke: adjustColor(colors.stone, -30),
            'stroke-width': 1,
            opacity: 0.7
        });
        
        svg.appendChild(line1);
        svg.appendChild(line2);
    }
    
    /**
     * Draws a gems resource icon
     * @param {SVGElement} svg - SVG element to draw on
     * @param {number} size - Size of the SVG
     */
    function drawGemsIcon(svg, size) {
        // Main gem shape
        const gem = createSVGElement('path', {
            d: `M${size * 0.5} ${size * 0.2} 
                L${size * 0.7} ${size * 0.4} 
                L${size * 0.5} ${size * 0.8} 
                L${size * 0.3} ${size * 0.4} 
                Z`,
            fill: colors.gems,
            stroke: '#000',
            'stroke-width': 1
        });
        
        svg.appendChild(gem);
        
        // Add facet lines
        const facet1 = createSVGElement('line', {
            x1: size * 0.5,
            y1: size * 0.2,
            x2: size * 0.5,
            y2: size * 0.8,
            stroke: 'white',
            'stroke-width': 1,
            opacity: 0.5
        });
        
        const facet2 = createSVGElement('line', {
            x1: size * 0.3,
            y1: size * 0.4,
            x2: size * 0.7,
            y2: size * 0.4,
            stroke: 'white',
            'stroke-width': 1,
            opacity: 0.5
        });
        
        svg.appendChild(facet1);
        svg.appendChild(facet2);
        
        // Add sparkle
        const sparkle = createSVGElement('circle', {
            cx: size * 0.4,
            cy: size * 0.3,
            r: size * 0.03,
            fill: 'white',
            opacity: 0.8
        });
        
        svg.appendChild(sparkle);
    }
    
    /**
     * Draws a generic resource icon
     * @param {SVGElement} svg - SVG element to draw on
     * @param {number} size - Size of the SVG
     * @param {string} resourceType - Type of resource
     */
    function drawGenericResourceIcon(svg, size, resourceType) {
        // Default resource color based on type
        let color = '#A9A9A9';
        if (resourceType.includes('dirt') || resourceType.includes('soil')) {
            color = colors.dirt;
        } else if (resourceType.includes('stone') || resourceType.includes('rock')) {
            color = colors.stone;
        } else if (resourceType.includes('gem') || resourceType.includes('crystal')) {
            color = colors.gems;
        }
        
        // Simple circular resource
        const resource = createSVGElement('circle', {
            cx: size * 0.5,
            cy: size * 0.5,
            r: size * 0.3,
            fill: color,
            stroke: '#000',
            'stroke-width': 1
        });
        
        svg.appendChild(resource);
    }

    // ===== HAZARD ASSETS =====

    /**
     * Creates an SVG representation of a hazard
     * @param {string} hazardType - Type of hazard (caveIn, gasLeak, lavaFlow)
     * @param {string} state - State of the hazard (warning, active)
     * @param {number} size - Size of the SVG
     * @returns {SVGElement} - SVG representation of the hazard
     */
    function createHazardIcon(hazardType, state = 'warning', size = 60) {
        const hazardSVG = createSVG(size, size, [], {
            class: `hazard-icon hazard-${hazardType} hazard-${state}`
        });
        
        // Add warning background if in warning state
        if (state === 'warning') {
            const warningBg = createSVGElement('circle', {
                cx: size * 0.5,
                cy: size * 0.5,
                r: size * 0.45,
                fill: colors.hazardWarning,
                opacity: 0.3
            });
            hazardSVG.appendChild(warningBg);
            
            // Pulsing animation
            const animate = document.createElementNS(svgNS, 'animate');
            animate.setAttribute('attributeName', 'opacity');
            animate.setAttribute('values', '0.3;0.6;0.3');
            animate.setAttribute('dur', '2s');
            animate.setAttribute('repeatCount', 'indefinite');
            warningBg.appendChild(animate);
        }
        
        // Draw the appropriate hazard based on type
        switch (hazardType.toLowerCase()) {
            case 'cavein':
                drawCaveInHazard(hazardSVG, size, state);
                break;
            case 'gasleak':
                drawGasLeakHazard(hazardSVG, size, state);
                break;
            case 'lavaflow':
                drawLavaFlowHazard(hazardSVG, size, state);
                break;
            default:
                drawGenericHazard(hazardSVG, size, state);
        }
        
        return hazardSVG;
    }
    
    /**
     * Draws a cave-in hazard icon
     * @param {SVGElement} svg - SVG element to draw on
     * @param {number} size - Size of the SVG
     * @param {string} state - State of the hazard
     */
    function drawCaveInHazard(svg, size, state) {
        // Falling rocks
        const rocks = [
            { x: size * 0.3, y: size * 0.3, r: size * 0.1 },
            { x: size * 0.5, y: size * 0.2, r: size * 0.08 },
            { x: size * 0.7, y: size * 0.4, r: size * 0.12 },
            { x: size * 0.4, y: size * 0.5, r: size * 0.09 },
            { x: size * 0.6, y: size * 0.6, r: size * 0.07 }
        ];
        
        rocks.forEach(rock => {
            const rockElement = createSVGElement('circle', {
                cx: rock.x,
                cy: rock.y,
                r: rock.r,
                fill: colors.stone,
                stroke: '#000',
                'stroke-width': 1
            });
            
            svg.appendChild(rockElement);
            
            // Add cracks to rocks
            const crack1 = createSVGElement('line', {
                x1: rock.x - rock.r * 0.5,
                y1: rock.y - rock.r * 0.5,
                x2: rock.x + rock.r * 0.2,
                y2: rock.y + rock.r * 0.2,
                stroke: '#000',
                'stroke-width': 1,
                opacity: 0.7
            });
            
            svg.appendChild(crack1);
            
            // Add animation for active state
            if (state === 'active') {
                const animate = document.createElementNS(svgNS, 'animate');
                animate.setAttribute('attributeName', 'cy');
                animate.setAttribute('from', rock.y);
                animate.setAttribute('to', size * 0.9);
                animate.setAttribute('dur', `${1 + Math.random()}s`);
                animate.setAttribute('repeatCount', 'indefinite');
                rockElement.appendChild(animate);
            }
        });
        
        // Add warning sign for warning state
        if (state === 'warning') {
            const warningSign = createSVGElement('path', {
                d: `M${size * 0.5} ${size * 0.2} 
                    L${size * 0.7} ${size * 0.6} 
                    L${size * 0.3} ${size * 0.6} 
                    Z`,
                fill: 'none',
                stroke: '#FF0000',
                'stroke-width': 2
            });
            
            const exclamation = createSVGElement('text', {
                x: size * 0.5,
                y: size * 0.5,
                'font-size': size * 0.2,
                'text-anchor': 'middle',
                'font-weight': 'bold',
                fill: '#FF0000'
            });
            exclamation.textContent = '!';
            
            svg.appendChild(warningSign);
            svg.appendChild(exclamation);
        }
    }
    
    /**
     * Draws a gas leak hazard icon
     * @param {SVGElement} svg - SVG element to draw on
     * @param {number} size - Size of the SVG
     * @param {string} state - State of the hazard
     */
    function drawGasLeakHazard(svg, size, state) {
        // Gas clouds
        const clouds = [
            { x: size * 0.3, y: size * 0.4, r: size * 0.15 },
            { x: size * 0.5, y: size * 0.3, r: size * 0.12 },
            { x: size * 0.7, y: size * 0.5, r: size * 0.18 },
            { x: size * 0.4, y: size * 0.6, r: size * 0.14 },
            { x: size * 0.6, y: size * 0.7, r: size * 0.1 }
        ];
        
        // Gas color based on state
        const gasColor = state === 'active' ? '#ADFF2F' : '#CCFF66';
        
        clouds.forEach(cloud => {
            const cloudElement = createSVGElement('circle', {
                cx: cloud.x,
                cy: cloud.y,
                r: cloud.r,
                fill: gasColor,
                opacity: 0.7
            });
            
            svg.appendChild(cloudElement);
            
            // Add animation for both states
            const animate = document.createElementNS(svgNS, 'animate');
            animate.setAttribute('attributeName', 'r');
            animate.setAttribute('values', `${cloud.r * 0.8};${cloud.r * 1.2};${cloud.r * 0.8}`);
            animate.setAttribute('dur', `${2 + Math.random()}s`);
            animate.setAttribute('repeatCount', 'indefinite');
            cloudElement.appendChild(animate);
            
            if (state === 'active') {
                const animateOpacity = document.createElementNS(svgNS, 'animate');
                animateOpacity.setAttribute('attributeName', 'opacity');
                animateOpacity.setAttribute('values', '0.7;0.9;0.7');
                animateOpacity.setAttribute('dur', `${1 + Math.random()}s`);
                animateOpacity.setAttribute('repeatCount', 'indefinite');
                cloudElement.appendChild(animateOpacity);
            }
        });
        
        // Add warning sign for warning state
        if (state === 'warning') {
            const warningSign = createSVGElement('path', {
                d: `M${size * 0.3} ${size * 0.8} 
                    L${size * 0.7} ${size * 0.8}`,
                fill: 'none',
                stroke: '#FF0000',
                'stroke-width': 2
            });
            
            const skull = createSVGElement('text', {
                x: size * 0.5,
                y: size * 0.85,
                'font-size': size * 0.15,
                'text-anchor': 'middle',
                fill: '#FF0000'
            });
            skull.textContent = '☠';
            
            svg.appendChild(warningSign);
            svg.appendChild(skull);
        }
    }
    
    /**
     * Draws a lava flow hazard icon
     * @param {SVGElement} svg - SVG element to draw on
     * @param {number} size - Size of the SVG
     * @param {string} state - State of the hazard
     */
    function drawLavaFlowHazard(svg, size, state) {
        // Create lava pool
        const lavaPool = createSVGElement('ellipse', {
            cx: size * 0.5,
            cy: size * 0.7,
            rx: size * 0.4,
            ry: size * 0.2,
            fill: '#FF4500',
            stroke: '#FF0000',
            'stroke-width': 2
        });
        
        svg.appendChild(lavaPool);
        
        // Add lava bubbles
        const bubbles = [
            { x: size * 0.4, y: size * 0.65, r: size * 0.05 },
            { x: size * 0.6, y: size * 0.68, r: size * 0.04 },
            { x: size * 0.5, y: size * 0.72, r: size * 0.06 }
        ];
        
        bubbles.forEach(bubble => {
            const bubbleElement = createSVGElement('circle', {
                cx: bubble.x,
                cy: bubble.y,
                r: bubble.r,
                fill: '#FF8C00'
            });
            
            svg.appendChild(bubbleElement);
            
            // Add animation for both states
            if (state === 'active') {
                const animate = document.createElementNS(svgNS, 'animate');
                animate.setAttribute('attributeName', 'r');
                animate.setAttribute('values', `${bubble.r};${bubble.r * 1.5};0`);
                animate.setAttribute('dur', `${1 + Math.random()}s`);
                animate.setAttribute('repeatCount', 'indefinite');
                bubbleElement.appendChild(animate);
                
                const animateY = document.createElementNS(svgNS, 'animate');
                animateY.setAttribute('attributeName', 'cy');
                animateY.setAttribute('from', bubble.y);
                animateY.setAttribute('to', bubble.y - size * 0.2);
                animateY.setAttribute('dur', `${1 + Math.random()}s`);
                animateY.setAttribute('repeatCount', 'indefinite');
                bubbleElement.appendChild(animateY);
            }
        });
        
        // Add lava drips
        if (state === 'active') {
            for (let i = 0; i < 3; i++) {
                const x = size * (0.3 + i * 0.2);
                
                const drip = createSVGElement('path', {
                    d: `M${x} ${size * 0.2} 
                        C${x - size * 0.05} ${size * 0.3} ${x + size * 0.05} ${size * 0.4} ${x} ${size * 0.5}`,
                    fill: 'none',
                    stroke: '#FF4500',
                    'stroke-width': size * 0.05,
                    'stroke-linecap': 'round'
                });
                
                svg.appendChild(drip);
                
                // Animate drip
                const animateY = document.createElementNS(svgNS, 'animate');
                animateY.setAttribute('attributeName', 'd');
                animateY.setAttribute('values', 
                    `M${x} ${size * 0.2} C${x - size * 0.05} ${size * 0.3} ${x + size * 0.05} ${size * 0.4} ${x} ${size * 0.5};` +
                    `M${x} ${size * 0.2} C${x - size * 0.05} ${size * 0.4} ${x + size * 0.05} ${size * 0.6} ${x} ${size * 0.7}`
                );
                animateY.setAttribute('dur', `${1 + i * 0.5}s`);
                animateY.setAttribute('repeatCount', 'indefinite');
                drip.appendChild(animateY);
            }
        }
        
        // Add warning sign for warning state
        if (state === 'warning') {
            const warningSign = createSVGElement('path', {
                d: `M${size * 0.3} ${size * 0.3} 
                    L${size * 0.7} ${size * 0.3}`,
                fill: 'none',
                stroke: '#FF0000',
                'stroke-width': 2
            });
            
            const heatIcon = createSVGElement('text', {
                x: size * 0.5,
                y: size * 0.25,
                'font-size': size * 0.15,
                'text-anchor': 'middle',
                fill: '#FF0000'
            });
            heatIcon.textContent = '🔥';
            
            svg.appendChild(warningSign);
            svg.appendChild(heatIcon);
        }
    }
    
    /**
     * Draws a generic hazard icon
     * @param {SVGElement} svg - SVG element to draw on
     * @param {number} size - Size of the SVG
     * @param {string} state - State of the hazard
     */
    function drawGenericHazard(svg, size, state) {
        // Warning triangle
        const triangle = createSVGElement('path', {
            d: `M${size * 0.5} ${size * 0.2} 
                L${size * 0.8} ${size * 0.8} 
                L${size * 0.2} ${size * 0.8} 
                Z`,
            fill: state === 'active' ? colors.hazardDanger : colors.hazardWarning,
            stroke: '#000',
            'stroke-width': 2
        });
        
        svg.appendChild(triangle);
        
        // Exclamation mark
        const exclamation = createSVGElement('text', {
            x: size * 0.5,
            y: size * 0.65,
            'font-size': size * 0.3,
            'text-anchor': 'middle',
            'font-weight': 'bold',
            fill: '#000'
        });
        exclamation.textContent = '!';
        
        svg.appendChild(exclamation);
        
        // Add animation for active state
        if (state === 'active') {
            const animate = document.createElementNS(svgNS, 'animate');
            animate.setAttribute('attributeName', 'fill');
            animate.setAttribute('values', `${colors.hazardDanger};${colors.hazardWarning};${colors.hazardDanger}`);
            animate.setAttribute('dur', '1s');
            animate.setAttribute('repeatCount', 'indefinite');
            triangle.appendChild(animate);
        }
    }

    // ===== ACHIEVEMENT ASSETS =====

    /**
     * Creates an SVG representation of an achievement
     * @param {string} achievementType - Type of achievement
     * @param {boolean} unlocked - Whether the achievement is unlocked
     * @param {number} size - Size of the SVG
     * @returns {SVGElement} - SVG representation of the achievement
     */
    function createAchievementIcon(achievementType, unlocked = false, size = 50) {
        const achievementSVG = createSVG(size, size, [], {
            class: `achievement-icon achievement-${achievementType} ${unlocked ? 'unlocked' : 'locked'}`
        });
        
        // Base achievement badge
        const badge = createSVGElement('circle', {
            cx: size * 0.5,
            cy: size * 0.5,
            r: size * 0.4,
            fill: unlocked ? colors.achievement : '#808080',
            stroke: '#000',
            'stroke-width': 2
        });
        
        achievementSVG.appendChild(badge);
        
        // Inner circle
        const innerCircle = createSVGElement('circle', {
            cx: size * 0.5,
            cy: size * 0.5,
            r: size * 0.35,
            fill: 'none',
            stroke: '#000',
            'stroke-width': 1,
            opacity: 0.5
        });
        
        achievementSVG.appendChild(innerCircle);
        
        // Draw the appropriate achievement icon based on type
        switch (achievementType.toLowerCase()) {
            case 'depth':
                drawDepthAchievement(achievementSVG, size, unlocked);
                break;
            case 'resources':
                drawResourcesAchievement(achievementSVG, size, unlocked);
                break;
            case 'upgrades':
                drawUpgradesAchievement(achievementSVG, size, unlocked);
                break;
            case 'hazards':
                drawHazardsAchievement(achievementSVG, size, unlocked);
                break;
            default:
                drawGenericAchievement(achievementSVG, size, unlocked);
        }
        
        // Add locked overlay if not unlocked
        if (!unlocked) {
            const lockedOverlay = createSVGElement('circle', {
                cx: size * 0.5,
                cy: size * 0.5,
                r: size * 0.4,
                fill: '#000',
                opacity: 0.5
            });
            
            const lockIcon = createSVGElement('text', {
                x: size * 0.5,
                y: size * 0.6,
                'font-size': size * 0.3,
                'text-anchor': 'middle',
                fill: '#FFF',
                opacity: 0.8
            });
            lockIcon.textContent = '🔒';
            
            achievementSVG.appendChild(lockedOverlay);
            achievementSVG.appendChild(lockIcon);
        }
        
        return achievementSVG;
    }
    
    /**
     * Draws a depth achievement icon
     * @param {SVGElement} svg - SVG element to draw on
     * @param {number} size - Size of the SVG
     * @param {boolean} unlocked - Whether the achievement is unlocked
     */
    function drawDepthAchievement(svg, size, unlocked) {
        // Vertical ruler
        const ruler = createSVGElement('rect', {
            x: size * 0.45,
            y: size * 0.2,
            width: size * 0.1,
            height: size * 0.6,
            fill: unlocked ? '#FFF' : '#CCC'
        });
        
        svg.appendChild(ruler);
        
        // Ruler markings
        for (let i = 0; i < 5; i++) {
            const y = size * (0.3 + i * 0.1);
            
            const mark = createSVGElement('line', {
                x1: size * 0.45,
                y1: y,
                x2: size * 0.55,
                y2: y,
                stroke: '#000',
                'stroke-width': 1
            });
            
            svg.appendChild(mark);
        }
        
        // Depth arrow
        const arrow = createSVGElement('path', {
            d: `M${size * 0.5} ${size * 0.2} 
                L${size * 0.4} ${size * 0.3} 
                L${size * 0.45} ${size * 0.3} 
                L${size * 0.45} ${size * 0.7} 
                L${size * 0.55} ${size * 0.7} 
                L${size * 0.55} ${size * 0.3} 
                L${size * 0.6} ${size * 0.3} 
                Z`,
            fill: unlocked ? '#FF0000' : '#A9A9A9'
        });
        
        svg.appendChild(arrow);
    }
    
    /**
     * Draws a resources achievement icon
     * @param {SVGElement} svg - SVG element to draw on
     * @param {number} size - Size of the SVG
     * @param {boolean} unlocked - Whether the achievement is unlocked
     */
    function drawResourcesAchievement(svg, size, unlocked) {
        // Resource pile
        const resources = [
            { x: size * 0.35, y: size * 0.6, r: size * 0.12, color: colors.dirt },
            { x: size * 0.5, y: size * 0.45, r: size * 0.1, color: colors.stone },
            { x: size * 0.65, y: size * 0.55, r: size * 0.08, color: colors.gems }
        ];
        
        resources.forEach(resource => {
            const resourceElement = createSVGElement('circle', {
                cx: resource.x,
                cy: resource.y,
                r: resource.r,
                fill: unlocked ? resource.color : '#A9A9A9',
                stroke: '#000',
                'stroke-width': 1
            });
            
            svg.appendChild(resourceElement);
        });
        
        // Sparkle on gem
        if (unlocked) {
            const sparkle = createSVGElement('path', {
                d: `M${size * 0.65} ${size * 0.45} 
                    L${size * 0.65} ${size * 0.4} 
                    M${size * 0.6} ${size * 0.5} 
                    L${size * 0.55} ${size * 0.5} 
                    M${size * 0.7} ${size * 0.5} 
                    L${size * 0.75} ${size * 0.5} 
                    M${size * 0.6} ${size * 0.45} 
                    L${size * 0.55} ${size * 0.4} 
                    M${size * 0.7} ${size * 0.45} 
                    L${size * 0.75} ${size * 0.4}`,
                stroke: '#FFD700',
                'stroke-width': 1,
                fill: 'none'
            });
            
            svg.appendChild(sparkle);
        }
    }
    
    /**
     * Draws an upgrades achievement icon
     * @param {SVGElement} svg - SVG element to draw on
     * @param {number} size - Size of the SVG
     * @param {boolean} unlocked - Whether the achievement is unlocked
     */
    function drawUpgradesAchievement(svg, size, unlocked) {
        // Tool silhouette
        const tool = createSVGElement('path', {
            d: `M${size * 0.3} ${size * 0.3} 
                L${size * 0.5} ${size * 0.3} 
                L${size * 0.5} ${size * 0.7} 
                L${size * 0.3} ${size * 0.7} 
                Z`,
            fill: unlocked ? colors.stone : '#A9A9A9',
            stroke: '#000',
            'stroke-width': 1
        });
        
        svg.appendChild(tool);
        
        // Tool handle
        const handle = createSVGElement('rect', {
            x: size * 0.5,
            y: size * 0.45,
            width: size * 0.2,
            height: size * 0.1,
            fill: unlocked ? '#8B4513' : '#A9A9A9',
            stroke: '#000',
            'stroke-width': 1
        });
        
        svg.appendChild(handle);
        
        // Upgrade arrow
        const arrow = createSVGElement('path', {
            d: `M${size * 0.6} ${size * 0.35} 
                L${size * 0.7} ${size * 0.35} 
                L${size * 0.7} ${size * 0.25} 
                L${size * 0.8} ${size * 0.4} 
                L${size * 0.7} ${size * 0.55} 
                L${size * 0.7} ${size * 0.45} 
                L${size * 0.6} ${size * 0.45} 
                Z`,
            fill: unlocked ? '#4CAF50' : '#A9A9A9',
            stroke: '#000',
            'stroke-width': 1
        });
        
        svg.appendChild(arrow);
    }
    
    /**
     * Draws a hazards achievement icon
     * @param {SVGElement} svg - SVG element to draw on
     * @param {number} size - Size of the SVG
     * @param {boolean} unlocked - Whether the achievement is unlocked
     */
    function drawHazardsAchievement(svg, size, unlocked) {
        // Warning triangle
        const triangle = createSVGElement('path', {
            d: `M${size * 0.5} ${size * 0.25} 
                L${size * 0.7} ${size * 0.65} 
                L${size * 0.3} ${size * 0.65} 
                Z`,
            fill: unlocked ? colors.hazardWarning : '#A9A9A9',
            stroke: '#000',
            'stroke-width': 1
        });
        
        svg.appendChild(triangle);
        
        // Exclamation mark
        const exclamation = createSVGElement('text', {
            x: size * 0.5,
            y: size * 0.55,
            'font-size': size * 0.2,
            'text-anchor': 'middle',
            'font-weight': 'bold',
            fill: '#000'
        });
        exclamation.textContent = '!';
        
        svg.appendChild(exclamation);
        
        // Shield
        const shield = createSVGElement('path', {
            d: `M${size * 0.5} ${size * 0.75} 
                Q${size * 0.35} ${size * 0.7} ${size * 0.35} ${size * 0.6} 
                L${size * 0.35} ${size * 0.5} 
                L${size * 0.65} ${size * 0.5} 
                L${size * 0.65} ${size * 0.6} 
                Q${size * 0.65} ${size * 0.7} ${size * 0.5} ${size * 0.75} 
                Z`,
            fill: unlocked ? '#4682B4' : '#A9A9A9',
            stroke: '#000',
            'stroke-width': 1
        });
        
        svg.appendChild(shield);
        
        // Check mark on shield
        if (unlocked) {
            const check = createSVGElement('path', {
                d: `M${size * 0.4} ${size * 0.6} 
                    L${size * 0.45} ${size * 0.65} 
                    L${size * 0.6} ${size * 0.55}`,
                fill: 'none',
                stroke: '#FFF',
                'stroke-width': 2,
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round'
            });
            
            svg.appendChild(check);
        }
    }
    
    /**
     * Draws a generic achievement icon
     * @param {SVGElement} svg - SVG element to draw on
     * @param {number} size - Size of the SVG
     * @param {boolean} unlocked - Whether the achievement is unlocked
     */
    function drawGenericAchievement(svg, size, unlocked) {
        // Star shape
        const star = createSVGElement('path', {
            d: `M${size * 0.5} ${size * 0.25} 
                L${size * 0.6} ${size * 0.4} 
                L${size * 0.75} ${size * 0.45} 
                L${size * 0.6} ${size * 0.55} 
                L${size * 0.65} ${size * 0.75} 
                L${size * 0.5} ${size * 0.65} 
                L${size * 0.35} ${size * 0.75} 
                L${size * 0.4} ${size * 0.55} 
                L${size * 0.25} ${size * 0.45} 
                L${size * 0.4} ${size * 0.4} 
                Z`,
            fill: unlocked ? '#FFD700' : '#A9A9A9',
            stroke: '#000',
            'stroke-width': 1
        });
        
        svg.appendChild(star);
    }

    // ===== ANIMATION FUNCTIONS =====

    /**
     * Creates a digging animation at the specified position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} toolType - Type of tool used
     * @returns {SVGElement} - SVG animation element
     */
    function createDiggingAnimation(x, y, toolType = 'shovel') {
        const size = 60;
        const animSVG = createSVG(size, size, [], {
            class: 'digging-animation',
            style: `position: absolute; left: ${x - size/2}px; top: ${y - size/2}px;`
        });
        
        // Create particles
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * size * 0.3;
            const particleX = size/2 + Math.cos(angle) * distance;
            const particleY = size/2 + Math.sin(angle) * distance;
            const particleSize = 2 + Math.random() * 4;
            
            const particle = createSVGElement('circle', {
                cx: particleX,
                cy: particleY,
                r: particleSize,
                fill: toolType === 'drill' ? '#A9A9A9' : '#8B4513',
                opacity: 0.8
            });
            
            // Add animation
            const animateX = document.createElementNS(svgNS, 'animate');
            animateX.setAttribute('attributeName', 'cx');
            animateX.setAttribute('from', particleX);
            animateX.setAttribute('to', particleX + Math.cos(angle) * size * 0.4);
            animateX.setAttribute('dur', '0.5s');
            animateX.setAttribute('fill', 'freeze');
            particle.appendChild(animateX);
            
            const animateY = document.createElementNS(svgNS, 'animate');
            animateY.setAttribute('attributeName', 'cy');
            animateY.setAttribute('from', particleY);
            animateY.setAttribute('to', particleY + Math.sin(angle) * size * 0.4);
            animateY.setAttribute('dur', '0.5s');
            animateY.setAttribute('fill', 'freeze');
            particle.appendChild(animateY);
            
            const animateOpacity = document.createElementNS(svgNS, 'animate');
            animateOpacity.setAttribute('attributeName', 'opacity');
            animateOpacity.setAttribute('from', '0.8');
            animateOpacity.setAttribute('to', '0');
            animateOpacity.setAttribute('dur', '0.5s');
            animateOpacity.setAttribute('fill', 'freeze');
            particle.appendChild(animateOpacity);
            
            animSVG.appendChild(particle);
        }
        
        // Create tool impact
        const impact = createSVGElement('circle', {
            cx: size/2,
            cy: size/2,
            r: 5,
            fill: 'white',
            opacity: 0.8
        });
        
        const animateImpact = document.createElementNS(svgNS, 'animate');
        animateImpact.setAttribute('attributeName', 'r');
        animateImpact.setAttribute('from', '5');
        animateImpact.setAttribute('to', '20');
        animateImpact.setAttribute('dur', '0.3s');
        animateImpact.setAttribute('fill', 'freeze');
        impact.appendChild(animateImpact);
        
        const animateOpacity = document.createElementNS(svgNS, 'animate');
        animateOpacity.setAttribute('attributeName', 'opacity');
        animateOpacity.setAttribute('from', '0.8');
        animateOpacity.setAttribute('to', '0');
        animateOpacity.setAttribute('dur', '0.3s');
        animateOpacity.setAttribute('fill', 'freeze');
        impact.appendChild(animateOpacity);
        
        animSVG.appendChild(impact);
        
        // Auto-remove after animation completes
        setTimeout(() => {
            if (animSVG.parentNode) {
                animSVG.parentNode.removeChild(animSVG);
            }
        }, 500);
        
        return animSVG;
    }
    
    /**
     * Creates a resource collection animation
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} resourceType - Type of resource
     * @param {number} amount - Amount collected
     * @param {Object} targetElement - Target element to animate towards
     * @returns {SVGElement} - SVG animation element
     */
    function createResourceCollectionAnimation(x, y, resourceType, amount, targetElement) {
        const size = 40;
        const animSVG = createSVG(size, size, [], {
            class: 'resource-collection-animation',
            style: `position: absolute; left: ${x - size/2}px; top: ${y - size/2}px; pointer-events: none;`
        });
        
        // Resource icon
        let resourceColor;
        switch (resourceType.toLowerCase()) {
            case 'dirt':
                resourceColor = colors.dirt;
                break;
            case 'stone':
                resourceColor = colors.stone;
                break;
            case 'gems':
                resourceColor = colors.gems;
                break;
            default:
                resourceColor = '#A9A9A9';
        }
        
        const resource = createSVGElement('circle', {
            cx: size/2,
            cy: size/2,
            r: size/4,
            fill: resourceColor,
            stroke: '#000',
            'stroke-width': 1
        });
        
        animSVG.appendChild(resource);
        
        // Amount text
        const amountText = createSVGElement('text', {
            x: size/2,
            y: size/2 + 5,
            'font-size': '12px',
            'text-anchor': 'middle',
            'font-weight': 'bold',
            fill: '#FFF',
            stroke: '#000',
            'stroke-width': 0.5
        });
        amountText.textContent = `+${amount}`;
        
        animSVG.appendChild(amountText);
        
        // Calculate target position
        let targetX = window.innerWidth / 2;
        let targetY = 50;
        
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            targetX = rect.left + rect.width / 2;
            targetY = rect.top + rect.height / 2;
        }
        
        // Add animation
        const animateX = document.createElementNS(svgNS, 'animateMotion');
        animateX.setAttribute('path', `M0,0 Q20,-50 ${targetX - x},${targetY - y}`);
        animateX.setAttribute('dur', '1s');
        animateX.setAttribute('fill', 'freeze');
        animSVG.appendChild(animateX);
        
        const animateScale = document.createElementNS(svgNS, 'animate');
        animateScale.setAttribute('attributeName', 'transform');
        animateScale.setAttribute('type', 'scale');
        animateScale.setAttribute('from', '1');
        animateScale.setAttribute('to', '0.5');
        animateScale.setAttribute('dur', '1s');
        animateScale.setAttribute('fill', 'freeze');
        animSVG.appendChild(animateScale);
        
        // Auto-remove after animation completes
        setTimeout(() => {
            if (animSVG.parentNode) {
                animSVG.parentNode.removeChild(animSVG);
            }
        }, 1000);
        
        return animSVG;
    }
    
    /**
     * Creates a hazard warning animation
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {string} hazardType - Type of hazard
     * @returns {SVGElement} - SVG animation element
     */
    function createHazardWarningAnimation(x, y, hazardType) {
        const size = 80;
        const animSVG = createSVG(size, size, [], {
            class: 'hazard-warning-animation',
            style: `position: absolute; left: ${x - size/2}px; top: ${y - size/2}px;`
        });
        
        // Warning circle
        const warningCircle = createSVGElement('circle', {
            cx: size/2,
            cy: size/2,
            r: size/3,
            fill: colors.hazardWarning,
            opacity: 0.6,
            stroke: '#FF0000',
            'stroke-width': 2
        });
        
        animSVG.appendChild(warningCircle);
        
        // Hazard icon
        let hazardIcon;
        switch (hazardType.toLowerCase()) {
            case 'cavein':
                hazardIcon = createSVGElement('path', {
                    d: `M${size * 0.4} ${size * 0.4} 
                        L${size * 0.6} ${size * 0.4} 
                        L${size * 0.5} ${size * 0.6} 
                        Z`,
                    fill: '#A9A9A9',
                    stroke: '#000',
                    'stroke-width': 1
                });
                break;
            case 'gasleak':
                hazardIcon = createSVGElement('circle', {
                    cx: size/2,
                    cy: size/2,
                    r: size/6,
                    fill: '#ADFF2F',
                    opacity: 0.8
                });
                break;
            case 'lavaflow':
                hazardIcon = createSVGElement('path', {
                    d: `M${size * 0.4} ${size * 0.6} 
                        Q${size * 0.5} ${size * 0.3} ${size * 0.6} ${size * 0.6} 
                        Q${size * 0.5} ${size * 0.7} ${size * 0.4} ${size * 0.6}`,
                    fill: '#FF4500',
                    stroke: '#FF0000',
                    'stroke-width': 1
                });
                break;
            default:
                hazardIcon = createSVGElement('text', {
                    x: size/2,
                    y: size/2 + 5,
                    'font-size': '24px',
                    'text-anchor': 'middle',
                    'font-weight': 'bold',
                    fill: '#000'
                });
                hazardIcon.textContent = '!';
        }
        
        animSVG.appendChild(hazardIcon);
        
        // Add pulsing animation
        const animatePulse = document.createElementNS(svgNS, 'animate');
        animatePulse.setAttribute('attributeName', 'r');
        animatePulse.setAttribute('values', `${size/3};${size/2.5};${size/3}`);
        animatePulse.setAttribute('dur', '1s');
        animatePulse.setAttribute('repeatCount', '3');
        warningCircle.appendChild(animatePulse);
        
        const animateOpacity = document.createElementNS(svgNS, 'animate');
        animateOpacity.setAttribute('attributeName', 'opacity');
        animateOpacity.setAttribute('values', '0.6;0.8;0.6');
        animateOpacity.setAttribute('dur', '1s');
        animateOpacity.setAttribute('repeatCount', '3');
        warningCircle.appendChild(animateOpacity);
        
        // Auto-remove after animation completes
        setTimeout(() => {
            if (animSVG.parentNode) {
                animSVG.parentNode.removeChild(animSVG);
            }
        }, 3000);
        
        return animSVG;
    }

    // ===== RENDERING FUNCTIONS =====

    /**
     * Updates the digging area visualization based on current game state
     * @param {Object} gameState - Current game state
     * @param {HTMLElement} container - Container element for the digging area
     */
    function renderDiggingArea(gameState, container) {
        // Clear existing content
        container.innerHTML = '';
        
        // Get current layer info
        const currentDepth = gameState.depth;
        const layerInfo = gameState.currentLayer || {
            name: 'Surface Soil',
            color: colors.surface
        };
        
        // Create digging site SVG
        const width = container.clientWidth;
        const height = container.clientHeight;
        const diggingSite = createDiggingSite(width, height, currentDepth, layerInfo);
        
        // Add depth indicator
        const depthIndicator = document.createElement('div');
        depthIndicator.className = 'depth-indicator';
        depthIndicator.innerHTML = `
            <span class="depth-label">Depth:</span>
            <span class="depth-value" id="depth-value">${currentDepth}</span>m
        `;
        
        // Add layer name
        const layerName = document.createElement('div');
        layerName.className = 'layer-name';
        layerName.textContent = layerInfo.name;
        layerName.style.color = adjustColor(layerInfo.color, 100); // Ensure readable text
        
        // Append elements
        container.appendChild(diggingSite);
        container.appendChild(depthIndicator);
        container.appendChild(layerName);
        
        return diggingSite;
    }
    
    /**
     * Updates the resource display with SVG icons
     * @param {Object} resources - Resource amounts
     * @param {HTMLElement} container - Container for resource display
     */
    function renderResourceDisplay(resources, container) {
        // Get all resource containers
        const resourceContainers = container.querySelectorAll('.resource');
        
        resourceContainers.forEach(resourceContainer => {
            // Get resource type from ID
            const idParts = resourceContainer.id.split('-');
            const resourceType = idParts[0];
            
            // Find icon container
            const iconContainer = resourceContainer.querySelector('.resource-icon');
            if (iconContainer) {
                // Clear existing content
                iconContainer.innerHTML = '';
                
                // Create SVG icon
                const resourceIcon = createResourceIcon(resourceType, 24);
                
                // Append SVG icon
                iconContainer.appendChild(resourceIcon);
            }
            
            // Update value
            const valueContainer = resourceContainer.querySelector('.resource-value');
            if (valueContainer && resources[resourceType]) {
                valueContainer.textContent = resources[resourceType].toLocaleString();
            }
        });
    }
    
    /**
     * Renders an upgrade item with SVG icon
     * @param {Object} upgrade - Upgrade data
     * @param {boolean} canAfford - Whether the player can afford the upgrade
     * @returns {HTMLElement} - Upgrade item element
     */
    function renderUpgradeItem(upgrade, canAfford) {
        // Create upgrade container
        const upgradeItem = document.createElement('div');
        upgradeItem.className = `upgrade-item ${canAfford ? 'can-afford' : 'cannot-afford'}`;
        upgradeItem.dataset.id = upgrade.id;
    
        // Create icon container
        const iconContainer = document.createElement('div');
        iconContainer.className = 'upgrade-icon';
    
        // Create SVG icon based on upgrade type
        let toolType = 'shovel';
        if (upgrade.id.includes('pickaxe')) toolType = 'pickaxe';
        if (upgrade.id.includes('drill')) toolType = 'drill';
        if (upgrade.id.includes('dynamite')) toolType = 'dynamite';
        if (upgrade.id.includes('helper')) toolType = 'helper';
    
        const upgradeIcon = createToolIcon(toolType, upgrade.level, 40);
        iconContainer.appendChild(upgradeIcon);
    
        // Create info container
        const infoContainer = document.createElement('div');
        infoContainer.className = 'upgrade-info';
    
        // Add name and description
        const name = document.createElement('div');
        name.className = 'upgrade-name';
        name.textContent = upgrade.name;
    
        const description = document.createElement('div');
        description.className = 'upgrade-description';
        description.textContent = upgrade.description;
    
        infoContainer.appendChild(name);
        infoContainer.appendChild(description);
    
        // Create cost container
        const costContainer = document.createElement('div');
        costContainer.className = 'upgrade-cost';
    
        // Add cost info
        if (upgrade.cost && typeof upgrade.cost === 'object') { // Add this check
            for (const [resource, amount] of Object.entries(upgrade.cost)) {
                const costItem = document.createElement('div');
                costItem.className = 'cost-item';
    
                // Create resource icon
                const resourceIcon = createResourceIcon(resource, 16);
    
                costItem.appendChild(resourceIcon);
                costItem.appendChild(document.createTextNode(` ${amount.toLocaleString()}`));
                costContainer.appendChild(costItem);
            }
        }
    
        // Assemble upgrade item
        upgradeItem.appendChild(iconContainer);
        upgradeItem.appendChild(infoContainer);
        upgradeItem.appendChild(costContainer);
    
        return upgradeItem;
    }
    
    /**
     * Renders an achievement with SVG icon
     * @param {Object} achievement - Achievement data
     * @param {boolean} unlocked - Whether the achievement is unlocked
     * @returns {HTMLElement} - Achievement element
     */
    function renderAchievement(achievement, unlocked) {
        // Create achievement container
        const achievementItem = document.createElement('div');
        achievementItem.className = `achievement-item ${unlocked ? 'unlocked' : 'locked'}`;
        achievementItem.dataset.id = achievement.id;
        
        // Create icon container
        const iconContainer = document.createElement('div');
        iconContainer.className = 'achievement-icon-container';
        
        // Determine achievement type
        let achievementType = 'generic';
        if (achievement.id.includes('depth')) achievementType = 'depth';
        if (achievement.id.includes('resource')) achievementType = 'resources';
        if (achievement.id.includes('upgrade')) achievementType = 'upgrades';
        if (achievement.id.includes('hazard')) achievementType = 'hazards';
        
        // Create SVG icon
        const achievementIcon = createAchievementIcon(achievementType, unlocked, 40);
        iconContainer.appendChild(achievementIcon);
        
        // Create info container
        const infoContainer = document.createElement('div');
        infoContainer.className = 'achievement-info';
        
        // Add name and description
        const name = document.createElement('div');
        name.className = 'achievement-name';
        name.textContent = achievement.name;
        
        const description = document.createElement('div');
        description.className = 'achievement-description';
        description.textContent = unlocked ? achievement.description : '???';
        
        infoContainer.appendChild(name);
        infoContainer.appendChild(description);
        
        // Assemble achievement item
        achievementItem.appendChild(iconContainer);
        achievementItem.appendChild(infoContainer);
        
        return achievementItem;
    }
    
    /**
     * Renders a hazard warning
     * @param {Object} hazard - Hazard data
     * @param {string} state - Hazard state (warning, active)
     * @returns {HTMLElement} - Hazard warning element
     */
    function renderHazardWarning(hazard, state = 'warning') {
        // Create hazard container
        const hazardContainer = document.createElement('div');
        hazardContainer.className = `hazard-container hazard-${state}`;
        hazardContainer.dataset.type = hazard.type;
        
        // Create icon container
        const iconContainer = document.createElement('div');
        iconContainer.className = 'hazard-icon-container';
        
        // Create SVG icon
        const hazardIcon = createHazardIcon(hazard.type, state, 50);
        iconContainer.appendChild(hazardIcon);
        
        // Create info container
        const infoContainer = document.createElement('div');
        infoContainer.className = 'hazard-info';
        
        // Add name and description
        const name = document.createElement('div');
        name.className = 'hazard-name';
        name.textContent = hazard.name;
        
        const description = document.createElement('div');
        description.className = 'hazard-description';
        description.textContent = state === 'warning' ? 
            `Warning: ${hazard.warningMessage}` : 
            `Danger: ${hazard.activeMessage}`;
        
        infoContainer.appendChild(name);
        infoContainer.appendChild(description);
        
        // Create action button for warning state
        if (state === 'warning') {
            const actionButton = document.createElement('button');
            actionButton.className = 'hazard-action-button';
            actionButton.textContent = 'Prevent';
            actionButton.dataset.hazardType = hazard.type;
            infoContainer.appendChild(actionButton);
        }
        
        // Assemble hazard container
        hazardContainer.appendChild(iconContainer);
        hazardContainer.appendChild(infoContainer);
        
        return hazardContainer;
    }

    // Public API
    return {
        // SVG creation functions
        createSVG,
        createSVGElement,
        
        // Asset creation functions
        createDiggingSite,
        createToolIcon,
        createResourceIcon,
        createHazardIcon,
        createAchievementIcon,
        
        // Animation functions
        createDiggingAnimation,
        createResourceCollectionAnimation,
        createHazardWarningAnimation,
        
        // Rendering functions
        renderDiggingArea,
        renderResourceDisplay,
        renderUpgradeItem,
        renderAchievement,
        renderHazardWarning,
        
        // Color utilities
        colors,
        adjustColor,
        blendColors
    };
})();