//Security best pracises are not followed here. 
//Refer to auth.js for a more complete picture.
const sha256 = require('sha256');

// Some private user information
const privat_info = [
    "OUR_INSURANCE_ID",
    "firstname",
    "lastname",
    "car_license"
];

//This is how we would create all the information for the claim.
//We just traverse the tree upwards
const leaf_level_hashed = [
    sha256(privat_info[0]),
    sha256(privat_info[1]),
    sha256(privat_info[2]),
    sha256(privat_info[3])
];

//We need an intermediate level, since we got 4 items. 
//Tip: If we had to implement it, we would iterate over the array with .map()
const level_one = [
    sha256(leaf_level_hashed[0] + leaf_level_hashed[1]),
    sha256(leaf_level_hashed[2] + leaf_level_hashed[3]),
];

//The top hash is what we verified is valid. Government issued Verifiable Credentials for example.
const top_hash = sha256(level_one[0] + level_one[1]);


//----> Our scenario starts here
//We received the insurance id from the user
const insurance_id = privat_info[0];

//The user doesn't want to reveal the other information to us. We receive only the hashes.
const received_hashes = [leaf_level_hashed[1], leaf_level_hashed[2], leaf_level_hashed[3]];

//We create the whole hashed leaf level ourself. 
//We check, if all the other hashes + the insurance id, in hashed form, are the same as the root hash.
const validate_hashes = [sha256(insurance_id), ...received_hashes];

//Just as before, we construct our merkle tree.
const validate_level_one = [
    sha256(validate_hashes[0] + validate_hashes[1]),
    sha256(validate_hashes[2] + validate_hashes[3])
];

//And this is the last level we have to construct.
const validate_root = sha256(validate_level_one[0] + validate_level_one[1]);

//Check if root from verified claim and hash(revealed info) + other hashes are the same
console.log('Calculated Hash and Root Hash are equal: ', validate_root === top_hash);