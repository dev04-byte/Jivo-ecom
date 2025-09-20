@echo off
echo Testing Swiggy CSV upload API...

echo.
echo Testing FC5PO242846.csv...
curl -X POST http://localhost:3000/api/swiggy-pos/upload ^
  -F "file=@C:\Users\singh\Downloads\FC5PO242846.csv" ^
  -H "Content-Type: multipart/form-data"

echo.
echo.
echo Testing PO_1758265329897.csv...
curl -X POST http://localhost:3000/api/swiggy-pos/upload ^
  -F "file=@C:\Users\singh\Downloads\PO_1758265329897.csv" ^
  -H "Content-Type: multipart/form-data"

echo.
echo Test completed!