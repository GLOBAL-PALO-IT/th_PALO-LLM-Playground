export interface MenuItem {
    id: string;
    title: string;
    description: string;
    sampleChatQueryThai: string[];
    path?: string;
}

export interface MenuCategory {
    categoryId: string;
    category: string;
    items: MenuItem[];
}
export const menuItems: MenuCategory[] = [
    {
        categoryId: "1",
        category: "GO by Krungsri Auto",
        items: [
            { id: "1", title: "ขอสินเชื่อรถ", description: "Car loan application", sampleChatQueryThai:["ขอสินเชื่อรถทำยังไง"] },
            { id: "2", title: "คาร์ ฟอร์ แคช", description: "Car For Cash service", sampleChatQueryThai:["นำรถไปแลกเงินทำยังไง"] },
        ],
    },
    {
        categoryId: "2",
        category: "Car Lifestyle",
        items: [
            { id: "1", title: "ออโต้ คลับ", description: "Auto Club", sampleChatQueryThai:["อ่านข่าว ออโต้ คลับ"] },
            { id: "2", title: "ค้นหาสถานีชาร์จรถไฟฟ้า", description: "EV charging station locator", sampleChatQueryThai:["ค้นหาสถานีชาร์จรถไฟฟ้า"] },
            { id: "3", title: "นัดเข้าศูนย์มิตซูบิชิ", description: "Schedule Mitsubishi service", sampleChatQueryThai:["นัดเข้าศูนย์มิตซูบิชิ"] },
            { id: "4", title: "ออโต้แคร์ เช็คสภาพรถ", description: "Auto Care vehicle check-up", sampleChatQueryThai:["ออโต้แคร์ เช็คสภาพรถ"] },
            { id: "5", title: "ราคาน้ำมัน", description: "Oil prices", sampleChatQueryThai:["ราคาน้ำมัน"] },
            { id: "6", title: "ตลาดรถมือสอง", description: "Used car market", sampleChatQueryThai:["ตลาดรถมือสอง"] },
            { id: "7", title: "ทริปเที่ยวไทย", description: "Travel in Thailand", sampleChatQueryThai:["ทริปเที่ยวไทย"] },
            { id: "8", title: "ตลาดสินค้ารถอุปกรณ์", description: "Vehicle accessories market", sampleChatQueryThai:["ตลาดสินค้ารถอุปกรณ์"] },
        ],
    },
    {
        categoryId: "3",
        category: "Insurance",
        items: [
            { id: "1", title: "ประกันรถ", description: "Car insurance", sampleChatQueryThai:["ประกันรถ"] },
            { id: "2", title: "พ.ร.บ. รถยนต์", description: "Motor vehicle compulsory insurance", sampleChatQueryThai:["พ.ร.บ. รถยนต์"] },
            { id: "3", title: "ประกันคุ้มครองอะไหล่", description: "Spare parts protection insurance", sampleChatQueryThai:["ประกันคุ้มครองอะไหล่"] },
            { id: "4", title: "ประกันอุบัติเหตุ", description: "Accident insurance", sampleChatQueryThai:["ประกันอุบัติเหตุ"] },
            { id: "5", title: "ประกันสุขภาพ", description: "Health insurance", sampleChatQueryThai:["ประกันสุขภาพ"] },
            { id: "6", title: "ประกันเดินทางต่างประเทศ", description: "Travel insurance abroad", sampleChatQueryThai:["ประกันเดินทางต่างประเทศ"] },
            { id: "7", title: "โปรโมชั่นและประกันอื่นๆ", description: "Promotions and other insurances", sampleChatQueryThai:["โปรโมชั่นและประกันอื่นๆ"] },
        ],
    },
    {
        categoryId: "4",
        category: "Others",
        items: [
            // chat
            {id: "1", title: "Chat", path: "/chat", description: "Basic OpenAI Chat API usage example", sampleChatQueryThai:["Chat"]},
            // chatWithTools
            {id: "2", title: "ChatWithTools", path: "/chatWithTools", description: "OpenAI Chat API With Book Data to demonstrate tools calling", sampleChatQueryThai:["ChatWithTools"]},
            //chatInsurance
            {id: "3", title: "ChatInsurance", path: "/chatInsurance", description: "OpenAI Chat API with Insurance API to demonstrate tools calling for insurance industry", sampleChatQueryThai:["ChatInsurance"]},
            //chatVoice
            {id: "4", title: "ChatVoice", path: "/chatVoice", description: "OpenAI Chat API using realtime speech to speech API Voice to demonstrate realtime capability using Live Kit", sampleChatQueryThai:["ChatVoice"]},
            //ragOne
            {id: "5", title: "RAGOne", path: "/ragOne", description: "RAG Chunking Raw Text to demonstrate how to Chunking in RAG works at basic level", sampleChatQueryThai:["RAGOne"]},
            //ragQdrant
            {id: "6", title: "RAGQdrant", path: "/ragQdrant", description: "RAG Qdrant: demonstrate how RAG works with Qdrant vector database and use to upload data into Qdrant", sampleChatQueryThai:["RAGQdrant"]},
            //ragChat
            {id: "7", title: "RAGChat", path: "/ragChat", description: "RAG Chat: demonstrate how RAG works with OpenAI Chat API by fetching data from Qdrant and pass the context to Chat API", sampleChatQueryThai:["RAGChat"]},
        ]
    }
];

/*
Here's an example of how the paths will look for each menu item in the provided structure:

### Category: **GO by Krungsri Auto**
1. **ขอสินเชื่อรถ**: `/menu1/item1`
2. **คาร์ ฟอร์ แคช**: `/menu1/item2`

---

### Category: **ไลฟ์สไตล์ของผู้ใช้รถ**
1. **ออโต้ คลับ**: `/menu2/item1`
2. **ค้นหาสถานีชาร์จรถไฟฟ้า**: `/menu2/item2`
3. **นัดเข้าศูนย์มิตซูบิชิ**: `/menu2/item3`
4. **ออโต้แคร์ เช็คสภาพรถ**: `/menu2/item4`
5. **ราคาน้ำมัน**: `/menu2/item5`
6. **ตลาดรถมือสอง**: `/menu2/item6`
7. **ทริปเที่ยวไทย**: `/menu2/item7`
8. **ตลาดสินค้ารถอุปกรณ์**: `/menu2/item8`

---

### Category: **ประกัน**
1. **ประกันรถ**: `/menu3/item1`
2. **พ.ร.บ. รถยนต์**: `/menu3/item2`
3. **ประกันคุ้มครองอะไหล่**: `/menu3/item3`
4. **ประกันอุบัติเหตุ**: `/menu3/item4`
5. **ประกันสุขภาพ**: `/menu3/item5`
6. **ประกันเดินทางต่างประเทศ**: `/menu3/item6`
7. **โปรโมชั่นและประกันอื่นๆ**: `/menu3/item7`

---

### How the paths are structured:
- `/menu<categoryId>/item<itemId>`
  - `categoryId` corresponds to the `categoryId` in the `menuItems` array.
  - `itemId` corresponds to the `id` of each item within the `items` array.

Let me know if you'd like further adjustments!
*/

// categoryId and itemId
export const generatePath = (categoryId: string, itemId: string) => {
    return `/menu${categoryId}/item${itemId}`;
};

export const isPathExistInMenuItemsFromId= (categoryId: string, itemId: string) => {
    const category = menuItems.find(category => category.categoryId === categoryId);
    if (category) {
        const item = category.items.find(item => item.id === itemId);
        if (item) {
            return item.path;
        }
    }
    return false;
}
