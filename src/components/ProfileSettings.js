
import React, { Component } from 'react'
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import { DatePicker } from "material-ui-pickers";
import moment from "moment";
import TextField from "material-ui/TextField";
import config from "../config/config.js";
import Typography from "material-ui/Typography/Typography";
import decode from "jwt-decode";
import uuidv1 from "uuid/v1";
import Grid from "material-ui/Grid";
import { changeSetting } from "../actions/changeSetting";
import compose from 'recompose/compose';
import { connect } from "react-redux";
import ImageCropper from './ImageCropper';
const styles = theme => ({
  textField: {
    width: 300,
    float: 'left',
    marginBottom: 10,
  },
  emailAddress: {
    width: 300,
    float: 'left',
    marginBottom: 30,
  },

  pickerContainer: {
    width: 200,
  },

  datePicker: {
    width: 300,
  }


});


class UserPictureAndState extends Component {
  constructor() {
    super();
    this.state = {
      value: '',
      submittedImgValue: '',
      newUser: {
        firstName: '',
        lastName: '',
        emailAddress: '',
        dateOfBirth: '',
        gender: '',
        avatarURL: `${config.BASE_URL}images/avatar_placeholder.png`
      },
      disabled: true

    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
  }
  componentWillMount() {
    let user = decode(localStorage.getItem('token'))
    this.setState({
      userCurrentData: {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        emailAddress: user.emailAddress,
        dateOfBirth: user.dateOfBirth,
        gender: user.profile.gender,
        avatarURL: user.profile.avatarURL

      }
    })


  }

  handleDataChange = date => {
    let checkedDate = date.format().substring(0, 10);
    this.setState({
      newUser: { ...this.state.newUser, dateOfBirth: checkedDate }
    });
  };


  handleImageChange(e) {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = () => {
      this.setState({
        newUser: {
          ...this.state.newUser,
          avatarURL: reader.result
        },
        disabled: false

      });

    }

    reader.readAsDataURL(file);

  }



  handleRadioChange = (e, value) => {
    this.setState({
      newUser: {
        ...this.state.newUser,
        gender: value
      },
      value: value
    });
  };

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      newUser: {
        ...this.state.newUser,
        [name]: value
      }
    });
  }

  submitForm() {

    var formData = new FormData(this.formSettings.target);

    let data = this.state.newUser;

    formData.append('file', this.state.submittedImgValue)
    formData.append('dateOfBirth', this.state.userCurrentData.dateOfBirth)
    formData.append('firstName', this.state.userCurrentData.firstName)
    formData.append('lastName', this.state.userCurrentData.lastName)



    let url = `${config.BASE_URL}user/profile_edit/${uuidv1()}`;
    let token = localStorage.getItem("token");

    if (this.state.newUser.avatarURL !== '') {


      // this.props.changeUserSetting(url,formData)

      fetch(url, {
        method: "POST",
        headers: {
          'Authorization': `TOKEN ${token}`
        },
        body: formData
      })
        .then(res => res.json())
        .then(data => {

          if (data) {
            localStorage.setItem('updatedUserData', JSON.stringify(data))
            setTimeout(() => {
              window.location.reload();
            }, 2000)

          }

        })
        .catch(err => console.log(err));

    } else {
      console.log({ Error: "Fields are required" }); //Handle errors here...
    }
  }

  saveCropedImage(file) {
    let objectURL = URL.createObjectURL(file);
    this.setState({ submittedImgValue: file })

  }

  handleSubmit(e) {

    e.preventDefault();

  };

  render() {
    const { classes } = this.props;
    return (
      <Grid container spacing={24} className={classes.row}>
        <Grid item xs>
          <form
            noValidate
            autoComplete="off"
            onSubmit={this.handleSubmit.bind(this)}
            encType="multipart/form-data"
            ref={(form) => this.formSettings = form}
          >
            <TextField
              id="firstName"
              className={classes.textField}
              label={this.state.userCurrentData.firstName}
              onChange={this.handleInputChange}
              name="firstName"
            />

            <TextField
              id="lastName"
              className={classes.textField}
              label={this.state.userCurrentData.lastName}
              onChange={this.handleInputChange}
              name="lastName"
              helperText={this.state.errorMessagelastName}
            />

            <TextField
              id="emailAddress"
              className={classes.emailAddress}
              label={this.state.userCurrentData.emailAddress}
              onChange={this.handleInputChange}
              name="emailAddress"
            />

            <div className={classes.pickerContainer}>
              <Typography
                type="caption"
                align="left"
                gutterBottom
              >
                Date of Birth
                </Typography>
              <DatePicker
                keyboard
                value={this.state.userCurrentData.dateOfBirth}
                labelFunc={date => moment(date).format("Do MMMM YYYY")}
                onChange={this.handleDataChange}
                className={classes.datePicker}
              />
            </div>


            <ImageCropper saveCropedImage={this.saveCropedImage.bind(this)} />

            <Button type="button" className={"login-button"} onClick={this.submitForm.bind(this)} >
              SAVE
              </Button>
          </form>

        </Grid>
      </Grid>
    )
  }
}

/* const mapDispatchToProps = (dispatch) => {
  return {
    changeUserSetting: (url, formData) => { dispatch(changeSetting(url, formData)) }
  }

  }; */



export default withStyles(styles)(UserPictureAndState)
 /*  withStyles(styles),
  connect(null, mapDispatchToProps)
)(UserPictureAndState);

  */

