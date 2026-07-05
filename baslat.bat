@echo off
chcp 65001 >nul
title Flamingo Bar - Stok ve Satis
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo.
    echo  [HATA] Node.js bulunamadi!
    echo.
    echo  Siteyi calistirmak icin once Node.js yuklemeniz gerekiyor:
    echo  https://nodejs.org/tr/download
    echo.
    echo  Kurulumdan sonra bu dosyaya cift tiklayin.
    echo.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo.
    echo  Bagimliliklar yukleniyor, lutfen bekleyin...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo  [HATA] npm install basarisiz oldu.
        pause
        exit /b 1
    )
)

echo.
echo  Flamingo Bar baslatiliyor...
echo  Tarayici otomatik acilacak: http://localhost:5173
echo  Kapatmak icin bu pencerede Ctrl+C basin.
echo.

start "" "http://localhost:5173"
call npm run dev

pause
