export default class CloseMessage {
    constructor(shouldShowExitDialog, incrementAttemptCount, taskRequiresRestart) {
        this.shouldShowExitDialog = shouldShowExitDialog;
        this.incrementAttemptCount = incrementAttemptCount;
        this.taskRequiresRestart = taskRequiresRestart;
    }

    stringify() {
        return JSON.stringify(this);
    }
}
