import SwiftUI
import WebKit

struct BottomScreenDialogView: View {
    private var titleText: String
    private var subtitleText: String
    private var actionButtonText: String
    private var timeoutSeconds: TimeInterval
    private var dismissHandler: () -> Void
    private var timeoutHandler: () -> Void
    
    init(titleText: String, subtitleText: String, actionButtonText: String, timeoutSeconds: TimeInterval, dismissHandler: @escaping () -> Void, timeoutHandler: @escaping () -> Void) {
        self.titleText = titleText
        self.subtitleText = subtitleText
        self.actionButtonText = actionButtonText
        self.timeoutSeconds = timeoutSeconds
        self.dismissHandler = dismissHandler
        self.timeoutHandler = timeoutHandler
    }
    
    var body: some View {
        ZStack {
            Color(hex: "#66000000")
            
            VStack {
                Spacer()
                
                ZStack {
                    UnevenRoundedRectangle(cornerRadii: RectangleCornerRadii(topLeading: 25, topTrailing: 25))
                        .foregroundStyle(Color.white)
                    
                    VStack(spacing: 24) {
                        ZStack {
                            Text(titleText)
                                .multilineTextAlignment(.center)
                                .font(.system(size: 18, weight: .bold))
                                .frame(maxWidth: .infinity)
                            
                            HStack {
                                Spacer()
                                
                                TimeProgressView(
                                    countdownSeconds: timeoutSeconds,
                                    timeoutHandler: timeoutHandler
                                )
                                .padding(.trailing)
                            }
                        }
                        .padding(.top)
                        
                        Text(subtitleText)
                            .multilineTextAlignment(.center)
                            .font(.system(size: 14, weight: .regular))
                            .padding(.horizontal)
                        
                        Button {
                            dismissHandler()
                        } label: {
                            ZStack {
                                RoundedRectangle(cornerRadius: 25)
                                    .stroke(Color.orange, lineWidth: 4)
                                    .frame(height: 48)
                                    .foregroundStyle(Color.white)

                                Text(actionButtonText.uppercased())
                                    .foregroundStyle(Color.orange)
                                    .bold()
                            }
                        }
                        .padding()
                        .fixedSize(horizontal: false, vertical: false)
                    }
                    .padding(.vertical)
                }
                .fixedSize(horizontal: false, vertical: true)
            }
        }
        .ignoresSafeArea(edges: .bottom)
    }
}

#Preview {
    BottomScreenDialogView(
        titleText: "Are you still there?",
        subtitleText: "Continue within the next 2 mins to keep collecting coins.",
        actionButtonText: "Continue",
        timeoutSeconds: 120.0,
        dismissHandler: {},
        timeoutHandler: {}
    )
}
