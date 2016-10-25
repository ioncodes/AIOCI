echo "Restoring NuGet Packages..."
"C:\Nuget\nuget.exe" restore %1".sln"
echo "Release build..."
C:\Windows\Microsoft.NET\Framework64\v4.0.30319\MSBuild.exe /consoleloggerparameters:ErrorsOnly /maxcpucount /nologo /property:Configuration=Release /verbosity:quiet %1".sln"