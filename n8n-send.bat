@echo off
setlocal EnableDelayedExpansion
set "INPUT=%~1"
set "OUTPUT=%~2"
set "INPUT=!INPUT:\=\\!"
set "OUTPUT=!OUTPUT:\=\\!"
curl -X POST http://127.0.0.1:3333/api/inject-file -H "Content-Type: application/json" -d "{\"filePath\":\"!INPUT!\",\"outputPath\":\"!OUTPUT!\",\"autoRender\":true}"
