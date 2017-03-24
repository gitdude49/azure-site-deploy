#!/usr/bin/env node
"use strict";

var FILEPATH_CONFIG = './azure-site-deploy.json';
var FILENAME_AZUREDEPLOY = 'azure-site-deploy-touchfile.txt';
var GIT_EXCLUDES = [];
var COMMIT_MESSAGE = 'Azure deploy script';

var fs = require("fs");
var path = require("path");
var request = require('request');
var keytar = require('keytar');

var argv = require('yargs')
    .usage('Usage: $0 -s <site name>')
    .alias('s', 'site')
    .demand(['s'])
    .argv;

if (!checkFile(FILEPATH_CONFIG)) {
    console.log(`Error: config file (${FILEPATH_CONFIG}) not found.`);
    return 1;
};

var config = JSON.parse(fs.readFileSync(FILEPATH_CONFIG, 'utf8'));
var site = config[argv.site];
if (!site) {
    console.log(`Error: config file (${FILEPATH_CONFIG}) does not contain site "${argv.site}".`);
    return 1;
}
checkRequiredSiteProperty(site, 'appServiceName');
checkRequiredSiteProperty(site, 'keychainServiceName');
checkRequiredSiteProperty(site, 'keychainAccountName');
checkRequiredSiteProperty(site, 'buildOutput');

var keychainPassword = keytar.getPassword(site.keychainServiceName, site.keychainAccountName);
if (!keychainPassword) {
    console.log(`Error: failed to retrieve password from keychain/vault, tried using serviceName: "${site.keychainServiceName}", acountName: "${site.keychainAccountName}".`);
    console.log('For OSX Keychain:')
    console.log('- create an "application password" & enter:');
    console.log('   Name: <choose a name you like>"');
    console.log('   Kind: <choose a kind you like>"');
    console.log('   Account: make this match the value for "keychainAccountName"');
    console.log('   Where: make this match the value for "keychainServiceName"');
    console.log('   Password: <your Azure Deployment password');
    return 1;
}

fs.writeFileSync(path.join(site.buildOutput, FILENAME_AZUREDEPLOY), 'Just a file to make sure we have something to commit to GIT, timestamp: ' + (new Date()).getTime());

var DeploymentManager= require('azure-deploy').AzureWebSiteDeploymentManager;

var deploymentManager = new DeploymentManager(site.appServiceName, site.keychainAccountName, keychainPassword);
deploymentManager.deploy(site.buildOutput, GIT_EXCLUDES, COMMIT_MESSAGE).then(function() {
    console.log("DONE");

    if (site.checkUrl) {
        console.log('### Waking up & checking site');
        request(site.checkUrl, function (error, response, body) {
            if (error) {
                console.log(`Error: Site retured error (${error}), sad times.`);
            } else if (response.statusCode == 200) {
                console.log('Site returned response code 200, happy times!');
            } else {
                console.log(`Error: Site retured response !200 (${response.statusCode}), sad times.`);
            };
            console.log();
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
}).catch(function(error) {
    console.log("ERROR: " + error);
    process.exit(1);
});

function checkFile(file) {
    try {
        var stat = fs.statSync(file);
        return stat.isFile();
    } catch (error) {
        return false;
    };
};

function checkRequiredSiteProperty(object, propertyName) {
    var propertyValue = object[propertyName];
    if (!propertyValue || typeof propertyValue !== 'string') {
        throw new Error(`Error: site doesn\'t contain value for "${propertyName}"`);
    };
};
