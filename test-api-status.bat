@echo off
echo Testing API endpoints...

echo Testing port 5000...
curl -s http://localhost:5000/api/health > nul 2>&1
if %errorlevel% == 0 (
    echo ✅ API responding on port 5000
    echo Testing Flipkart endpoint...
    curl -X POST -F "file=@C:\Users\singh\Downloads\purchase_order_FNH3G06748277 (1).xls" -F "platform=flipkart" http://localhost:5000/api/po/preview
) else (
    echo ❌ No API on port 5000
)

echo.
echo Testing port 8000...
curl -s http://localhost:8000/api/health > nul 2>&1
if %errorlevel% == 0 (
    echo ✅ API responding on port 8000
    echo Testing Flipkart endpoint...
    curl -X POST -F "file=@C:\Users\singh\Downloads\purchase_order_FNH3G06748277 (1).xls" -F "platform=flipkart" http://localhost:8000/api/po/preview
) else (
    echo ❌ No API on port 8000
)

echo.
echo Testing port 3000...
curl -s http://localhost:3000/api/health > nul 2>&1
if %errorlevel% == 0 (
    echo ✅ API responding on port 3000
    echo Testing Flipkart endpoint...
    curl -X POST -F "file=@C:\Users\singh\Downloads\purchase_order_FNH3G06748277 (1).xls" -F "platform=flipkart" http://localhost:3000/api/po/preview
) else (
    echo ❌ No API on port 3000
)

pause