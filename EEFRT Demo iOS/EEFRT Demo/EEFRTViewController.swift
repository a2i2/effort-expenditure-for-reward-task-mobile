import os.log
import SwiftUI
import SwiftyUserDefaults
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

    private var gameCache: GameCache?

    init(gameCache: GameCache? = nil) {
        self.gameCache = gameCache
    }

    func makeUIViewController(context: Context) -> EEFRTViewController {
        let controller = EEFRTViewController(useCachedData: gameCache != nil)
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
    private static let practiceTrialResultMessageKey = "practiceTrialResult"
    private static let trialResultMessageKey = "trialResult"
    private static let currentGameCacheKey = "currentGameCache"
    private static let gameCompleteKey = "gameComplete"

    weak var delegate: EEFRTViewControllerDelegate?

    private var webView: WKWebView!
    private var useCachedData: Bool

    private let publicPath: String
    private let indexFileUrl: URL

    init(useCachedData: Bool = false) {
        guard let publicPath = Bundle.main.path(forResource: "assets", ofType: nil) else {
            fatalError("Unable to locate 'assets' folder in main bundle")
        }
        guard let indexFileURL = Bundle.main.url(forResource: "assets/index", withExtension: "html") else {
            fatalError("Unable to locate 'assets/index.html' in main bundle")
        }

        self.useCachedData = useCachedData
        self.publicPath = publicPath
        self.indexFileUrl = indexFileURL
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

        let topInset: CGFloat = {
            guard
                let windowScene = UIApplication.shared.connectedScenes
                .compactMap({ $0 as? UIWindowScene })
                .first(where: { $0.activationState == .foregroundActive }),
                let window = windowScene.windows.first(where: { $0.isKeyWindow })
            else {
                return 0.0
            }
            return window.safeAreaInsets.top
        }()

        // Execute the following JS after the DOM is loaded
        let injectedJS = "window.EmbedContext.setInsetTop(`\(Int(topInset))`);"
        let userScript = WKUserScript(source: injectedJS, injectionTime: .atDocumentEnd, forMainFrameOnly: false)

        let config = WKWebViewConfiguration()
        config.userContentController = WKUserContentController()
        config.userContentController.addUserScript(userScript)
        config.userContentController.add(self, name: Self.closedMessageKey)
        config.userContentController.add(self, name: Self.practiceTrialResultMessageKey)
        config.userContentController.add(self, name: Self.trialResultMessageKey)
        config.userContentController.add(self, name: Self.currentGameCacheKey)
        config.userContentController.add(self, name: Self.gameCompleteKey)

        config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")

        if useCachedData, let gameCache = try? Defaults.gameCache?.stringify() {
            let gameCacheJsString = "window.setupGameWithCache(\(gameCache));"
            let gameCacheUserScript = WKUserScript(source: gameCacheJsString, injectionTime: .atDocumentEnd, forMainFrameOnly: false)
            config.userContentController.addUserScript(gameCacheUserScript)
        }

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

    private func showDismissDialog(didReachRewardThreshold: Bool) {
        let message = didReachRewardThreshold
            ? "You'll still receive a bonus but won't be able to return to the task and add to your bonus payment."
            : "You have not completed enough rounds to earn the bonus payment and will lose your progress."

        let alert = UIAlertController(
            title: "Quit task?",
            message: message,
            preferredStyle: .alert
        )
        alert.addAction(
            UIAlertAction(
                title: "Cancel",
                style: .cancel
            )
        )
        alert.addAction(
            UIAlertAction(
                title: "Yes, quit task",
                style: .default
            ) { [weak self] _ in
                guard let self else { return }
                delegate?.eefrtViewControllerDidRequestClose(self)
            }
        )

        present(alert, animated: true)
    }
}

extension EEFRTViewController: WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        os_log(.info, log: .file, "Received %s message back from web view", message.name)

        switch message.name {
        case Self.closedMessageKey:
            guard let didReachRewardThresholdFromJS = message.body as? String,
                  let didReachRewardThreshold = Bool(didReachRewardThresholdFromJS) else {
                // couldnt find a flag to signal that the user reached the reward threshold, just exit the task
                delegate?.eefrtViewControllerDidRequestClose(self)
                return
            }

            showDismissDialog(didReachRewardThreshold: didReachRewardThreshold)

        case Self.practiceTrialResultMessageKey:
            guard let stringifiedData = (message.body as? String)?.data(using: .utf8) else { return }
            do {
                os_log(.debug, "%s", message.body as! String)
                let decoder = JSONDecoder()
                let decodedPracticeTaskResultString = try decoder.decode(String.self, from: stringifiedData)
                let decodedPracticeTaskResult = try JSONDecoder().decode(PracticeTaskResult.self, from: Data(decodedPracticeTaskResultString.utf8))
                decodedPracticeTaskResult.createdAt = .now
                delegate?.eefrtViewControllerDidSubmitPracticeResult(practiceResult: decodedPracticeTaskResult)
            } catch {
                os_log(.error, "Couldn't decode practice trial result from EEFRT task into a native object")
            }

        case Self.trialResultMessageKey:
            guard let stringifiedData = (message.body as? String)?.data(using: .utf8) else { return }
            do {
                os_log(.debug, "%s", message.body as! String)
                let decoder = JSONDecoder()
                let decodedTaskResultString = try decoder.decode(String.self, from: stringifiedData)
                let decodedTaskResult = try JSONDecoder().decode(TaskResult.self, from: Data(decodedTaskResultString.utf8))
                decodedTaskResult.createdAt = .now
                delegate?.eefrtViewControllerDidSubmitTaskResult(taskResult: decodedTaskResult)
            } catch {
                os_log(.error, "Couldn't decode main trial result from EEFRT task into a native object")
            }

        case Self.currentGameCacheKey:
            guard let stringifiedData = (message.body as? String)?.data(using: .utf8) else { return }
            do {
                os_log(.debug, "%s", message.body as! String)
                let decoder = JSONDecoder()
                let decodedGameCacheString = try decoder.decode(String.self, from: stringifiedData)
                let decodedGameCache = try decoder.decode(GameCache.self, from: Data(decodedGameCacheString.utf8))
                Defaults.gameCache = decodedGameCache
            } catch {
                os_log(.error, "Couldn't decode game cache from EEFRT task into a native object")
            }

        case Self.gameCompleteKey:
            // clear the cache as the user has finished the task
            Defaults.gameCache = nil
            delegate?.eefrtViewControllerDidRequestClose(self)

        default:
            os_log(.error, "Message type %s not implemented yet!", message.name)
        }
    }
}

extension DefaultsKeys {
    var gameCache: DefaultsKey<GameCache?> { .init("gameCache", defaultValue: nil) }
}

private extension OSLog {
    static let file = OSLog(subsystem: "ai.a2i2.conductor.eefrt-demo", category: "EEFRTViewController")
}
