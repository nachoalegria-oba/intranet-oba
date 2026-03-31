import Foundation
import AppKit

struct IconSpec {
    let size: CGFloat
    let insetRatio: CGFloat
    let outputPath: String
}

func fail(_ message: String) -> Never {
    fputs("Error: \(message)\n", stderr)
    exit(1)
}

guard CommandLine.arguments.count >= 2 else {
    fail("Uso: build_app_icons.swift <logo.png>")
}

let logoPath = CommandLine.arguments[1]
let logoURL = URL(fileURLWithPath: logoPath)

guard let sourceImage = NSImage(contentsOf: logoURL) else {
    fail("No se pudo abrir el logo base")
}

let fileManager = FileManager.default
let baseDir = logoURL.deletingLastPathComponent().path

let specs = [
    IconSpec(size: 180, insetRatio: 0.18, outputPath: "\(baseDir)/icon-180.png"),
    IconSpec(size: 192, insetRatio: 0.18, outputPath: "\(baseDir)/icon-192.png"),
    IconSpec(size: 512, insetRatio: 0.18, outputPath: "\(baseDir)/icon-512.png"),
    IconSpec(size: 512, insetRatio: 0.11, outputPath: "\(baseDir)/icon-maskable-512.png")
]

for spec in specs {
    let canvasSize = NSSize(width: spec.size, height: spec.size)
    let image = NSImage(size: canvasSize)
    image.lockFocus()

    NSColor(calibratedWhite: 0.03, alpha: 1).setFill()
    NSBezierPath(roundedRect: NSRect(origin: .zero, size: canvasSize), xRadius: spec.size * 0.22, yRadius: spec.size * 0.22).fill()

    let availableWidth = spec.size * (1 - spec.insetRatio * 2)
    let logoAspect = sourceImage.size.width / max(sourceImage.size.height, 1)
    let logoWidth = availableWidth
    let logoHeight = logoWidth / max(logoAspect, 0.01)
    let logoRect = NSRect(
        x: (spec.size - logoWidth) / 2,
        y: (spec.size - logoHeight) / 2,
        width: logoWidth,
        height: logoHeight
    )

    sourceImage.draw(in: logoRect, from: .zero, operation: .sourceOver, fraction: 1)
    image.unlockFocus()

    guard
        let tiff = image.tiffRepresentation,
        let rep = NSBitmapImageRep(data: tiff),
        let pngData = rep.representation(using: .png, properties: [:])
    else {
        fail("No se pudo rasterizar un icono")
    }

    let outputURL = URL(fileURLWithPath: spec.outputPath)
    try pngData.write(to: outputURL)
}

print("Iconos generados correctamente")
