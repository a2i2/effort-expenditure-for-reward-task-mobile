import Foundation
import SwiftyUserDefaults

struct GameCache: Codable, DefaultsSerializable {
    var practiceComplete: Bool
    var trialNumber: Int
    var maxPressCount: Int
    var coinRunningTotal: Int
    var trialResults: [String: Int]
    var randTrialsIdx: [Int]?
    var trialSeqFilename: String?

    // Default initializer with default values
    init(
        practiceComplete: Bool = false,
        trialNumber: Int = 0,
        maxPressCount: Int = 0,
        coinRunningTotal: Int = 0,
        trialResults: [String: Int] = [:],
        randTrialsIdx: [Int]? = nil,
        trialSeqFilename: String? = nil
    ) {
        self.practiceComplete = practiceComplete
        self.trialNumber = trialNumber
        self.maxPressCount = maxPressCount
        self.coinRunningTotal = coinRunningTotal
        self.trialResults = trialResults
        self.randTrialsIdx = randTrialsIdx
        self.trialSeqFilename = trialSeqFilename
    }

    // Decoder initializer
    init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.practiceComplete = try container.decode(Bool.self, forKey: .practiceComplete)
        self.trialNumber = try container.decode(Int.self, forKey: .trialNumber)
        self.maxPressCount = try container.decode(Int.self, forKey: .maxPressCount)
        self.coinRunningTotal = try container.decode(Int.self, forKey: .coinRunningTotal)
        self.trialResults = try container.decode([String: Int].self, forKey: .trialResults)
        self.randTrialsIdx = try container.decodeIfPresent([Int].self, forKey: .randTrialsIdx)
        self.trialSeqFilename = try container.decodeIfPresent(String.self, forKey: .trialSeqFilename)
    }

    func encode(to encoder: any Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(practiceComplete, forKey: .practiceComplete)
        try container.encode(trialNumber, forKey: .trialNumber)
        try container.encode(maxPressCount, forKey: .maxPressCount)
        try container.encode(coinRunningTotal, forKey: .coinRunningTotal)
        try container.encode(trialResults, forKey: .trialResults)
        try container.encodeIfPresent(randTrialsIdx, forKey: .randTrialsIdx)
        try container.encodeIfPresent(trialSeqFilename, forKey: .trialSeqFilename)
    }

    private enum CodingKeys: String, CodingKey {
        case practiceComplete
        case trialNumber
        case maxPressCount
        case coinRunningTotal
        case trialResults
        case randTrialsIdx
        case trialSeqFilename
    }

    public func stringify() throws -> String {
        let encoder = JSONEncoder()
        let data = try encoder.encode(self)
        return String(decoding: data, as: UTF8.self)
    }
}
