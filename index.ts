import { root, nodes, state } from 'membrane';

// Sometimes we have to find the correct userId by hitting the site. We keep the actual user IDs here so we don't have
// to hit the site for the same user more than once
state.actualUserIds = state.actualUserIds || {};

async function getApi(path: string) {
  const url = `https://hacker-news.firebaseio.com/v0/${path}`;
  const json = await nodes.http.get({ url, headers: "{}", }).$query(`{ body }`);
  return JSON.parse(json.body!)
}

async function siteGet(path: string) {
  const url = `https://news.ycombinator.com/${path}`;
  const html = await nodes.http.get({ url, headers: "{}", }).$query(`{ body }`);
  return html.body!;
}

async function getAlgolia(path: string) {
  const url = `https://hn.algolia.com/api/v1/${path}`;
  const json = await nodes.http.get({ url, headers: "{}", }).$query(`{ body }`);
  return JSON.parse(json.body!)
}

export const Root = {
  items() { return {}; },
  users() { return {}; },
  status() {
    return 'Ready';
  },
  parse({ args: { name, value } }) {
    switch (name) {
      case "item": {
        const id = value.match(/id=([0-9]+)$/)?.[1];
        if (id) {
          return [root.items.one({ id: parseInt(id) })];
        }
        break;
      }
      case "user": {
        const id = value.match(/id=([a-zA-Z0-9_-]+)$/)?.[1];
        if (id) {
          return [root.users.one({ id })];
        }
        break;
      }
    }
    return [];
  },
}

export const Item = {
  async parent({ obj }) {
    if (obj.parent) {
      return getApi(`/item/${obj.parent}.json`)
      // return ItemCollection.one({ args: { id: obj.parent }});
    }
  },
  async gref({ self, obj, generateSubquery }) {
    if (obj && typeof obj.id === "number") {
      return root.items.one({ id: obj.id });
    }
    return self;
  },
  async kids({ obj, generateSubquery }) {
    return obj.kids &&
      Promise.all(obj.kids.slice(0, 5).map((id) => getApi(`/item/${id}.json`)))
  }
}

export const UserCollection = {
  async one({ args, context }) {
    let actualId = state.actualUserIds[args.id];
    const json = await getApi(`/user/${actualId || args.id}.json`)
    if (json === null && actualId === undefined) {
      const html = await siteGet(`user?id=${args.id}`);
      const matches = html.match(new RegExp(`Profile: (${args.id})`, "i"));
      console.log('Trying with actual username', matches?.[1]);
      actualId = matches?.[1];
      state.actualUserIds[args.id] = actualId || null; // We set it to null to avoid trying again
      if (actualId) {
        return await getApi(`/user/${actualId}.json`)
      }
    }
    context.userId = json?.id;
    return json;
  },
  create: () => console.log('created user'),
}

export const User = {
  async submitted({ obj, args, self }) {
    const page = Math.max(args.page ?? 1, 1);
    const pageSize = Math.max(1, Math.min(25, args.pageSize ?? 15));
    const startIndex = (page - 1) * pageSize;

    const promises = obj.submitted.slice(startIndex, startIndex + pageSize).map((id) => {
      return getApi(`/item/${id}.json`);
    });
    const items = await Promise.all(promises);

    return { items, next: self.submitted({ page: page + 1 }) };
    // return { submitted: obj.submitted };
    // // const author = obj.id;
    
    // return obj.submitted &&
    //   // Promise.all(obj.submitted.slice(0, 5).map((id) => apiGet(`/item/${id}.json`)))
    //   Promise.all(obj.submitted.slice(0, 10).map((id) => ItemCollection.one({ args: { id } })))
  }
}

export const ItemCollection = {
  async one({ args }) {
    return getApi(`/item/${args.id}.json`)
  },

  page: async ({ self, args }) => {
    const page = Math.max(args.page ?? 1, 1);
    const maxItem = await getApi('maxitem.json');
    const pageSize = Math.max(1, Math.min(25, args.pageSize ?? 15));
    const start = maxItem - (page - 1) * pageSize;

    const promises : Promise<any>[] = [];
    for (let i = 0; i < pageSize; i++) {
      promises.push(getApi(`/item/${start - i}.json`));
    }
    const items = await Promise.all(promises);

    return { items, next: self.page({ page: page + 1 }) };
    // const { author } = context;
    // const res = await getAlgolia(`search_by_date?tags=author_${author}`);
    // const items = res.hits;
    // return { items }
  }
}

export const UserItemCollection = {
  async one({ args }) {
    return getApi(`/item/${args.id}.json`)
  },

  page: async ({ self, args }) => {
    // const { author } = context;
    // const res = await getAlgolia(`search_by_date?tags=author_${author}`);
    // const items = res.hits;
    // return { items }
  }
}