# Getting Started 
First, clone this repository:
```
git clone https://github.com/lovodkin93/highlights-extract-app.git
cd highlights-extract-app
```
then, run:
```
npm install
npm i react-icons
npm i react-router-dom
npm i -g serv
npm install --save bootstrap@latest
npm install react-bootstrap bootstrap@5.1.3
npm install @mui/material @emotion/react @emotion/styled @material-ui/core @mui/icons-material 
npm install bootstrap@3
npm install underscore
npm i fs
npm install interweave react
npm i util
npm install aws-sdk
npm install --save video-react react react-dom redux
npm install antd
npm install react-player
```
to install all the packages used in this project and serve (which will be used to build the project for production).

## Development Mode:
To start working with the UI, run:
```
npm start
```

This will run the UI in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

## Building:
To build the UI for production to the `build` folder, run:
```
npm run build
```
Then, to load the UI to port 8000 (for example), run:
```
serve -s build -p 8000
```
