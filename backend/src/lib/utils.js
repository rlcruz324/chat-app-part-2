//Functions generateToken

import jwt from "jsonwebtoken"

export const generateToken= (userId, res) => {
    //Generate Token
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn:"7d"
    });
    //Sending it to user as a cookie
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, //Miliseconds
        httpOnly: true, //not accessible by javascript prevents XSS attacks
        sameSite: "strict", //prevents CSRF attacks cross-site request forgery attacks
        secure: process.env.NODE_ENV !== "development" //if in development false if not then true 
    });
    return token;
};
