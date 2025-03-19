import SwiftUI

struct ContentView: View {
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
                    destination: EventLogsView(),
                    label: {
                        Text("View Event Logs")
                    }
                )
            }
            .padding()
        }
    }
}

#Preview {
    ContentView()
}
