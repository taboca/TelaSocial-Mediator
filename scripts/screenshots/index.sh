export DISPLAY=:0.0
/usr/bin/xwd -root -out file.xwd
convert file.xwd current.jpg
cp current.jpg ./static

