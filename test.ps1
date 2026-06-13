$envLocal = Get-Content ".env.local"
$urlLine = $envLocal | Select-String "NEXT_PUBLIC_SUPABASE_URL="
$url = $urlLine.Line.Split('=', 2)[1].Trim()

$keyLine = $envLocal | Select-String "NEXT_PUBLIC_SUPABASE_ANON_KEY="
$key = $keyLine.Line.Split('=', 2)[1].Trim()

$headers = @{
    "apikey" = $key
    "Authorization" = "Bearer $key"
}

try {
    $response = Invoke-RestMethod -Uri "$url/rest/v1/complaints?select=*" -Headers $headers -Method Get
    Write-Host "Success!"
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error!"
    $_.Exception.Response.StatusCode
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader.ReadToEnd()
}
