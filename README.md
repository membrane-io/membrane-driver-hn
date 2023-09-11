# Hacker News Driver

This [Membrane](https://membrane.io) driver lets you interact with the Hacker News API through your Membrane graph.

## Example Queries

### Items by topic

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

### Latest Items
`mctl query 'hn:items.page.items' '{ id title }'`

