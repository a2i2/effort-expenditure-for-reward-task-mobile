import os.log
import SwiftUI
import UIKit
import WebKit

protocol EEFRTViewControllerDelegate: AnyObject {
    func eefrtViewControllerDidRequestClose(_ controller: EEFRTViewController)
    func eefrtViewControllerDidSubmitPracticeResult(practiceResult: PracticeTaskResult)
    func eefrtViewControllerDidSubmitTaskResult(taskResult: TaskResult)
}

struct EEFRTView: UIViewControllerRepresentable {
    @Environment(\.presentationMode) private var presentationMode
    @Environment(\.modelContext) private var context

    func makeUIViewController(context: Context) -> EEFRTViewController {
        let controller = EEFRTViewController()
        controller.delegate = context.coordinator
        return controller
    }

    func updateUIViewController(_ uiViewController: EEFRTViewController, context: Context) {
        // no-op
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(parent: self)
    }

    typealias UIViewControllerType = EEFRTViewController

    class Coordinator: NSObject, EEFRTViewControllerDelegate {
        func eefrtViewControllerDidSubmitPracticeResult(practiceResult: PracticeTaskResult) {
            parent.context.insert(practiceResult)
        }

        func eefrtViewControllerDidSubmitTaskResult(taskResult: TaskResult) {
            parent.context.insert(taskResult)
        }

        var parent: EEFRTView

        init(parent: EEFRTView) {
            self.parent = parent
        }

        func eefrtViewControllerDidRequestClose(_ controller: EEFRTViewController) {
            parent.presentationMode.wrappedValue.dismiss()
        }
    }
}

class EEFRTViewController: UIViewController {
    private static let closedMessageKey = "close"
    private static let practiceTriaResultMessageKey = "practiceTrialResult"
    private static let trialResultMessageKey = "trialResult"

    weak var delegate: EEFRTViewControllerDelegate?

    private var webView: WKWebView!

    private let publicPath: String
    private let indexFileUrl: URL

    init() {
        guard let publicPath = Bundle.main.path(forResource: "assets", ofType: nil) else {
            fatalError("Unable to locate 'assets' folder in main bundle")
        }
        guard let indexFileUrl = Bundle.main.url(forResource: "assets/index", withExtension: "html") else {
            fatalError("Unable to locate 'assets/index.html' in main bundle")
        }

        self.publicPath = publicPath
        self.indexFileUrl = indexFileUrl
        super.init(nibName: nil, bundle: nil)
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
        webView.configuration.userContentController.removeAllScriptMessageHandlers()
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func loadView() {
        view = UIView()
        view.backgroundColor = .systemBackground

        let config = WKWebViewConfiguration()
        config.userContentController = WKUserContentController()
        config.userContentController.add(self, name: Self.closedMessageKey)
        config.userContentController.add(self, name: Self.practiceTriaResultMessageKey)
        config.userContentController.add(self, name: Self.trialResultMessageKey)
        config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")

        webView = WKWebView(frame: .zero, configuration: config)
        webView.scrollView.isScrollEnabled = false
        webView.translatesAutoresizingMaskIntoConstraints = false
        // Only necessary for iOS 16.4+
        if #available(iOS 16.4, *) {
            webView.isInspectable = true
        }
        view.addSubview(webView)

        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
        ])
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        webView.loadFileURL(indexFileUrl, allowingReadAccessTo: URL(fileURLWithPath: publicPath))
    }
}

extension EEFRTViewController: WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        os_log(.info, log: .file, "Received %s message back from web view", message.name)

        switch message.name {
        case Self.closedMessageKey:
            delegate?.eefrtViewControllerDidRequestClose(self)

        case Self.practiceTriaResultMessageKey:
            guard let stringifiedData = (message.body as? String)?.data(using: .utf8) else { return }
            do {
                os_log(.debug, "%s", message.body as! String)
                let decodedPracticeTaskResult = try JSONDecoder().decode(PracticeTaskResult.self, from: stringifiedData)
                decodedPracticeTaskResult.createdAt = .now
                delegate?.eefrtViewControllerDidSubmitPracticeResult(practiceResult: decodedPracticeTaskResult)
            } catch {
                os_log(.error, "Couldn't decode response from EEFRT task into a native object")
            }

        case Self.trialResultMessageKey:
            guard let stringifiedData = (message.body as? String)?.data(using: .utf8) else { return }
            do {
                os_log(.debug, "%s", message.body as! String)
                let decodedTaskResult = try JSONDecoder().decode(TaskResult.self, from: stringifiedData)
                decodedTaskResult.createdAt = .now
                delegate?.eefrtViewControllerDidSubmitTaskResult(taskResult: decodedTaskResult)
            } catch {
                os_log(.error, "Couldn't decode response from EEFRT task into a native object")
            }

        default:
            os_log(.error, "Message type %s not implemented yet!", message.name)
        }
    }
}

private extension OSLog {
    static let file = OSLog(subsystem: "ai.a2i2.conductor.eefrt-demo", category: "EEFRTViewController")
}
