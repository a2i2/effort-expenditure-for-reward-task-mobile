import Foundation

struct CloseMessage: Codable {
    let shouldShowExitDialog: Bool
    let incrementAttemptCount: Bool
    let taskRequiresRestart: Bool

    init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        // swift sometimes struggles decoding boolean values from the JS side so provide fallback to decode the string value instead
        if let decodedBoolValue = try? container.decode(Bool.self, forKey: .shouldShowExitDialog) {
            self.shouldShowExitDialog = decodedBoolValue
        } else if let decodedStringValue = try? container.decode(String.self, forKey: .shouldShowExitDialog) {
            self.shouldShowExitDialog = decodedStringValue.lowercased() == "true"
        } else {
            throw DecodingError.valueNotFound(Bool.self, .init(codingPath: [CodingKeys.shouldShowExitDialog], debugDescription: "Required field 'shouldShowExitDialog' not found"))
        }

        if let decodedBoolValue = try? container.decode(Bool.self, forKey: .incrementAttemptCount) {
            self.incrementAttemptCount = decodedBoolValue
        } else if let decodedStringValue = try? container.decode(String.self, forKey: .incrementAttemptCount) {
            self.incrementAttemptCount = decodedStringValue.lowercased() == "true"
        } else {
            throw DecodingError.valueNotFound(Bool.self, .init(codingPath: [CodingKeys.incrementAttemptCount], debugDescription: "Required field 'incrementAttemptCount' not found"))
        }

        if let decodedBoolValue = try? container.decode(Bool.self, forKey: .taskRequiresRestart) {
            self.taskRequiresRestart = decodedBoolValue
        } else if let decodedStringValue = try? container.decode(String.self, forKey: .taskRequiresRestart) {
            self.taskRequiresRestart = decodedStringValue.lowercased() == "true"
        } else {
            throw DecodingError.valueNotFound(Bool.self, .init(codingPath: [CodingKeys.taskRequiresRestart], debugDescription: "Required field 'taskRequiresRestart' not found"))
        }
    }

    private enum CodingKeys: String, CodingKey {
        case shouldShowExitDialog
        case incrementAttemptCount
        case taskRequiresRestart
    }
}
