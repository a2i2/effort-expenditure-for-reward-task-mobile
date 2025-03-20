import SwiftData
import SwiftUI

struct TaskResultDetailsView: View {
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
                    .frame(width: UIScreen.main.bounds.width)
            }
        }
    }
}
