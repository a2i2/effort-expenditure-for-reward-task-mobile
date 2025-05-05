export default class ProgressBar extends Phaser.GameObjects.Container {
    constructor(scene, x, y, segments, progress, config = {}) {
        super(scene, x, y);

        // Default configuration
        this.config = {
            height: 20,
            padding: 2,
            backgroundColor: 0xFDC4AD,
            fillColor: 0xCA3E04,
            cornerRadius: 5,
            ...config
        };
        
        // Dynamically determine width based on screen width and close button
        const closeBtnWidth = 55;
        this.width = window.innerWidth - closeBtnWidth;
        this.segments = segments;
        this.segmentWidth = (this.width / segments) - config.padding;
        
        this.progressSegments = [];
        this.createProgressBar(progress);
        
        // Add this container to the scene
        scene.add.existing(this);
    }
    
    createProgressBar(progress) {
        // Create background segments
        for (let i = 0; i < this.segments; i++) {
            const x = (i === 0) ? 0 : i * this.segmentWidth;
            // Place a graphics object at the x, y coordinates within the scene x, y coordinates set in the constructor
            const segment = this.scene.add.graphics({ x: x, y: 0 });

            const fillColor = (i <= progress) ? this.config.fillColor : this.config.backgroundColor;
            segment.fillStyle(fillColor, 1);

            var rectRadius = 0; // no rounded corners
            // Apply rounded corners to first and last segments
            if (i === 0) {
                rectRadius = {
                    tl: this.config.cornerRadius,
                    tr: 0,
                    bl: this.config.cornerRadius,
                    br: 0
                }
            } else if (i === this.segments - 1) {
                rectRadius = {
                    tl: 0,
                    tr: this.config.cornerRadius,
                    bl: 0,
                    br: this.config.cornerRadius
                }
            }

            // Draw a rounded rectangle within the graphics x, y coordinates
            segment.fillRoundedRect(
                0, // x: 0 as it's determined by the graphics object's x, y coordinates
                0, // y: 0 as it's determined by the graphics object's x, y coordinates
                this.segmentWidth - this.config.padding,
                this.config.height,
                rectRadius
            );

            this.progressSegments.push(segment);
            this.add(segment);
        }
    }
} 