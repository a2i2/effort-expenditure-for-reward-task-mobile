package ai.a2i2.conductor.effrtdemoandroid.ui

import ai.a2i2.conductor.effrtdemoandroid.ui.data.EefrtTaskAttempt

object EventLogsFormatter {
    
    /**
     * Formats an EEFRT task attempt using the standard formatting logic
     * that replaces parentheses and commas with newlines for better readability
     */
    fun formatTaskAttempt(taskAttempt: EefrtTaskAttempt): String {
        return taskAttempt.toString()
            .replace("(", "(\n ")
            .replace(",", "\n")
            .replace(")", "\n)")
    }
    
    /**
     * Formats all event logs (practice and main trials) into a single sharable string
     */
    fun formatAllEventLogs(
        practiceTaskAttempts: List<ai.a2i2.conductor.effrtdemoandroid.persistence.PracticeTaskAttempt>,
        actualTaskAttempts: List<ai.a2i2.conductor.effrtdemoandroid.persistence.TaskAttempt>
    ): String {
        val stringBuilder = StringBuilder()
        
        // Add practice trials section
        stringBuilder.append("=== PRACTICE ROUNDS ===\n\n")
        practiceTaskAttempts.sortedBy { it.pracTrialNo }.forEachIndexed { index, practiceTaskAttempt ->
            stringBuilder.append("Practice Trial Round ${index}:\n")
            stringBuilder.append(formatTaskAttempt(practiceTaskAttempt))
            stringBuilder.append("\n\n")
        }
        
        // Add actual trials section
        stringBuilder.append("=== MAIN ROUNDS ===\n\n")
        actualTaskAttempts.sortedBy { it.trialNo }.forEachIndexed { index, taskAttempt ->
            stringBuilder.append("Main Trial Round ${index}:\n")
            stringBuilder.append(formatTaskAttempt(taskAttempt))
            stringBuilder.append("\n\n")
        }
        
        return stringBuilder.toString()
    }
} 