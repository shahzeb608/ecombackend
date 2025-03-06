import bcrypt from "bcrypt"
const plainPassword = "admin123"; 
const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
  if (err) throw err;
  console.log("Hashed Password:", hash);
});