const sha256 = require('sha256');
const crypto = require('crypto');
//We only use it to mock-data. The user would choose their own password.
const password = require('generate-password');
const ecdh = require('ecdh');
const merkleTree = require('./src/auth/MerkleTree');

const LOG_DB = false;

//Always good practise to lower- and uppercase etc. in your passwords.
const generator_config = {
    length: 12,
    numbers: true,
    symbols: true,
    lowercase: true,
    uppercase: true
}

//Just for demonstration purposes. Use whatever curve you like.
const curve = ecdh.getCurve("secp128r1"), 
admin_pair = ecdh.generateKeys(curve),
user_pair1 = ecdh.generateKeys(curve),
user_pair2 = ecdh.generateKeys(curve),
user_pair3 = ecdh.generateKeys(curve);

//We have a frontend server that has all the business logic. Or connects to a smart contract.
//However that design is, there is probably some user facing server involved.
const frontend_server_pair = ecdh.generateKeys(curve);

const admin = {pub: admin_pair.publicKey, private: admin_pair.privateKey, password: password.generate(generator_config)},
user_1 = {pub: user_pair1.publicKey, private: user_pair2.privateKey, password: password.generate(generator_config)},
user_2 = {pub: user_pair2.publicKey, private: user_pair2.privateKey, password: password.generate(generator_config)},
user_3 = {pub: user_pair3.publicKey, private: user_pair3.privateKey, password: password.generate(generator_config)};


//Always hash passwords with salt. crypto.randomBytes(12).toString('hex') -> 12 random bytes as hex.
const admin_salt = crypto.randomBytes(12).toString('hex'),
salt1 = crypto.randomBytes(12).toString('hex'),
salt2 = crypto.randomBytes(12).toString('hex'),
salt3 = crypto.randomBytes(12).toString('hex');

//Here is where the magic happens. Given an initial database with a root has from a merkle tree.
//We could call it Genesis block, or whatever you want. Not necessarily related to web3.
const hashed_admin_Password = sha256(admin.paddword + admin_salt);
const admin_data = [
    {
        salt: admin_salt,
        username: 'admin',
        firstname: 'admin',
        lastname: 'admin',
        email: 'admin@admin.com',
        paddword: hashed_admin_Password,
        public_key: admin.pub.buffer.toString('hex')
    }
];

const init_db_hashed_leafs = admin_data
    .map(obj => Object.values(obj))
    //Keep in mind this means sha256(salt + salt). Salt everything, in case data gets compromised. 
    //As well as sha256(sha256(password + salt) + salt)
    .map((item) => item.map(v => sha256(v + item[0]) )).flat();
if(LOG_DB){
    console.log('Initial DB: ', init_db_hashed_leafs);
    console.log('Init DB Root Hash: ', init_db_root_hash);
}

//Our initial merkle tree, only with the admin in it. Commit this to a DLT or something.
const init_db_root_hash = merkleTree.merkleTree(merkleTree.merkleTree, init_db_hashed_leafs);

console.log("Admin Pub Key: ", admin_pair.publicKey.buffer.toString('hex'));
console.log("Frontend Server Pub Key: ", frontend_server_pair.publicKey.buffer.toString('hex'));

//Authentificate admin user against frontend server

//Admin user sends public key, together with merkleproof, to server
console.log('Admin user auth against the server...');
const merkle_proof_admin_pub = merkleTree.getMerkleProof(init_db_hashed_leafs, [sha256(admin.pub.buffer.toString('hex') + admin_salt)]);

if(LOG_DB){
    console.log('Merkleproof:', merkle_proof_admin_pub)
}

//Server: Verify if proof is correct, and in fact data is in the merkleproof
const admin_pub_key = admin.pub.buffer.toString('hex');
const isPubKeyInTree = merkleTree.verifyProof(merkleTree.merkleTree, init_db_root_hash, merkle_proof_admin_pub, [sha256(admin_pub_key + admin_salt)]);
console.log("Is Admin key in merkle tree:", isPubKeyInTree);

