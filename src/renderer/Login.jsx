'use strict';

import React from 'react';
import Loading from './Loading';
import firebase from 'firebase/firebase-browser';

/**
 * 認証画面
 */
export default class Login extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      email: '',
      password: '',
      errors: [],
      loading: false
    };
    this.setEmail = this.setEmail.bind(this);
    this.setPassword = this.setPassword.bind(this);
    this.loginSubmit = this.loginSubmit.bind(this);
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

  loginSubmit(e){
    // ログイン処理
    e.preventDefault();

    const {
      email,
      password
    } = this.state;
    const errors = [];
    let isValid = true;

    if (!email.length) {
      isValid = false;
      errors.push("Email can't be blank");
    }
    if (!password.length) {
      isValid = false;
      errors.push("Password can't be blank");
    }

    if (!isValid) {
      // 必須入力チェックに該当した場合はエラーを表示する
      this.setState({
        errors: errors
      });
      return;
    }

    // Firebaseのログイン処理
    this.setState({
      loading: true
    });
    firebase.auth().signInWithEmailAndPassword(email, password).then(() => {
      // ログイン済の状態にして、ダイアログを閉じる
      this.props.closeAuthModal();
    }).catch(error => {
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
          <p className="title">ログイン</p>
          {this.state.errors.length > 0 ?
            this.state.errors.map((error, index) => <span key={index}>{error}</span>)
            : null}
          <form onSubmit={this.loginSubmit}>
            <div className="form-group">
              <label>メールアドレス</label>
              <input
                type="email"
                value={this.state.email}
                onChange={this.setEmail}
              />
              <label>パスワード</label>
              <input
                type="password"
                value={this.state.password}
                onChange={this.setPassword}
              />
            </div>
            <div className="form-group">
              <button className="dialogBtn">ログイン</button>
            </div>
          </form>
          <button className="dialogCloseBtn" onClick={this.props.closeAuthModal}>閉じる</button>
        </div>
      </div>
    )
  }
}