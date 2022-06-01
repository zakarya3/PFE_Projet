const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service : "gmail",
    auth : {
        user : "tt1459000@gmail.com",
        pass : "Test25042022"
    }
});

const option ={
    from : "tt1459000@gmail.com",
    to : "zakaria.aanni@gmail.com",
    subject : "test",
    text : "salut"
};

transporter.sendMail(option, function (err, info) { 
    if (err) {
        console.log(err);
        return;
    }
    console.log("sent: "+info.response);
 });