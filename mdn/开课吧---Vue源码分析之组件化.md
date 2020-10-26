# 开课吧

## 问题

1. Vue中的响应式  每个变量都能监听到 Object.defineproperty

   1. ​	{{name}}

2. React没有响应式

   1. 虚拟dom通过对比，知道数据的变化

3. $$
   问题来了，Vue中都知道哪个数据变了，为啥Vue2还需要虚拟dom，Vue中的响应式直到组件
   $$

   Vue的响应式只到组件，组建内部用虚拟dom来做 diff

