import Foundation

struct EventLogsFormatter {
    
    /**
     * Formats a task result using the standard formatting logic
     * that replaces parentheses and commas with newlines for better readability
     */
    static func formatTaskResult<T: Encodable>(_ taskResult: T) -> String {
        do {
            let jsonString = try JsonHelpers.stringify(taskResult)
            return jsonString
                .replacingOccurrences(of: "(", with: "(\n ")
                .replacingOccurrences(of: ",", with: "\n")
                .replacingOccurrences(of: ")", with: "\n)")
        } catch {
            return "Error formatting task result: \(error.localizedDescription)"
        }
    }
    
    /**
     * Formats all event logs (practice and main trials) into a single sharable string
     */
    static func formatAllEventLogs(
        practiceTaskResults: [PracticeTaskResult],
        taskResults: [TaskResult]
    ) -> String {
        var stringBuilder = ""
        
        // Add practice trials section
        stringBuilder += "=== PRACTICE ROUNDS ===\n\n"
        for (index, practiceTaskResult) in practiceTaskResults.sorted(by: { $0.pracTrialNo < $1.pracTrialNo }).enumerated() {
            stringBuilder += "Practice Trial Round \(index):\n"
            stringBuilder += formatTaskResult(practiceTaskResult)
            stringBuilder += "\n\n"
        }
        
        // Add actual trials section
        stringBuilder += "=== MAIN ROUNDS ===\n\n"
        for (index, taskResult) in taskResults.sorted(by: { $0.trialNo < $1.trialNo }).enumerated() {
            stringBuilder += "Main Trial Round \(index):\n"
            stringBuilder += formatTaskResult(taskResult)
            stringBuilder += "\n\n"
        }
        
        return stringBuilder
    }
} 
