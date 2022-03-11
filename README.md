# [Monacoducks.com (staging) preview here](https://www.monacoducks.com/?_ab=0&_fd=0&_sc=1&preview_theme_id=120165662781)

[![PRE-PRODUCTION DEPLOYMENT](https://github.com/ShopLab-Team/monacoduck/actions/workflows/pre-production.yaml/badge.svg)](https://github.com/ShopLab-Team/monacoduck/actions/workflows/pre-production.yaml)
[![PRODUCTION DEPLOYMENT](https://github.com/ShopLab-Team/monacoduck/actions/workflows/production.yaml/badge.svg)](https://github.com/ShopLab-Team/monacoduck/actions/workflows/production.yaml)

## Prerequisites
- [Node JS](https://nodejs.org/en/download/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install)
- [Themekit](https://shopify.dev/tools/theme-kit/getting-started)

## Index
- [1. Setup & Branches](#1-setup--branches)
- [2. Install Packages](#2-install-packages)
- [3. Setup remote shopify theme](#3-setup-remote-shopify-theme)
- [4. Download/Deploy your theme](#4-downloaddeploy-your-theme)
- [5. Setup the Theme](#5-setup-the-theme)
- [6. Initial deployment](#6-initial-deployment)
- [7. Start your work](#7-start-your-work)
- [8. SSL fix for localhost](#8-ssl-fix-for-localhost)
- [9. Starting up your Development](#9-starting-up-your-development)
- [10. Complete your work and deploy](#10-complete-your-work-and-deploy)

### 1. Setup & Branches
Clone the repository and setup a feature branch from master:

`git clone git@github.com:ShopLab-Team/MY_REPOSITORY_URL.git`

Create your new feature branch from main tree.
***Always create a new branch from the latest master branch!****

`git checkout -b feat/my_feature_title`

### 2. Install Packages
All the build tools and packages are located inside the the [/dev/](dev) folder
```
cd /dev/
yarn install
```
After the command completed, all required packages should have been installed.

### 3. Setup remote shopify theme
Go to the project [root folder](/).

Make a copy of the `sample.config.yml` and rename it to `config.yml`.

Login to shopify, duplicate the published theme and create a private app. At last fill out the `config.yml` with the required credentials.

**IF there is no theme installed in the repository, then you need to download it from shopify first.**

### 4. Download/Deploy your theme
If you already have a theme in the root folder of the repository then you do not need to download theme anymore. If there is no theme installed in the repository, then you need to run inside the root folder `theme download`. 

***If*** there is a theme already setup in the repository, then you can go to ***step 6.***

### 5. Setup the Theme
We are using simple code splitting techniques, so you need to add two lines of code to your theme.liquid.

Inside the theme.liquid - before the closing `</head>` tag insert: 

`{%- render 'lab.styles-tag' -%}`

Still inside the theme.liquid - before the closing `</body>` tag insert:

`{%- render 'lab.scripts-tag' -%}`

### 6. Initial deployment
To make sure you have all the required files, specially the compiled ones - you need to go to the [dev](dev) folder and run the following command once:

`yarn build`

This will build and compile all assets and generate the required liquid snippets and then upload the changes to your default `--development` theme. 

### 7. Start your work
To get started using [browsersync](https://browsersync.io/) you need to also add some credentials into an [enviroment](dev/sample.env.json). 

Create a copy of the `sample.env.json` and rename it to `env.json`. Fill out the env.json file with the required credentials.

Still inside the [dev](dev) folder - run the command to startup the engines:

`yarn dev`

This will start the following services:
```
$ themekit watch
$ gulp watch // inside dev folder
$ browsersync // inside gulpfile task
```

The browser should open with localhost url basically proxying the theme preview. 
Now themekit & gulp is watching for file changes. When you trigger any filechange - either the file will be compiled or directly uploaded to shopify. The gulp task will also tell browsersync to reload the browser after 4 seconds delay automatically. CSS files are injected without a page-reload. 

### 8. SSL fix for localhost
If you encounter this issue and you use chrome - then you can apply this flag to allow connection. This should be fairly safe and confirmed workaround.
`chrome://flags/#allow-insecure-localhost`

### 9. Starting up your Development
cd into your dev folder and then simply run this:

```
yarn dev
```
This will now run the gulp tasks and also startup a proxy to the shopify url with browsersync.
It will also start themekit watch process at the same time. 

When you make changes to any files, it will detect and reload the browser. For CSS it will hotreload it without reloading whole browser.
Because of themekit timeouts we increased timing of browsersync to make sure the files are uploaded before reloading. Increase this if you have poor internet connection.

### 10. Complete your work and deploy
When you completed your work - you add and commit your changes in your `feat/my_branch_title`. 

After that head to github and create a [Pull Request](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).

Try to describe your Pull Request with "bare minimum" information. The more the better the code-reviewer can understand what you did. 

Depending on the Workflow Setup - a Pull Request should trigger a automatic deployment to the client's (pre-production) theme. The QA-Team will take over from there and notify you if any changes or error occur. The Pull Request should remain open until the requested "Code Reviewer" approved your changes and closed the Pull Request.

If changes are requested, then you can do them in the same branch of course `feat/my_branch_title` and they will show up in the Pull Request commit history. It will also trigger a new (pre-production) deployment if setup.

Upon closing the Pull Request, your `feat/my_branch_title` will be deleted automatically. 

 
#### Make this happen
- Improve error handling
- Integrate proper sass linter 

