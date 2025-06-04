import Foundation
import SwiftyUserDefaults

struct GameConfigUtils {
    private static let rewardPaymentThreshold = 0.8

    static func rewardThresholdReached() -> Bool {
        guard let cache = Defaults.gameCache,
              let nTrials = cache.randTrialsIdx?.count else { return false }

        let nTrialsToReachThreshold = Int(Double(nTrials) * rewardPaymentThreshold)
        return cache.trialNumber + 1 >= nTrialsToReachThreshold
    }
}
