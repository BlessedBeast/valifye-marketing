export interface ItemListEntry {
  title: string
  one_liner: string
}

export interface ItemListListItemSchema {
  '@type': 'ListItem'
  position: number
  name: string
  description: string
}

export interface ItemListSchema {
  '@context': 'https://schema.org'
  '@type': 'ItemList'
  name: string
  numberOfItems: number
  itemListElement: ItemListListItemSchema[]
}

export function generateItemListSchema(
  listName: string,
  items: ItemListEntry[]
): ItemListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.title,
      description: item.one_liner
    }))
  }
}
