export default class ProgressBar extends Phaser.GameObjects.Container {
    constructor(scene, x, y, width, segments, progress, config = {}) {
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
        
        this.width = width;
        this.segments = segments;
        this.segmentWidth = (width / segments) - config.padding;
        
        this.progressSegments = [];
        this.createProgressBar(progress);
        
        // Add this container to the scene
        scene.add.existing(this);
    }
    
    createProgressBar(progress) {
        // Create background segments
        for (let i = 0; i < this.segments; i++) {
            const x = (i === 0) ? 0 : i * this.segmentWidth;
            const segment = this.scene.add.graphics({ x: x, y: 0 });

            const fillColor = (i <= progress) ? this.config.fillColor : this.config.backgroundColor;
            // Set fill style (with full opacity here, change alpha as needed)
            segment.fillStyle(fillColor, 1);

            var rectRadius = 0;
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

            // Draw rounded rect with custom per-corner radii
            segment.fillRoundedRect(
                0,
                0,
                this.segmentWidth - this.config.padding,
                this.config.height,
                rectRadius
            );

            this.progressSegments.push(segment);
            this.add(segment);
        }
    }
} 