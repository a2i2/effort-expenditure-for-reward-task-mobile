import OSLog
import SwiftData
import SwiftUI
import SwiftyUserDefaults

class ContentViewModel: ObservableObject {
    @Published var gameCache: GameCache? = nil

    private var defaultsObserver: DefaultsDisposable?

    init() {
        gameCache = Defaults.gameCache
        defaultsObserver = Defaults.observe(\.gameCache, options: [.new]) { [weak self] newCache in
            self?.gameCache = newCache.newValue?.map { $0 }
        }
    }

    deinit {
        defaultsObserver?.dispose()
    }
}
