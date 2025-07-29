import Foundation

struct CloseMessage: Codable {
    let shouldShowExitDialog: Bool
    let incrementAttemptCount: Bool
    let taskRequiresRestart: Bool

    init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)

        self.shouldShowExitDialog = try CloseMessage.decodeBoolOrString(forKey: .shouldShowExitDialog, from: container)
        self.incrementAttemptCount = try CloseMessage.decodeBoolOrString(forKey: .incrementAttemptCount, from: container)
        self.taskRequiresRestart = try CloseMessage.decodeBoolOrString(forKey: .taskRequiresRestart, from: container)
    }

    /// Attempts to decode a boolean value for the given key, falling back to decoding a string (e.g., "true"/"false") if needed.
    /// This is necessary because sometimes values sent from the JS side are encoded as strings instead of booleans.
    private static func decodeBoolOrString(forKey key: CodingKeys, from container: KeyedDecodingContainer<CodingKeys>) throws -> Bool {
        if let boolValue = try? container.decode(Bool.self, forKey: key) {
            return boolValue
        }
        if let stringValue = try? container.decode(String.self, forKey: key) {
            return stringValue.lowercased() == "true"
        }
        throw DecodingError.valueNotFound(
            Bool.self,
            .init(
                codingPath: [key],
                debugDescription: "Required field '\(key.stringValue)' not found or not convertible to Bool"
            )
        )
    }

    private enum CodingKeys: String, CodingKey {
        case shouldShowExitDialog
        case incrementAttemptCount
        case taskRequiresRestart
    }
}
