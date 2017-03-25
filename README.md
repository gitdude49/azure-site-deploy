# azure-site-deploy
Node script to quickly perform Azure App Service/Website deployment using GIT deployment.


## Install
Global install:

`npm install -g azure-site-deploy`

Local install:

`npm install --save-dev azure-site-deploy`


## Required configuration file
Create a file **azure-site-deploy.json**. It should contain a map of your site(s), where each site has values for:

- appServiceName

The Azure App Service name we need to deploy for

- keychainServiceName
The Servicename under which your Azure Deployment password is stored in keychain/vault*

- keychainAccountName
The Accountname under which your Azure Deployment password is stored in keychain/vault, also used as Azure deployment 'Username' during deployment*

- buildOutput

The directory containing the content that needs to be deployed to the Azure App Service

- checkUrl

[Optional] The url that needs to be checked after a deployment has been perdormed


## Example Configuration
Filename: azure-site-deploy.json
~~~~
{
    "mysite": {
        "appServiceName": "mysite",
        "keychainServiceName": "Azure Deployment Credentials",
        "keychainAccountName": "MyAzureDeploymentUsername",
        "buildOutput": "./dist",
        "checkUrl": "http://mysite.azurewebsites.net/index.html"
    }
}
~~~~


## Keychain / Vault
For Keychain/Vault interaction [Keytar](https://www.npmjs.com/package/keytar) is being used.

To allow azure-site-deply password work with OSX keychain create an "application password" & enter:

- Name: &lt;choose a name you like&gt;
- Kind: &lt;choose a kind you like&gt;
- Account: make this match the value for "keychainAccountName"
- Where: make this match the value for "keychainServiceName"
- Password: &lt;your Azure Deployment password&gt;

Also make sure to provide the "node" process access to Keychain password entry.


## Run
When azure-site-deploy has been installed globally:
- Perform the project specific build for your project, this should produce output in **buildOutput**
- Run **azure-site-deploy**, use commandline option -s (or --site) and provide the site you want to deploy
```
azure-site-deploy --site mysite
```

When azure-sit-deploy has been installed locally:

Add **azure-site-deploy** to one of the scripts in your **package.json**
```
{
  ... other content in package.json not shown here
  "scripts": {
    "deploy": "dotnet publish && azure-site-deploy --site mysite"
  }
}
```

## * Azure App Service configuration for GIT deployment 
Enable "Local GIT" deployment on your Azure App Service

Also: set "Deployment credentials" for your Azure GIT/FTP deployments. Note: The Azure "Deployment credentials" are a subscription wide setting

