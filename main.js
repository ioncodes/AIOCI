var readlineSync = require('readline-sync');
var fs = require('fs-sync');
var request = require('sync-request');
var HashMap = require('hashmap');
var DownloadProgress = require('download-progress');
var spawnSync = require('spawn-sync');
const __BAT = 'C:\\Multi-Runner\\bat';
const __BIN = 'C:\\Multi-Runner\\bin';

console.log("Fetching data...");
var res = request('GET', 'https://raw.githubusercontent.com/ioncodes/GitlabYamls/master/Windows/configs.txt');
var body = res.getBody() + '';
var configs = body.split(',');
var len = configs.length;
for(var i = 0; i < len; i++) {
  console.log(i + ": " + configs[i]);
}
var selectedConfigs = readlineSync.question('Please select all CI configs, you want to be installed. (Comma seperated): ').split(',');
console.log("Preparing installation...");
console.log("Creating directories...");
fs.mkdir(__BAT);
fs.mkdir(__BIN);
var len = selectedConfigs.length;
var settings = new HashMap();
var downloads = new Array();
var tmpDownloads = new Array();
for(var i = 0; i < len; i++) {
  var config = configs[selectedConfigs[i]];
  console.log("Preparing '" + config  + "'");
  if(config === ".NET") {
    var path = readlineSync.question("Enter the path to 'MSBuild.exe' (leave blank to install it automatically): ");
    if(path === "") {
      // install & download
      downloads.push({url: 'https://download.microsoft.com/download/E/E/D/EEDF18A8-4AED-4CE0-BEBE-70A83094FC5A/BuildTools_Full.exe', dest: 'bin/BuildTools_Full.exe'});
      tmpDownloads.push(".NET");
    } else {
      settings.set(".NET", path);
    }
    path = readlineSync.question("Enter the path to 'Nuget.exe' (leave blank to install it automatically): ");
    if(path === "") {
      // install & download
      downloads.push({url: 'https://dist.nuget.org/win-x86-commandline/latest/nuget.exe', dest: 'bin/nuget.exe'});
      tmpDownloads.push("Nuget");
    } else {
      settings.set("Nuget", path);
    }
    downloads.push({url: 'https://raw.githubusercontent.com/ioncodes/GitlabYamls/master/Windows/NET/net_ci.bat', dest: 'bat/net_ci.bat'});
  } else if(config === "Java") {
      var yn = readlineSync.question("Is Java in your PATH? (y/n): ");
      if(yn === 'y') {
        // download & copy bat
      } else {
        // download java
        tmpDownloads.push("Java"); // ?
      }
      downloads.push({url: 'https://raw.githubusercontent.com/ioncodes/GitlabYamls/master/Windows/Java/java_ci.bat', dest: 'bat/java_ci.bat'});
  }
}

console.log("Installed files: ");
settings.forEach(function(value, key) {
    console.log(key + ": " + value);
});

console.log("Files to be installed: ");
len = tmpDownloads.length;
for(var i = 0; i < len; i++) {
  console.log(tmpDownloads[i]);
}

console.log("Writing configuration...");
var tmpIni = new Array();
settings.forEach(function(value, key) {
    tmpIni.push(key + ":" + value);
});

fs.write("settings.ini", JSON.stringify(tmpIni));
console.log("Starting download engine...");

var options = {};
var download = DownloadProgress(downloads, options);

download.get(function (err) {
    if (err) { throw new Error(err); }
    console.log('DONE');
});

console.log("Adding to PATH");
var result = spawnSync('cmd.exe',
                       ['/c', __dirname + '/tools/path.bat > log.txt 2>&1']);

if (result.status !== 0) {
  process.stderr.write(result.stderr);
  process.exit(result.status);
} else {
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
}

console.log("Let's start copying batches!");
fs.copy('bat/', 'C:\\Multi-Runner\\bat\\', options);

console.log("Installing files...");

/* MSBuild.exe */
if(fs.exists('bin/BuildTools_Full.exe')) {
  console.log('Installing MSBuild...');
  result = spawnSync('cmd.exe',
                         ['/c',  __dirname + '/bin/BuildTools_Full.exe /CustomInstallPath '+__BIN+'\\MSBuild\\ > log.txt 2>&1']);

  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status);
  } else {
    process.stdout.write(result.stdout);
    process.stderr.write(result.stderr);
  }
}

/* Nuget */
if(fs.exists('bin/nuget.exe')) {
  console.log('Installing Nuget...');
  fs.copy('bin/nuget.exe', __BIN + '\\Nuget\\nuget.exe');
}

console.log("Finished :)");
