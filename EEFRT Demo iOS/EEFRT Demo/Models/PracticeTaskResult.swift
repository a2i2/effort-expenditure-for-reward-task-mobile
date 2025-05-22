import Foundation
import SwiftData

@Model
class PracticeTaskResult: Codable {
    var createdAt: Date?
    var pracTrialNo: Int
    var trialReward: Int
    var trialEffort: Int
    var pressCount: Int
    var pressTimes: [Int]
    var trialSuccess: Int
    var maxPressCount: Int

    init(pracTrialNo: Int, trialReward: Int, trialEffort: Int, pressCount: Int, pressTimes: [Int], trialSuccess: Int, maxPressCount: Int) {
        self.createdAt = Date()
        self.pracTrialNo = pracTrialNo
        self.trialReward = trialReward
        self.trialEffort = trialEffort
        self.pressCount = pressCount
        self.pressTimes = pressTimes
        self.trialSuccess = trialSuccess
        self.maxPressCount = maxPressCount
    }

    required init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.createdAt = try container.decodeIfPresent(Date.self, forKey: .createdAt)
        self.pracTrialNo = try container.decode(Int.self, forKey: .pracTrialNo)
        self.trialReward = try container.decode(Int.self, forKey: .trialReward)
        self.trialEffort = try container.decode(Int.self, forKey: .trialEffort)
        self.pressCount = try container.decode(Int.self, forKey: .pressCount)
        self.pressTimes = try container.decode([Int].self, forKey: .pressTimes)
        self.trialSuccess = try container.decode(Int.self, forKey: .trialSuccess)
        self.maxPressCount = try container.decode(Int.self, forKey: .maxPressCount)
    }

    func encode(to encoder: any Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(createdAt, forKey: .createdAt)
        try container.encode(pracTrialNo, forKey: .pracTrialNo)
        try container.encode(trialReward, forKey: .trialReward)
        try container.encode(trialEffort, forKey: .trialEffort)
        try container.encode(pressCount, forKey: .pressCount)
        try container.encode(pressTimes, forKey: .pressTimes)
        try container.encode(trialSuccess, forKey: .trialSuccess)
        try container.encode(maxPressCount, forKey: .maxPressCount)
    }

    enum CodingKeys: String, CodingKey {
        case createdAt, pracTrialNo, trialReward, trialEffort, pressCount, pressTimes, trialSuccess, maxPressCount
    }
}
