import OSLog
import SwiftData
import SwiftUI

struct EventLogsView: View {
    @Query(sort: \PracticeTaskResult.createdAt, order: .reverse) var practiceTaskResults: [PracticeTaskResult]
    @Query(sort: \TaskResult.createdAt, order: .reverse) var taskResults: [TaskResult]
    
    @Environment(\.modelContext) private var modelContext

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
}
