# Hacker News Driver

This [driver](https://membrane.io) lets you interact with Hacker news through your Membrane graph.

## Queries

### Stories

Change the topic to ask, job, top, new, best or new.

`mctl query 'hn:stories.page(topic:"job").items)' '{ id title }'`

```
[
  {
    "id": 34228664,
    "title": "Ashby (YC W19) is hiring product and design engineers"
  },
  {
    "id": 34208105,
    "title": "Motion (YC W20) Is Hiring Fullstack Engineers"
  },
  {
    "id": 34205679,
    "title": "Skio (YC S20) is hiring – subscriptions for Shopify, easy ReCharge migrations"
  },
  ...
]
```

### Live Data
`mctl query 'hn:items.page.items' '{ id title }'`


# Schema

### Types
```javascript
<Root>
    - Fields
        stories -> Ref <StoriesCollection>
        users -> Ref <UsersCollection>
        items -> Ref <ItemsCollection>
<UsersCollection>
    - Fields
        one -> <User>
<User>
    - Field
        id -> String
        about -> String
        created -> Int
        karma -> Int
        submitted -> Ref <UserItemPage>
<UserItemPage>
    - Fields
        items -> List <Item>
        next -> Ref <UserItemPage>
<StoriesCollection>
    - Fields
        one -> Ref <Item>
        page(page, pageSize, topic) -> Ref <ItemPage>
<ItemsCollection>
    - Fields
        one -> Ref <Item>
        page(page, pageSize) -> Ref <ItemPage>
<ItemPage>
    - Fields
        items -> List <Item>
        next -> Ref <ItemPage>
<Item>
    - Fields
        id -> Int
        deleted -> Boolean
        type -> String
        by -> String
        time -> Int
        text -> string
        dead -> Boolean
        parent -> <Item>
        url -> String
        kids -> List <Item>
        score -> Int
        title -> String
        descendant -> Int
