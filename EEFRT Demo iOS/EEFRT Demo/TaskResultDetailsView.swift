import SwiftData
import SwiftUI
import UIKit

struct TaskResultDetailsView: View {
    @State private var showCopiedAlert = false
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
                    UIPasteboard.general.string = jsonString
                    showCopiedAlert = true
                }) {
                    Image(systemName: "doc.on.doc")
                }
            }
        }
        .alert("Copied!", isPresented: $showCopiedAlert) {
            Button("OK", role: .cancel) { }
        } message: {
            Text("Text copied to clipboard")
        }
    }
}
