const oldNode = {
  type: 'div',
  children: [
    { type: 'p', children: '1' },
    { type: 'p', children: '2' },
    { type: 'p', children: '3' }
  ]
};

const newNode = {
  type: 'div',
  children: [
    { type: 'p', children: '1' },
    { type: 'p', children: '2' },
    { type: 'p', children: '3' }
  ]
};

function patchChildren(n1, n2, container) {
  if (typeof n2.children === 'string') {
  } else if (Array.isArray(n2.children)) {
    const oldChildren = n1.children;
    const newChildren = n2.children;
    const oldLen = oldChildren.length,
      newLen = newChildren.length;
    const commonLength = Math.min(oldLen, newLen);
    for (let i = 0; i < commonLength; i++) {
      patch(oldChildren[i], newChildren[i]);
    }
    if (newLen > oldLen) {
      for (let i = commonLength; i < newLen; i++) {
        patch(null, newChildren[i], contianer);
      }
    } else if (oldLen > newLen) {
      for (let i = commonLength; i < oldLen; i++) {
        unmount(oldChildren[i]);
      }
    }
  } else {
  }
}
