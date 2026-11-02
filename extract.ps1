Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead("Home_Inventory_Expiry_Tracker_Spec.docx")
$entry = $zip.GetEntry("word/document.xml")
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xml = [xml]$reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")
$paragraphs = $xml.SelectNodes("//w:p", $ns)
$lines = [System.Collections.Generic.List[string]]::new()
foreach ($p in $paragraphs) {
    $texts = $p.SelectNodes(".//w:t", $ns)
    if ($texts -and $texts.Count -gt 0) {
        $line = ($texts | ForEach-Object { $_.InnerText }) -join ""
        if (-not [string]::IsNullOrWhiteSpace($line)) {
            $lines.Add($line)
        }
    }
}
[System.IO.File]::WriteAllLines("spec_extracted.txt", $lines, [System.Text.Encoding]::UTF8)
Write-Output "Done. Lines count: $($lines.Count)"

