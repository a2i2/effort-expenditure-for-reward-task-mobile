import SwiftUI
import SwiftData

@main
struct EEFRT_DemoApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .modelContainer(for: [
                    PracticeTaskResult.self,
                    TaskResult.self,
                ])
        }
    }
}
