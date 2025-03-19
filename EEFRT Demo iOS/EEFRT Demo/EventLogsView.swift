import SwiftData
import SwiftUI

struct EventLogsView: View {
    @Query(sort: \PracticeTaskResult.createdAt, order: .reverse) var practiceTaskResults: [PracticeTaskResult]
    @Query(sort: \TaskResult.createdAt, order: .reverse) var taskResults: [TaskResult]

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
            }
        }
    }
}
