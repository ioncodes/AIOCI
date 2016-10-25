mkdir build
dir /s /B *.java > sources.txt
javac -d build/ @sources.txt
cd build
xcopy /S ..\src\%3\* %3\
jar cvfe %1 %2 *