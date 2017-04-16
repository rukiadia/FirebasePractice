'use strict';

import React from 'react';
import moment from 'moment';
import TodoList from './TodoList';
import SignUp from './SignUp';
import Login from './Login';

import firebase from 'firebase/firebase-browser';

/**
 * TODOリスト・フォーム部分
 */

export default class TodoForm extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      inputValue: '',
      todoList: [],
      errorMessage: '',
      isOpenSignUp: false,
      isOpenLogin: false,
      authenticated: false
    };
    this.indexedDB = null;
    this.handleOnChange = this.handleOnChange.bind(this);
    this.todoSubmit = this.todoSubmit.bind(this);
    this.setUpDatabase = this.setUpDatabase.bind(this);
    this.getAllTodo = this.getAllTodo.bind(this);
    this.updateTodo = this.updateTodo.bind(this);
    this.deleteTodo = this.deleteTodo.bind(this);
    this.openSignUpMode = this.openSignUpMode.bind(this);
    this.openLoginMode = this.openLoginMode.bind(this);
    this.closeAuthModal = this.closeAuthModal.bind(this);
    this.insertData = this.insertData.bind(this);
    this.logout = this.logout.bind(this);
    this.createUserArea = this.createUserArea.bind(this);
  }

  handleOnChange(e) {
    this.setState({
      inputValue: e.target.value
    });
  }

  todoSubmit(e){
    e.preventDefault();

    const {
      inputValue,
      todoList
    } = this.state;

    if (!inputValue.length) {
      return;
    }

    // トランザクション生成
    const transaction = this.indexedDB.transaction(['todo'], 'readwrite');
    const todoObjectStore = transaction.objectStore('todo');
    const addData = {
      text: inputValue,
      date: moment().format('MM/DD'),
      isComplete: false,
      timeStamp: Date.now()
    };

    // putするためのリクエストを作成
    todoObjectStore.put(addData);
    todoList.push(addData);
    transaction.oncomplete = () => {
      this.setState({
        inputValue: '',
        todoList: todoList
      });
      // Firebase側も更新
      this.insertData(todoList);
    };

    // エラー時
    transaction.onerror = (error) => {
      this.setState({
        inputValue: '',
        errorMessage: error
      });
    };
  }

  setUpDatabase(){
    const dbRequest = window.indexedDB.open('myTodoDB', 3);
    dbRequest.onupgradeneeded = (event) => {
      // Versionが上がった場合
      let db = event.target.result;
      event.target.transaction.onerror = (error) => {
        alert(error);
      };

      // 既存schema削除と、DB新規作成
      if (db.objectStoreNames.contains('todo')) {
        db.deleteObjectStore('todo');
      }
      db.createObjectStore('todo', {
        keyPath: 'timeStamp'
      });
    };

    dbRequest.onsuccess = (event) => {
      // indexedDB初期化
      this.indexedDB = event.target.result;
      this.getAllTodo();
    };
  }

  getAllTodo(){
    const store = this.indexedDB.transaction(['todo'], 'readonly').objectStore('todo');

    // 値を横断的に取得
    const cursorRequest = store.openCursor();
    const resultArray = [];
    cursorRequest.onsuccess = (event) => {
      const result = event.target.result;
      if (!result) {
        // 一通りデータを取ったら、処理終了
        this.setState({
          todoList: resultArray
        });
        return;
      }
      resultArray.push(result.value);
      result.continue();
    };

    // エラー時
    cursorRequest.onerror = (error) => {
      this.setState({
        errorMessage: error
      });
    };
  }

  updateTodo(e){
    // クリックしたリストの完了状態を更新
    const { todoList } = this.state;

    const listIndex = e.target.dataset.listIndex;
    const targetTodo = todoList[listIndex];
    const store = this.indexedDB.transaction(['todo'], 'readwrite').objectStore('todo');
    const dbRequest = store.get(targetTodo.timeStamp);

    dbRequest.onsuccess = () => {
      // データの完了フラグを書き換える
      let data = dbRequest.result;
      data.isComplete = !(data.isComplete);
      const updateRequest = store.put(data);
      updateRequest.onsuccess = () => {
        // todoListの更新があった場所だけ更新
        todoList[listIndex].isComplete = !(todoList[listIndex].isComplete);
        this.setState({
          todoList
        });
        // Firebase側も更新
        this.insertData(todoList);
      };
      updateRequest.onerror = (error) => {
        this.setState({
          errorMessage: error
        });
      };
    };

    dbRequest.onerror = (error) => {
      this.setState({
        errorMessage: error
      });
    };
  }

  deleteTodo(e){
    e.stopPropagation();

    const { todoList } = this.state;
    const listIndex = e.target.dataset.listIndex;
    const targetTodo = todoList[listIndex];
    const store = this.indexedDB.transaction(['todo'], 'readwrite').objectStore('todo');
    const dbRequest = store.delete(targetTodo.timeStamp);

    // 対象のデータを消す
    dbRequest.onsuccess = () => {
      todoList.splice(listIndex, 1);
      this.setState({
        todoList
      });
      // Firebase側も更新
      this.insertData(todoList);
    };

    dbRequest.onerror = (error) => {
      this.setState({
        errorMessage: error
      });
    };
  }

  openSignUpMode(){
    this.setState({
      isOpenSignUp: true
    });
  }

  openLoginMode(){
    this.setState({
      isOpenLogin: true
    });
  }

  closeAuthModal(){
    this.setState({
      isOpenSignUp: false,
      isOpenLogin: false
    });
  }

  insertData(result){
    if (!firebase.auth().currentUser) {
      return;
    }

    // Firebase側に更新されたデータを反映
    const ref = firebase.database().ref(`/${firebase.auth().currentUser.uid}`);
    ref.set({
      lastUpdateTime: Date.now(),
      TODOData: result
    });
  }

  logout(){
    firebase.auth().signOut().then(() => {
      this.setState({
        authenticated: false
      });
    });
  }

  createUserArea(){
    // 新規登録時、ユーザのTODOを保存する領域を作る
    const newRoomRef = firebase.database().ref(`/${firebase.auth().currentUser.uid}`);
    const newRoom = {
      TODOData: this.state.todoList,
      lastUpdateTime: Date.now()
    };
    newRoomRef.update(newRoom).then(() => {
      this.closeAuthModal();
    });
  }

  componentDidMount(){
    this.setUpDatabase();

    // 認証状態を更新
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        this.setState({
          authenticated: true
        });
      } else {
        // No user is signed in.
        this.setState({
          authenticated: false
        });
      }
    });
  }

  render() {
    return (
      <div>
        <header className="header">
          <div className="headerInner">
            <button className="headerBtn" onClick={this.openSignUpMode}>新規登録</button>
            <button className="headerBtn" onClick={this.openLoginMode}>{this.state.authenticated ? '別のユーザでログイン' : 'ログイン'}</button>
            {this.state.authenticated ? <span className="userName">{firebase.auth().currentUser.displayName}</span> : null}
            {this.state.authenticated ? <button className="headerBtn" onClick={this.logout}>ログアウト</button> : null}
          </div>
        </header>
        <div className="wrapper">
          <form className="form" onSubmit={this.todoSubmit}>
            <input
              type="text"
              className="todoText"
              placeholder="タスクを書こう!"
              onChange={this.handleOnChange}
              value={this.state.inputValue}
            />
            <input type="submit" className="addBtn" value="追加"/>
          </form>
          <TodoList
            todoList={this.state.todoList}
            updateTodo={this.updateTodo}
            deleteTodo={this.deleteTodo}
          />
        </div>
        {this.state.isOpenSignUp ?
          <SignUp
            closeAuthModal={this.closeAuthModal}
            createUserArea={this.createUserArea}
          /> : null}
        {this.state.isOpenLogin ?
          <Login closeAuthModal={this.closeAuthModal}/> : null}
      </div>
    );
  }
}