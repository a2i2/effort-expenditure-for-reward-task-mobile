import OSLog
import SwiftData
import SwiftUI

struct ContentView: View {
    @Environment(\.modelContext) private var modelContext
    @State private var shouldShowAlert = false
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                NavigationLink(
                    destination: EEFRTView()
                        .ignoresSafeArea(edges: [.bottom]),
                    label: {
                        Text("Begin EEFRT Task")
                    }
                )

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

#Preview {
    ContentView()
}
