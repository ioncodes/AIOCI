var readlineSync = require('readline-sync');
var fs = require('fs-sync');
var request = require('sync-request');
var HashMap = require('hashmap');

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
console.log("Creating directory...");
fs.mkdir("C:\\Multi-Runner\\bats");
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
      downloads.push("");
      tmpDownloads.push(".NET");
    } else {
      settings.set(".NET", path);
    }
    path = readlineSync.question("Enter the path to 'Nuget.exe' (leave blank to install it automatically): ");
    if(path === "") {
      // install & download
      downloads.push("https://dist.nuget.org/win-x86-commandline/latest/nuget.exe");
      tmpDownloads.push("Nuget");
    } else {
      settings.set("Nuget", path);
    }
  } else if(config === "Java") {
      var yn = readlineSync.question("Is Java in your PATH? (y/n): ");
      if(yn === 'y') {
        // download & copy bat
      } else {
        // download java
        tmpDownloads.push("Java"); // ?
      }
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
console.log("Finished configuring... Let's start setting up :)");

// setup

console.log("Finished :)");
