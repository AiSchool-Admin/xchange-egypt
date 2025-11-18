# Xchange Production API Testing - PowerShell Script
# Run this on YOUR Windows machine to test the PRODUCTION backend

# Generate unique email
$timestamp = (Get-Date).ToFileTime()
$individualEmail = "test-indiv-$timestamp@example.com"
$businessEmail = "test-biz-$timestamp@example.com"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "XCHANGE PRODUCTION API TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Backend: https://xchange-egypt-production.up.railway.app" -ForegroundColor Blue
Write-Host "Individual Email: $individualEmail" -ForegroundColor Blue
Write-Host "Business Email: $businessEmail`n" -ForegroundColor Blue

# TEST 1: Individual Registration
Write-Host "TEST 1: Individual Registration" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

$body = @{
    fullName = "John Test User"
    email = $individualEmail
    password = "TestPassword123!"
    phone = "+201234567890"
    city = "Cairo"
    governorate = "Cairo"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://xchange-egypt-production.up.railway.app/api/v1/auth/register/individual" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body

    if ($response.success) {
        Write-Host "✅ SUCCESS: Individual registered!" -ForegroundColor Green
        Write-Host "   User ID: $($response.data.user.id)" -ForegroundColor Cyan
        Write-Host "   Email: $($response.data.user.email)" -ForegroundColor Cyan
        Write-Host "   Full Name: $($response.data.user.fullName)" -ForegroundColor Cyan
        Write-Host "   User Type: $($response.data.user.userType)" -ForegroundColor Cyan
        Write-Host "   Access Token: $($response.data.accessToken.Substring(0,30))..." -ForegroundColor Cyan

        $global:accessToken = $response.data.accessToken
        $global:refreshToken = $response.data.refreshToken
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception.Response
}

Write-Host ""

# TEST 2: Business Registration
Write-Host "TEST 2: Business Registration" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

$body = @{
    fullName = "Sarah Business Owner"
    email = $businessEmail
    password = "TestPassword123!"
    phone = "+201987654321"
    businessName = "Tech Solutions LLC"
    taxId = "TAX987654"
    commercialRegNo = "CR123456"
    city = "Alexandria"
    governorate = "Alexandria"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://xchange-egypt-production.up.railway.app/api/v1/auth/register/business" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body

    if ($response.success) {
        Write-Host "✅ SUCCESS: Business registered!" -ForegroundColor Green
        Write-Host "   User ID: $($response.data.user.id)" -ForegroundColor Cyan
        Write-Host "   Email: $($response.data.user.email)" -ForegroundColor Cyan
        Write-Host "   Full Name: $($response.data.user.fullName)" -ForegroundColor Cyan
        Write-Host "   User Type: $($response.data.user.userType)" -ForegroundColor Cyan
        Write-Host "   Business Name: $($response.data.user.businessName)" -ForegroundColor Cyan
        Write-Host "   Tax ID: $($response.data.user.taxId)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# TEST 3: Login
Write-Host "TEST 3: Login with Individual Account" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

$body = @{
    email = $individualEmail
    password = "TestPassword123!"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://xchange-egypt-production.up.railway.app/api/v1/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body

    if ($response.success) {
        Write-Host "✅ SUCCESS: Login successful!" -ForegroundColor Green
        Write-Host "   Email: $($response.data.user.email)" -ForegroundColor Cyan
        Write-Host "   Full Name: $($response.data.user.fullName)" -ForegroundColor Cyan
        Write-Host "   User Type: $($response.data.user.userType)" -ForegroundColor Cyan
        Write-Host "   New Access Token: $($response.data.accessToken.Substring(0,30))..." -ForegroundColor Cyan

        $global:accessToken = $response.data.accessToken
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# TEST 4: Get User Profile (Protected Route)
Write-Host "TEST 4: Get User Profile (Protected Route)" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

try {
    $headers = @{
        "Authorization" = "Bearer $global:accessToken"
    }

    $response = Invoke-RestMethod -Uri "https://xchange-egypt-production.up.railway.app/api/v1/auth/me" `
        -Method GET `
        -ContentType "application/json" `
        -Headers $headers

    if ($response.success) {
        Write-Host "✅ SUCCESS: Profile retrieved!" -ForegroundColor Green
        Write-Host "   User ID: $($response.data.id)" -ForegroundColor Cyan
        Write-Host "   Email: $($response.data.email)" -ForegroundColor Cyan
        Write-Host "   Full Name: $($response.data.fullName)" -ForegroundColor Cyan
        Write-Host "   User Type: $($response.data.userType)" -ForegroundColor Cyan
        Write-Host "   City: $($response.data.city)" -ForegroundColor Cyan
        Write-Host "   Status: $($response.data.status)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# TEST 5: Logout
Write-Host "TEST 5: Logout" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

$body = @{
    refreshToken = $global:refreshToken
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://xchange-egypt-production.up.railway.app/api/v1/auth/logout" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body

    if ($response.success) {
        Write-Host "✅ SUCCESS: Logout successful!" -ForegroundColor Green
        Write-Host "   Message: $($response.message)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TESTING COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
