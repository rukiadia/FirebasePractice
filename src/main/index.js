'use strict';

import { app, BrowserWindow } from 'electron';

// GC防止
let mainWindow = null;

// メインウィンドウ作成
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#FFFFFF'
  });

  mainWindow.loadURL(`file://${__dirname}/../../index.html`);

  mainWindow.on('closed', function(){
    mainWindow = null;
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', function(){
  // macOS以外の場合はアプリケーション終了
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // メインウィンドウが消えている場合は、再度メインウィンドウを作成する
  if (mainWindow === null){
    createWindow();
  }
});