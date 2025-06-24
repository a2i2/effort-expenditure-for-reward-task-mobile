import SwiftyUserDefaults

extension DefaultsAdapter<DefaultsKeys> {
    func clearEEFRTData() {
        Defaults.remove(\.gameCache)
    }
}
