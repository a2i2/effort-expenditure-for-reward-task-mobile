export default class Message {
    constructor(scene, gameWidth, fontString, backgroundColor, borderColor, messageText, messageTextColor, height, yPosition, xOffset, yOffset) {
        this.scene = scene;
        this.feedbackBg = scene.add.graphics();
        this.feedbackBg.fillStyle(backgroundColor, 1);
        this.feedbackBg.lineStyle(2, borderColor, 1);
    
        const padding = { x: 20, y: 10 };
        const width = gameWidth * 0.8;
  
        this.feedbackBg.fillRoundedRect((gameWidth - width)/2 + xOffset, yPosition - height, width, height, 10);
        this.feedbackBg.strokeRoundedRect((gameWidth - width)/2 + xOffset, yPosition - height, width, height, 10);
  
        this.feedback = scene.add.text(gameWidth/2 + xOffset, yPosition + yOffset, messageText, {
            font: fontString,
            fill: messageTextColor,
            align: 'center',
            padding: padding
        }).setOrigin(0.5, 1);

        this.destroy = function() {
            this.feedback.destroy();
            this.feedbackBg.destroy();
        }
    }
}
  