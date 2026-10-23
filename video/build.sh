#!/usr/bin/env bash
# Assembles the demo video from frames captured by scripts/record.mjs, adds a closing card and an
# original soundtrack synthesised with ffmpeg (music.sh, adapted from the brag workflow).
#   ./build.sh <framesDir> <out.mp4>
set -euo pipefail
cd "$(dirname "$0")"
FRAMES="$1"; OUT="$2"; FPS=25; W=1280; H=720
BOLD=/usr/share/fonts/opentype/inter/InterDisplay-Black.otf
MONO=/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf
mkdir -p work
ffmpeg -y -v error -framerate $FPS -i "$FRAMES/f%05d.png" -vf "format=yuv420p" -c:v libx264 -preset medium -crf 16 work/tour.mp4
TOUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 work/tour.mp4)
OUTRO=3.4
ffmpeg -y -v error -f lavfi -i "color=c=0x06050b:s=${W}x${H}:r=$FPS:d=$OUTRO" -vf \
  "geq=r='6+60*exp(-((X-W/2)*(X-W/2)+(Y-H*0.5)*(Y-H*0.5))/(W*W*0.05))':g='5+22*exp(-((X-W/2)*(X-W/2)+(Y-H*0.5)*(Y-H*0.5))/(W*W*0.05))':b='11+110*exp(-((X-W/2)*(X-W/2)+(Y-H*0.5)*(Y-H*0.5))/(W*W*0.05))',\
drawtext=fontfile=$BOLD:text='GEOVERSE':fontsize=96:fontcolor=0xf3eeff:alpha='min(1\,t/0.6)':x=(w-text_w)/2:y=h*0.40,\
drawtext=fontfile=$MONO:text='EXPLORE BEYOND THE SURFACE':fontsize=20:fontcolor=0xffb14f:alpha='min(1\,max(0\,(t-0.4)/0.6))':x=(w-text_w)/2:y=h*0.40+100,\
drawtext=fontfile=$MONO:text='Real-time WebGL capture of the working site. Independent concept; Earth imagery from the three.js examples (MIT).':fontsize=14:fontcolor=0x8f86ad:alpha='min(1\,max(0\,(t-0.9)/0.6))':x=(w-text_w)/2:y=h-60,format=yuv420p" \
  -c:v libx264 -preset medium -crf 16 work/outro.mp4
XF=0.6
OFF=$(python3 -c "print(round($TOUR-$XF,3))")
TOTAL=$(python3 -c "print(round($TOUR+$OUTRO-$XF,3))")
ffmpeg -y -v error -i work/tour.mp4 -i work/outro.mp4 -filter_complex "[0:v][1:v]xfade=transition=fadeblack:duration=$XF:offset=$OFF,format=yuv420p[v]" -map "[v]" -c:v libx264 -preset medium -crf 16 work/video.mp4
# whooshes on each scripted section move
bash music.sh "$TOTAL" "4.8 7.8 17.2 24.8 34.9 $OFF" work/music.wav
ffmpeg -y -v error -i work/video.mp4 -i work/music.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
echo "built $OUT ($TOTAL s)"
