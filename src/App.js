import logo from './logo.svg';
import './App.css';
import React, {useEffect, useState} from "react";
import {Amplify, API, graphqlOperation} from "aws-amplify";
import {createProfile,createTodo} from "./graphql/mutations";
import {AmplifyS3Image, AmplifySignOut} from "@aws-amplify/ui-react";
import {getProfile, listProfiles, listTodos} from "./graphql/queries";
import awsExports from "./aws-exports";
import { withAuthenticator } from '@aws-amplify/ui-react'
import { Auth } from 'aws-amplify';
import {Storage} from "aws-amplify";
import {BrowserRouter as Router, Route, Link} from "react-router-dom";

Amplify.configure(awsExports)

const initialState = {username : '',
  displayname : '',
  education : '',
  experience : '',
  activities : ''}

function S3Album(props) {
  return null;
}

class App extends React.Component{



  constructor(props) {
    super(props);

  }


  state = {username : '',
    displayName : '',
    education : '',
    experience : '',
    activities : '',
    id : '',
    exist : 'true'
  }




  fillProfile = e => {
    const value = e.target.value;
    const name = e.target.name;
    this.setState({[name] : value})
  }

  upload = async e => {
    try {
      await API.graphql(graphqlOperation(createProfile, {input: {id : this.state.username, username : this.state.username, displayName: this.state.displayName, experience :this.state.experience, activities : this.state.activities, education : this.state.education}}))
    }
    catch (err) {
      console.log(err)
    }
  }

  printcurrentAuth = () => {
    Auth.currentUserInfo()
        .then(
            data => {
              console.log(data);
              const username_get = data.username;
              this.setState({username : username_get});
              this.setState({id : username_get});
              API.graphql(graphqlOperation(getProfile, {id : username_get}))
                  .then(data => {console.log("有Profile" + data.data);
                    console.log(data.data.getProfile)
                    if (data.data.getProfile.username) {
                      this.setState({exist : 'true'});
                      this.setState({displayName : data.data.getProfile.displayName})
                      this.setState({education : data.data.getProfile.education})
                      this.setState({experience : data.data.getProfile.experience})
                      this.setState({activities : data.data.getProfile.activities})
                    }})
                  .catch(err => {console.log("沒有Profile" + err);
                    this.setState({exist : 'false'});})
            }
        )
        .catch(e => console.log(e))

  }


  async listProfiles() {
    const data = await  API.graphql(graphqlOperation(listProfiles))
    console.log(data)
  }
  componentDidMount() {
    this.printcurrentAuth();
  }

  getUserimglink = () => {
    return this.state.username + ".jpg"
  }

  renderimg = ()=> {
    console.log("打印一下" + this.state.username)
    return <img src={this.imglink} />
  }

  getimgurl = async ()=> {
    const link = await Storage.get(this.state.username + ".jpg")
    this.imglink = link;
    console.log(link)
  }

  getUsereixst = async e => {
    try {
      console.log("記錄當前 username" + e)
      const result = await API.graphql(graphqlOperation(getProfile, {id : this.state.username}))
      console.log("result is " + result)
      console.log(result)
      if (result.data.getProfile == null) {
        this.setState({userprofileexist : 'false'})
      }
      else {
        this.setState({userprofileexist : 'true'})
      }
      //return result
    }
    catch (err) {
      console.log(err)
    }
  }
  createProfile = () => {
    async function onChange(e) {
      const file = e.target.files[0];
      try {
        console.log(e.target.getAttribute('username'))
        const username = e.target.getAttribute('username')
        await Storage.put(username + ".jpg", file, {
          contentType: "image/jpg", // contentType is optional
        });
        window.location.reload(false)
      } catch (error) {
        console.log("Error uploading file: ", error);
      }
    }


    return (


        <div className="App">
          <AmplifySignOut/>
          <header className="App-header">

            <img src={logo} className="App-logo" alt="logo"/>
            <p>
              Hello User {this.state.username}
              <img className='photo'
                   src={'https://easycampusreactv20f8fa0a551e84b23b27048be4f0649145029-dev.s3.us-east-1.amazonaws.com/public/' + this.state.username + '.jpg'}/>

            </p>

            <input type="file" className="form-control" id="customFile" username={this.state.username}
                   onChange={onChange}/>


            <input type="text" className="form-control" name="displayName" value={this.state.displayName}
                   onChange={this.fillProfile} placeholder={"Please Enter Your displayname"}/>
            <textarea name="education" className="form-control" value={this.state.education}
                      onChange={this.fillProfile} placeholder={"Please Enter Your Education"}
                      style={{height: 200}}/>
            <textarea name="experience" className="form-control" value={this.state.experience}
                      onChange={this.fillProfile} placeholder={"Please Enter Your Experience"}
                      style={{height: 200}}/>
            <textarea name="activities" className="form-control" value={this.state.activities}
                      onChange={this.fillProfile} placeholder={"Please Enter Your activities"}
                      style={{height: 200}}/>
            <input type="button" className="btn btn-primary" value={"submit"} onClick={this.upload}/>
            <input type="button" className="btn btn-primary" value={"logcurrent_session"}
                   onClick={this.printcurrentAuth}/>
            <input type="button" className="btn btn-primary" value={"listallprofiles"}
                   onClick={this.listProfiles}/>
            <input type="button" className="btn btn-primary" value={"getimgurl"} onClick={this.getimgurl}/>
            <Link to = {'/'} > Comeback</Link>
            <a href={'newtest.html'}> click me</a>

          </header>
        </div>
    );
  }


