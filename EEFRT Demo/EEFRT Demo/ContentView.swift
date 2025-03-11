//
//  ContentView.swift
//  EEFRT Demo
//
//  Created by Nicholas on 5/3/2025.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationStack {
            VStack {
                NavigationLink(
                    destination: EEFRTView(),
                    label: {
                        Text("Begin EEFRT Task")
                    }
                )
            }
            .padding()
        }
    }

    private func beginTask() {}
}

#Preview {
    ContentView()
}
