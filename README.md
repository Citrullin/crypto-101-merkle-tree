# Merkle Trees and Merkle Proofs in Crypto: Code by example

## What are Merkle Trees?

_The MerkleProof example contains important security pracises_

Merkle trees, also known as hash trees, are a fundamental concept in cryptography.
At their core, they are a collection of hashed data organized in a binary tree structure.
However, instead of going into complex technicalities, let's explore them through a simple JavaScript example.

Imagine a scenario where we need to verify a user's car insurance information.
Traditionally, this involves complex and expensive processes like document verification and identity checks.
To simplify and streamline this process, we can leverage Verifiable Credentials and Decentralized Identifiers (DID),
especially in conjunction with Distributed Ledger Technology (DLT) like blockchain.

In our example, let's consider a government-issued ID, such as a driver's license.
Each piece of information associated with the ID, like the driver's name or insurance details, can be represented as a hashed block.
The top hash in our Merkle tree represents the entire claim, signed by the government, ensuring its validity.

Now, let's dive into constructing the Merkle tree. The top hash serves as the root, and each leaf node represents a hashed piece of information,
such as the driver's first name or insurance ID.
As we move up the tree, we combine pairs of hashes at each level until we reach the root hash.
This root hash acts as the verification point for the entire claim.

But enough theory; let's explore a practical JavaScript implementation. You can find the code [here](insurance.js).

### Getting Started:

1. **Clone the Repository**: Use `git clone ` to clone the repository.
2. **Install npm Dependencies**: Navigate to the cloned directory (`cd merkleproofs`) and install dependencies using `npm install`.

## Exploring Merkle Proofs:

Merkle proofs are essential for verifying data integrity in a decentralized environment.
Let's delve deeper into this concept with an example of DAO authentication.

In this scenario, we utilize a blockchain for user authentication and management.
Each user's Merkle tree contains hashed data such as salts, usernames, emails, and public keys. This information forms the basis of authentication.

Authentication occurs entirely on the DLT. Anyone with access to the blockchain can process user login requests. However, security is important.
In our example, hashed leaf nodes are included in Merkle proofs. This is not the optimal solution and be improved.
A more efficient approach involves sending only the diff subtree as proof.

To enhance security, passwords should always be hased together with a salt. This makes rainbow table attacks hard to execude.
Additionally, the use of "pepper" can further strengthen defenses.
User-specific salts add an extra layer of security, mitigating risks associated with rainbow table attacks or user information exposure.

For a practical demonstration, refer to the code available in [auth.js](auth.js) or execute `npm run auth`.
The code is documented with comments and more advanced logging can be enabled.

## Documentation Improvements

- [] Replace git clone with actual url
- [] Clean code up, naming convention etc.
- [] Add Links to keywords, such as DLT, DID, DAO
- [] Unit tests
- [] More Logging capabilities
- [] Extend with actual DLT backend
- [] Use actual AES encryption (Browser implementation?)