//Server negotiate a shared key with admin user. e.g. TLS
const admin_user_shared_key = frontend_server_pair.privateKey.deriveSharedSecret(admin.pub);
//The shared key can now be used for AES encryption between server and admin user
console.log("Admin user and Server shared key:", admin_user_shared_key.toString('hex'));

//Now we do 2FA. We know the user in the session has access to the key/machine.
//Let's check, if the person behind the machine also knows the password.
//To improve security: Use pepper for passwords as well. Just one byte is enough.
const merkle_proof_admin_pass = merkleTree.getMerkleProof(init_db_hashed_leafs, [sha256(hashed_admin_Password + admin_salt)]);
const isPasswordInTree = merkleTree.verifyProof(merkleTree.merkleTree, init_db_root_hash, merkle_proof_admin_pass, [sha256(hashed_admin_Password + admin_salt)]);

//If we the password is in the database, we could create a session token for the admin user.
//Something like OAuth2 etc.
console.log("Is Admin password in merkle tree:", isPasswordInTree);

//The admin is going to add three new users to the database and merkle tree
//If we would use BLS curves, we could aggregate our public keys and save space.
const to_add = [
    {
        salt: salt1,
        username: 'user_valid_1', 
        firstname: 'michael',
        lastname: 'savage', 
        email: 'michael@savage.com',
        password: sha256(user_1.password + salt1),
        public_key: user_1.pub.buffer.toString('hex')
    },
    {
        salt: salt2,
        username: 'user_valid_1', 
        firstname: 'anna',
        lastname: 'summer', 
        email: 'anna@summer.com',
        password: sha256(user_2.password + salt2),
        public_key: user_2.pub.buffer.toString('hex')
    },
    {
        salt: salt3,
        username: 'user_valid_1', 
        firstname: 'dieter',
        lastname: 'mueller', 
        email: 'dieter@mueller.com',
        password: sha256(user_3.password + salt3),
        public_key: user_3.pub.buffer.toString('hex')
    }
];

const added_user_db = init_db_hashed_leafs.concat(
    to_add.map(obj => Object.values(obj))
    .map((item) => item.map(v => sha256(v + item[0]) )).flat()
);
const added_user_root_hash = merkleTree.merkleTree(merkleTree.merkleTree, added_user_db);

//Not ideal since empty spaces get commited as well. Diffs/Proofs can be written more efficiently.
if(LOG_DB){
    console.log('Added User DB: ', added_user_db);
    console.log('Added User DB Root Hash:', added_user_root_hash);
};

const user1_pub_key = user_1.pub.buffer.toString('hex');
const user2_pub_key = user_2.pub.buffer.toString('hex');
const merkle_proof_added_user = merkleTree.getMerkleProof(added_user_db, [sha256(admin_pub_key + admin_salt), sha256(user1_pub_key + salt1), sha256(user2_pub_key + salt2)]);
const isAdminPubInAddedUser = merkleTree.verifyProof(merkleTree.merkleTree, added_user_root_hash, merkle_proof_added_user, [sha256(admin_pub_key + admin_salt)]);

//You would write the added_user_root_hash into some DLT etc. it's the updated state with new users added
//Of course, you can have smart contract verifying the admin and change.
console.log('Is Admin User Pub key in added user DB:', isAdminPubInAddedUser);

const isUserTwoInDb = merkleTree.verifyProof(merkleTree.merkleTree, added_user_root_hash, merkle_proof_added_user, [sha256(user2_pub_key + salt2)]);
const isUserTwoInOldDb = merkleTree.verifyProof(merkleTree.merkleTree, init_db_root_hash, merkle_proof_added_user, [sha256(user2_pub_key + salt2)]);

//Now the new users are available as well. They can open sessions, just as the admin did.
console.log('Is User 2 in Added User DB', isUserTwoInDb);
console.log('Is User 2 in Initital DB:', isUserTwoInOldDb);