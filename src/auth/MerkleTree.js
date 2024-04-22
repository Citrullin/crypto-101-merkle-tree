const sha256 = require('sha256');

module.exports = MerkleTree = {
    verifyLeafs: (merkleTree, rootHash, leafs, elements) => {
        //We don't necessarily need the proof. As long as we have the hashed leafs, we can check ourselves.
        //Aka creating the proof ourselves, this implementation is untested.
        return merkleTree(leafs) === rootHash && elements.map(e => leafs.indexOf(sha256(e)) > -1).every(e => e);
    },
    verifyProof: (merkleTree, rootHash, proof, elements) => {
        console.log(rootHash);
        console.log(proof);
        console.log(elements);

        console.log(
            merkleTree(proof.leafs) === rootHash && 
            elements.map(e => proof.elements.map((pe) => pe.value).some(pv => e == pv)).every(b => b) &&
            proof.elements.map(e => proof.leafs[e.pos] == e.value).every(b => b)
        );

        return merkleTree(proof.leafs) === rootHash && 
        //Check if element is in the proof
        elements.map(e => proof.elements.map((pe) => pe.value).some(pv => e == pv)).every(b => b) &&
        //Check if proof elements are in leafs
        proof.elements.map(e => proof.leafs[e.pos] == e.value).every(b => b)
    },
    getMerkleProof: (leafs, elements) => {
        return {
            leafs,
            elements: elements.map((e) => {
                return {
                    value: e,
                    pos: leafs.indexOf(e)
                }
            })
        }
    },
    merkleTree: (merkleTree, subTree) => {
        function isPowerOfTwo(n) {
            return n > 0 && (n & (n - 1)) === 0;
        }
        
        function fillToPowerOfTwo(toFill) {
            while (!isPowerOfTwo(toFill.length)) {
                toFill.push('');
            }
            return toFill;
        }
        
        //Fix weird behaviour. Maybe use Typescript to avoid those issues.
        if (!!subTree || typeof subTree == 'undefined') {
           return sha256(''); 
        }else if(subTree.length === 1){
            // One element = root hash
            return sha256(subTree[0]);
        } else {
            const pairs = fillToPowerOfTwo(subTree).reduce((acc, _, i) => {
                //.concat([item]) -> like push(item), but returns new array.
                return i % 2 === 0 ? acc.concat([[subTree[i], subTree[i + 1]]]) : acc;
            }, []).map(v => sha256(v[0] + v[1]));
    
            return merkleTree(merkleTree, pairs);
        }
    }
};