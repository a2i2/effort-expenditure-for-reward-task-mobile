import os.log
import SwiftUI
import UIKit
import WebKit

// protocol SurveyViewControllerDelegate: AnyObject {
//    func surveyViewController(_ controller: SurveyViewController, didFinishWithResult result: Result<Void, SurveyFailure>)
//    func surveyViewController(_ controller: SurveyViewController, didBeginSubmission survey: Survey)
//    func surveyViewController(_ controller: SurveyViewController, didCompleteSubmission survey: Survey, withResult result: Result<Void, Error>)
// }

struct EEFRTView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> EEFRTViewController {
        EEFRTViewController()
    }

    func updateUIViewController(_ uiViewController: EEFRTViewController, context: Context) {
        // no-op
    }

    typealias UIViewControllerType = EEFRTViewController
}

class EEFRTViewController: UIViewController {
//    private static let loadedMessageKey = "surveyLoaded"
//    private static let pageMessageKey = "pageChanged"
//    private static let completedMessageKey = "completed"
//    private static let closedMessageKey = "close"
//    private static let initialisedMessageKey = "initialised"

//    weak var delegate: SurveyViewControllerDelegate?

    private var webView: WKWebView!

    private let publicPath: String
    private let indexFileUrl: URL

    init() {
        guard let publicPath = Bundle.main.path(forResource: "public", ofType: nil) else {
            fatalError("Unable to locate 'public' folder in main bundle")
        }
        guard let indexFileUrl = Bundle.main.url(forResource: "public/index", withExtension: "html") else {
            fatalError("Unable to locate 'public/index.html' in main bundle")
        }

        self.publicPath = publicPath
        self.indexFileUrl = indexFileUrl
        super.init(nibName: nil, bundle: nil) // TODO: Need to serve the files using a server like the other theming apps to prevent CORS issues
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
//        config.userContentController.add(self, name: Self.loadedMessageKey)
//        config.userContentController.add(self, name: Self.pageMessageKey)
//        config.userContentController.add(self, name: Self.completedMessageKey)
//        config.userContentController.add(self, name: Self.closedMessageKey)
//        config.userContentController.add(self, name: Self.initialisedMessageKey)
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
//        NotificationCenter.default.addObserver(self, selector: #selector(keyboardWillDisappear), name: UIResponder.keyboardWillHideNotification, object: nil)
//        NotificationCenter.default.addObserver(self, selector: #selector(keyboardWillAppear), name: UIResponder.keyboardWillShowNotification, object: nil)
    }

//    @objc func keyboardWillAppear() {
//        let keyboardMessage = messageKeyboardState(payload: messageKeyboardState.Payload(keyboardVisible: true))
//        sendAppMessage(keyboardMessage)
//    }
//
//    @objc func keyboardWillDisappear() {
//        let keyboardMessage = messageKeyboardState(payload: messageKeyboardState.Payload(keyboardVisible: false))
//        sendAppMessage(keyboardMessage)
//    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        NotificationCenter.default.removeObserver(self)
    }
}

private extension OSLog {
    static let file = OSLog(subsystem: "ai.a2i2.conductor.eefrt-demo", category: "EEFRTViewController")
}
