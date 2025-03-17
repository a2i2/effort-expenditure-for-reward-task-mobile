import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationStack {
            VStack {
                NavigationLink(
                    destination: EEFRTView()
                        .ignoresSafeArea(edges: [.bottom]),
                    label: {
                        Text("Begin EEFRT Task")
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
