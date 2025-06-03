import OSLog
import SwiftData
import SwiftUI
import SwiftyUserDefaults

struct ContentView: View {
    @ObservedObject private var viewModel = ContentViewModel()
    @Environment(\.modelContext) private var modelContext
    @State private var shouldShowAlert = false

    @State private var showingTrialDialog = false
    @State private var navigateToEEFRT = false
    @State private var newGameCache = GameCache()

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

                NavigationLink(
                    destination:
                    EventLogsView()
                        .toolbar {
                            ToolbarItem(placement: .topBarTrailing) {
                                Button {
                                    showAlert()
                                } label: {
                                    Image(systemName: "trash")
                                }
                            }
                        },
                    label: {
                        Text("View Event Logs")
                    }
                )
            }
            .padding()
            .navigationDestination(isPresented: $navigateToEEFRT) {
                EEFRTView(gameCache: newGameCache)
                    .ignoresSafeArea()
                    .navigationBarBackButtonHidden()
            }
            .alert(isPresented: $shouldShowAlert) {
                Alert(
                    title: Text("Delete all events logs"),
                    message: Text("Are you sure you want to remove all the practice and actual trial event log data?"),
                    primaryButton: .destructive(Text("Delete")) {
                        removeAllEventLogs()
                    },
                    secondaryButton: .cancel {}
                )
            }
        }
    }

    private func startTrial(number: Int) {
        newGameCache = GameCache()
        switch(number) {
        case 2:
            newGameCache.trialSeqFilename = "trial-seq-2.json"
        case 3:
            newGameCache.trialSeqFilename = "trial-seq-3.json"
        default:
            newGameCache.trialSeqFilename = "trial-seq-1.json"
        }
        viewModel.gameCache = newGameCache
        navigateToEEFRT = true
    }

    private func showAlert() {
        shouldShowAlert = true
    }

    private func removeAllEventLogs() {
        let practiceEvents = try? modelContext.fetch(FetchDescriptor<PracticeTaskResult>())
        let actualEvents = try? modelContext.fetch(FetchDescriptor<TaskResult>())

        guard let practiceEvents, let actualEvents else { return }

        practiceEvents.forEach { practiceEvent in
            modelContext.delete(practiceEvent)
        }

        actualEvents.forEach { trialData in
            modelContext.delete(trialData)
        }

        do {
            try modelContext.save()
        } catch {
            os_log(.error, "Error saving modelContext after deletion: \(error)")
        }
    }
}
