import bcrypt from "bcryptjs";

const password = "asha@123";

// 1) Hashing: one-way scrambling. The same password gives a DIFFERENT hash each time (random salt)
const hash1 = await bcrypt.hash(password, 10);
const hash2 = await bcrypt.hash(password, 10);
console.log("Hash 1:", hash1);
console.log("Hash 2:", hash2);

// 2) Checking: compare a typed password with a stored hash
console.log("Correct password:", await bcrypt.compare("asha@123", hash1));
console.log("Wrong password:  ", await bcrypt.compare("asha@124", hash1));
