//////////////
// Imports //
////////////

import React, {Component} from 'react';
import axios from 'axios';
import classnames from 'classnames';

////////////////
// Component //
//////////////

class Login extends Component {
    // Add a constructor to add a component state
    constructor() {
        super();
        this.state = {
            email: '',
            password: '',
            errors: {}
        }
    }

    // Method which is called when the user types in one of the fields
    // e.target.name points to the name that is given to the input field in the JSX below
    // e.target.value points to the current value typed in each of the text fields
    onChange = (e) => {
        this.setState({[e.target.name]: e.target.value});
    };

    // Method which get called when the user submits the typed in values
    // when clicking on the submit button
    // This is made available by the onSubmit={ this.onSubmit } attribute in the form tag below
    onSubmit = (e) => {
        e.preventDefault();

        // Create a user object having the values read from the filled in state
        const newLogin = {
            email: this.state.email,
            password: this.state.password
        };

        // interact with the backend through axios
        // issue a post request to REST endpoint with the new user which gives a promise having a result.
        axios.post('/api/users/login', newLogin)
            .then(res => console.log(res.data))
            .catch(err => this.setState({ errors: err.response.data }));
    };

    render() {
        // Pull the errors object from the state
        const { errors } = this.state;

        // the classnames of the input fields now use the npm package classnames
        // css className has "form-control and form-control-lg always active" by the 1st argument between ' '
        // and an optional when the input is not valid as the second argument ' ' which is set to the errors
        // we get through the server side validation in express & validator

        // Bootstrap: http://getbootstrap.com/docs/4.1/components/forms/#validation
        // Classnames: https://github.com/JedWatson/classnames#readme

        return (
            <div className="login">
                <div className="container">
                    <div className="row">
                        <div className="col-md-8 m-auto">
                            <h1 className="display-4 text-center">Log In</h1>
                            <p className="lead text-center">Sign in to your DevConnector account</p>

                            {/* On submit, fire up the onSubmit method*/}
                            <form onSubmit={ this.onSubmit }>
                                <div className="form-group">

                                    {/* CSS classnames use the classnames npm package */}
                                    <input
                                        className={classnames('form-control form-control-lg', {
                                            'is-invalid': errors.email
                                        })}

                                        type="email"
                                        placeholder="Email Address"
                                        name="email"
                                        value={ this.state.email }
                                        onChange={ this.onChange }
                                    />

                                    {/* provide the error messages under the input that is not validated */}
                                    {errors.email && (<div className="invalid-feedback">{errors.email}</div>)}

                                </div>
                                <div className="form-group">

                                    {/* CSS classnames use the classnames npm package */}
                                    <input
                                        className={classnames('form-control form-control-lg', {
                                            'is-invalid': errors.password
                                        })}

                                        type="password"
                                        placeholder="Password"
                                        name="password"
                                        value={ this.state.password }
                                        onChange={ this.onChange }
                                    />

                                    {/* provide the error messages under the input that is not validated */}
                                    {errors.password && (<div className="invalid-feedback">{errors.password}</div>)}

                                </div>
                                <input type="submit" className="btn btn-info btn-block mt-4"/>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

//////////////
// Exports //
////////////

export default Login;