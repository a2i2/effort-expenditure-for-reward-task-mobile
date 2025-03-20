import Foundation
import SwiftData

@Model
class TaskResult: Codable {
    var createdAt: Date?
    var trialNo: Int
    var trialStartTime: Int
    var trialReward1: Int
    var trialEffort1: Int
    var trialEffortPropMax1: Double
    var trialReward2: Int
    var trialEffort2: Int
    var trialEffortPropMax2: Double
    var choice: String
    var choiceRT: Int
    var pressCount: Int
    var pressTimes: [Int]
    var trialSuccess: Int
    var coinsRunningTotal: Int
    var trialEndTime: Int
    var effortTimeLimit: Int
    var recalibration: Int
    var thresholdMax: Int

    init(trialNo: Int, trialStartTime: Int, trialReward1: Int, trialEffort1: Int, trialEffortPropMax1: Double, trialReward2: Int, trialEffort2: Int, trialEffortPropMax2: Double, choice: String, choiceRT: Int, pressCount: Int, pressTimes: [Int], trialSuccess: Int, coinsRunningTotal: Int, trialEndTime: Int, effortTimeLimit: Int, recalibration: Int, thresholdMax: Int) {
        self.createdAt = Date()
        self.trialNo = trialNo
        self.trialStartTime = trialStartTime
        self.trialReward1 = trialReward1
        self.trialEffort1 = trialEffort1
        self.trialEffortPropMax1 = trialEffortPropMax1
        self.trialReward2 = trialReward2
        self.trialEffort2 = trialEffort2
        self.trialEffortPropMax2 = trialEffortPropMax2
        self.choice = choice
        self.choiceRT = choiceRT
        self.pressCount = pressCount
        self.pressTimes = pressTimes
        self.trialSuccess = trialSuccess
        self.coinsRunningTotal = coinsRunningTotal
        self.trialEndTime = trialEndTime
        self.effortTimeLimit = effortTimeLimit
        self.recalibration = recalibration
        self.thresholdMax = thresholdMax
    }

    required init(from decoder: any Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        self.createdAt = try container.decodeIfPresent(Date.self, forKey: .createdAt)
        self.trialNo = try container.decode(Int.self, forKey: .trialNo)
        self.trialStartTime = try container.decode(Int.self, forKey: .trialStartTime)
        self.trialReward1 = try container.decode(Int.self, forKey: .trialReward1)
        self.trialEffort1 = try container.decode(Int.self, forKey: .trialEffort1)
        self.trialEffortPropMax1 = try container.decode(Double.self, forKey: .trialEffortPropMax1)
        self.trialReward2 = try container.decode(Int.self, forKey: .trialReward2)
        self.trialEffort2 = try container.decode(Int.self, forKey: .trialEffort2)
        self.trialEffortPropMax2 = try container.decode(Double.self, forKey: .trialEffortPropMax2)
        self.choice = try container.decode(String.self, forKey: .choice)
        self.choiceRT = try container.decode(Int.self, forKey: .choiceRT)
        self.pressCount = try container.decode(Int.self, forKey: .pressCount)
        self.pressTimes = try container.decode([Int].self, forKey: .pressTimes)
        self.trialSuccess = try container.decode(Int.self, forKey: .trialSuccess)
        self.coinsRunningTotal = try container.decode(Int.self, forKey: .coinsRunningTotal)
        self.trialEndTime = try container.decode(Int.self, forKey: .trialEndTime)
        self.effortTimeLimit = try container.decode(Int.self, forKey: .effortTimeLimit)
        self.recalibration = try container.decode(Int.self, forKey: .recalibration)
        self.thresholdMax = try container.decode(Int.self, forKey: .thresholdMax)
    }

    func encode(to encoder: any Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(createdAt, forKey: .createdAt)
        try container.encode(trialNo, forKey: .trialNo)
        try container.encode(trialStartTime, forKey: .trialStartTime)
        try container.encode(trialReward1, forKey: .trialReward1)
        try container.encode(trialEffort1, forKey: .trialEffort1)
        try container.encode(trialEffortPropMax1, forKey: .trialEffortPropMax1)
        try container.encode(trialReward2, forKey: .trialReward2)
        try container.encode(trialEffort2, forKey: .trialEffort2)
        try container.encode(trialEffortPropMax2, forKey: .trialEffortPropMax2)
        try container.encode(choice, forKey: .choice)
        try container.encode(choiceRT, forKey: .choiceRT)
        try container.encode(pressCount, forKey: .pressCount)
        try container.encode(pressTimes, forKey: .pressTimes)
        try container.encode(trialSuccess, forKey: .trialSuccess)
        try container.encode(coinsRunningTotal, forKey: .coinsRunningTotal)
        try container.encode(trialEndTime, forKey: .trialEndTime)
        try container.encode(effortTimeLimit, forKey: .effortTimeLimit)
        try container.encode(recalibration, forKey: .recalibration)
        try container.encode(thresholdMax, forKey: .thresholdMax)
    }

    enum CodingKeys: CodingKey {
        case createdAt, trialNo, trialStartTime, trialReward1, trialEffort1, trialEffortPropMax1, trialReward2, trialEffort2, trialEffortPropMax2, choice, choiceRT, pressCount, pressTimes, trialSuccess, coinsRunningTotal, trialEndTime, effortTimeLimit, recalibration, thresholdMax
    }
}
