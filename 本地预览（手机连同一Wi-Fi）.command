#!/bin/bash
cd "$(dirname "$0")" || exit 1

PORT=8899
while /usr/sbin/lsof -nP -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT+1))
  if [ "$PORT" -gt 8920 ]; then echo "端口都被占用了，先关掉一些程序再试。"; exit 1; fi
done

IP="$(ipconfig getifaddr en0 2>/dev/null)"
[ -z "$IP" ] && IP="$(ipconfig getifaddr en1 2>/dev/null)"

echo "==============================================="
echo "  组会排班 · 本地预览"
echo "==============================================="
echo "  电脑上用：http://localhost:$PORT/"
if [ -n "$IP" ]; then
  echo "  手机上用（手机连同一个 Wi-Fi）：http://$IP:$PORT/"
fi
echo ""
echo "  手机 Safari 打开上面的地址 → 分享 → 添加到主屏幕"
echo "  结束运行：在这个窗口按 Control-C"
echo "==============================================="

python3 -m http.server "$PORT" --bind 0.0.0.0 &
SRV=$!
sleep 1
open "http://localhost:$PORT/"
wait $SRV
