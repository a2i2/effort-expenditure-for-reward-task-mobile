import OSLog
import SwiftData
import SwiftUI
import SwiftyUserDefaults

struct ContentView: View {
    @ObservedObject private var viewModel = ContentViewModel()
    @Environment(\.modelContext) private var modelContext

    @State private var showingTrialDialog = false
    @State private var navigateToEEFRT = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Button("Start new EEFRT Task") {
                    showingTrialDialog = true
                }
                .confirmationDialog("Choose a Trial", isPresented: $showingTrialDialog, titleVisibility: .visible) {
                    Button("Trial 1") { startTrial(number: 1) }
                    Button("Trial 2") { startTrial(number: 2) }
                    Button("Trial 3") { startTrial(number: 3) }
                    Button("Cancel", role: .cancel) {}
                }

                if viewModel.gameCache?.trialNumber ?? 0 > 0, let cache = viewModel.gameCache {
                    NavigationLink(destination: EEFRTView(gameCache: cache)
                        .ignoresSafeArea()
                        .navigationBarBackButtonHidden()) {
                        Text("Resume current EEFRT Task")
                    }
                }

                NavigationLink(destination: EventLogsView()) {
                    Text("View Event Logs")
                }
            }
            .padding()
            .navigationDestination(isPresented: $navigateToEEFRT) {
                EEFRTView(gameCache: viewModel.gameCache!)
                    .ignoresSafeArea()
                    .navigationBarBackButtonHidden()
            }
        }
    }

    private func startTrial(number: Int) {
        var newGameCache = GameCache()
        switch(number) {
        case 2:
            newGameCache.trialSeqFilename = "trial-seq-2.json"
        case 3:
            newGameCache.trialSeqFilename = "trial-seq-3.json"
        default:
            newGameCache.trialSeqFilename = "trial-seq-1.json"
        }
        Defaults.gameCache = newGameCache
        navigateToEEFRT = true
    }
}
