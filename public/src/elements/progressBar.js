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
        this.segmentWidth = (this.width / segments);
        
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
            const segmentBackground = this.scene.add.graphics({ x: x, y: 0 });

            segment.fillStyle(this.config.fillColor, 1);
            segmentBackground.fillStyle(this.config.backgroundColor, 1);

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

            // determine the subprogress within each segment
            // if the progress is more than the index range of the block then that segment can be fully filled
            // otherwise if then we need to fill it based on the proportion of how many of the trials have been completed in that block

            // examples, assume we are on trial 8
            // trials 1-6 are completed in block 1 so we need to fill that segment with a full color
            // trials 7-8 are complete so we fill that segment using the fill color
            // trials 9-12 are incomplete so we fill that segment with a background color

            const trialsPerBlock = this.config.trialsPerBlock;
            const trialNumber = progress + 1.0; // Make the progress 1-indexed
            let blockStart = (i * trialsPerBlock) + 1.0;
            let blockEnd = (i + 1.0) * trialsPerBlock;

            var blockProgress;
            if (trialNumber < blockStart) {
                blockProgress = 0.0; // Haven't reached the current block
                segment.setAlpha(0);
            } else if (trialNumber >= blockEnd) {
                blockProgress = 1.0; // Completely fill the current block since its done
            } else {
                // need to standardize the trial number to be within a 1-blockLength range
                let standardizedBlockStart = trialNumber % trialsPerBlock;
                // if the standardizedBlockStart is 0 then we're at the end of this block so fill to 1.0. Otherwise fill based on proportion of trials completed in this block
                blockProgress = standardizedBlockStart == 0 ? 1.0 :  standardizedBlockStart / trialsPerBlock;
            }

            // Draw a rounded rectangle within the graphics x, y coordinates
            segmentBackground.fillRoundedRect(
                0, // x: 0 as it's determined by the graphics object's x, y coordinates
                0, // y: 0 as it's determined by the graphics object's x, y coordinates
                this.segmentWidth - this.config.padding,
                this.config.height,
                rectRadius
            );

            // adjust the border radius of the segment for just the last section to have no border radius untill the last tick is filled
            if (i == this.segments - 1 && blockProgress != 1.0) {
                rectRadius = 0;
            }

            // draw in the filled section on top of the background
            segment.fillRoundedRect(
                0, // x: 0 as it's determined by the graphics object's x, y coordinates
                0, // y: 0 as it's determined by the graphics object's x, y coordinates
                (this.segmentWidth - this.config.padding) * blockProgress,
                this.config.height,
                rectRadius
            );

            this.progressSegments.push(segment);
            this.add(segmentBackground);
            this.add(segment);
        }
    }
} 