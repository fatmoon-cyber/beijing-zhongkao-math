@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo [1/3] 启动本地服务器（端口8765）...
netstat -ano | findstr LISTENING | findstr :8765 >nul
if errorlevel 1 (
  powershell -NoProfile -Command "Start-Process -WindowStyle Hidden python -ArgumentList '-u','-m','http.server','8765' -WorkingDirectory '%~dp0' -RedirectStandardOutput '%~dp0server-access.log' -RedirectStandardError '%~dp0server-error.log'"
  timeout /t 2 /nobreak >nul
)

echo [2/3] 启动公网隧道（Cloudflare）...
taskkill /f /im cloudflared.exe >nul 2>&1
del tunnel.log >nul 2>&1
powershell -NoProfile -Command "Start-Process -WindowStyle Hidden '%USERPROFILE%\cloudflared.exe' -ArgumentList 'tunnel','--url','http://127.0.0.1:8765' -RedirectStandardError '%~dp0tunnel.log' -RedirectStandardOutput '%~dp0tunnel-out.log'"

echo [3/3] 等待公网网址生成（约10秒）...
timeout /t 12 /nobreak >nul
echo.
echo ============= 分享网址（发给别人即可） =============
findstr /i "trycloudflare.com" tunnel.log
echo ====================================================
echo.
echo 说明：网址每次重新启动隧道都会变化；分享期间请保持本电脑开机、不关闭后台进程。
echo 若上方未显示网址，请稍等几秒后打开 tunnel.log 查找 trycloudflare.com。
echo.
pause
