#!/usr/bin/env bash
# music.sh <seconds> "<whoosh times>" <out.wav>
# A short original track synthesised with ffmpeg only, so there is nothing to
# license: an A-minor pad, a soft four-on-the-floor pulse from the first scene,
# quiet hats, and filtered-noise whooshes on the cuts.
set -euo pipefail
D="$1"; WT="$2"; OUT="$3"
T=work/audio; mkdir -p $T

# pad: Am9 sines with slow tremolo, low-passed
ffmpeg -y -v error -f lavfi -i "aevalsrc='0.05*sin(2*PI*110*t)+0.04*sin(2*PI*164.81*t)+0.035*sin(2*PI*220*t)+0.03*sin(2*PI*246.94*t)+0.025*sin(2*PI*329.63*t)':s=48000:d=$D" \
  -af "tremolo=f=0.2:d=0.35,lowpass=f=1400,afade=t=in:d=2,afade=t=out:st=$(python3 -c "print($D-2.5)"):d=2.5" $T/pad.wav

# soft kick every 0.5 s (120 bpm) after 1.6 s, quiet hats on the off-beat
ffmpeg -y -v error -f lavfi -i "aevalsrc='if(gte(t,1.6),0.55*sin(2*PI*(46+90*exp(-mod(t-1.6,0.5)*28))*mod(t-1.6,0.5))*exp(-mod(t-1.6,0.5)*7),0)':s=48000:d=$D" -af "lowpass=f=160" $T/kick.wav
ffmpeg -y -v error -f lavfi -i "aevalsrc='if(gte(t,1.6),0.2*(random(0)*2-1)*exp(-mod(t-1.35,0.5)*60),0)':s=48000:d=$D" -af "highpass=f=6500,volume=0.6" $T/hat.wav

# whooshes
MIX=(-i $T/pad.wav -i $T/kick.wav -i $T/hat.wav)
N=3; FILT=""
i=0
for t in $WT; do
  ffmpeg -y -v error -f lavfi -i "anoisesrc=d=0.7:c=pink:r=48000:a=0.5" -af "bandpass=f=1800:w=1.4,afade=t=in:d=0.3,afade=t=out:st=0.3:d=0.4,volume=0.55" $T/w$i.wav
  MIX+=(-i $T/w$i.wav)
  ms=$(python3 -c "print(int(max(0,$t-0.3)*1000))")
  FILT+="[$((N+i)):a]adelay=${ms}|${ms}[wd$i];"
  i=$((i+1))
done
# chain labels: pad, kick, hat then each delayed whoosh
MIXLIST="[0:a][1:a][2:a]"
for ((j=0;j<i;j++)); do MIXLIST+="[wd$j]"; done
ffmpeg -y -v error "${MIX[@]}" -filter_complex "${FILT}${MIXLIST}amix=inputs=$((3+i)):normalize=0,alimiter=limit=0.89,loudnorm=I=-18:TP=-2:LRA=7" -ar 48000 -ac 2 "$OUT"
