import Foundation

enum JsonHelpers {
    static func stringify<T: Encodable>(_ value: T) throws -> String {
        let encoder = JSONEncoder()

        let data = try encoder.encode(value)
        let jsonString = String(decoding: data, as: UTF8.self)

        return jsonString
    }
}
