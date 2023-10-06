# 力扣
## 两数之和

给定一个整数数组和一个目标值，找出数组中和为目标值的两个数。
你可以假设每个输入只对应一种答案，且同样的元素不能被重复利用。
示例:
给定 nums = [2, 7, 11, 15], target = 9
因为 nums[0] + nums[1] = 2 + 7 = 9
所以返回 [0, 1]

```javascript
// 暴力解法
function(nums, target) {
  for(let i=0;i<nums.length;i++){
    for(let j=i+1;j<nums.length;j++){
      if(nums[i]+nums[j]===target)return [i,j]
    }
  }
  return []
};
// hash表
function(nums,target){
  const map=new Map()
  for(let i=0;i<nums.length;i++){
   if(map.has(target-nums[i])){
    return [i,map.get(target-nums[i])]
   }else{
     map.set(nums[i],i)
   }
  }
  return []
}
```

## 路径总和

给定一个二叉树和一个目标和，判断该树中是否存在根节点到叶子节点的路径，这条路径上所有节点值相加等于目标和。 说明: 叶子节点是指没有子节点的节点。

```javascript
// 广度优先遍历
function(root, targetSum) {
    if(!root) return false
    let nodes = [root]
    while(nodes.length){
        const current = nodes.pop()
        const isLeaf = !current.left && !current.right
        if(isLeaf && current.val ===targetSum){
            return true
        }

         if(current.left){
        current.left.val=current.left.val+current.val
        nodes.unshift(current.left)
         }   
         if(current.right){
        current.right.val=current.right.val+current.val
        nodes.unshift(current.right)
         }

    }
    return false
};

```

