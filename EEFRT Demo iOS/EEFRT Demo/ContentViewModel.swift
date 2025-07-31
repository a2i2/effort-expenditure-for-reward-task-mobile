import OSLog
import SwiftData
import SwiftUI
import SwiftyUserDefaults

class ContentViewModel: ObservableObject {
    @Published var gameCache: GameCache? = nil
    @Published var gameMarkedAsComplete: Bool? = nil
    @Published var eefrtAttemptCount: Int? = nil

    private var defaultsGameCacheObserver: DefaultsDisposable?
    private var defaultsGameMarkedAsCompleteObserver: DefaultsDisposable?
    private var defaultsEefrtAttemptCountObserver: DefaultsDisposable?

    init() {
        gameCache = Defaults.gameCache
        gameMarkedAsComplete = Defaults.gameMarkedAsComplete
        eefrtAttemptCount = Defaults.eefrtAttemptCount

        defaultsGameCacheObserver = Defaults.observe(\.gameCache, options: [.new]) { [weak self] newCache in
            self?.gameCache = newCache.newValue?.map { $0 }
        }
        defaultsGameMarkedAsCompleteObserver = Defaults.observe(\.gameMarkedAsComplete, options: [.new]) { [weak self] gameMarkedAsComplete in
            self?.gameMarkedAsComplete = gameMarkedAsComplete.newValue.map { $0 }
        }
        defaultsEefrtAttemptCountObserver = Defaults.observe(\.eefrtAttemptCount, options: [.new]) { [weak self] eefrtAttemptCount in
            self?.eefrtAttemptCount = eefrtAttemptCount.newValue.map { $0 }
        }
    }

    deinit {
        defaultsGameCacheObserver?.dispose()
        defaultsGameMarkedAsCompleteObserver?.dispose()
        defaultsEefrtAttemptCountObserver?.dispose()
    }

    func determineTrialNumberStringFromCache() -> String {
        guard let cache = Defaults.gameCache, cache.practiceComplete else { return "Tutorial" }
        return "Trial \(cache.trialNumber + 1)" // remove the 0 indexing from the trial number
    }
}
