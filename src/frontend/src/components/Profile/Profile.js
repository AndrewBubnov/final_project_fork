import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import InputAdornment from '@material-ui/core/InputAdornment';
import Photo from './Photo/Photo'
import { updateProfile, setPhoto, confirmEmail, clearCurrentCarPhoto } from '../../actions/userCreators'
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider'
import Car from './Car/Car'
import ConfirmButton from './ConfirmButton/ConfirmButton'
import manSihlouette from '../../img/manSihlouette.svg'
import carSihlouette from '../../img/carSihlouette.svg'
import ErrorSnackbar from "./ErrorSnackbar/ErrorSnackbar";
import AddingCar from "./AddingCar/AddingCar";
import { theme } from '../../styles/styles'
import { profileStyles as styles } from '../../styles/styles'
import { profileStyle as style } from '../../styles/style'
import './Profile.css'




const phoneNumber = /^\+?[0-9]{10}/;
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class Profile extends Component {

    state = {
        user: {
            userName: this.props.users.user.userName,
            userPhoto: this.props.users.user.userPhoto,
            userPhone: this.props.users.user.userPhone,
            userMail: this.props.users.user.userMail,
            userCars: this.props.users.user.userCars,
        },
        adding: false,
        snackbarOpen: false,
        alertError: '',
        currentInput: '',
        newCar: {
            userCarName: '',
            userCarColour: '',
            userCarPhoto: '',
            userCarSitsQty: 0,
        },
    }


    handleChange = ({target: {name, value}}) => {
        this.setState({user: {...this.state.user, [name]: value}, newCar: {...this.state.newCar, [name]: value}})
    }

    handleCapacity = (capacity) => {
        this.setState({newCar: {...this.state.newCar, userCarSitsQty: capacity}})
    }


    handleAddCar = () => {
        this.props.clearCurrentCarPhoto()
        this.setState({adding: true})
    }

    submitNewCar = () => {
        const cars = [...this.state.user.userCars]
        let newCar = this.state.newCar
        newCar.userCarId = null
        newCar.userCarPhoto = this.props.users.currentCarPhoto
        cars.push(newCar)
        this.setState({user: {...this.state.user, userCars: cars}})
        this.rejectNewCar()
    }

    rejectNewCar = () => {
        this.setState({adding: false, newCar: {...this.state.newCar, userCarName: '', userCarColour: ''}})
    }

    deleteCar = (car) => {
        const cars = this.state.user.userCars.filter(item => item.userCarId !== car.userCarId)
        this.setState({user: {...this.state.user, userCars: cars}})
    }

    onFocus = (e) => {
        this.setState({currentInput: e.target.name})
    }

    handleSnackbarClose = () => {
        this.setState({alertError: '', snackbarOpen: false})
    }

    check = () => {
        setTimeout(this.validate, 0)
    }

    validate = () => {
        const {user: {userName, userPhone, userMail, userPhoto}, currentInput} = this.state
        if (currentInput !== 'userName' && !userName) {
            this.setState({alertError: 'Please enter user name', snackbarOpen: true})
        }
        else if (currentInput !== 'userPhone' && !(userPhone && phoneNumber.test(userPhone.split('-').join('')))) {
            this.setState({alertError: 'Please enter your phone number', snackbarOpen: true})
        }
        else if (currentInput !== 'userMail' && !(userMail && email.test(userMail.toLowerCase()))) {
            this.setState({alertError: 'Please enter your email', snackbarOpen: true})
        }
        else if (currentInput !== 'fileUpload' && userName && userPhone && userMail && !userPhoto) {
            this.setState({alertError: 'Please upload photo', snackbarOpen: true})
        }
    }


    setProfile = () => {
        this.props.updateProfile(this.state.user)
        this.props.history.push({pathname: '/smart'})
    }

    setPhotoAndProfile = (photo, subject) => {
        this.props.setPhoto(photo, this.state.user, subject)
    }

    componentDidUpdate(prevProps) {
        if (this.props.users.user !== prevProps.users.user) {
            this.setState({user: {...this.state.user, ...this.props.users.user}})
        }
    }


    render() {
        const {classes, users: {user: {userIsConfirmedMail}}} = this.props

        const { adding, user: {userName, userPhone, userMail, userPhoto, userCars},
            newCar: {userCarName, userCarColour, userCarSitsQty} } = this.state

        const allChecks = (userPhone && phoneNumber.test(userPhone.split('-').join('')))
            && (userMail && email.test(userMail.toLowerCase()))
            && (userName && userName.length > 0)
            && userPhoto

        let carList = userCars.map(item => {
            const car = item.userCarName + ' ' + item.userCarColour
            return (
                <Car key={car}
                     model={item}
                     deleteCar={this.deleteCar}
                >
                    {car}
                </Car>
            )
        })
        const adornment = !userIsConfirmedMail || userIsConfirmedMail < 2 ?
            <InputAdornment position="end">
                <ConfirmButton
                    confirmEmail={() => this.props.confirmEmail(this.state.user.userMail)}
                />
            </InputAdornment>
            : null
        let dependentOutput = null
        if (adding) {
            dependentOutput = (
                <AddingCar
                    userCarName={userCarName}
                    userCarColour={userCarColour}
                    handleChange={this.handleChange}
                    submitNewCar={this.submitNewCar}
                    rejectNewCar={this.rejectNewCar}
                    setSeatCapacity={this.handleCapacity}
                    userCarSitsQty={userCarSitsQty}
                >
                    <Photo
                        setPhoto={this.setPhotoAndProfile}
                        photo={this.props.users.currentCarPhoto}
                        sihlouette={carSihlouette}
                        error={this.props.users.errorPopupOpen}
                        ratio={18 / 10}
                        subject='car'
                    />
                </AddingCar>
            )
        } else {
            dependentOutput = (
                <>
                    <Photo
                        setPhoto={this.setPhotoAndProfile}
                        photo={this.props.users.user.userPhoto}
                        sihlouette={manSihlouette}
                        error={this.props.users.errorPopupOpen}
                        onFocus={this.onFocus}
                        ratio={3 / 4}
                        subject='user'
                    />
                    <MuiThemeProvider theme={theme}>
                        <TextField
                            required
                            label="User Name"
                            name='userName'
                            type='text'
                            onChange={this.handleChange}
                            onBlur={this.check}
                            onFocus={this.onFocus}
                            autoComplete="off"
                            value={userName || ''}
                            style={style.input}
                            InputProps={{
                                classes: {
                                    input: classes.inputColor
                                }
                            }}
                        />
                        <TextField
                            required
                            label="Phone"
                            name='userPhone'
                            placeholder='+38'
                            onChange={this.handleChange}
                            onBlur={this.check}
                            onFocus={this.onFocus}
                            autoComplete="off"
                            value={userPhone || ''}
                            style={style.input}
                            InputProps={{
                                classes: {
                                    input: classes.inputColor
                                }
                            }}
                        />
                        <TextField
                            required
                            label="Email"
                            type="email"
                            name='userMail'
                            onChange={this.handleChange}
                            onBlur={this.check}
                            onFocus={this.onFocus}
                            autoComplete="off"
                            value={userMail || ''}
                            style={style.input}
                            InputProps={{
                                classes: {
                                    input: classes.inputColor
                                },
                                endAdornment: adornment,
                            }}
                        />
                        {
                            userCars.length > 0 &&
                        < span className='carlist-header'>List of your cars (swipe to delete)</span>
                        }

                        <div className='carlist'>
                            {carList}
                        </div>

                        {
                            allChecks &&
                        <Button onClick={this.handleAddCar}
                                color="primary"
                                classes={{
                                    root: classes.addButton,
                                    label: classes.label
                                }}
                                style={{
                                    marginTop: 30
                                }}
                        >
                            Add new car
                        </Button>
                        }
                    </MuiThemeProvider>
                </>
            )
        }

        return (
            <>
                <div className='profile-container'>

                    {dependentOutput}

                    {!adding &&
                    <Button onClick={this.setProfile}
                            color="primary"
                            disabled={!allChecks}
                            classes={{
                                root: classes.root,
                                label: classes.label
                            }}
                    >
                        Submit
                    </Button>
                    }

                </div>
                <ErrorSnackbar
                    handleSnackbarClose={this.handleSnackbarClose}
                    open={this.state.snackbarOpen}
                    message={this.state.alertError}
                />
            </>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        users: state.users
    }
}


export default withStyles(styles)(connect(mapStateToProps, { updateProfile, setPhoto, confirmEmail, clearCurrentCarPhoto })(Profile))
