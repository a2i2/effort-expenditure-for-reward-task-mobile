import SwiftData
import SwiftUI
import UIKit

struct TaskResultDetailsView<T: Encodable>: View {
    @State private var isSharePresented = false
    private var formattedString: String

    init(taskResult: T) {
        self.formattedString = EventLogsFormatter.formatTaskResult(taskResult)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading) {
                Text(formattedString)
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
            ActivityView(activityItems: [formattedString])
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
