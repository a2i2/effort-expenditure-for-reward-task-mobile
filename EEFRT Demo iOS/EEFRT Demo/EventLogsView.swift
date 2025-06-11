import OSLog
import SwiftData
import SwiftUI

struct EventLogsView: View {
    @Query(sort: \PracticeTaskResult.createdAt, order: .reverse) var practiceTaskResults: [PracticeTaskResult]
    @Query(sort: \TaskResult.createdAt, order: .reverse) var taskResults: [TaskResult]
    
    @Environment(\.modelContext) private var modelContext

    @State private var shouldShowAlert = false

    var body: some View {
        List {
            Section("Practice attempts") {
                ForEach(practiceTaskResults) { result in
                    VStack {
                        NavigationLink(
                            destination: {
                                do {
                                    let jsonString = try JsonHelpers.stringify(result)
                                    return TaskResultDetailsView(jsonString: jsonString)
                                } catch {
                                    fatalError("Couldn't stringifiy event log we already stringified...")
                                }
                            },
                            label: {
                                Text(result.createdAt?.description ?? "Something went wrong")
                            }
                        )
                    }
                }
                .onDelete(perform: deletePracticeTaskResult)
            }

            Section("Actual attempts") {
                ForEach(taskResults) { result in
                    VStack {
                        NavigationLink(
                            destination: {
                                do {
                                    let jsonString = try JsonHelpers.stringify(result)
                                    return TaskResultDetailsView(jsonString: jsonString)
                                } catch {
                                    fatalError("Couldn't stringifiy event log we already stringified...")
                                }
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
                Button {
                    shouldShowAlert = true
                } label: {
                    Image(systemName: "trash")
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
