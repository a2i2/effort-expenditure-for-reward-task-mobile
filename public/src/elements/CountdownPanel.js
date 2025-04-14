import eventsCenter from '../eventsCenter.js'

export default class CountdownPanel {
    constructor(scene, x, y, duration, timeoutKey, startImmediately = true) {
        this.scene = scene;
        this.duration = duration;
        this.timeLeft = duration; // start with the full duration to then countdown
        this.timeoutKey = timeoutKey;

        // Background
        this.panel = scene.rexUI.add.roundRectangle(27.5, 0, 100, 30, 6, 0xF2F4F7);
        this.panel.setOrigin(0.5);
        
        // Create the main container for our countdown elements
        this.container = scene.add.container(0, 0);
        
        // Create the circular progress indicator first
        this.circleRadius = 10;
        this.circle = scene.add.graphics();
        
        // Create the countdown text with formatted time
        this.countdownText = scene.add.text(this.circleRadius + 8, 0, this.formatTime(this.timeLeft), {
            fontFamily: 'monospace',
            fontSize: '16px',  // Match title text size
            color: '#000000'
        }).setOrigin(0, 0.5);
        
        // Add both elements to the container
        this.container.add([this.panel, this.circle, this.countdownText]);
        
        // Draw initial circle state
        this.drawCircle(1);
        
        // Start the countdown if required
        if (startImmediately) {
            this.startCountdown();
        }
    }
    
    formatTime(ms) {
        const seconds = Math.ceil(ms / 1000);
        return `0:${seconds.toString().padStart(2, '0')}`;
    }
    
    drawCircle(progress) {
        this.circle.clear();
        
        // Draw the dark gray background circle (filled)
        this.circle.fillStyle(0x98A2B3);
        this.circle.fillCircle(0, 0, this.circleRadius);
        
        if (progress < 1) {
            // Draw the lighter gray progress (revealing effect)
            this.circle.fillStyle(0xD0D5DD);
            this.circle.beginPath();
            
            // Calculate start and end angles for the arc
            const startAngle = -90;
            const angleToRotate = 360 * (1 - progress);
            
            // Draw the arc
            this.circle.moveTo(0, 0);
            this.circle.arc(
                0, 0,
                this.circleRadius,
                Phaser.Math.DegToRad(startAngle),
                Phaser.Math.DegToRad(startAngle - angleToRotate),
                true
            );
            this.circle.lineTo(0, 0);
            this.circle.fillPath();
        }
    }
    
    startCountdown() {
        const updateInterval = 50; // Update every 50ms for smooth animation
        
        this.timer = this.scene.time.addEvent({
            delay: updateInterval,
            callback: () => {               
                this.timeLeft -= updateInterval;
                
                if (this.timeLeft <= 0) {
                    this.timeLeft = 0;
                    this.onComplete();
                    return;
                }
                
                // Update visual elements
                this.countdownText.setText(this.formatTime(this.timeLeft));
                this.drawCircle(this.timeLeft / this.duration);
            },
            callbackScope: this,
            loop: true
        });
    }
    
    onComplete() {
        eventsCenter.emit(this.timeoutKey);
        this.destroy();
    }

    // Stop the timer from running, but allow the countdown objects to remain visible on the screen
    removeTimer() {
        if (this.timer) {
            this.timer.remove();
            this.timer = undefined;
        }
    }

    // Stop the timer from running, and remove the countdown objects from the screen
    destroy() {
        this.removeTimer();
        this.container.destroy();
    }
} 