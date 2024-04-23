const sha256 = require('sha256');

class MerkleTree {
    
    getMerkleTree(subTree){
        //We always need to pair 2 values and create one hash from it. So it has to the power of two.
        //If only value, we practically carry the value upwards until we can combine it.
        function isPowerOfTwo(n) {
            return n > 0 && (n & (n - 1)) === 0;
        }
        
        function fillToPowerOfTwo(toFill) {
            while (!isPowerOfTwo(toFill.length)) {
                toFill.push(sha256(''));
            }
            return toFill;
        }
        
        // One element = root hash
        if (subTree.length === 1) {
            return subTree[0];
        } else {
            const pairs = fillToPowerOfTwo(subTree).reduce((acc, _, i) => {
                //.concat([item]) -> like push(item), but returns new array.
                return i % 2 === 0 ? acc.concat([[subTree[i], subTree[i + 1]]]) : acc;
            }, []).map(v => sha256(v[0] + v[1]));

            return this.getMerkleTree(pairs);
        }
    }

    verifyLeafs(rootHash, leafs, elements) {
        //We don't necessarily need the proof. As long as we have the hashed leafs, we can check ourselves.
        //Aka creating the proof ourselves, this implementation is untested.
        return this.getMerkleTree(leafs) === rootHash && elements.map(e => leafs.indexOf(e) > -1).every(e => e);
    }

    verifyProof(rootHash, proof, elements){
        return this.getMerkleTree(proof.leafs) === rootHash && 
        //Check if element is in the proof
        elements.map(e => proof.elements.map((pe) => pe.value).some(pv => e == pv)).every(b => b) &&
        //Check if proof elements are in leafs
        proof.elements.map(e => proof.leafs[e.pos] == e.value).every(b => b)
    }

    //Simply just get the position of the value in the leaf and what is removed. 
    //Can be also done without the proof and only leafs.
    getMerkleProof(leafs, elements){
        return {
            leafs,
            elements: elements.map((e) => {
                return {
                    value: e,
                    pos: leafs.indexOf(e)
                }
            })
        }
    }
}

module.exports = new MerkleTree();