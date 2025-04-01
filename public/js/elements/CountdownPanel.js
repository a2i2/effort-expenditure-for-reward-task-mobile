import eventsCenter from '../eventsCenter.js'
import { timeout } from '../versionInfo.js'

export default class CountdownPanel {
    constructor(scene, x, y, duration = timeout) {
        this.scene = scene;
        this.duration = duration;
        this.timeLeft = duration;
        
        // Create the main container for our countdown elements
        this.container = scene.add.container(0, 0);
        
        // Create the circular progress indicator first
        this.circleRadius = 12;
        this.circle = scene.add.graphics();
        
        // Create the countdown text with formatted time
        this.countdownText = scene.add.text(this.circleRadius + 4, 0, this.formatTime(this.timeLeft), {
            fontFamily: 'monospace',
            fontSize: '20px',  // Match title text size
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        
        // Add both elements to the container
        this.container.add([this.circle, this.countdownText]);
        
        // Draw initial circle state
        this.drawCircle(1);
        
        // Start the countdown
        this.startCountdown();
    }
    
    formatTime(ms) {
        const seconds = Math.ceil(ms / 1000);
        return `0:${seconds.toString().padStart(2, '0')}`;
    }
    
    drawCircle(progress) {
        this.circle.clear();
        
        // Draw the dark gray background circle (filled)
        this.circle.fillStyle(0x333333);
        this.circle.fillCircle(0, 0, this.circleRadius);
        
        if (progress < 1) {
            // Draw the lighter gray progress (revealing effect)
            this.circle.fillStyle(0x666666);
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

        eventsCenter.once('destroyCountdown', () => {
            this.removeTimer();
        });
    }
    
    onComplete() {
        this.destroy();
        eventsCenter.emit('countdownComplete');

        // FIXME: A delay was needed to ensure the countdown panel was removed before choiceComplete event was emitted in some cases,
        // come back to this in the future and fix it properly

        // Emit event that countdown is complete
        // this.scene.tweens.add({
        //     targets: this.container,
        //     alpha: 0,
        //     duration: 200,
        //     ease: 'Power2',
        //     onComplete: () => {
        //         // this.destroy();
        //         eventsCenter.emit('countdownComplete');
        //     }
        // });
    }
    
    destroy() {
        this.removeTimer();
        this.container.destroy();
    }

    removeTimer() {
        if (this.timer) {
            this.timer.remove();
            this.timer = null;
        }
    }
} 