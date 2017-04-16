'use strict';

import React from 'react';
import Loading from './Loading';
import firebase from 'firebase/firebase-browser';

/**
 * 登録画面
 */
export default class SignUp extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      email: '',
      password: '',
      userName: '',
      errors: [],
      loading: false
    };
    this.setEmail = this.setEmail.bind(this);
    this.setPassword = this.setPassword.bind(this);
    this.setUserName = this.setUserName.bind(this);
    this.signUpSubmit = this.signUpSubmit.bind(this);
  }

  setEmail(e){
    this.setState({
      email: e.target.value
    });
  }

  setPassword(e){
    this.setState({
      password: e.target.value
    });
  }

  setUserName(e){
    this.setState({
      userName: e.target.value
    });
  }

  signUpSubmit(e){
    // 新規登録処理
    e.preventDefault();

    const {
      email,
      password,
      userName,
    } = this.state;
    let isValid = false;
    const errors = [];

    if (!email.length) {
      isValid = true;
      errors.push('メールアドレスが未入力です。');
    }
    if (!password.length) {
      isValid = true;
      errors.push('パスワードが未入力です。');
    }
    if (!userName.length) {
      isValid = true;
      errors.push('ユーザ名が未入力です。');
    }

    if (isValid) {
      this.setState({
        errors: errors
      });
      return;
    }

    // アカウント作成
    this.setState({
      loading: true
    });
    firebase.auth().createUserWithEmailAndPassword(email, password).then(newUser => {
      return newUser.updateProfile({
        displayName: userName
      });
    }).then(() => {
      this.props.createUserArea();
    }).catch(error => {
      // エラーを返された場合
      this.setState({
        errors: [error.message],
        loading: false
      });
    });
  }

  render() {
    return (
      <div className="authDialog">
        {this.state.loading ? <Loading/> : null}
        <div className="dialogInner">
          <p className="title">新規登録</p>
          {this.state.errors.length > 0 ?
            this.state.errors.map((error, index) => <span key={index}>{error}</span>)
            : null}
          <form onSubmit={this.signUpSubmit}>
            <div className="form-group">
              <label>メールアドレス*</label>
              <input
                type="email"
                value={this.state.email}
                onChange={this.setEmail}
              />
              <label>パスワード*</label>
              <input
                type="password"
                value={this.state.password}
                onChange={this.setPassword}
              />
              <label>ユーザー名*</label>
              <input
                type="text"
                value={this.state.userName}
                onChange={this.setUserName}
              />
            </div>
            <div className="form-group">
              <button className="dialogBtn">新規登録をする</button>
            </div>
          </form>
          <button className="dialogCloseBtn" onClick={this.props.closeAuthModal}>閉じる</button>
        </div>
      </div>
    );
  }
}