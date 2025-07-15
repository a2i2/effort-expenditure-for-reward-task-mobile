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

    init(gameCache: GameCache?) {
        self.gameCache = gameCache
    }

    func makeUIViewController(context: Context) -> EEFRTViewController {
        let controller = EEFRTViewController(gameCache: gameCache)
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
    private var gameCache: GameCache?

    private let publicPath: String
    private let indexFileUrl: URL

    private var interruptionTimeout: Int64?

    init(gameCache: GameCache?) {
        guard let publicPath = Bundle.main.path(forResource: "assets", ofType: nil) else {
            fatalError("Unable to locate 'assets' folder in main bundle")
        }
        guard let indexFileURL = Bundle.main.url(forResource: "assets/index", withExtension: "html") else {
            fatalError("Unable to locate 'assets/index.html' in main bundle")
        }

        self.gameCache = gameCache
        self.publicPath = publicPath
        self.indexFileUrl = indexFileURL
        super.init(nibName: nil, bundle: nil)

        NotificationCenter.default.addObserver(self, selector: #selector(appWasBackgrounded), name: UIApplication.didEnterBackgroundNotification, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(appWillbeForegrounded), name: UIApplication.willEnterForegroundNotification, object: nil)
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
        webView.configuration.userContentController.removeAllScriptMessageHandlers()
        webView.configuration.userContentController.removeAllUserScripts()
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

        // inject the stored calibrationComplete and calibratedMaxPressCount values into the cache
        var cache = gameCache ?? GameCache()
        if let calibrationComplete = Defaults.calibrationComplete, calibrationComplete == true, let calibratedMaxPressCount = Defaults.calibratedMaxPressCount {
            cache.calibrationComplete = calibrationComplete
            cache.maxPressCount = calibratedMaxPressCount
        }

        if let stringifiedGameCache = try? cache.stringify() {
            let gameCacheJsString = "window.setupGameWithCache(\(stringifiedGameCache));"
            let gameCacheUserScript = WKUserScript(source: gameCacheJsString, injectionTime: .atDocumentEnd, forMainFrameOnly: false)
            config.userContentController.addUserScript(gameCacheUserScript)
        } else {
            DispatchQueue.main.async {
                Defaults.gameCache = nil
            }
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

    private func showDismissDialog(closeMessage: CloseMessage) {
        let message = GameConfigUtils.rewardThresholdReached()
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
                if closeMessage.incrementAttemptCount {
                    // increment attempt count in the main app
                    os_log(.debug, "Incremented attempt count")
                }

                if closeMessage.taskRequiresRestart {
                    // the task needs to be restarted
                    os_log(.debug, "Task will be restarted on next load")
                }

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
            /*
                The exit behaviour is slightly different depending on if we've reached the main trials or not:
                If we've reached the main trials, show the exit dialog with the appropriate message based on their completion.
                If they are still in the practice trials, just exit the task.
                We also want to not show the exit dialog if they are shown the Times Up message.

                We may also be requested to exit the task if a significant interruption has occured and will need to determine if the
                task attempt count should be incremented or not as well.
             */
            guard let stringifiedDataFromJS = (message.body as? String)?.data(using: .utf8) else {
                delegate?.eefrtViewControllerDidRequestClose(self)
                return
            }
            do {
                // decode the message from the JS side
                let decoder = JSONDecoder()
                let decodedCloseMessageString = try decoder.decode(String.self, from: stringifiedDataFromJS)
                let closeMessage = try decoder.decode(CloseMessage.self, from: Data(decodedCloseMessageString.utf8))

                // ensure its only incremented if the game is closed, the user has the option to cancel closing the task via the dialog
                if !closeMessage.shouldShowExitDialog, closeMessage.incrementAttemptCount {
                    // increment attempt count - in main app
                    os_log(.debug, "Incremented attempt count")
                }

                // ensure the game data is reset if we've actually closed the task, similar scenario to the shouldShowExitDialog
                if !closeMessage.shouldShowExitDialog, closeMessage.taskRequiresRestart {
                    // the task needs to be restarted
                    os_log(.debug, "Task will be restarted on next load")
                }

                if closeMessage.shouldShowExitDialog {
                    showDismissDialog(closeMessage: closeMessage)
                }
            } catch {
                os_log(.debug, "Unable to decode close message from JS side with error: \(error.localizedDescription)")
            }

            // fallback for if we are unable to decode message or there was no message, just close the view
            delegate?.eefrtViewControllerDidRequestClose(self)

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

            guard let cache = Defaults.gameCache else { return }

            // determine if calibration has been completed, if so then we dont need to set the calibratedMaxPressCount
            if cache.calibrationComplete {
                Defaults.calibrationComplete = true
                return
            }

            // save the highest calibrated max presses
            let storedMaxPresses = Defaults.calibratedMaxPressCount ?? 0
            if cache.maxPressCount > storedMaxPresses {
                Defaults.calibratedMaxPressCount = cache.maxPressCount
            }

        case Self.gameCompleteKey:
            // clear the cache as the user has finished the task
            Defaults.clearEEFRTData()
            delegate?.eefrtViewControllerDidRequestClose(self)

        default:
            os_log(.error, "Message type %s not implemented yet!", message.name)
        }
    }
}

@objc private extension EEFRTViewController {
    func appWasBackgrounded() {
        // update the interruptionTimeout with the time the app was backgrounded
        interruptionTimeout = Int64(Date().timeIntervalSince1970 * 1000) // convert seconds to milliseconds
    }

    func appWillbeForegrounded() {
        guard var cache = Defaults.gameCache,
              let interruptionTimeout else {
            self.interruptionTimeout = nil // reset this value then return
            return
        }
        cache.interruptionTimestamp = interruptionTimeout

        if let stringifiedCache = try? cache.stringify() {
            webView.evaluateJavaScript("window.setupGameWithCache(\(stringifiedCache));")
            self.interruptionTimeout = nil // we can safely remove it from here
        }
    }
}

extension DefaultsKeys {
    var gameCache: DefaultsKey<GameCache?> { .init("gameCache", defaultValue: nil) }
    var calibrationComplete: DefaultsKey<Bool?> { .init("calibrationComplete", defaultValue: nil) }
    var calibratedMaxPressCount: DefaultsKey<Int?> { .init("calibratedMaxPressCount", defaultValue: nil) }
}

private extension OSLog {
    static let file = OSLog(subsystem: "ai.a2i2.conductor.eefrt-demo", category: "EEFRTViewController")
}
