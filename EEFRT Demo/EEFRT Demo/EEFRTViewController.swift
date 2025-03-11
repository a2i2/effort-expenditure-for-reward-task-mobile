import os.log
import SwiftUI
import UIKit
import WebKit

protocol EEFRTViewControllerDelegate: AnyObject {
    func eefrtViewControllerDidRequestClose(_ controller: EEFRTViewController)
}

struct EEFRTView: UIViewControllerRepresentable {
    @Environment(\.presentationMode) var presentationMode

    func makeUIViewController(context: Context) -> EEFRTViewController {
        var controller = EEFRTViewController()
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
//    private static let loadedMessageKey = "surveyLoaded"
//    private static let pageMessageKey = "pageChanged"
//    private static let completedMessageKey = "completed"
    private static let closedMessageKey = "close"
//    private static let initialisedMessageKey = "initialised"

    weak var delegate: EEFRTViewControllerDelegate?

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
//        config.userContentController.add(self, name: Self.loadedMessageKey)
//        config.userContentController.add(self, name: Self.pageMessageKey)
//        config.userContentController.add(self, name: Self.completedMessageKey)
        config.userContentController.add(self, name: Self.closedMessageKey)
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
}

extension EEFRTViewController: WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        os_log(.info, log: .file, "Received %s message back from web view", message.name)

        switch message.name {
        case Self.closedMessageKey:
            delegate?.eefrtViewControllerDidRequestClose(self)

        default:
            os_log(.error, "Message type %s not implemented yet!", message.name)
        }
    }
}

private extension OSLog {
    static let file = OSLog(subsystem: "ai.a2i2.conductor.eefrt-demo", category: "EEFRTViewController")
}
