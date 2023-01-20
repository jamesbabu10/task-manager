const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.sendgrid_apikey);

const sendwelcomeEmail = (email, name) => {
  const msg = {
    to: email,
    from: "jamesbabu010@gmail.com",
    subject: "Thanks for joining in!",
    text: `Welcome to the app,${name} .Let me know how you feel about my application`,
    html: `<strong>Welcome to the app,${name} .Let me know how you feel about my application<strong>`,
  };
  sgMail.send(msg);
};

const goodbyeemail = (email, name) => {
  const msg = {
    to: email,
    from: "jamesbabu010@gmail.com",
    subject: "Sad to see you leave !",
    text: `Goodbye, ${name} . I hope to see you back sometime soon.`,
    html: `<strong>Goodbye, ${name} . I hope to see you back sometime soon.<strong>`,
  };
  sgMail.send(msg);
};

module.exports = {
  sendwelcomeEmail,
  goodbyeemail,
};

// const msg = {
//   to: "jamesbabu010@gmail.com", // Change to your recipient
//   from: "jamesbabu010@gmail.com", // Change to your verified sender
//   subject: "Sending with SendGrid is Fun",
//   text: "and easy to do anywhere, even with Node.js",
//   html: "<strong>and easy to do anywhere, even with Node.js</strong>",
// };
// sgMail
//   .send(msg)
//   .then(() => {
//     console.log("Email sent");
//   })
//   .catch((error) => {
//     console.error(error);
//   });
