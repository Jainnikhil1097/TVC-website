// Lifts each person out of their studio photo (like Photos' "Lift subject"), using
// macOS's built-in Vision framework: offline, no extra packages. Needs macOS 14+.
//
//   swift scripts/cutout-team-photos.swift "~/Downloads/TVC Photos" /tmp/tvc-cutouts
//
// Writes <same name>.png with a transparent background for every photo in the folder.
// Then frame them for the site with:
//   npm run team:photos -- "~/Downloads/TVC Photos" --cutouts /tmp/tvc-cutouts
import CoreImage
import Foundation
import Vision

let args = CommandLine.arguments.dropFirst().map { ($0 as NSString).expandingTildeInPath }
guard args.count == 2 else {
  print("Usage: swift scripts/cutout-team-photos.swift <photos folder> <output folder>")
  exit(1)
}
let source = URL(fileURLWithPath: args[0])
let output = URL(fileURLWithPath: args[1])
try FileManager.default.createDirectory(at: output, withIntermediateDirectories: true)

let context = CIContext()
let srgb = CGColorSpace(name: CGColorSpace.sRGB)!
let files = try FileManager.default.contentsOfDirectory(at: source, includingPropertiesForKeys: nil)
  .filter { ["jpg", "jpeg", "png", "heic", "webp"].contains($0.pathExtension.lowercased()) }
  .sorted { $0.lastPathComponent < $1.lastPathComponent }

var made = 0
for file in files {
  // Apply the camera orientation first, so the cut-out is upright.
  guard let image = CIImage(contentsOf: file, options: [.applyOrientationProperty: true]) else {
    print("Skipped (unreadable): \(file.lastPathComponent)")
    continue
  }
  let handler = VNImageRequestHandler(ciImage: image, options: [:])
  let request = VNGenerateForegroundInstanceMaskRequest()
  do {
    try handler.perform([request])
    guard let result = request.results?.first, !result.allInstances.isEmpty else {
      print("No subject found: \(file.lastPathComponent)")
      continue
    }
    let masked = try result.generateMaskedImage(ofInstances: result.allInstances, from: handler, croppedToInstancesExtent: false)
    let out = output.appendingPathComponent(file.deletingPathExtension().lastPathComponent + ".png")
    try context.writePNGRepresentation(of: CIImage(cvPixelBuffer: masked), to: out, format: .RGBA8, colorSpace: srgb)
    made += 1
    print("Cut out: \(file.lastPathComponent)")
  } catch {
    print("Failed: \(file.lastPathComponent): \(error)")
  }
}
print("Saved \(made) cut-outs to \(output.path)")
