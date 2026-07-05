Add-Type -AssemblyName System.Drawing

$publicDir = Join-Path $PSScriptRoot "..\public"
$sourcePath = Join-Path $publicDir "flamingo-logo-original.png"
$outputPath = Join-Path $publicDir "flamingo-logo-clean.png"

if (-not (Test-Path $sourcePath)) {
    Copy-Item (Join-Path $publicDir "flamingo-logo.png") $sourcePath
}

$bitmap = [System.Drawing.Bitmap]::FromFile((Resolve-Path $sourcePath).Path)

function Test-Foreground($color) {
    $r = [int]$color.R
    $g = [int]$color.G
    $b = [int]$color.B
    $brightness = ($r + $g + $b) / 3

    # Logo mürekkebi — koyu kahverengi
    if ($brightness -lt 135 -and $r -lt 160 -and $b -lt 130) { return $true }

    # Kenar yumuşatma
    if ($brightness -lt 165 -and $r -lt 185 -and $b -lt 155 -and ($r - $b) -lt 70) { return $true }

    return $false
}

for ($y = 0; $y -lt $bitmap.Height; $y++) {
    for ($x = 0; $x -lt $bitmap.Width; $x++) {
        $pixel = $bitmap.GetPixel($x, $y)
        if (-not (Test-Foreground $pixel)) {
            $bitmap.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Dispose()

Write-Host "Kaydedildi: $outputPath"
