import Foundation
import CoreGraphics
import ImageIO
import UniformTypeIdentifiers

struct Config {
    let inputPath: String
    let outputPath: String
    let padding: Int
    let targetWidth: Int
}

func fail(_ message: String) -> Never {
    fputs("Error: \(message)\n", stderr)
    exit(1)
}

guard CommandLine.arguments.count >= 3 else {
    fail("Uso: extract_logo.swift <input.png> <output.png>")
}

let config = Config(
    inputPath: CommandLine.arguments[1],
    outputPath: CommandLine.arguments[2],
    padding: 12,
    targetWidth: 2600
)

let inputURL = URL(fileURLWithPath: config.inputPath)
guard let source = CGImageSourceCreateWithURL(inputURL as CFURL, nil),
      let cgImage = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
    fail("No se pudo leer la imagen de entrada")
}

let width = cgImage.width
let height = cgImage.height
let bytesPerPixel = 4
let bytesPerRow = width * bytesPerPixel
let bitsPerComponent = 8
let colorSpace = CGColorSpaceCreateDeviceRGB()
let bitmapInfo = CGImageAlphaInfo.premultipliedLast.rawValue

guard let context = CGContext(
    data: nil,
    width: width,
    height: height,
    bitsPerComponent: bitsPerComponent,
    bytesPerRow: bytesPerRow,
    space: colorSpace,
    bitmapInfo: bitmapInfo
) else {
    fail("No se pudo crear el contexto base")
}

context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
guard let data = context.data else {
    fail("No se pudo acceder a los píxeles")
}

let pixels = data.bindMemory(to: UInt8.self, capacity: width * height * bytesPerPixel)

var minX = width
var minY = height
var maxX = 0
var maxY = 0

for y in 0..<height {
    for x in 0..<width {
        let offset = y * bytesPerRow + x * bytesPerPixel
        let r = Double(pixels[offset])
        let g = Double(pixels[offset + 1])
        let b = Double(pixels[offset + 2])
        let luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
        let normalized = max(0.0, min(1.0, (255.0 - luminance) / 255.0))
        let clipped: Double
        if normalized < 0.18 {
            clipped = 0
        } else if normalized > 0.74 {
            clipped = 1
        } else {
            clipped = pow((normalized - 0.18) / (0.74 - 0.18), 0.72)
        }
        let alpha = UInt8(max(0, min(255, Int(clipped * 255.0))))

        pixels[offset] = 255
        pixels[offset + 1] = 255
        pixels[offset + 2] = 255
        pixels[offset + 3] = alpha

        if alpha > 20 {
            minX = min(minX, x)
            minY = min(minY, y)
            maxX = max(maxX, x)
            maxY = max(maxY, y)
        }
    }
}

if minX >= maxX || minY >= maxY {
    fail("No se detectó un logo oscuro sobre fondo claro")
}

let cropX = max(0, minX - config.padding)
let cropY = max(0, minY - config.padding)
let cropWidth = min(width - cropX, (maxX - minX) + config.padding * 2)
let cropHeight = min(height - cropY, (maxY - minY) + config.padding * 2)
let cropRect = CGRect(x: cropX, y: cropY, width: cropWidth, height: cropHeight)

guard let whitenedImage = context.makeImage(),
      let croppedImage = whitenedImage.cropping(to: cropRect) else {
    fail("No se pudo recortar el logo")
}

let scale = CGFloat(config.targetWidth) / CGFloat(croppedImage.width)
let targetHeight = Int(CGFloat(croppedImage.height) * scale)
let targetBytesPerRow = config.targetWidth * bytesPerPixel

guard let outputContext = CGContext(
    data: nil,
    width: config.targetWidth,
    height: targetHeight,
    bitsPerComponent: bitsPerComponent,
    bytesPerRow: targetBytesPerRow,
    space: colorSpace,
    bitmapInfo: bitmapInfo
) else {
    fail("No se pudo crear el contexto de salida")
}

outputContext.interpolationQuality = .high
outputContext.clear(CGRect(x: 0, y: 0, width: config.targetWidth, height: targetHeight))
outputContext.draw(croppedImage, in: CGRect(x: 0, y: 0, width: config.targetWidth, height: targetHeight))

guard let finalImage = outputContext.makeImage() else {
    fail("No se pudo generar la imagen final")
}

let outputURL = URL(fileURLWithPath: config.outputPath)
guard let destination = CGImageDestinationCreateWithURL(outputURL as CFURL, UTType.png.identifier as CFString, 1, nil) else {
    fail("No se pudo crear el destino PNG")
}

CGImageDestinationAddImage(destination, finalImage, nil)
if !CGImageDestinationFinalize(destination) {
    fail("No se pudo guardar el PNG de salida")
}

print("Logo exportado en \(config.outputPath)")
