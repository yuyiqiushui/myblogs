# Redis

## Redis数据类型

### String

```\
redis 127.0.0.1:6379> SET runoob "菜鸟教程"
OK
redis 127.0.0.1:6379> GET runoob
"菜鸟教程"
```

在以上实例中我们使用了 Redis 的 **SET** 和 **GET** 命令。键为 runoob，对应的值为 **菜鸟教程**。

**注意：**一个键最大能存储 512MB。

### Hash

```
redis 127.0.0.1:6379> DEL runoob
redis 127.0.0.1:6379> HMSET runoob field1 "Hello" field2 "World"
"OK"
redis 127.0.0.1:6379> HGET runoob field1
"Hello"
redis 127.0.0.1:6379> HGET runoob field2
"World"
```

实例中我们使用了 Redis **HMSET, HGET** 命令，**HMSET** 设置了两个 **field=>value** 对, HGET 获取对应 **field** 对应的 **value**。

每个 hash 可以存储 2的32次幂-1键值对(40多亿)

### List(列表)

```
redis 127.0.0.1:6379> DEL runoob
redis 127.0.0.1:6379> lpush runoob redis
(integer) 1
redis 127.0.0.1:6379> lpush runoob mongodb
(integer) 2
redis 127.0.0.1:6379> lpush runoob rabitmq
(integer) 3
redis 127.0.0.1:6379> lrange runoob 0 10
1) "rabitmq"
2) "mongodb"
3) "redis"
redis 127.0.0.1:6379>
```

列表最多可存储 2的32次幂 - 1 元素 (4294967295, 每个列表可存储40多亿)。

### Set(集合)

#### sadd命令

添加一个string元素到key对应的set集合中，成功返回1，如果元素已经在集合中返回0.

```
sadd key member
```

```
redis 127.0.0.1:6379> DEL runoob
redis 127.0.0.1:6379> sadd runoob redis
(integer) 1
redis 127.0.0.1:6379> sadd runoob mongodb
(integer) 1
redis 127.0.0.1:6379> sadd runoob rabitmq
(integer) 1
redis 127.0.0.1:6379> sadd runoob rabitmq
(integer) 0
redis 127.0.0.1:6379> smembers runoob

1) "redis"
2) "rabitmq"
3) "mongodb"
```

注意：以上实例中rabitmq添加了两次，但是根据集合内元素的唯一性，第二次插入的元素将被忽略。

集合中最大的成员数为2的32次幂-1(4294967295, 每个集合可存储40多亿个成员)

### zset(sorted set : 有序集合)

#### zadd命令

```
zadd key score member
```

```
redis 127.0.0.1:6379> DEL runoob
redis 127.0.0.1:6379> zadd runoob 0 redis
(integer) 1
redis 127.0.0.1:6379> zadd runoob 0 mongodb
(integer) 1
redis 127.0.0.1:6379> zadd runoob 0 rabitmq
(integer) 1
redis 127.0.0.1:6379> zadd runoob 0 rabitmq
(integer) 0
redis 127.0.0.1:6379> > ZRANGEBYSCORE runoob 0 1000
1) "mongodb"
2) "rabitmq"
3) "redis"
```

### 各个类型应用场景

| 类型                 | 简介                                                    | 特性                                                         | 场景                                                         |
| -------------------- | ------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| String               | 二进制安全                                              | 可以包含任何数据，比如jpg图片或者序列化的对象，一个键最大存储512M | ___                                                          |
| Hash(字典)           | 键值对集合，即编程语言中的Map类型                       | 适合存储对象，并且可以像数据库中的update一个属性一样只修改某一项属性值(Memcached中需要取出整个字符串反序列化成对象修改完再序列化存回去) | 1、最新消息排行等功能(比如朋友圈的时间线)2、消息队列         |
| Set(集合)            | 哈希表实现，元素不重复                                  | 1、添加、删除、查找的复杂度都是O(1)2、为集合提供了求交集、并集、差集等操作 | 1、共同好友2、利用唯一性、统计访问网站的所有独立IP 3、好友推荐时，根据tag求交集，大于某个阈值就可以推荐 |
| List(列表)           | 链表(双向链表)                                          | 增删快，提供了操作某一段元素的API                            | 1、最新消息排行等功能(比如朋友圈的时间线)2、消息队列         |
| Sorted Set(有序集合) | 将Set中的元素增加一个权重参数score，元素按score有序排列 | 数据插入集合时，已经进行天然排序                             | 1、排行榜2、带权重的消息队列                                 |



