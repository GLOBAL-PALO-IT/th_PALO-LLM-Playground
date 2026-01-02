import { z } from 'zod'
import { menuItems } from '@/components/NavBar/mockMenu'

export const menuItemsListParams = () => {
  // Extract categories for the enum
  const categoryEnumValues = menuItems.map(item => item.category);

  // Extract titles for the enum
  const titleEnumValues = menuItems.flatMap(item => item.items.map(subItem => subItem.title));

  // Extract descriptions for the enum
  const descriptionEnumValues = menuItems.flatMap(item => item.items.map(subItem => subItem.description));

  // Extract category id
  const categoryEnumValuesId = menuItems.map(item => item.categoryId);

  // Extract item id
  const itemEnumValuesId = menuItems.flatMap(item => item.items.map(subItem => subItem.id));

  // Define Zod Enums
  const MenuCategoryEnum = z.enum(categoryEnumValues as [string, ...string[]]);
  const MenuItemTitleEnum = z.enum(titleEnumValues as [string, ...string[]]);
  const MenuItemDescriptionEnum = z.enum(descriptionEnumValues as [string, ...string[]]);
  const MenuCategoryIdEnum = z.enum(categoryEnumValuesId as [string, ...string[]]);
  const MenuItemIdEnum = z.enum(itemEnumValuesId as [string, ...string[]]);

  return z.object({
    selectedMenu: z.object({
      reasoning: z.string().describe('Reasoning of why choosing this menu item'),
      reasoningInThai: z.string().describe('Reasoning of why choosing this menu item in Thai'),
      title: MenuItemTitleEnum,
      description: MenuItemDescriptionEnum,
      category: MenuCategoryEnum,
      itemId: MenuItemIdEnum,
      categoryId: MenuCategoryIdEnum
    }),
  })
}

// menuItemsListParamsType
export type MenuItemsListParamsType = z.infer<ReturnType<typeof menuItemsListParams>>