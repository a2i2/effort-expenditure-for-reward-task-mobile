import OSLog
import SwiftData
import SwiftUI

struct EventLogsView: View {
    @Query(sort: \PracticeTaskResult.createdAt, order: .reverse) var practiceTaskResults: [PracticeTaskResult]
    @Query(sort: \TaskResult.createdAt, order: .reverse) var taskResults: [TaskResult]
    
    @Environment(\.modelContext) private var modelContext

    @State private var shouldShowAlert = false
    @State private var isSharePresented = false

    var body: some View {
        List {
            Section("Practice Rounds") {
                ForEach(practiceTaskResults) { result in
                    VStack {
                        NavigationLink(
                            destination: {
                                TaskResultDetailsView(taskResult: result)
                            },
                            label: {
                                Text(result.createdAt?.description ?? "Something went wrong")
                            }
                        )
                    }
                }
                .onDelete(perform: deletePracticeTaskResult)
            }

            Section("Main Rounds") {
                ForEach(taskResults) { result in
                    VStack {
                        NavigationLink(
                            destination: {
                                TaskResultDetailsView(taskResult: result)
                            },
                            label: {
                                Text(result.createdAt?.description ?? "Something went wrong")
                            }
                        )
                    }
                }
                .onDelete(perform: deleteActualTaskResult)
            }
        }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                HStack {
                    Button {
                        isSharePresented = true
                    } label: {
                        Image(systemName: "square.and.arrow.up")
                    }
                    
                    Button {
                        shouldShowAlert = true
                    } label: {
                        Image(systemName: "trash")
                    }
                }
            }
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
        .sheet(isPresented: $isSharePresented) {
            let shareText = EventLogsFormatter.formatAllEventLogs(
                practiceTaskResults: practiceTaskResults,
                taskResults: taskResults
            )
            ActivityView(activityItems: [shareText])
        }
    }
    
    private func deletePracticeTaskResult(at offsets: IndexSet) {
        for index in offsets {
            let practiceTaskResult = practiceTaskResults[index]
            modelContext.delete(practiceTaskResult)
        }
        
        do {
            try modelContext.save()
        } catch {
            os_log("Unable to save changes to the PracticeTaskResults list")
        }
    }
    
    private func deleteActualTaskResult(at offsets: IndexSet) {
        for index in offsets {
            let taskResult = taskResults[index]
            modelContext.delete(taskResult)
        }
        
        do {
            try modelContext.save()
        } catch {
            os_log("Unable to save changes to the TaskResults list")
        }
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

fileprivate struct ActivityView: UIViewControllerRepresentable {
    let activityItems: [Any]
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: activityItems, applicationActivities: nil)
    }
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
