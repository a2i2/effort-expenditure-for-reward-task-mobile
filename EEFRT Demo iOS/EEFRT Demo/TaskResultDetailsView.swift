import SwiftData
import SwiftUI
import UIKit

struct TaskResultDetailsView: View {
    @State private var isSharePresented = false
    private var jsonString: String

    init(jsonString: String) {
        let formattedString = jsonString
            .replacingOccurrences(of: ",", with: ",\n")
            .replacingOccurrences(of: "{", with: "")
            .replacingOccurrences(of: "}", with: "")

        self.jsonString = formattedString
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading) {
                Text(jsonString)
                    .multilineTextAlignment(.leading)
                    .textSelection(.enabled)
                    .frame(width: UIScreen.main.bounds.width)
            }
        }
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: {
                    isSharePresented = true
                }) {
                    Image(systemName: "square.and.arrow.up")
                }
            }
        }
        .sheet(isPresented: $isSharePresented) {
            ActivityView(activityItems: [jsonString])
        }
    }
}

struct ActivityView: UIViewControllerRepresentable {
    let activityItems: [Any]
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: activityItems, applicationActivities: nil)
    }
    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}
