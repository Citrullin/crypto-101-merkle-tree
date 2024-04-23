const MerkleTree = require('./MerkleTree');
const sha256 = require('sha256');

describe('MerkleTree', () => {
    describe('getMerkleTree', () => {
        it('should return correct root hash for single leaf', () => {
            const leaf = 'data';
            const rootHash = MerkleTree.getMerkleTree([sha256(leaf)]);
            expect(rootHash).toEqual(sha256(leaf));
        });

        it('should return correct root hash for two leaves', () => {
            const leaves = ['data1', 'data2'];
            const rootHash = MerkleTree.getMerkleTree(leaves.map(sha256));
            const hashedLeafs = leaves.map(sha256);
            const toCheckRoot = sha256(hashedLeafs[0] + hashedLeafs[1]);
            expect(rootHash).toEqual(toCheckRoot);
        });

        it('should return correct root hash for three leaves', () => {
            const leaves = ['data1', 'data2', 'data3'];
            const rootHash = MerkleTree.getMerkleTree(leaves.map(sha256));
            const hashedLeafs = leaves.map(sha256);
            hashedLeafs.push(sha256(''));
            const firstLayer = [sha256(hashedLeafs[0] + hashedLeafs[1]), sha256(hashedLeafs[2] + hashedLeafs[3])]
            const toCheckRoot = sha256(firstLayer[0] + firstLayer[1]);
            expect(rootHash).toEqual(toCheckRoot);
        });

        it('should return correct root hash for four leaves', () => {
            const leaves = ['data1', 'data2', 'data3', 'data4'];
            const rootHash = MerkleTree.getMerkleTree(leaves.map(sha256));
            const hashedLeafs = leaves.map(sha256);
            const firstLayer = [sha256(hashedLeafs[0] + hashedLeafs[1]), sha256(hashedLeafs[2] + hashedLeafs[3])]
            const toCheckRoot = sha256(firstLayer[0] + firstLayer[1]);
            expect(rootHash).toEqual(toCheckRoot);
        });

        it('should return correct root hash for five leaves', () => {
            const leaves = ['data1', 'data2', 'data3', 'data4', 'data5'];
            const rootHash = MerkleTree.getMerkleTree(leaves.map(sha256));
            const hashedLeafs = leaves.map(sha256);
            hashedLeafs.push(sha256(''));
            hashedLeafs.push(sha256(''));
            hashedLeafs.push(sha256(''));
            const firstLayer = [
                sha256(hashedLeafs[0] + hashedLeafs[1]),
                sha256(hashedLeafs[2] + hashedLeafs[3]), 
                sha256(hashedLeafs[4] + hashedLeafs[5]), 
                sha256(hashedLeafs[6] + hashedLeafs[7])
            ];
            const secondLayer = [
                sha256(firstLayer[0] + firstLayer[1]),
                sha256(firstLayer[2] + firstLayer[3]), 
            ];
            const toCheckRoot = sha256(secondLayer[0] + secondLayer[1]);
            expect(rootHash).toEqual(toCheckRoot);
        });
    });

    describe('verifyLeafs', () => {
        it('should return true for valid root hash and leafs', () => {
            const leafs = ['data1', 'data2', 'data3'];
            const hashedLeafs = leafs.map(sha256);
            const rootHash = MerkleTree.getMerkleTree(hashedLeafs);
            const elements = ['data1', 'data2', 'data3'];
            expect(MerkleTree.verifyLeafs(rootHash, hashedLeafs, elements.map(sha256))).toEqual(true);
        });

        it('should return false for invalid root hash', () => {
            const leafs = ['data1', 'data2', 'data3'];
            const hashedLeafs = leafs.map(sha256);
            const rootHash = MerkleTree.getMerkleTree(hashedLeafs);
            const elements = ['data1', 'data5', 'data3'];
            expect(MerkleTree.verifyLeafs(rootHash, hashedLeafs, elements.map(sha256))).toEqual(false);
        });
    });

    describe('verifyProof', () => {
        it('should return true for valid proof', () => {
            const leafs = ['data1', 'data2', 'data3'];
            const hashedLeafs = leafs.map(sha256);
            const merkleRoot = MerkleTree.getMerkleTree(hashedLeafs);
            const elements = ['data1', 'data2', 'data3'];
            const validProof = {
                leafs: hashedLeafs,
                elements: [
                    { value: sha256('data1'), pos: 0 },
                    { value: sha256('data2'), pos: 1 },
                    { value: sha256('data3'), pos: 2 }
                ]
            };

            expect(MerkleTree.verifyProof(merkleRoot, validProof, elements.map(sha256))).toEqual(true);
        });

        it('should return false for invalid proof', () => {
            const leafs = ['data1', 'data2', 'data3'];
            const hashedLeafs = leafs.map(sha256);
            const merkleRoot = MerkleTree.getMerkleTree(hashedLeafs);
            const elements = ['data1', 'data2', 'data3'];
            const validProof = {
                leafs: hashedLeafs,
                elements: [
                    { value: sha256('invalid'), pos: 0 },
                    { value: sha256('data2'), pos: 1 },
                    { value: sha256('data3'), pos: 2 }
                ]
            };

            expect(MerkleTree.verifyProof(merkleRoot, validProof, elements.map(sha256))).toEqual(false);
        });
    });

    describe('getMerkleProof', () => {
        it('should return correct proof', () => {
            const leafs = [sha256('data1'), sha256('data2'), sha256('data3')];
            const elements = [sha256('data1'), sha256('data2'), sha256('data3')];
            const proof = MerkleTree.getMerkleProof(leafs, elements);
            expect(proof).toEqual({
                leafs,
                elements: [
                    { value: sha256('data1'), pos: 0 },
                    { value: sha256('data2'), pos: 1 },
                    { value: sha256('data3'), pos: 2 }
                ]
            });
        });
    });
});