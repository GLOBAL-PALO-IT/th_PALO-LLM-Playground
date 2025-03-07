## Prisma Usage Guide


### Migration
Run the following command to generate the migration and apply it:
```bash
npx prisma migrate dev --name init_playground
```

### Generation
Run this to generate the Prisma Client:
```bash
npx prisma generate
```

### Seed
Run this to seed the database:
```bash
npx prisma db seed
```

### Run Studio
Run this to open the Prisma Studio:
```bash
npx prisma studio
```

### Run these set of commands to generate and seed the database
```bash
npx prisma generate
npx prisma db seed
```

### Run these set of commands to generate and seed the database and open the Prisma Studio
```bash
npx prisma generate
npx prisma db seed
npx prisma studio
```
### Run these set of commands when there are updates to the Prisma schema
```bash
npx prisma migrate dev --name init_memories
npx prisma generate
npx prisma db seed
```

## FAQ

1. When do I run migration?
Answer: When you run `npx prisma migrate dev --name init_memories`, it will generate a migration file and apply it to the database. You need to run it when you make changes to the Prisma schema.
2. When do I run generation?
Answer: When you run `npx prisma generate`, it will generate the Prisma Client. You need to run it when you make changes to the Prisma schema.
3. When do I run seed?
Answer: When you run `npx prisma db seed`, it will seed the database with the data defined in the Prisma schema. You need to run it when you make changes to the Prisma schema.
4. When do I run studio?
Answer: When you run `npx prisma studio`, it will open the Prisma Studio. You need to run it when you make changes to the Prisma schema.