  readProfile = ()=>{

    return (
        <div>
          Hello User {this.state.username}
          <div> Your Display name {this.state.displayName}</div>
          <div> Your Education {this.state.education}</div>
          <div> Your Experience {this.state.experience}</div>
          <div> Your Activities {this.state.activities} </div>
          <a href = {"Easy-Campus-Life/index.html" + "?username=" + this.state.username}> Go To dashboard</a>
        </div>

    )
  }

  render () {

    if (this.state.exist == 'true') {
      return (<div> <AmplifySignOut/>
        <Router>
        <Link to = {'/readProfile'} > readProfile</Link>
        <Route path={'/readProfile'} render={this.readProfile}></Route>
        </Router>
      </div>)
    }
    else {
      return (
          <Router>
            <div> <AmplifySignOut/> You don't have a profile please add Profile</div>
            <Link to = {'/createProfile'} > CreateProfile</Link>
            <Route path={'/createProfile'} render={this.createProfile}></Route>
          </Router>
      )
    }
  }
}

class Afterlogin extends React.Component {

  constructor(props) {
    super(props);
  }
  state = {exists : '' , username :''}

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.username !== prevProps.username) {
      this.setState({username : this.props.username})
    }
  }

  componentDidMount() {
    this.not_used_function(this.state.username)
  }

  not_used_function = async (props)=> {
    try {
      console.log("記錄當前 username" + props.username)
      const result = await API.graphql(graphqlOperation(getProfile, {id : props.username}))
      console.log("result is " + result)
      console.log(result)
      if (result.data.getProfile == null) {
        this.setState({exists : 'false'})
      }
      else {
        this.setState({exists : 'true'})
      }
      //return result
    }
    catch (err) {
      console.log(err)
    }
  }

  render() {
    return <div> {this.state.username} </div>
  }
  /*
  async function not_used_function(props) {
      try {
          console.log("記錄當前 username" + props.username)
          const result = await API.graphql(graphqlOperation(getProfile, {id : props.username}))
          console.log("result is " + result)
          console.log(result)
          if (result.data.getProfile == null) {
              this.setState({exists : 'false'})
          }
          else {
              this.setState({exists : 'true'})
          }
          //return result
      }
      catch (err) {
          console.log(err)
      }
  }

  if (props == null) {
      return null
  }
  return (
      <div>


      </div>)*/
  /*
      if (props.username== 'true') {
          return (
              <div className="App">
                  <AmplifySignOut/>
                  <header className="App-header">

                      <img src={logo} className="App-logo" alt="logo"/>
                      Welcome {this.props.username}
                      Read Profile
                      Go To Dashboard
                  </header>
              </div>
          )
      }
      else {
          return (
              <div className="App">
                  <AmplifySignOut/>
                  <header className="App-header">
                      <img src={logo} className="App-logo" alt="logo"/>
                      <p> Hello {this.props.username} </p>
                      <p> You will be redirect to create profile page! </p>
                  </header>
              </div>
          );
      }*/
}



export default withAuthenticator(App);
