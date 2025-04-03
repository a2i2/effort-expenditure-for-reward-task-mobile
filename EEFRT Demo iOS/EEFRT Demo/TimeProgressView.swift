import SwiftUI
import UIKit

struct TimeProgressView: View {
    private var countdownSeconds: Double
    private var timeoutHandler: () -> Void

    @State private var timeLeft: Double
    @State private var endAngle: Angle = .degrees(360)

    private let clockBackgroundColor: Color = .init(hex: "#D0D5DD")
    private let clockForegroundColor: Color = .init(hex: "#98A2B3")
    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    init(countdownSeconds: Double, timeoutHandler: @escaping () -> Void) {
        self.countdownSeconds = countdownSeconds
        self.timeLeft = countdownSeconds
        self.timeoutHandler = timeoutHandler
    }

    var body: some View {
        ZStack {
            HStack(spacing: 4) {
                GeometryReader { geometry in
                    ZStack {
                        Path { path in
                            let width: CGFloat = min(geometry.size.width, geometry.size.height)
                            let height = width

                            let center = CGPoint(x: width * 0.5, y: height * 0.5)

                            path.move(to: center)

                            path.addArc(center: center, radius: width * 0.5, startAngle: Angle(degrees: -90.0), endAngle: Angle(degrees: -90.0) + .degrees(360), clockwise: false)
                        }
                        .fill(clockBackgroundColor)

                        Path { path in
                            let width: CGFloat = min(geometry.size.width, geometry.size.height)
                            let height = width

                            let center = CGPoint(x: width * 0.5, y: height * 0.5)

                            path.move(to: center)

                            path.addArc(center: center, radius: width * 0.5, startAngle: Angle(degrees: -90.0), endAngle: Angle(degrees: -90.0) + endAngle, clockwise: false)
                        }
                        .fill(clockForegroundColor)
                    }
                }
                .frame(width: 16, height: 16, alignment: .center)
                .aspectRatio(1, contentMode: .fit)
                .onReceive(timer) { _ in
                    if timeLeft == 0 {
                        timer.upstream.connect().cancel()
                        timeoutHandler()
                    } else {
                        timeLeft -= 1
                        endAngle = Angle(degrees: Double((timeLeft / countdownSeconds) * 360))
                    }
                }

                Text("\(timeFormatter(timeRemaining: timeLeft))")
                    .font(Font.custom("Roboto-Bold", size: 16))
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 4)
        .background(Color.init(hex: "#F2F4F7"))
        .cornerRadius(CGFloat(6))
    }

    func timeFormatter(timeRemaining: Double) -> String {
        let roundedTime = Int(timeRemaining)
        let minutes = roundedTime / 60
        let seconds = roundedTime % 60

        return seconds < 10 ? "\(minutes):0\(seconds)" : "\(minutes):\(seconds)"
    }
}

struct TimeProgressView_Previews: PreviewProvider {
    static var previews: some View {
        TimeProgressView(countdownSeconds: 120, timeoutHandler: {})
    }
}
