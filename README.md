# Raappid

Project Scaffolding Tool

[![Coverage Status](https://coveralls.io/repos/coolchem/raappid/badge.svg?branch=master&service=github)](https://coveralls.io/github/coolchem/raappid?branch=master)  [![Build Status](https://travis-ci.org/coolchem/raappid.svg?branch=master)](https://travis-ci.org/coolchem/raappid)


##### Things you must consider before using raappid

- Make sure you have installed nodejs, any version > 5.0

    [https://nodejs.org/en](https://nodejs.org/en/)

- Make sure you have git installed on your system

    [https://git-scm.com/downloads](https://git-scm.com/downloads)

### Install

````
npm install -g raappid
````

### Update
Raappid is under active development and new versions will get realesed very often.
In order to get the most out of this tool please update regularly
````
npm -g update raappid
````

### How to use

Raappid is a project scaffolding tool, which uses predifined or
user defined templates to scaffold your project.

##### Command

````
raappid [project-type] <<project-name>> --using <<template-name>>
````



1. Choose your project type (**required**)

    ````
    project-type: node-app | web-app | template
    ````

    - **node-app**: Choose this project type, when you want to create nodejs modules or applications.
    - **web-app**:  Choose this project type, when you want to create web applications.
    - **template**: Choose this project type, if you want to develop a template for your projects or to share with other developers.


2. Choose name for your project (**required**)
    ````
    project-name: it is the name you want to give to your project,
                  a folder with your project name will be created in the directory
                  where the command is run

                  Requirements: name should be single word for example,
                  my-project, my_project, MyProject or myproject etc.
    ````

3. Choose a template (**optional**)

    ````
    template-name: template name refers to the remote repository from which
                   the project will be based on.
                   If no template name is provided, the default template based on
                   project type will be used to create the project.

                   Examples:
                   npm-package-name
                   githubname/reponame
                   bitbucket:mybitbucketuser/myproject
                   gitlab:mygitlabuser/myproject
    ````