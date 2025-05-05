export default class Message {
    constructor(scene, gameWidth, backgroundColor, borderColor, messageText, messageTextColor, yPosition) {
        this.scene = scene;
        this.feedbackBg = scene.add.graphics();
        this.feedbackBg.fillStyle(backgroundColor, 1);
        this.feedbackBg.lineStyle(2, borderColor, 1);
    
        const textXSpacing = 30;
        const textPadding = { x: 0, y: 20 };
        const cameraWidth = scene.cameras.main.width;
        const currentX = scene.cameras.main.scrollX;
        const containerWidth = gameWidth * 0.9;
        const containerXPos = currentX + (cameraWidth * 0.05);
        const wordWrapWidth = containerWidth - textXSpacing * 2
        const textXPos = containerXPos + (containerWidth - wordWrapWidth) / 2;
  
        this.feedback = scene.rexUI.add.BBCodeText(textXPos, yPosition, messageText, {
            fontSize: '14px',
            fontFamily: 'DMSans',
            fontWeight: 'normal',
            fill: messageTextColor,
            align: 'center',
            wrap: {
                mode: 'word',
                width: wordWrapWidth,
            },
            lineSpacing: 2,
            fixedWidth: wordWrapWidth,
            padding: textPadding
        });

        let containerHeight = this.feedback.height

        this.feedbackBg.fillRoundedRect(containerXPos, yPosition, containerWidth, containerHeight, 10);
        this.feedbackBg.strokeRoundedRect(containerXPos, yPosition, containerWidth, containerHeight, 10);

        this.destroy = function() {
            this.feedback.destroy();
            this.feedbackBg.destroy();
        }
    }
}
  