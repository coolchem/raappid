# Raappid

Project Scaffolding Tool

[![Coverage Status](https://coveralls.io/repos/coolchem/raappid/badge.svg?branch=master&service=github)](https://coveralls.io/github/coolchem/raappid?branch=master)  [![Build Status](https://travis-ci.org/coolchem/raappid.svg?branch=master)](https://travis-ci.org/coolchem/raappid)

Raappid is a Project Scaffolding tool. It is a Command line tool run in NodeJS. It is used to rapidly setup a development environment, for projects using either inbuilt or user defined templates.. 
I started working on this project to save me some time in porting over my common project setup, like Continuous Integration, Unit testing, release and deploy settings. And quicly build and deploy production ready projects.

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

Raappid is a project scaffolding tool, which uses predefined or
user defined templates to scaffold your project.

##### Command

````
    raappid create <<project-name>> --using <<template-name>>
                            or
    raappid create <<project-name>> -u <<template-name>>
````



1. Choose name for your project (**required**)

````
    project-name: it is the name you want to give to your project,
                  a folder with your project name will be created in the directory
                  where the command is run

                  Requirements: name should be single word for example,
                  my-project, my_project, MyProject or myproject etc.
````

2. Choose a template (**required**)

    ````
    template-name: template name refers to the remote repository from which
                   the project will be based on

                   Examples:
                   githubname/reponame
                   bitbucket:mybitbucketuser/myproject
                   gitlab:mygitlabuser/myproject
    ````

##### Shortcut Command

This command sets up project from basic templates, for the most common type of projects

````
    raappid <<project-type>> <<project-name>>  


    The above command is just an alias to main command, for example, for a project type "node-module"
    the shortcut command would be

    "raappid node-module testProject"

    its Alias:

    raappid create testProject --using raappid/template-node-module-basic
````
 
The project types supported in the shortcut command as as below:    
    
- **node-app**: Choose this project type, when you want to create nodejs modules or applications.
- **web-app**:  Choose this project type, when you want to create web applications.
- **node-module**:  Choose this project type, when you want to create module to be used in nodejs apps and is published on npm.
- **browser-module**:  Choose this project type, when you want to create module to be used in browser and is published on npm.
- **template**: Choose this project type, if you want to develop a template for your projects or to share with other developers.

    
