# <img src="https://cdn.freebiesupply.com/logos/large/2x/the-university-of-melbourne-logo-svg-vector.svg" width=15% align=left> INFO30005 Tutorial 15 Group Project Team Pikapika
This repository is created for [University of Melbourne](https://www.unimelb.edu.au) [INFO30005 Semester 1 2022](https://handbook.unimelb.edu.au/2022/subjects/info30005) 
<br></br>

**Diabetes@Home** project development

---

**Please view patient with the screen sizes:**
* Phone: 375 x 812 (iPhone X, portrait)
* Tablet: 1024 x 768 (iPad, landscape)
* Desktop: 1920 x 1080 (monitor, landscape)

**Please view clinician wit hthe screen size:**
* Desktop: 1920 x 1080 (monitor, landscape)

---

📩 Contacts of tutor: rainer.selby@unimelb.edu.au

📩 Contacts of client: 

---

## Table of Content
<!-- [<img src="https://cdn.freebiesupply.com/logos/large/2x/the-university-of-melbourne-logo-svg-vector.svg" width=20% align=left> -->
  - [INFO30005 Tutorial 15 Group Project Team Pikapika](#-info30005-tutorial-15-group-project-team-pikapika)
  - [Team members](#team-members)
  - [Software Dependencies](#software-dependencies)
  - [Build With](#built-with)
  - [Directories](#directories)
  - [Quick Start Guide](#quick-start-guide)
---

## Team members
| Name | Role | Contact | 
| :---- | :---- | :---- | 
| Joeann Chong | Patient's part Front End Leader | joeannc@student.unimelb.edu.au |
| Rongshun Li | Clinician's part Back End Leader | rongshunl@student.unimelb.edu |
| Tinyu Huang | Clinician's part Back End Leader | tinhuang@student.unimelb.edu.au |
| Yingting Li | Patient's Back End Leader | yingting1@student.unimelb.edu.au |
| Yuqi Deng| Clinician's part Front End Leader | yuqideng@student.unimelb.edu.au | 

## Software Dependencies
For more information, please check `package.json`.

For quick installation:
```bash
npm install # install all dependencies or
npm install --dependencies # install required dependencies only
```

## Built With 
Our project was built with the following technologies:
* Node.js
* Express Handlebars
* Express.js
* CSS
* HTML
* MongoDB

## Directories
* `config`: store application session authentication functions
* `controller`: store controllers for each accessible routes
* `models`: store database connection script and database schemas
* `public`: store html fragments
* `routes`: store server accessible routes
* `js`: store helper script if necessary
* `views`: handlebar views

## Quick Start Guide
Before start development or testing, please make sure all required dependencies have been installed.

For convenience purpose, please use `nodemon` instead of `node`.
```bash
nodemon app.js
```

When typing support message and clinicial notes, clinician can type ":" to select the emoji he'she likes or clike the emoji button to select emoji.
